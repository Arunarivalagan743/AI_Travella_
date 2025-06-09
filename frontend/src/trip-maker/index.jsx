// import React, { useEffect, useState } from 'react';
// import GooglePlacesAutocomplete from 'react-google-places-autocomplete';
// import { AI_PROMPT, BudgetOptions, SelectTravelList } from '@/choices/SelectTravelList';
// import { motion, AnimatePresence } from 'framer-motion';
// import { FaPlane, FaMapMarkerAlt, FaCalendarAlt, FaWalking, FaSuitcase, FaPaperPlane } from 'react-icons/fa';
// import { RiMoneyDollarCircleLine, RiFlightTakeoffFill } from 'react-icons/ri';
// import { BiSolidChevronRight, BiRefresh } from 'react-icons/bi';
// import { MdLocationOn, MdOutlineSwipe, MdExplore, MdHotel } from 'react-icons/md';
// // Import the default export
// import AiSetup from '../ModelWork/AiSetup';
// import { useGoogleLogin } from '@react-oauth/google';

// function CreateTrip() {
//   const [place, setPlace] = useState(null);
//   const [formData, setFormData] = useState({});
//   const [activeSection, setActiveSection] = useState(0);
//   const [showSuccess, setShowSuccess] = useState(false);
//   const [isMobile, setIsMobile] = useState(false);
//   const [isRefreshing, setIsRefreshing] = useState(false);
//   const [travelAnimation, setTravelAnimation] = useState(false);
//   const [isGenerating, setIsGenerating] = useState(false);
//   const [openDialog, setOpenDialog] = useState(false);
  
//   // Move the hook to the component level so it doesn't recreate on every submit
//   const { generateTravelPlan, loading, error, travelData } = AiSetup();

//   const isFormComplete = () => {
//     return formData.place && 
//            formData.duration && 
//            formData.travelType && 
//            formData.budget;
//   };

//   useEffect(() => {
//     const checkScreenSize = () => {
//       setIsMobile(window.innerWidth < 768);
//     };
    
//     checkScreenSize();
//     window.addEventListener('resize', checkScreenSize);
    
//     return () => window.removeEventListener('resize', checkScreenSize);
//   }, []);

//   const handleInput = (name, value) => {
//     if (name === 'place') {
//       // Extract location name from the place object
//       const locationName = value?.label || value?.value?.description || "Unknown location";
//       setFormData({
//         ...formData,
//         place: value, // Keep the original place object
//         location: locationName // Add a separate location string property
//       });
//     } else {
//       setFormData({
//         ...formData,
//         [name]: value
//       });
//     }
    
//     setTravelAnimation(true);
//     setTimeout(() => setTravelAnimation(false), 1000);
    
//     if (name === 'place') setActiveSection(1);
//     else if (name === 'duration') setActiveSection(2);
//     else if (name === 'travelType') setActiveSection(3);
//   };

//   const resetForm = () => {
//     setIsRefreshing(true);
//     setTimeout(() => {
//       setFormData({});
//       setPlace(null);
//       setActiveSection(0);
//       setIsRefreshing(false);
//     }, 800);
//   };

//   const onSubmit = async (e) => {
//     e.preventDefault();
// const user = localStorage.getItem('user');
//     if (!user) {
//       alert("Please log in to create a trip");  
//       return;
//     }
    
//     // Check if all required fields are filled
//     if (!formData.location || !formData.duration || !formData.travelType || !formData.budget) {
//       alert("Please fill all the fields");
//       return;
//     }
    
//     // Check duration limit
//     if (formData.duration > 5) {
//       alert("You can only travel for a maximum of 5 days");
//       resetForm();
//       return;
//     }
    
//     // Find the selected travel type to get the peopleMax
//     const selectedTravelType = SelectTravelList.find(item => item.id === formData.travelType);
//     const peopleMax = selectedTravelType ? selectedTravelType.peopleMax : "4-6 people";
    
//     const FINAL_PROMPT = AI_PROMPT.replace('{location}', formData.location)
//                                  .replace('{duration}', formData.duration)
//                                  .replace('{travelType}', formData.travelType)
//                                  .replace('{budget}', formData.budget)
//                                  .replace('{peopleMax}', peopleMax);
                                 
//     console.log("Final AI Prompt:", FINAL_PROMPT);
    
//     try {
//       // Show loading state
//       setIsGenerating(true);
      
//       // Prepare travel parameters for AI
//       const travelParams = {
//         location: formData.location,
//         duration: `${formData.duration} Days`,
//         for: peopleMax,
//         budgetType: formData.budget
//       };
      
//       console.log("Calling generateTravelPlan with params:", travelParams);
      
//       // Call the AI service
//       const result = await generateTravelPlan(travelParams);
//       console.log("Generated travel plan:", result);
      
//       // Store the result in localStorage for later use
//       if (result) {
//         localStorage.setItem('lastTripPlan', JSON.stringify(result));
//       }
      
//       // Show success message
//       setShowSuccess(true);
//       setTimeout(() => {
//         setShowSuccess(false);
//         resetForm();
//       }, 2500);
      
//       // Navigate to results page (if you have routing set up)
//       // window.location.href = '/trip-results';
      
//     } catch (error) {
//       console.error("Error generating trip:", error);
//       alert("Failed to generate your trip plan. Please try again.");
//     } finally {
//       setIsGenerating(false);
//     }
//   };
//   const login = useGoogleLogin({
//     onSuccess: (response) => console.log("Login successful:", response),
//     onError: (error) => console.error("Login failed:", error)
//   })

//   const containerVariants = {
//     hidden: { opacity: 0 },
//     visible: { 
//       opacity: 1,
//       transition: { 
//         staggerChildren: 0.2,
//         duration: 0.6
//       }
//     }
//   };

