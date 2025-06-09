

import React, { useEffect, useState } from 'react';
import GooglePlacesAutocomplete from 'react-google-places-autocomplete';
import { BudgetOptions, SelectTravelList } from '@/choices/SelectTravelList';
import { motion, AnimatePresence } from 'framer-motion';
import { FaPlane, FaMapMarkerAlt, FaCalendarAlt, FaWalking, FaSuitcase, FaPaperPlane } from 'react-icons/fa';
import { RiMoneyDollarCircleLine, RiFlightTakeoffFill } from 'react-icons/ri';
import { BiSolidChevronRight, BiRefresh } from 'react-icons/bi';
import { MdLocationOn, MdOutlineSwipe, MdExplore, MdHotel } from 'react-icons/md';

function CreateTrip() {
  const [place, setPlace] = useState(null);
  const [formData, setFormData] = useState({});
  const [activeSection, setActiveSection] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [travelAnimation, setTravelAnimation] = useState(false);

  const isFormComplete = () => {
    return formData.place && 
           formData.duration && 
           formData.travelType && 
           formData.budget;
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
    setFormData({
      ...formData,
      [name]: value
    });
    
    setTravelAnimation(true);
    setTimeout(() => setTravelAnimation(false), 1000);
    
    if (name === 'place') setActiveSection(1);
    else if (name === 'duration') setActiveSection(2);
    else if (name === 'travelType') setActiveSection(3);
  };

  const resetForm = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setFormData({});
      setPlace(null);
      setActiveSection(0);
      setIsRefreshing(false);
    }, 800);
  };

  const onSubmit = (e) => {
    e.preventDefault();
    if (formData?.duration > 5) {
      alert("You can only travel for a maximum of 5 days");
      return;
    }
    
    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
      resetForm();
    }, 2500);
  };

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

  const stepIcons = [
    <FaMapMarkerAlt key="location" />,
    <FaCalendarAlt key="calendar" />,
    <MdExplore key="explore" />,
    <RiMoneyDollarCircleLine key="budget" />
  ];

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

  return (
    <AnimatePresence mode="wait">
      <motion.div 
        key={isRefreshing ? 'refreshing' : 'content'}
        className={`p-6 mx-auto bg-white bg-opacity-95 backdrop-blur-sm  ${isMobile ? 'max-w-full' : 'max-w-4xl'} relative overflow-hidden`}
        initial="hidden"
        animate="visible"
        exit={{ opacity: 0, y: -20 }}
        variants={containerVariants}
        style={{
          backgroundImage: isMobile ? 
            'linear-gradient(to bottom, rgba(255,255,255,0.95), rgba(255,255,255,0.98))' : 
            'url("https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=2073")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundBlendMode: 'overlay'
        }}
      >
        {travelAnimation && (
          <motion.div 
            className="absolute inset-0 pointer-events-none z-30 overflow-hidden"
            variants={planeAnimation}
            initial="initial"
            animate="animate"
          >
            <div className="text-emerald-600 text-4xl absolute">
              <RiFlightTakeoffFill />
            </div>
          </motion.div>
        )}

        {isRefreshing ? (
          <div className="flex flex-col items-center justify-center h-40">
            <motion.div 
              initial={{ rotate: 0 }}
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="text-emerald-500 text-4xl mb-4"
            >
              <BiRefresh />
            </motion.div>
            <p className="text-emerald-600">Preparing your next adventure...</p>
          </div>
        ) : (
          <>
            <motion.div 
              className="flex items-center gap-3 mb-4"
              variants={itemVariants}
            >
              <div className="relative">
                
              </div>
              <h2 className={`${isMobile ? 'text-2xl' : 'text-3xl'} font-bold bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent`}>
                Your Dream Trip Awaits
              </h2>
            </motion.div>

            {!isMobile && (
              <motion.p 
                className="text-gray-700 mb-6 leading-relaxed"
                variants={itemVariants}
              >
                Let us help you craft the perfect getaway tailored to your preferences and style.
                Complete the form below and we'll create a personalized itinerary just for you.
              </motion.p>
            )}

            <motion.div 
              className={`mb-6 ${isMobile ? 'bg-white p-2 rounded-full shadow-sm' : 'bg-gray-50 p-3 rounded-lg bg-opacity-80'}`}
              variants={itemVariants}
            >
              {isMobile ? (
                <div className="flex items-center justify-between gap-1 px-2">
                  {[1,2,3,4].map((step, i) => (
                    <motion.div 
                      key={i} 
                      className={`flex-1 h-1.5 rounded-full ${i <= activeSection ? 'bg-emerald-600' : 'bg-gray-200'}`}
                      initial={{ width: 0 }}
                      animate={{ width: "100%" }}
                      transition={{ duration: 0.5, delay: i * 0.1 }}
                    />
                  ))}
                  <div className="ml-2 text-xs font-medium text-emerald-600">
                    {activeSection + 1}/4
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex justify-between mb-2 relative">
                    <div className="absolute top-4 left-0 right-0 h-0.5 bg-gray-200 z-0"></div>
                    {stepIcons.map((icon, i) => (
                      <motion.div 
                        key={i} 
                        className="flex flex-col items-center z-10"
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: i * 0.1, duration: 0.3 }}
                      >
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${i <= activeSection ? 'bg-emerald-600 text-white' : 'bg-gray-200 text-gray-500'} transition-all duration-500`}>
                          {icon}
                        </div>
                        <div className="text-xs mt-1 text-gray-600 font-medium">
                          {i === 0 ? "Destination" : i === 1 ? "Duration" : i === 2 ? "Type" : "Budget"}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                  <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden mt-2">
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

            {isMobile && activeSection === 0 && (
              <motion.div 
                className="flex justify-center items-center text-gray-500 text-sm mb-3"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <MdOutlineSwipe className="mr-1" /> Swipe after completing each step
              </motion.div>
            )}

            <motion.div 
              className={`mb-5 bg-white p-6 ${isMobile ? 'rounded-2xl shadow-lg border-t-4' : 'rounded-xl shadow-md border-l-4'} border-emerald-600 transition-all duration-300`}
              animate={activeSection >= 0 ? "visible" : "hidden"}
              variants={isMobile ? mobileSectionVariants : sectionVariants}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className={`${isMobile ? 'p-2 bg-emerald-100 rounded-full' : ''}`}>
                  <FaMapMarkerAlt className={`${isMobile ? 'text-lg' : 'text-xl'} text-emerald-600`} />
                </div>
                <h3 className="font-semibold text-lg">Where would you like to go?</h3>
              </div>
              <div className="transform transition-all hover:scale-101">
                <GooglePlacesAutocomplete
                  apiKey={import.meta.env.VITE_GOOGLE_PLACE_API_KEY}
                  selectProps={{
                    value: place,
                    placeholder: 'Search for a destination',
                    onChange: (v) => {
                      setPlace(v);
                      handleInput('place', v);
                    },
                    styles: {
                      control: (provided) => ({
                        ...provided,
                        padding: '4px',
                        borderRadius: '8px',
                        border: '1px solid #e2e8f0',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                      }),
                      option: (provided) => ({
                        ...provided,
                        padding: '10px',
                      }),
                    }
                  }}
                />
              </div>
              {place && (
                <motion.div 
                  className="flex items-center mt-2 text-emerald-700"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <MdLocationOn className="mr-1" /> 
                  <span className="text-sm">Destination selected</span>
                </motion.div>
              )}
            </motion.div>

            <motion.div 
              className={`mb-5 bg-white p-6 ${isMobile ? 'rounded-2xl shadow-lg border-t-4' : 'rounded-xl shadow-md border-l-4'} ${activeSection >= 1 ? 'border-emerald-600' : 'border-gray-200'} transition-all duration-300`}
              animate={activeSection >= 1 ? "visible" : "hidden"}
              variants={isMobile ? mobileSectionVariants : sectionVariants}
              initial="hidden"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className={`${isMobile ? 'p-2 bg-emerald-100 rounded-full' : ''}`}>
                  <FaCalendarAlt className={`${isMobile ? 'text-lg' : 'text-xl'} text-emerald-600`} />
                </div>
                <h3 className="font-semibold text-lg">How long will you be traveling?</h3>
              </div>
              {isMobile ? (
                <div className="flex flex-wrap gap-2 justify-between">
                  {[1, 2, 3, 4, 5].map((day) => (
                    <motion.button
                      key={day}
                      onClick={() => handleInput('duration', day)}
                      className={`flex-1 min-w-[65px] py-3 px-2 rounded-lg text-center ${
                        formData.duration === day 
                          ? 'bg-emerald-600 text-white' 
                          : 'bg-gray-100 text-gray-700'
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
                    className="border p-3 rounded-lg w-full focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all duration-300"
                    value={formData.duration || ''}
                  />
                  <div className="flex items-center gap-2 mt-2">
                    {[1, 2, 3, 4, 5].map((day) => (
                      <motion.button
                        key={day}
                        onClick={() => handleInput('duration', day)}
                        className={`px-3 py-1 rounded border ${
                          formData.duration === day 
                            ? 'bg-emerald-50 border-emerald-500 text-emerald-700' 
                            : 'bg-gray-50 border-gray-200 text-gray-500'
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
              className={`mb-5 bg-white p-6 ${isMobile ? 'rounded-2xl shadow-lg border-t-4' : 'rounded-xl shadow-md border-l-4'} ${activeSection >= 2 ? 'border-emerald-600' : 'border-gray-200'} transition-all duration-300`}
              animate={activeSection >= 2 ? "visible" : "hidden"}
              variants={isMobile ? mobileSectionVariants : sectionVariants}
              initial="hidden"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className={`${isMobile ? 'p-2 bg-emerald-100 rounded-full' : ''}`}>
                  <FaWalking className={`${isMobile ? 'text-lg' : 'text-xl'} text-emerald-600`} />
                </div>
                <h3 className="font-semibold text-lg">What type of adventure are you seeking?</h3>
              </div>
              <div className={`grid ${isMobile ? 'grid-cols-1 gap-3' : 'md:grid-cols-2 gap-4'}`}>
                {SelectTravelList.map((item, index) => (
                  <motion.div
                    key={index}
                    onClick={() => handleInput('travelType', item.id)}
                    className={`border ${isMobile ? 'rounded-xl shadow-sm' : 'rounded-xl'} p-5 hover:shadow-md cursor-pointer transition-all duration-300 ${formData.travelType === item.id ? 'bg-emerald-50 border-emerald-500' : ''} relative overflow-hidden`}
                    whileHover={{ scale: isMobile ? 1.01 : 1.02, boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}
                    whileTap={{ scale: 0.98 }}
                    initial={{ opacity: 0, y: 15 }}
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
                      <div className={`text-emerald-600 ${isMobile ? 'text-lg bg-emerald-50 p-2 rounded-full' : 'text-xl'}`}>
                        {item.icon}
                      </div>
                      <h4 className="font-medium text-lg">{item.title}</h4>
                    </div>
                    {(!isMobile || formData.travelType === item.id) && (
                      <motion.p 
                        className="text-sm text-gray-600"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        transition={{ duration: 0.3 }}
                      >
                        {item.description}
                      </motion.p>
                    )}
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div 
              className={`mb-5 bg-white p-6 ${isMobile ? 'rounded-2xl shadow-lg border-t-4' : 'rounded-xl shadow-md border-l-4'} ${activeSection >= 3 ? 'border-emerald-600' : 'border-gray-200'} transition-all duration-300`}
              animate={activeSection >= 3 ? "visible" : "hidden"}
              variants={isMobile ? mobileSectionVariants : sectionVariants}
              initial="hidden"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className={`${isMobile ? 'p-2 bg-emerald-100 rounded-full' : ''}`}>
                  <RiMoneyDollarCircleLine className={`${isMobile ? 'text-lg' : 'text-xl'} text-emerald-600`} />
                </div>
                <h3 className="font-semibold text-lg">What's your budget range?</h3>
              </div>
              <div className={`grid ${isMobile ? 'grid-cols-1 gap-3' : 'md:grid-cols-3 gap-4'}`}>
                {BudgetOptions.map((item, index) => (
                  <motion.div
                    key={index}
                    onClick={() => handleInput('budget', item.id)}
                    className={`border ${isMobile ? 'rounded-xl shadow-sm' : 'rounded-xl'} p-5 hover:shadow-md cursor-pointer transition-all duration-300 ${formData.budget === item.id ? 'bg-emerald-50 border-emerald-500' : ''}`}
                    whileHover={{ scale: isMobile ? 1.01 : 1.03, boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}
                    whileTap={{ scale: 0.97 }}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1, duration: 0.3 }}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`text-emerald-600 ${isMobile ? 'text-lg bg-emerald-50 p-2 rounded-full' : 'text-xl'}`}>
                        {item.icon}
                      </div>
                      <div>
                        <h4 className="font-medium">{item.label}</h4>
                        {isMobile && <p className="text-xs text-gray-500">{item.description}</p>}
                      </div>
                    </div>
                    {!isMobile && <p className="text-sm text-gray-500 mt-2">{item.description}</p>}
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <AnimatePresence>
              {isFormComplete() && (
                <motion.div
                  className={`mt-6 ${isMobile ? 'sticky bottom-4 z-20' : ''}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                  <motion.button
                    onClick={onSubmit}
                    className={`bg-gradient-to-r from-emerald-500 to-teal-600 text-white py-3 px-8 rounded-lg shadow-md hover:shadow-lg flex items-center justify-center gap-2 ${isMobile ? 'w-full' : 'md:w-auto'} relative overflow-hidden`}
                    whileHover={{ scale: 1.03, boxShadow: "0px 8px 15px rgba(16, 185, 129, 0.2)" }}
                    whileTap={{ scale: 0.97 }}
                  >
                    <motion.div
                      className="absolute inset-0 bg-white opacity-20"
                      initial={{ x: "-100%" }}
                      whileHover={{ x: "100%" }}
                      transition={{ duration: 1, ease: "easeInOut" }}
                    />
                    <FaSuitcase className="mr-2" />
                    <span>Generate My Trip</span>
                    <BiSolidChevronRight className={`${isMobile ? 'text-2xl' : 'text-xl'}`} />
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {showSuccess && (
                <motion.div 
                  className={`fixed ${isMobile ? 'bottom-20 left-4 right-4' : 'bottom-8 right-8'} bg-emerald-500 text-white p-4 rounded-lg shadow-lg flex items-center gap-2 z-50`}
                  initial={{ y: 50, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: 50, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 300, damping: 25 }}
                >
                  <FaPaperPlane className="text-xl animate-bounce" />
                  <span>Trip generated successfully!</span>
                  <span className="text-2xl ml-1">✈️</span>
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}
      </motion.div>
    </AnimatePresence>
  );
}

export default CreateTrip;