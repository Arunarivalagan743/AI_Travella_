















import React, { useEffect, useState } from 'react';
import GooglePlacesAutocomplete from 'react-google-places-autocomplete';
import {  SelectTravelList } from '@/choices/SelectTravelList';
import { motion, AnimatePresence } from 'framer-motion';
import { FaPlane, FaMapMarkerAlt, FaCalendarAlt, FaWalking, FaSuitcase, FaPaperPlane, FaUsers } from 'react-icons/fa';
import { RiMoneyDollarCircleLine, RiFlightTakeoffFill } from 'react-icons/ri';
import { BiSolidChevronRight, BiRefresh } from 'react-icons/bi';
import { MdLocationOn, MdExplore } from 'react-icons/md';
import AiSetup from '../ModelWork/AiSetup';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../ModelWork/firebaseConfig.js';
import { useNavigate} from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
function CreateTrip() {
  // Load saved form data from localStorage on initial render
  const [place, setPlace] = useState(() => {
    const saved = localStorage.getItem('createTripPlace');
    return saved ? JSON.parse(saved) : null;
  });
  const [formData, setFormData] = useState(() => {
    const saved = localStorage.getItem('createTripFormData');
    return saved ? JSON.parse(saved) : {};
  });
  const [activeSection, setActiveSection] = useState(() => {
    const saved = localStorage.getItem('createTripActiveSection');
    return saved ? parseInt(saved) : 0;
  });
  const [showSuccess, setShowSuccess] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [travelAnimation, setTravelAnimation] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  const { user, login } = useAuth();
  const { generateTravelPlan, loading: aiLoading, error, travelData } = AiSetup();
  const navigate = useNavigate();

  // Save form data to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('createTripFormData', JSON.stringify(formData));
  }, [formData]);

  useEffect(() => {
    localStorage.setItem('createTripPlace', JSON.stringify(place));
  }, [place]);

  useEffect(() => {
    localStorage.setItem('createTripActiveSection', activeSection.toString());
  }, [activeSection]);

  // Removed old Google OAuth login - now using Firebase Auth from Header

  const isFormComplete = () => {
    return formData.place && 
           formData.duration && 
           formData.travelType && 
           formData.budget &&
           formData.travelers;
  };

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  const handleInput = (name, value) => {
    if (name === 'place') {
      const locationName = value?.label || value?.value?.description || "Unknown location";
      setPlace(value); // Update place state
      setFormData({
        ...formData,
        place: value,
        location: locationName
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
    setTravelAnimation(true);
    setTimeout(() => setTravelAnimation(false), 1000);
    if (name === 'place') setActiveSection(1);
    else if (name === 'duration') setActiveSection(2);
    else if (name === 'travelType') setActiveSection(3);
    else if (name === 'budget' || name === 'travelers') setActiveSection(4);
  };

  const resetForm = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setFormData({});
      setPlace(null);
      setActiveSection(0);
      setIsRefreshing(false);
      // Clear localStorage
      localStorage.removeItem('createTripFormData');
      localStorage.removeItem('createTripPlace');
      localStorage.removeItem('createTripActiveSection');
    }, 800);
  };

  const SaveAiTrip = async (tripData) => {
    try {
      setIsSaving(true);
      setErrorMessage(null);
      
      if (!user) {
        console.error("SaveAiTrip: User not authenticated");
        setErrorMessage("User not authenticated");
        throw new Error("User not authenticated");
      }
      
      if (!user.email) {
        console.error("SaveAiTrip: User email is missing");
        setErrorMessage("User email is required. Please sign in again.");
        throw new Error("User email is missing");
      }
      
      // Validate trip data
      if (!tripData) {
        console.error("SaveAiTrip: Trip data is empty");
        setErrorMessage("Trip data is missing. Please try again.");
        throw new Error("Trip data is empty");
      }
      
      // Generate a unique document ID
      const docId = Date.now().toString();
      
      // Prepare trip data
      const tripDocument = {
        userSelection: JSON.parse(JSON.stringify(formData)),
        tripData: tripData,
        userEmail: user.email,
        userName: user.name || user.email.split('@')[0],
        userPicture: user.picture || '',
        id: docId,
        isPublic: formData.isPublic || false,
        createdAt: new Date().toISOString(),
        likesCount: 0,
        likedBy: []
      };
      
      console.log("=== SAVING TRIP DEBUG ===");
      console.log("Generated AI Trip Data:", tripData);
      console.log("Final trip document structure:", tripDocument);
      console.log("=== END SAVE DEBUG ===");
      
      await setDoc(doc(db, "alltrips", docId), tripDocument);
      
      console.log("Trip saved successfully");
      navigate(`/show-trip/${docId}`);
      return docId;
    } catch (error) {
      console.error("SaveAiTrip Error:", error);
      console.error("Error details:", {
        message: error.message,
        code: error.code,
        stack: error.stack
      });
      setErrorMessage(`Failed to save your trip: ${error.message}. Please try again later.`);
      throw error;
    } finally {
      setIsSaving(false);
    }
  };

  const handleFormSubmit = async () => {
    // Validate all required fields
    if (!formData.location || !formData.duration || !formData.travelType || !formData.budget || !formData.travelers) {
      setErrorMessage("Please fill all the fields");
      console.error("Form validation failed:", formData);
      return;
    }
    
    // Validate location is not empty
    if (formData.location.trim() === '') {
      setErrorMessage("Please enter a valid destination");
      console.error("Location is empty");
      return;
    }
    
    if (formData.duration > 5 || formData.duration < 1) {
      setErrorMessage("Trip duration must be between 1 and 5 days");
      return;
    }
    
    setErrorMessage(null);
    
    try {
      setIsGenerating(true);
      
      const travelParams = {
        location: formData.location,
        duration: `${formData.duration} Days`,
        for: `${formData.travelers} travelers`,
        budgetAmount: formData.budget
      };
      
      console.log("Generating trip with params:", travelParams);
      
      const result = await generateTravelPlan(travelParams);
      
      if (result) {
        console.log("Trip plan generated successfully");
        
        try {
          await SaveAiTrip(result);
          // If save is successful, show success message
          setShowSuccess(true);
          setTimeout(() => {
            setShowSuccess(false);
            resetForm();
          }, 2500);
        } catch (saveError) {
          console.error("Error saving trip:", saveError);
          // Error message already set in SaveAiTrip
          // Don't reset form so user can try again
        }
      } else {
        setErrorMessage("Failed to generate trip plan. Please try again.");
      }
    } catch (error) {
      console.error("Error in handleFormSubmit:", error);
      setErrorMessage(`Failed to generate your trip plan: ${error.message}. Please try again.`);
    } finally {
      setIsGenerating(false);
    }
  };

  // Use context user for auth check
  const onSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      setErrorMessage("Please sign in from the header to generate your trip");
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    handleFormSubmit();
  };


  // Animation and UI constants - no changes needed
   const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.2,
        duration: 0.6
      }
    }
  };
   const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 80,
        damping: 12
      }
    }
  };
 const sectionVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        type: "spring", 
        stiffness: 70, 
        damping: 14 
      }
    }
  };
    
  const mobileSectionVariants = {
    hidden: { opacity: 0, x: 60 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: { 
        type: "spring", 
        stiffness: 100,
        damping: 15 
      }
    }
  };
   const planeAnimation = {
    initial: { x: -50, y: 20, opacity: 0, scale: 0.5 },
    animate: { 
      x: [0, 100, 200], 
      y: [0, -20, 0], 
      opacity: [0, 1, 0], 
      scale: [0.5, 1, 0.5],
      transition: { duration: 1, ease: "easeInOut" }
    }
  };

  // Dialog animation variants
  const dialogVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { type: "spring", stiffness: 500, damping: 25 }
    },
    exit: { opacity: 0, scale: 0.8, transition: { duration: 0.2 } }
  };
   const stepIcons = [
    <FaMapMarkerAlt key="location" />,
    <FaCalendarAlt key="calendar" />,
    <MdExplore key="explore" />,
    <RiMoneyDollarCircleLine key="budget" />
  ];
  // Combined loading state
  const isLoading = isGenerating || aiLoading || isSaving;

  return (
    <AnimatePresence mode="wait">
      <motion.div 
        key={isRefreshing ? 'refreshing' : 'content'}
        className="w-full relative overflow-hidden"
        initial="hidden"
        animate="visible"
        exit={{ opacity: 0, y: -20 }}
        variants={containerVariants}
      >
        {/* Dark banner header */}
        <div className="bg-[#1a1a2e] py-12 sm:py-16">
          <div className={`mx-auto px-4 sm:px-6 ${isMobile ? 'max-w-full' : 'max-w-4xl'}`}>
            <span className="text-[11px] uppercase tracking-[0.25em] text-white/50 font-medium">Plan Your Journey</span>
            <h2 className="font-serif text-3xl sm:text-4xl text-white mt-2">Your Dream Trip Awaits</h2>
            <div className="w-12 h-[2px] bg-emerald-600 mt-3"></div>
            {!isMobile && (
              <p className="text-white/60 text-sm tracking-wide mt-4 max-w-xl">
                Let us help you craft the perfect getaway tailored to your preferences and style.
              </p>
            )}
          </div>
        </div>
        {travelAnimation && null}

       {isRefreshing ? (
          <div className={`mx-auto px-4 sm:px-6 py-12 ${isMobile ? 'max-w-full' : 'max-w-4xl'}`}>
            <div className="flex flex-col items-center justify-center h-40 gap-4">
              <div className="w-[1px] h-10 bg-emerald-600 animate-pulse"></div>
              <p className="text-[11px] uppercase tracking-[0.25em] text-gray-400 font-medium">Preparing your next adventure</p>
            </div>
          </div>
        ) : (
          <div className={`mx-auto px-4 sm:px-6 py-8 sm:py-10 ${isMobile ? 'max-w-full' : 'max-w-4xl'}`}>

            <motion.div 
              className="hidden"
              variants={itemVariants}
            >
            </motion.div>

            {/* Step progress */}
            <motion.div 
              className="mb-8"
              variants={itemVariants}
            >
              {isMobile ? (
                <div className="flex items-center justify-between gap-1 px-2">
                  {[1,2,3,4].map((step, i) => (
                    <motion.div 
                      key={i} 
                      className={`flex-1 h-[2px] ${i <= activeSection ? 'bg-emerald-600' : 'bg-gray-200'}`}
                      initial={{ width: 0 }}
                      animate={{ width: "100%" }}
                      transition={{ duration: 0.5, delay: i * 0.1 }}
                    />
                  ))}
                  <div className="ml-3 text-[11px] uppercase tracking-[0.15em] font-medium text-[#1a1a2e]">
                    {Math.min(activeSection + 1, 4)}/4
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex justify-between mb-3 relative">
                    <div className="absolute top-4 left-0 right-0 h-[1px] bg-gray-200 z-0"></div>
                    {stepIcons.map((icon, i) => (
                      <motion.div 
                        key={i} 
                        className="flex flex-col items-center z-10"
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: i * 0.1, duration: 0.3 }}
                      >
                        <div className={`w-9 h-9 flex items-center justify-center text-sm ${i <= activeSection ? 'bg-[#1a1a2e] text-white' : 'bg-gray-100 text-gray-400'} transition-all duration-500`}>
                          {icon}
                        </div>
                        <div className="text-[10px] uppercase tracking-[0.15em] mt-2 text-gray-500 font-medium">
                          {i === 0 ? "Destination" : i === 1 ? "Duration" : i === 2 ? "Type" : "Details"}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                  <div className="w-full bg-gray-200 h-[2px] overflow-hidden mt-2">
                    <motion.div 
                      className="bg-emerald-600 h-full"
                      initial={{ width: "0%" }}
                      animate={{ width: `${(activeSection + 1) * 25}%` }}
                      transition={{ duration: 0.6, type: "spring", stiffness: 60, damping: 12 }}
                    />
                  </div>
                </>
              )}
            </motion.div>

            {/* All sections visible at all times with conditional highlighted styling */}
            <motion.div 
              className={`mb-6 bg-white p-6 sm:p-8 border ${activeSection === 0 ? 'border-emerald-600' : 'border-gray-200'}`}
              variants={itemVariants}
            >
              <div className="flex items-center gap-3 mb-1">
                <FaMapMarkerAlt className={`text-base ${activeSection === 0 ? 'text-emerald-600' : 'text-gray-400'}`} />
                <span className="text-[10px] uppercase tracking-[0.2em] text-gray-400 font-medium">Step 1</span>
              </div>
              <h3 className="font-serif text-lg text-[#1a1a2e] mb-4">Where would you like to go?</h3>
              <div className="transform transition-all hover:scale-101">
                <GooglePlacesAutocomplete
                  apiKey={import.meta.env.VITE_GOOGLE_PLACE_API_KEY}
                  apiOptions={{
                    language: 'en',
                    region: 'us'
                  }}
                  autocompletionRequest={{
                    types: ['(cities)'],
                    componentRestrictions: {}
                  }}
                  selectProps={{
                    value: place,
                    placeholder: 'Search for a destination',
                    onChange: (v) => {
                      console.log('Place selected:', v);
                      if (v && v.label) {
                        setPlace(v);
                        handleInput('place', v);
                      }
                    },
                    isClearable: true,
                    onInputChange: (inputValue, { action }) => {
                      if (action === 'input-change') {
                        console.log('Input changed:', inputValue);
                      }
                    },
                    styles: {
                      control: (provided) => ({
                        ...provided,
                        padding: '4px',
                        borderRadius: '0px',
                        border: `1px solid ${activeSection === 0 ? '#059669' : '#e2e8f0'}`,
                        boxShadow: 'none',
                      }),
                      option: (provided) => ({
                        ...provided,
                        padding: '10px',
                      }),
                    }
                  }}
                />
              </div>
            
              <AnimatePresence>
                {errorMessage && (
                  <motion.div 
                    className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                  >
                    <div className="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zm-1 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                      </svg>
                      {errorMessage}
                    </div>
                    <button 
                      className="text-sm text-red-600 underline mt-1"
                      onClick={() => setErrorMessage(null)}
                    >
                      Dismiss
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
              
              {place && (
                <motion.div 
                  className="flex items-center mt-2 text-emerald-700"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <MdLocationOn className="mr-1" /> 
                  <span className="text-sm">
                    {formData.location || "Destination selected"}
                  </span>
                </motion.div>
              )}
            </motion.div>

            <motion.div 
              className={`mb-6 bg-white p-6 sm:p-8 border ${activeSection === 1 ? 'border-emerald-600' : 'border-gray-200'}`}
              variants={itemVariants}
            >
              <div className="flex items-center gap-3 mb-1">
                <FaCalendarAlt className={`text-base ${activeSection === 1 ? 'text-emerald-600' : 'text-gray-400'}`} />
                <span className="text-[10px] uppercase tracking-[0.2em] text-gray-400 font-medium">Step 2</span>
              </div>
              <h3 className="font-serif text-lg text-[#1a1a2e] mb-4">How long will you be traveling?</h3>
              {isMobile ? (
                <div className="flex flex-wrap gap-2 justify-between">
                  {[1, 2, 3, 4, 5].map((day) => (
                    <motion.button
                      key={day}
                      onClick={() => handleInput('duration', day)}
                      className={`flex-1 min-w-[65px] py-3 px-2 text-center text-sm ${
                        formData.duration === day 
                          ? 'bg-[#1a1a2e] text-white' 
                          : 'bg-gray-50 text-gray-600 border border-gray-200 hover:border-gray-300'
                      } transition-all duration-300 relative overflow-hidden`}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {formData.duration === day && (
                        <motion.div 
                          className="absolute inset-0 bg-emerald-500 z-0 opacity-30"
                          initial={{ width: 0 }}
                          animate={{ width: "100%" }}
                          transition={{ duration: 0.5 }}
                        />
                      )}
                      <span className="relative z-10">
                        {day} {day === 1 ? 'Day' : 'Days'}
                      </span>
                    </motion.button>
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  <input
                    type="number"
                    min="1"
                    max="5"
                    placeholder="Number of days (1-5)"
                    onChange={(e) => handleInput('duration', Number(e.target.value))}
                    className={`border p-3 w-full outline-none transition-all duration-300 ${activeSection === 1 ? 'focus:border-emerald-600 border-emerald-600' : 'border-gray-200 focus:border-[#1a1a2e]'}`}
                    value={formData.duration || ''}
                  />
                  <div className="flex items-center gap-2 mt-2">
                    {[1, 2, 3, 4, 5].map((day) => (
                      <motion.button
                        key={day}
                        onClick={() => handleInput('duration', day)}
                        className={`px-3 py-1 border text-sm ${
                          formData.duration === day 
                            ? 'bg-[#1a1a2e] border-[#1a1a2e] text-white' 
                            : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300'
                        }`}
                        whileHover={{ y: -2 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        {day}
                      </motion.button>
                    ))}
                    <span className="text-xs text-gray-500">days</span>
                  </div>
                  <p className="text-xs text-gray-500">Maximum trip duration is 5 days</p>
                </div>
              )}
            </motion.div>

           <motion.div 
              className={`mb-6 bg-white p-6 sm:p-8 border ${activeSection === 2 ? 'border-emerald-600' : 'border-gray-200'}`}
              variants={itemVariants}
            >
              <div className="flex items-center gap-3 mb-1">
                <FaWalking className={`text-base ${activeSection === 2 ? 'text-emerald-600' : 'text-gray-400'}`} />
                <span className="text-[10px] uppercase tracking-[0.2em] text-gray-400 font-medium">Step 3</span>
              </div>
              <h3 className="font-serif text-lg text-[#1a1a2e] mb-4">What type of adventure are you seeking?</h3>
              <div className={`grid ${isMobile ? 'grid-cols-1 gap-3' : 'md:grid-cols-2 gap-4'}`}>
                {SelectTravelList.map((item, index) => (
                  <motion.div
                    key={index}
                    onClick={() => handleInput('travelType', item.id)}
                    className={`border p-5 cursor-pointer transition-all duration-300 
                      ${formData.travelType === item.id 
                        ? 'bg-[#f5f0eb] border-emerald-600' 
                        : 'border-gray-200 hover:border-gray-300'
                      } relative overflow-hidden`}
                    whileHover={{ scale: isMobile ? 1.01 : 1.02, boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}
                    whileTap={{ scale: 0.98 }}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1, duration: 0.3 }}
                  >
                    {formData.travelType === item.id && (
                      <motion.div 
                        className="absolute right-2 top-2 text-emerald-500 bg-white rounded-full p-1 shadow-sm"
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ type: "spring", stiffness: 300, damping: 10 }}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                          <path d="M13.854 3.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6.5 10.293l6.646-6.647a.5.5 0 0 1 .708 0z"/>
                        </svg>
                      </motion.div>
                    )}
                    <div className="flex items-center gap-3 mb-1">
                      <div className={`${isMobile ? 'text-lg p-2 rounded-full' : 'text-xl'} ${
                        formData.travelType === item.id 
                          ? 'text-emerald-600 bg-emerald-50' 
                          : activeSection === 2
                            ? 'text-emerald-500 bg-emerald-50'
                            : 'text-gray-500 bg-gray-100'
                      }`}>
                        {item.icon}
                      </div>
                      <div>
                        <h4 className="font-medium text-lg">{item.title}</h4>
                      </div>
                    </div>
                    {(!isMobile || formData.travelType === item.id) && (
                      <motion.div 
                        className="mt-2"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                      >
                        <p className="text-sm text-gray-600">
                          {item.description}
                        </p>
                        {formData.travelType === item.id && (
                          <div className="mt-2 flex flex-wrap gap-2">
                            {item.features.map((feature, i) => (
                              <span key={i} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                                {feature}
                              </span>
                            ))}
                          </div>
                        )}
                      </motion.div>
                    )}
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div 
              className={`mb-6 bg-white p-6 sm:p-8 border ${activeSection === 3 ? 'border-emerald-600' : 'border-gray-200'}`}
              variants={itemVariants}
            >
              <div className="flex items-center gap-3 mb-1">
                <RiMoneyDollarCircleLine className={`text-base ${activeSection === 3 ? 'text-emerald-600' : 'text-gray-400'}`} />
                <span className="text-[10px] uppercase tracking-[0.2em] text-gray-400 font-medium">Step 4</span>
              </div>
              <h3 className="font-serif text-lg text-[#1a1a2e] mb-4">Trip Details</h3>
              
              {/* Budget Input */}
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  What's your total budget? (₹)
                </label>
                <input
                  type="number"
                  min="100"
                  placeholder="Enter your budget amount"
                  onChange={(e) => handleInput('budget', parseInt(e.target.value))}
                  className={`border p-3 w-full outline-none transition-all duration-300 ${activeSection === 3 ? 'focus:border-emerald-600 border-emerald-600' : 'border-gray-200 focus:border-[#1a1a2e]'}`}
                  value={formData.budget || ''}
                />
                <p className="text-xs text-gray-500 mt-1">Enter the total amount you're willing to spend</p>
              </div>
              
              {/* Number of Travelers Input */}
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  How many travelers?
                </label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5, 6].map((num) => (
                    <motion.button
                      key={num}
                      onClick={() => handleInput('travelers', num)}
                      className={`flex-1 py-2 px-3 text-center text-sm ${
                        formData.travelers === num 
                          ? 'bg-[#1a1a2e] text-white' 
                          : 'bg-gray-50 text-gray-600 border border-gray-200 hover:border-gray-300'
                      } transition-all duration-300`}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <span>{num}</span>
                    </motion.button>
                  ))}
                </div>
                
                <div className="flex items-center gap-2 mt-3 text-gray-600">
                  <FaUsers className="text-emerald-500" />
                  <span className="text-sm">
                    {formData.travelers ? 
                      `${formData.travelers} ${formData.travelers === 1 ? 'person' : 'people'}` : 
                      'Select number of travelers'}
                  </span>
                </div>
              </div>

              {/* Social Sharing Toggle */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  Share your trip socially?
                </label>
                <div className="flex items-center justify-between p-4 bg-[#f5f0eb]">
                  <div>
                    <p className="font-medium text-gray-800">Make this trip public</p>
                    <p className="text-sm text-gray-500">Public trips appear in Explore feed for all users</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="sr-only peer"
                      checked={formData.isPublic || false}
                      onChange={() => handleInput('isPublic', !formData.isPublic)}
                    />
                    <div className={`w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all ${formData.isPublic ? 'peer-checked:bg-emerald-600' : ''}`}></div>
                  </label>
                </div>
              </div>
            </motion.div>

            {/* Submit Button with updated loading state */}
           

<AnimatePresence>
  {isFormComplete() && (
    <motion.div
      className={`mt-8 ${isMobile ? 'sticky bottom-4 z-20' : ''}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      <motion.button
        onClick={(e) => {
          e.preventDefault();
          if (!user) {
            setErrorMessage("Please sign in from the header to generate your trip");
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
          }
          handleFormSubmit();
        }}
        className={`bg-[#1a1a2e] hover:bg-[#2a2a4e] text-white text-[12px] uppercase tracking-[0.2em] font-medium py-4 px-10 flex items-center justify-center gap-3 ${isMobile ? 'w-full' : 'md:w-auto'} transition-colors ${isLoading ? 'opacity-75 cursor-not-allowed' : ''}`}
        whileHover={isLoading ? {} : { scale: 1.01 }}
        whileTap={isLoading ? {} : { scale: 0.99 }}
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <div className="w-[1px] h-4 bg-emerald-400 animate-pulse mr-1"></div>
            <span>{isSaving ? "Saving Trip..." : "Generating Trip Plan..."}</span>
          </>
        ) : (
          <>
            <FaSuitcase size={12} />
            <span>Generate My Trip</span>
            <BiSolidChevronRight />
          </>
        )}
      </motion.button>
    </motion.div>
  )}
</AnimatePresence>

       {/* Loading overlay */}

          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}

export default CreateTrip;