//   const itemVariants = {
//     hidden: { y: 30, opacity: 0 },
//     visible: { 
//       y: 0, 
//       opacity: 1,
//       transition: {
//         type: "spring",
//         stiffness: 80,
//         damping: 12
//       }
//     }
//   };

//   const sectionVariants = {
//     hidden: { opacity: 0, y: 30 },
//     visible: { 
//       opacity: 1, 
//       y: 0,
//       transition: { 
//         type: "spring", 
//         stiffness: 70, 
//         damping: 14 
//       }
//     }
//   };
  
//   const mobileSectionVariants = {
//     hidden: { opacity: 0, x: 60 },
//     visible: { 
//       opacity: 1, 
//       x: 0,
//       transition: { 
//         type: "spring", 
//         stiffness: 100,
//         damping: 15 
//       }
//     }
//   };

//   const stepIcons = [
//     <FaMapMarkerAlt key="location" />,
//     <FaCalendarAlt key="calendar" />,
//     <MdExplore key="explore" />,
//     <RiMoneyDollarCircleLine key="budget" />
//   ];

//   const planeAnimation = {
//     initial: { x: -50, y: 20, opacity: 0, scale: 0.5 },
//     animate: { 
//       x: [0, 100, 200], 
//       y: [0, -20, 0], 
//       opacity: [0, 1, 0], 
//       scale: [0.5, 1, 0.5],
//       transition: { duration: 1, ease: "easeInOut" }
//     }
//   };

//   return (
//     <AnimatePresence mode="wait">
//       <motion.div 
//         key={isRefreshing ? 'refreshing' : 'content'}
//         className={`p-6 mx-auto bg-white bg-opacity-95 backdrop-blur-sm rounded-lg shadow-lg ${isMobile ? 'max-w-full' : 'max-w-4xl'} relative overflow-hidden`}
//         initial="hidden"
//         animate="visible"
//         exit={{ opacity: 0, y: -20 }}
//         variants={containerVariants}
//         style={{
//           backgroundImage: isMobile ? 
//             'linear-gradient(to bottom, rgba(255,255,255,0.95), rgba(255,255,255,0.98))' : 
//             'url("https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=2073")',
//           backgroundSize: 'cover',
//           backgroundPosition: 'center',
//           backgroundBlendMode: 'overlay'
//         }}
//       >
//         {travelAnimation && (
//           <motion.div 
//             className="absolute inset-0 pointer-events-none z-30 overflow-hidden"
//             variants={planeAnimation}
//             initial="initial"
//             animate="animate"
//           >
//             <div className="text-emerald-600 text-4xl absolute">
//               <RiFlightTakeoffFill />
//             </div>
//           </motion.div>
//         )}

//         {isRefreshing ? (
//           <div className="flex flex-col items-center justify-center h-40">
//             <motion.div 
//               initial={{ rotate: 0 }}
//               animate={{ rotate: 360 }}
//               transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
//               className="text-emerald-500 text-4xl mb-4"
//             >
//               <BiRefresh />
//             </motion.div>
//             <p className="text-emerald-600">Preparing your next adventure...</p>
//           </div>
//         ) : (
//           <>
//             <motion.div 
//               className="flex items-center gap-3 mb-4"
//               variants={itemVariants}
//             >
//               <div className="relative">
//                 <FaPlane className={`${isMobile ? 'text-2xl' : 'text-3xl'} text-emerald-600`} />
//               </div>
//               <h2 className={`${isMobile ? 'text-2xl' : 'text-3xl'} font-bold bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent`}>
//                 Your Dream Trip Awaits
//               </h2>
//             </motion.div>

//             {!isMobile && (
//               <motion.p 
//                 className="text-gray-700 mb-6 leading-relaxed"
//                 variants={itemVariants}
//               >
//                 Let us help you craft the perfect getaway tailored to your preferences and style.
//                 Complete all sections below and we'll create a personalized itinerary just for you.
//               </motion.p>
//             )}

//             <motion.div 
//               className={`mb-6 ${isMobile ? 'bg-white p-2 rounded-full shadow-sm' : 'bg-gray-50 p-3 rounded-lg bg-opacity-80'}`}
//               variants={itemVariants}
//             >
//               {isMobile ? (
//                 <div className="flex items-center justify-between gap-1 px-2">
//                   {[1,2,3,4].map((step, i) => (
//                     <motion.div 
//                       key={i} 
//                       className={`flex-1 h-1.5 rounded-full ${i <= activeSection ? 'bg-emerald-600' : 'bg-gray-200'}`}
//                       initial={{ width: 0 }}
//                       animate={{ width: "100%" }}
//                       transition={{ duration: 0.5, delay: i * 0.1 }}
//                     />
//                   ))}
//                   <div className="ml-2 text-xs font-medium text-emerald-600">
//                     {Math.min(activeSection + 1, 4)}/4
//                   </div>
//                 </div>
//               ) : (
//                 <>
//                   <div className="flex justify-between mb-2 relative">
//                     <div className="absolute top-4 left-0 right-0 h-0.5 bg-gray-200 z-0"></div>
//                     {stepIcons.map((icon, i) => (
//                       <motion.div 
//                         key={i} 
//                         className="flex flex-col items-center z-10"
//                         initial={{ scale: 0.9, opacity: 0 }}
//                         animate={{ scale: 1, opacity: 1 }}
//                         transition={{ delay: i * 0.1, duration: 0.3 }}
//                       >
//                         <div className={`w-10 h-10 rounded-full flex items-center justify-center ${i <= activeSection ? 'bg-emerald-600 text-white' : 'bg-gray-200 text-gray-500'} transition-all duration-500`}>
//                           {icon}
//                         </div>
//                         <div className="text-xs mt-1 text-gray-600 font-medium">
//                           {i === 0 ? "Destination" : i === 1 ? "Duration" : i === 2 ? "Type" : "Budget"}
//                         </div>
//                       </motion.div>
//                     ))}
//                   </div>
//                   <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden mt-2">
//                     <motion.div 
//                       className="bg-emerald-600 h-full"
//                       initial={{ width: "0%" }}
//                       animate={{ width: `${(activeSection + 1) * 25}%` }}
//                       transition={{ duration: 0.6, type: "spring", stiffness: 60, damping: 12 }}
//                     />
//                   </div>
//                 </>
//               )}
//             </motion.div>

//             {/* All sections visible at all times with conditional highlighted styling */}
//             <motion.div 
//               className={`mb-5 bg-white p-6 ${isMobile ? 'rounded-2xl shadow-md' : 'rounded-xl shadow-md'} ${activeSection === 0 ? 'ring-2 ring-emerald-200' : ''}`}
//               variants={itemVariants}
//             >
//               <div className="flex items-center gap-3 mb-3">
//                 <div className={`${isMobile ? 'p-2 bg-emerald-100 rounded-full' : ''}`}>
//                   <FaMapMarkerAlt className={`${isMobile ? 'text-lg' : 'text-xl'} ${activeSection === 0 ? 'text-emerald-600' : 'text-gray-500'}`} />
//                 </div>
//                 <h3 className={`font-semibold text-lg ${activeSection === 0 ? 'text-emerald-700' : 'text-gray-700'}`}>Where would you like to go?</h3>
//               </div>
//               <div className="transform transition-all hover:scale-101">
//                 <GooglePlacesAutocomplete
//                   apiKey={import.meta.env.VITE_GOOGLE_PLACE_API_KEY}
//                   selectProps={{
//                     value: place,
//                     placeholder: 'Search for a destination',
//                     onChange: (v) => {
//                       setPlace(v);
//                       handleInput('place', v);
//                     },
//                     styles: {
//                       control: (provided) => ({
//                         ...provided,
//                         padding: '4px',
//                         borderRadius: '8px',
//                         border: `1px solid ${activeSection === 0 ? '#10b981' : '#e2e8f0'}`,
//                         boxShadow: activeSection === 0 ? '0 0 0 1px rgba(16, 185, 129, 0.2)' : '0 2px 4px rgba(0,0,0,0.05)',
//                       }),
//                       option: (provided) => ({
//                         ...provided,
//                         padding: '10px',
//                       }),
//                     }
//                   }}
//                 />
//               </div>
            

//             {place && (
//               <motion.div 
//                 className="flex items-center mt-2 text-emerald-700"
//                 initial={{ opacity: 0, y: 5 }}
//                 animate={{ opacity: 1, y: 0 }}
//                 transition={{ delay: 0.2 }}
//               >
//                 <MdLocationOn className="mr-1" /> 
//                 <span className="text-sm">
//                   {formData.location || "Destination selected"}
//                 </span>
//               </motion.div>
//             )}


//             </motion.div>

//             <motion.div 
//               className={`mb-5 bg-white p-6 ${isMobile ? 'rounded-2xl shadow-md' : 'rounded-xl shadow-md'} ${activeSection === 1 ? 'ring-2 ring-emerald-200' : ''}`}
//               variants={itemVariants}
//             >
//               <div className="flex items-center gap-3 mb-3">
//                 <div className={`${isMobile ? 'p-2 bg-emerald-100 rounded-full' : ''}`}>
//                   <FaCalendarAlt className={`${isMobile ? 'text-lg' : 'text-xl'} ${activeSection === 1 ? 'text-emerald-600' : 'text-gray-500'}`} />
//                 </div>
//                 <h3 className={`font-semibold text-lg ${activeSection === 1 ? 'text-emerald-700' : 'text-gray-700'}`}>How long will you be traveling?</h3>
//               </div>
//               {isMobile ? (
//                 <div className="flex flex-wrap gap-2 justify-between">
//                   {[1, 2, 3, 4, 5].map((day) => (
//                     <motion.button
//                       key={day}
//                       onClick={() => handleInput('duration', day)}
//                       className={`flex-1 min-w-[65px] py-3 px-2 rounded-lg text-center ${
//                         formData.duration === day 
//                           ? 'bg-emerald-600 text-white' 
//                           : activeSection === 1 
//                             ? 'bg-emerald-50 text-gray-700'
//                             : 'bg-gray-100 text-gray-700'
//                       } transition-all duration-300 relative overflow-hidden`}
//                       whileHover={{ scale: 1.03 }}
//                       whileTap={{ scale: 0.95 }}
//                     >
//                       {formData.duration === day && (
//                         <motion.div 
//                           className="absolute inset-0 bg-emerald-500 z-0 opacity-30"
//                           initial={{ width: 0 }}
//                           animate={{ width: "100%" }}
//                           transition={{ duration: 0.5 }}
//                         />
//                       )}
//                       <span className="relative z-10">
//                         {day} {day === 1 ? 'Day' : 'Days'}
//                       </span>
//                     </motion.button>
//                   ))}
//                 </div>
//               ) : (
//                 <div className="space-y-3">
//                   <input
//                     type="number"
//                     min="1"
//                     max="5"
//                     placeholder="Number of days (1-5)"
//                     onChange={(e) => handleInput('duration', Number(e.target.value))}
//                     className={`border p-3 rounded-lg w-full outline-none transition-all duration-300 ${activeSection === 1 ? 'focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 border-emerald-200' : 'border-gray-200 focus:border-gray-300'}`}
//                     value={formData.duration || ''}
//                   />
//                   <div className="flex items-center gap-2 mt-2">
//                     {[1, 2, 3, 4, 5].map((day) => (
//                       <motion.button
//                         key={day}
//                         onClick={() => handleInput('duration', day)}
//                         className={`px-3 py-1 rounded border ${
//                           formData.duration === day 
//                             ? 'bg-emerald-50 border-emerald-500 text-emerald-700' 
//                             : activeSection === 1
//                               ? 'bg-emerald-50 border-gray-200 text-gray-600'
//                               : 'bg-gray-50 border-gray-200 text-gray-500'
//                         }`}
//                         whileHover={{ y: -2 }}
//                         whileTap={{ scale: 0.95 }}
//                       >
//                         {day}
//                       </motion.button>
//                     ))}
//                     <span className="text-xs text-gray-500">days</span>
//                   </div>
//                   <p className="text-xs text-gray-500">Maximum trip duration is 5 days</p>
//                 </div>
//               )}
//             </motion.div>

//            <motion.div 
//               className={`mb-5 bg-white p-6 ${isMobile ? 'rounded-2xl shadow-md' : 'rounded-xl shadow-md'} ${activeSection === 2 ? 'ring-2 ring-emerald-200' : ''}`}
//               variants={itemVariants}
//             >
//               <div className="flex items-center gap-3 mb-3">
//                 <div className={`${isMobile ? 'p-2 bg-emerald-100 rounded-full' : ''}`}>
//                   <FaWalking className={`${isMobile ? 'text-lg' : 'text-xl'} ${activeSection === 2 ? 'text-emerald-600' : 'text-gray-500'}`} />
//                 </div>
//                 <h3 className={`font-semibold text-lg ${activeSection === 2 ? 'text-emerald-700' : 'text-gray-700'}`}>What type of adventure are you seeking?</h3>
//               </div>
//               <div className={`grid ${isMobile ? 'grid-cols-1 gap-3' : 'md:grid-cols-2 gap-4'}`}>
//                 {SelectTravelList.map((item, index) => (
//                   <motion.div
//                     key={index}
//                     onClick={() => handleInput('travelType', item.id)}
//                     className={`border ${isMobile ? 'rounded-xl' : 'rounded-xl'} p-5 hover:shadow-md cursor-pointer transition-all duration-300 
//                       ${formData.travelType === item.id 
//                         ? 'bg-emerald-50 border-emerald-300' 
//                         : activeSection === 2
//                           ? 'bg-gray-50 border-gray-100'
//                           : 'border-gray-200'
//                       } relative overflow-hidden`}
//                     whileHover={{ scale: isMobile ? 1.01 : 1.02, boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}
//                     whileTap={{ scale: 0.98 }}
//                     initial={{ opacity: 0, y: 10 }}
//                     animate={{ opacity: 1, y: 0 }}
//                     transition={{ delay: index * 0.1, duration: 0.3 }}
//                   >
//                     {formData.travelType === item.id && (
//                       <motion.div 
//                         className="absolute right-2 top-2 text-emerald-500 bg-white rounded-full p-1 shadow-sm"
//                         initial={{ scale: 0, opacity: 0 }}
//                         animate={{ scale: 1, opacity: 1 }}
//                         transition={{ type: "spring", stiffness: 300, damping: 10 }}
//                       >
//                         <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
//                           <path d="M13.854 3.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6.5 10.293l6.646-6.647a.5.5 0 0 1 .708 0z"/>
//                         </svg>
//                       </motion.div>
//                     )}
//                     <div className="flex items-center gap-3 mb-1">
//                       <div className={`${isMobile ? 'text-lg p-2 rounded-full' : 'text-xl'} ${
//                         formData.travelType === item.id 
//                           ? 'text-emerald-600 bg-emerald-50' 
//                           : activeSection === 2
//                             ? 'text-emerald-500 bg-emerald-50'
//                             : 'text-gray-500 bg-gray-100'
//                       }`}>
//                         {item.icon}
//                       </div>
//                       <div>
//                         <h4 className="font-medium text-lg">{item.title}</h4>
//                         <div className="flex items-center text-xs text-emerald-700 mt-1">
//                           <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
//                           </svg>
//                           <span>{item.peopleMax}</span>
//                         </div>
//                       </div>
//                     </div>
//                     {(!isMobile || formData.travelType === item.id) && (
//                       <motion.div 
//                         className="mt-2"
//                         initial={{ opacity: 0 }}
//                         animate={{ opacity: 1 }}
//                         transition={{ duration: 0.3 }}
//                       >
//                         <p className="text-sm text-gray-600">
//                           {item.description}
//                         </p>
//                         {formData.travelType === item.id && (
//                           <div className="mt-2 flex flex-wrap gap-2">
//                             {item.features.map((feature, i) => (
//                               <span key={i} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
//                                 {feature}
//                               </span>
//                             ))}
//                           </div>
//                         )}
//                       </motion.div>
//                     )}
//                   </motion.div>
//                 ))}
//               </div>
//             </motion.div>

//             <motion.div 
//               className={`mb-5 bg-white p-6 ${isMobile ? 'rounded-2xl shadow-md' : 'rounded-xl shadow-md'} ${activeSection === 3 ? 'ring-2 ring-emerald-200' : ''}`}
//               variants={itemVariants}
//             >
//               <div className="flex items-center gap-3 mb-3">
//                 <div className={`${isMobile ? 'p-2 bg-emerald-100 rounded-full' : ''}`}>
//                   <RiMoneyDollarCircleLine className={`${isMobile ? 'text-lg' : 'text-xl'} ${activeSection === 3 ? 'text-emerald-600' : 'text-gray-500'}`} />
//                 </div>
//                 <h3 className={`font-semibold text-lg ${activeSection === 3 ? 'text-emerald-700' : 'text-gray-700'}`}>What's your budget range?</h3>
//               </div>
//               <div className={`grid ${isMobile ? 'grid-cols-1 gap-3' : 'md:grid-cols-3 gap-4'}`}>
//                 {BudgetOptions.map((item, index) => (
//                   <motion.div
//                     key={index}
//                     onClick={() => handleInput('budget', item.id)}
//                     className={`border ${isMobile ? 'rounded-xl' : 'rounded-xl'} p-5 hover:shadow-md cursor-pointer transition-all duration-300 
//                       ${formData.budget === item.id 
//                         ? 'bg-emerald-50 border-emerald-300' 
//                         : activeSection === 3
//                           ? 'bg-gray-50 border-gray-100'
//                           : 'border-gray-200'
//                       }`}
//                     whileHover={{ scale: isMobile ? 1.01 : 1.03, boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}
//                     whileTap={{ scale: 0.97 }}
//                     initial={{ opacity: 0, y: 10 }}
//                     animate={{ opacity: 1, y: 0 }}
//                     transition={{ delay: index * 0.1, duration: 0.3 }}
//                   >
//                     <div className="flex items-center gap-3">
//                       <div className={`${isMobile ? 'text-lg p-2 rounded-full' : 'text-xl'} ${
//                         formData.budget === item.id 
//                           ? 'text-emerald-600 bg-emerald-50' 
//                           : activeSection === 3
//                             ? 'text-emerald-500 bg-emerald-50'
//                             : 'text-gray-500 bg-gray-100'
//                       }`}>
//                         {item.icon}
//                       </div>
//                       <div>
//                         <h4 className="font-medium">{item.label}</h4>
//                         {isMobile && <p className="text-xs text-gray-500">{item.description}</p>}
//                       </div>
//                     </div>
//                     {!isMobile && <p className="text-sm text-gray-500 mt-2">{item.description}</p>}
//                   </motion.div>
//                 ))}
//               </div>
//             </motion.div>

//             <AnimatePresence>
//               {isFormComplete() && (
//                 <motion.div
//                   className={`mt-8 ${isMobile ? 'sticky bottom-4 z-20' : ''}`}
//                   initial={{ opacity: 0, y: 20 }}
//                   animate={{ opacity: 1, y: 0 }}
//                   exit={{ opacity: 0, y: 20 }}
//                   transition={{ type: "spring", stiffness: 300, damping: 20 }}
//                 >
//                   <motion.button
//                     onClick={onSubmit}
//                     className={`bg-gradient-to-r from-emerald-500 to-teal-600 text-white py-3 px-8 rounded-lg shadow-md hover:shadow-lg flex items-center justify-center gap-2 ${isMobile ? 'w-full' : 'md:w-auto'} relative overflow-hidden`}
//                     whileHover={{ scale: 1.03, boxShadow: "0px 8px 15px rgba(16, 185, 129, 0.2)" }}
//                     whileTap={{ scale: 0.97 }}
//                     disabled={isGenerating || loading}
//                   >
//                     <motion.div
//                       className="absolute inset-0 bg-white opacity-20"
//                       initial={{ x: "-100%" }}
//                       whileHover={{ x: "100%" }}
//                       transition={{ duration: 1, ease: "easeInOut" }}
//                     />
//                     {isGenerating || loading ? (
//                       <>
//                         <motion.div
//                           initial={{ rotate: 0 }}
//                           animate={{ rotate: 360 }}
//                           transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
//                           className="mr-2"
//                         >
//                           <BiRefresh />
//                         </motion.div>
//                         <span>Generating Trip Plan...</span>
//                       </>
//                     ) : (
//                       <>
//                         <FaSuitcase className="mr-2" />
//                         <span>Generate My Trip</span>
//                         <BiSolidChevronRight className={`${isMobile ? 'text-2xl' : 'text-xl'}`} />
//                       </>
//                     )}
//                   </motion.button>
//                 </motion.div>
//               )}
//             </AnimatePresence>
//             <button
//               onClick={() => setOpenDialog(true)}
//               className={`mt-4 ${isMobile ? 'w-full' : 'w-auto'} bg-gray-100 text-gray-700 py-3 px-6 rounded-lg shadow-sm hover:bg-gray-200 transition-colors duration-300 flex items-center justify-center gap-2`}
//             >
//               onClick{login}
//               Open Dialog
//             </button>

//             <AnimatePresence>
//               {showSuccess && (
//                 <motion.div 
//                   className={`fixed ${isMobile ? 'bottom-20 left-4 right-4' : 'bottom-8 right-8'} bg-emerald-500 text-white p-4 rounded-lg shadow-lg flex items-center gap-2 z-50`}
//                   initial={{ y: 50, opacity: 0 }}
//                   animate={{ y: 0, opacity: 1 }}
//                   exit={{ y: 50, opacity: 0 }}
//                   transition={{ type: "spring", stiffness: 300, damping: 25 }}
//                 >
//                   <FaPaperPlane className="text-xl animate-bounce" />
//                   <span>Trip generated successfully!</span>
//                   <span className="text-2xl ml-1">✈️</span>
//                 </motion.div>
//               )}
//             </AnimatePresence>

//             {/* Loading overlay when generating trip */}
//             <AnimatePresence>
//               {(isGenerating || loading) && (
//                 <motion.div 
//                   className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
//                   initial={{ opacity: 0 }}
//                   animate={{ opacity: 1 }}
//                   exit={{ opacity: 0 }}
//                 >
//                   <div className="bg-white p-6 rounded-lg shadow-lg text-center">
//                     <motion.div 
//                       initial={{ rotate: 0 }}
//                       animate={{ rotate: 360 }}
//                       transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
//                       className="text-emerald-500 text-4xl mb-4 mx-auto"
//                     >
//                       <BiRefresh />
//                     </motion.div>
//                     <p className="text-emerald-700 font-medium">Creating your perfect trip itinerary...</p>
//                     <p className="text-gray-600 text-sm mt-2">This may take a minute</p>
//                   </div>
//                 </motion.div>
//               )}
//             </AnimatePresence>
//           </>
//         )}
//       </motion.div>
//     </AnimatePresence>
//   );
// }

// export default CreateTrip;
import React, { useEffect, useState } from 'react';
import GooglePlacesAutocomplete from 'react-google-places-autocomplete';
import { AI_PROMPT, BudgetOptions, SelectTravelList } from '@/choices/SelectTravelList';
import { motion, AnimatePresence } from 'framer-motion';
import { FaPlane, FaMapMarkerAlt, FaCalendarAlt, FaWalking, FaSuitcase, FaPaperPlane, FaGoogle } from 'react-icons/fa';
import { RiMoneyDollarCircleLine, RiFlightTakeoffFill } from 'react-icons/ri';
import { BiSolidChevronRight, BiRefresh } from 'react-icons/bi';
import { MdLocationOn, MdOutlineSwipe, MdExplore, MdHotel, MdClose } from 'react-icons/md';
import AiSetup from '../ModelWork/AiSetup';
import { useGoogleLogin } from '@react-oauth/google';
import axios from 'axios';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../ModelWork/firebaseConfig.js';

function CreateTrip() {
  const [place, setPlace] = useState(null);
  const [formData, setFormData] = useState({});
  const [activeSection, setActiveSection] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [travelAnimation, setTravelAnimation] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  
  const { generateTravelPlan, loading: aiLoading, error, travelData } = AiSetup();

  const login = useGoogleLogin({
    onSuccess: (response) => {
      console.log("Login successful:", response);
      localStorage.setItem('user', JSON.stringify(response));
      setOpenDialog(false);
      
      GetUserProfile(response);
      
      if (isFormComplete()) {
        handleFormSubmit();
      }
    },
    onError: (error) => {
      console.error("Login failed:", error);
      setErrorMessage("Login failed. Please try again.");
    }
  });
  
  const GetUserProfile = async (tokenInfo) => {
    if (!tokenInfo?.access_token) return;
    
    try {
      const response = await axios.get(`https://www.googleapis.com/oauth2/v2/userinfo`, {
        headers: {
          Authorization: `Bearer ${tokenInfo.access_token}`,
          Accept: 'application/json'
        }
      });
      
      console.log("User profile data:", response.data);
      localStorage.setItem('userProfile', JSON.stringify(response.data));
    } catch (error) {
      console.error("Error fetching user profile:", error);
    }
  };

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
    if (name === 'place') {
      const locationName = value?.label || value?.value?.description || "Unknown location";
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

  const SaveAiTrip = async (tripData) => {
    try {
      setIsSaving(true);
      setErrorMessage(null);
      
      // Check if user is logged in
      const userString = localStorage.getItem('user');
      if (!userString) {
        console.error("No user found in localStorage");
        throw new Error("User not authenticated");
      }
      
      const user = JSON.parse(userString);
      const userProfileString = localStorage.getItem('userProfile');
      const userProfile = userProfileString ? JSON.parse(userProfileString) : null;
      
      // Generate a unique document ID
      const docId = Date.now().toString();
      
      // Prepare trip data with sanitized inputs
      const tripDocument = {
        userSelection: JSON.parse(JSON.stringify(formData)), // Deep clone to remove any undefined values
        tripData: tripData,
        userEmail: (userProfile?.email || user?.email || "anonymous@example.com"),
        id: docId,
        createdAt: new Date().toISOString()
      };
      
      console.log("Attempting to save trip with ID:", docId);
      
      // Save to Firestore
      await setDoc(doc(db, "alltrips", docId), tripDocument);
      
      console.log("Trip saved successfully with ID:", docId);
      return docId;
    } catch (error) {
      console.error("Error saving trip:", error);
      setErrorMessage("Failed to save your trip. Please try again later.");
      throw error;
    } finally {
      setIsSaving(false);
    }
  };

  const handleFormSubmit = async () => {
    if (!formData.location || !formData.duration || !formData.travelType || !formData.budget) {
      setErrorMessage("Please fill all the fields");
      return;
    }
    
    if (formData.duration > 5) {
      setErrorMessage("You can only travel for a maximum of 5 days");
      resetForm();
      return;
    }
    
    setErrorMessage(null);
    
    try {
      setIsGenerating(true);
      
      const selectedTravelType = SelectTravelList.find(item => item.id === formData.travelType);
      const peopleMax = selectedTravelType ? selectedTravelType.peopleMax : "4-6 people";
      
      const FINAL_PROMPT = AI_PROMPT.replace('{location}', formData.location)
                                   .replace('{duration}', formData.duration)
                                   .replace('{travelType}', formData.travelType)
                                   .replace('{budget}', formData.budget)
                                   .replace('{peopleMax}', peopleMax);
                                   
      console.log("Final AI Prompt:", FINAL_PROMPT);
      
      const travelParams = {
        location: formData.location,
        duration: `${formData.duration} Days`,
        for: peopleMax,
        budgetType: formData.budget
      };
      
      console.log("Calling generateTravelPlan with params:", travelParams);
      
      const result = await generateTravelPlan(travelParams);
      console.log("Generated travel plan:", result);
      
      if (result) {
        localStorage.setItem('lastTripPlan', JSON.stringify(result));
        
        try {
          // Save trip to database - handling separately so AI result isn't lost if save fails
          await SaveAiTrip(result);
        } catch (saveError) {
          console.error("Error saving trip, but AI generation was successful:", saveError);
          // Continue with success flow despite save error
        }
        
        setShowSuccess(true);
        setTimeout(() => {
          setShowSuccess(false);
          resetForm();
        }, 2500);
      }
    } catch (error) {
      console.error("Error generating trip:", error);
      setErrorMessage("Failed to generate your trip plan. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const user = localStorage.getItem('user');
    
    if (!user) {
      setOpenDialog(true);
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
        className={`p-6 mx-auto bg-white bg-opacity-95 backdrop-blur-sm rounded-lg shadow-lg ${isMobile ? 'max-w-full' : 'max-w-4xl'} relative overflow-hidden`}
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
            {/* Component content remains the same... */}












        <motion.div 
          className="flex items-center gap-3 mb-4"
          variants={itemVariants}
        >
          <div className="relative">
            <FaPlane className={`${isMobile ? 'text-2xl' : 'text-3xl'} text-emerald-600`} />
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
            Complete all sections below and we'll create a personalized itinerary just for you.
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
                {Math.min(activeSection + 1, 4)}/4
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

        {/* All sections visible at all times with conditional highlighted styling */}
        <motion.div 
          className={`mb-5 bg-white p-6 ${isMobile ? 'rounded-2xl shadow-md' : 'rounded-xl shadow-md'} ${activeSection === 0 ? 'ring-2 ring-emerald-200' : ''}`}
          variants={itemVariants}
        >
          <div className="flex items-center gap-3 mb-3">
            <div className={`${isMobile ? 'p-2 bg-emerald-100 rounded-full' : ''}`}>
              <FaMapMarkerAlt className={`${isMobile ? 'text-lg' : 'text-xl'} ${activeSection === 0 ? 'text-emerald-600' : 'text-gray-500'}`} />
            </div>
            <h3 className={`font-semibold text-lg ${activeSection === 0 ? 'text-emerald-700' : 'text-gray-700'}`}>Where would you like to go?</h3>
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
                    border: `1px solid ${activeSection === 0 ? '#10b981' : '#e2e8f0'}`,
                    boxShadow: activeSection === 0 ? '0 0 0 1px rgba(16, 185, 129, 0.2)' : '0 2px 4px rgba(0,0,0,0.05)',
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
                  className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg"
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
          className={`mb-5 bg-white p-6 ${isMobile ? 'rounded-2xl shadow-md' : 'rounded-xl shadow-md'} ${activeSection === 1 ? 'ring-2 ring-emerald-200' : ''}`}
          variants={itemVariants}
        >
          <div className="flex items-center gap-3 mb-3">
            <div className={`${isMobile ? 'p-2 bg-emerald-100 rounded-full' : ''}`}>
              <FaCalendarAlt className={`${isMobile ? 'text-lg' : 'text-xl'} ${activeSection === 1 ? 'text-emerald-600' : 'text-gray-500'}`} />
            </div>
            <h3 className={`font-semibold text-lg ${activeSection === 1 ? 'text-emerald-700' : 'text-gray-700'}`}>How long will you be traveling?</h3>
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
                      : activeSection === 1 
                        ? 'bg-emerald-50 text-gray-700'
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
                className={`border p-3 rounded-lg w-full outline-none transition-all duration-300 ${activeSection === 1 ? 'focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 border-emerald-200' : 'border-gray-200 focus:border-gray-300'}`}
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
                        : activeSection === 1
                          ? 'bg-emerald-50 border-gray-200 text-gray-600'
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
          className={`mb-5 bg-white p-6 ${isMobile ? 'rounded-2xl shadow-md' : 'rounded-xl shadow-md'} ${activeSection === 2 ? 'ring-2 ring-emerald-200' : ''}`}
          variants={itemVariants}
        >
          <div className="flex items-center gap-3 mb-3">
            <div className={`${isMobile ? 'p-2 bg-emerald-100 rounded-full' : ''}`}>
              <FaWalking className={`${isMobile ? 'text-lg' : 'text-xl'} ${activeSection === 2 ? 'text-emerald-600' : 'text-gray-500'}`} />
            </div>
            <h3 className={`font-semibold text-lg ${activeSection === 2 ? 'text-emerald-700' : 'text-gray-700'}`}>What type of adventure are you seeking?</h3>
          </div>
          <div className={`grid ${isMobile ? 'grid-cols-1 gap-3' : 'md:grid-cols-2 gap-4'}`}>
            {SelectTravelList.map((item, index) => (
              <motion.div
                key={index}
                onClick={() => handleInput('travelType', item.id)}
                className={`border ${isMobile ? 'rounded-xl' : 'rounded-xl'} p-5 hover:shadow-md cursor-pointer transition-all duration-300 
                  ${formData.travelType === item.id 
                    ? 'bg-emerald-50 border-emerald-300' 
                    : activeSection === 2
                      ? 'bg-gray-50 border-gray-100'
                      : 'border-gray-200'
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
                    <div className="flex items-center text-xs text-emerald-700 mt-1">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      <span>{item.peopleMax}</span>
                    </div>
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
          className={`mb-5 bg-white p-6 ${isMobile ? 'rounded-2xl shadow-md' : 'rounded-xl shadow-md'} ${activeSection === 3 ? 'ring-2 ring-emerald-200' : ''}`}
          variants={itemVariants}
        >
          <div className="flex items-center gap-3 mb-3">
            <div className={`${isMobile ? 'p-2 bg-emerald-100 rounded-full' : ''}`}>
              <RiMoneyDollarCircleLine className={`${isMobile ? 'text-lg' : 'text-xl'} ${activeSection === 3 ? 'text-emerald-600' : 'text-gray-500'}`} />
            </div>
            <h3 className={`font-semibold text-lg ${activeSection === 3 ? 'text-emerald-700' : 'text-gray-700'}`}>What's your budget range?</h3>
          </div>
          <div className={`grid ${isMobile ? 'grid-cols-1 gap-3' : 'md:grid-cols-3 gap-4'}`}>
            {BudgetOptions.map((item, index) => (
              <motion.div
                key={index}
                onClick={() => handleInput('budget', item.id)}
                className={`border ${isMobile ? 'rounded-xl' : 'rounded-xl'} p-5 hover:shadow-md cursor-pointer transition-all duration-300 
                  ${formData.budget === item.id 
                    ? 'bg-emerald-50 border-emerald-300' 
                    : activeSection === 3
                      ? 'bg-gray-50 border-gray-100'
                      : 'border-gray-200'
                  }`}
                whileHover={{ scale: isMobile ? 1.01 : 1.03, boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}
                whileTap={{ scale: 0.97 }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.3 }}
              >
                <div className="flex items-center gap-3">
                  <div className={`${isMobile ? 'text-lg p-2 rounded-full' : 'text-xl'} ${
                    formData.budget === item.id 
                      ? 'text-emerald-600 bg-emerald-50' 
                      : activeSection === 3
                        ? 'text-emerald-500 bg-emerald-50'
                        : 'text-gray-500 bg-gray-100'
                  }`}>
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
                    onClick={onSubmit}
                    className={`bg-gradient-to-r from-emerald-500 to-teal-600 text-white py-3 px-8 rounded-lg shadow-md hover:shadow-lg flex items-center justify-center gap-2 ${isMobile ? 'w-full' : 'md:w-auto'} relative overflow-hidden ${isLoading ? 'opacity-75 cursor-not-allowed' : ''}`}
                    whileHover={isLoading ? {} : { scale: 1.03, boxShadow: "0px 8px 15px rgba(16, 185, 129, 0.2)" }}
                    whileTap={isLoading ? {} : { scale: 0.97 }}
                    disabled={isLoading}
                  >
                 <motion.div
                      className="absolute inset-0 bg-white opacity-20"
                      initial={{ x: "-100%" }}
                      whileHover={{ x: "100%" }}
                      transition={{ duration: 1, ease: "easeInOut" }}
                    />
                    {isLoading ? (
                      <>
                        <motion.div
                          initial={{ rotate: 0 }}
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          className="mr-2"
                        >
                          <BiRefresh />
                        </motion.div>
                        <span>{isSaving ? "Saving Trip..." : "Generating Trip Plan..."}</span>
                      </>
                    ) : (
                      <>
                        <FaSuitcase className="mr-2" />
                        <span>Generate My Trip</span>
                        <BiSolidChevronRight className={`${isMobile ? 'text-2xl' : 'text-xl'}`} />
                      </>
                    )}
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Sign In Dialog with updated loading state */}
            <AnimatePresence>
              {openDialog && (
                <motion.div 
                  className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setOpenDialog(false)}
                >
                  <motion.div 
                    className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full mx-4"
                    variants={dialogVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    onClick={e => e.stopPropagation()}
                  >
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-xl font-bold text-gray-800">Sign in to Continue</h3>
                      <button 
                        onClick={() => setOpenDialog(false)}
                        className="text-gray-500 hover:text-gray-700"
                        disabled={isLoading}
                      >
                        <MdClose className="text-xl" />
                      </button>
                    </div>
                    
                    <p className="text-gray-600 mb-6">
                      Please sign in to generate your personalized trip itinerary.
                    </p>
                    
                    <motion.button
                      onClick={login}
                      className={`w-full flex items-center justify-center gap-3 bg-white border border-gray-300 rounded-lg py-3 px-4 text-gray-700 hover:bg-gray-50 transition-colors duration-300 shadow-sm ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                      whileHover={isLoading ? {} : { scale: 1.02 }}
                      whileTap={isLoading ? {} : { scale: 0.98 }}
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <div className="flex items-center gap-2">
                          <motion.div
                            initial={{ rotate: 0 }}
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          >
                            <BiRefresh className="text-gray-500" />
                          </motion.div>
                          <span>Please wait...</span>
                        </div>
                      ) : (
                        <>
                          <FaGoogle className="text-red-500" />
                          <span>Sign in with Google</span>
                        </>
                      )}
                    </motion.button>
                    
                    <div className="mt-6 text-center text-sm text-gray-500">
                      By signing in, you agree to our terms of service and privacy policy.
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Success message and loading overlay remain the same... */}
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

            {/* Loading overlay with updated loading state */}
            <AnimatePresence>
              {isLoading && (
                <motion.div 
                  className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <div className="bg-white p-6 rounded-lg shadow-lg text-center">
                    <motion.div 
                      initial={{ rotate: 0 }}
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="text-emerald-500 text-4xl mb-4 mx-auto"
                    >
                      <BiRefresh />
                    </motion.div>
                    <p className="text-emerald-700 font-medium">
                      {isSaving ? "Saving your trip..." : "Creating your perfect trip itinerary..."}
                    </p>
                    <p className="text-gray-600 text-sm mt-2">This may take a minute</p>
                  </div>
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

















