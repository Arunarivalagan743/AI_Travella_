
import React, { useEffect, useState, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaMapMarkerAlt, 
  FaCalendarAlt, 
  FaHotel, 
  FaMapMarkedAlt,
  FaTemperatureHigh,
  FaSun,
  FaChevronLeft,
  FaChevronRight,
  FaHandPointer,
    FaCloud,
  FaCloudRain,
} from 'react-icons/fa';
import TripSummary from './TripSummary';
import HotelList from './HotelList';
import SimpleItinerary from './ItineraryPlaces';

import { GetPlaceDetails, PHOTO_REF_URL } from '@/ModelWork/GlobalApi';
import WelcomeMessage from '@/components/ui/custom/WelcomeMessage';

function Information({ trip }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [placePhotoUrl, setPlacePhotoUrl] = useState('');
  const [isPhotoLoading, setIsPhotoLoading] = useState(true);
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [tabChangeAnimation, setTabChangeAnimation] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [showSwipeHint, setShowSwipeHint] = useState(true);
  const [swipeDirection, setSwipeDirection] = useState(null);
  const tabsRef = useRef(null);

  // Array of tabs for easier manipulation
  const tabs = [
    { id: 'overview', label: 'Overview', icon: <FaMapMarkedAlt /> },
    { id: 'hotels', label: 'Hotels', icon: <FaHotel /> },
    { id: 'itinerary', label: 'Itinerary', icon: <FaCalendarAlt /> },
   
  ];

  // Find the index of current active tab
  const activeTabIndex = tabs.findIndex(tab => tab.id === activeTab);

  // Memoize the fallback image to avoid recalculation
  const fallbackImage = useMemo(() => {
    return trip?.image || 
           trip?.tripData?.hotelsList?.[0]?.hotelImageUrl || 
           "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1121&q=80";
  }, [trip]);

  // Final background image with immediate fallback
  const backgroundImage = placePhotoUrl || fallbackImage;

  // Next and previous tab functions
  const nextTab = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setSwipeDirection('left');
    const nextIndex = (activeTabIndex + 1) % tabs.length;
    setActiveTab(tabs[nextIndex].id);
  };

  const prevTab = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setSwipeDirection('right');
    const prevIndex = activeTabIndex === 0 ? tabs.length - 1 : activeTabIndex - 1;
    setActiveTab(tabs[prevIndex].id);
  };

  useEffect(() => {
    if (trip?.userSelection?.place?.label) {
      // Set a timeout to prevent indefinite loading
      const timeoutId = setTimeout(() => {
        if (isPhotoLoading) {
          console.log("Photo loading timeout - using fallback");
          setIsPhotoLoading(false);
        }
      }, 5000); // 5 second timeout

      getPlacePhoto();

      return () => clearTimeout(timeoutId);
    } else {
      setIsPhotoLoading(false);
    }
  }, [trip]);

  // Add animation effect when changing tabs
  useEffect(() => {
    setTabChangeAnimation(true);
    const timer = setTimeout(() => {
      setTabChangeAnimation(false);
      setIsTransitioning(false);
    }, 700);
    return () => clearTimeout(timer);
  }, [activeTab]);

  // Show hand swipe hint on first load
  useEffect(() => {
    if (showSwipeHint) {
      const timer = setTimeout(() => {
        setShowSwipeHint(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showSwipeHint]);

  // Scroll the active tab into view
  useEffect(() => {
    if (tabsRef.current) {
      const tabElement = tabsRef.current.querySelector(`.tab-${activeTab}`);
      if (tabElement) {
        tabElement.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
      }
    }
  }, [activeTab]);

  const getPlacePhoto = async () => {
    if (!trip?.userSelection?.place?.label) {
      setIsPhotoLoading(false);
      return;
    }
    
    try {
      const data = {
        textQuery: trip.userSelection.place.label
      };
      
      const response = await GetPlaceDetails(data);
      if (response?.data?.places?.[0]?.photos?.length > 0) {
        // Try to get a horizontal landscape photo if available
        const photoIndex = response.data.places[0].photos.length > 3 ? 3 : 0;
        const photoName = response.data.places[0].photos[photoIndex].name;
        const photoUrl = PHOTO_REF_URL.replace('{Name}', photoName);
        
        // Preload the image before setting it
        const img = new Image();
        img.onload = () => {
          setPlacePhotoUrl(photoUrl);
          setIsImageLoaded(true);
          setIsPhotoLoading(false);
          console.log("Place photo loaded successfully:", photoUrl);
        };
        img.onerror = () => {
          console.log("Failed to load place photo, using fallback");
          setIsPhotoLoading(false);
        };
        img.src = photoUrl;
      } else {
        setIsPhotoLoading(false);
      }
    } catch (error) {
      console.error("Error fetching place photo:", error);
      setIsPhotoLoading(false);
    }
  };

  if (!trip) return <div className="p-4 text-center">Loading trip information...</div>;

  const location = trip?.userSelection?.location || trip?.userSelection?.place?.label || "Destination";
  const budget = trip?.userSelection?.budget || "Not specified";
  const duration = trip?.userSelection?.duration || 0;
  const travelers = trip?.userSelection?.travelers || "Not specified";
  const travelType = trip?.userSelection?.travelType || "adventure";

  // Format travel type to capitalize first letter
  const formatTravelType = (type) => {
    if (!type) return "Trip";
    return type.charAt(0).toUpperCase() + type.slice(1).replace(/([A-Z])/g, ' $1');
  };

  // Get weather information
  const weather = trip?.tripData?.weatherForecast || {};
  const temperature = weather?.averageTemperature || "Not available";
  const weatherCondition = weather?.weatherPrediction?.[0] || "Not available";

  // Animation variants
  const contentVariants = {
    hidden: (direction) => ({
      x: direction === 'left' ? 100 : -100,
      opacity: 0
    }),
    visible: {
      x: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 300, damping: 30 }
    },
    exit: (direction) => ({
      x: direction === 'left' ? -100 : 100,
      opacity: 0,
      transition: { duration: 0.3 }
    })
  };

  const heroImageVariants = {
    initial: { scale: 1.1, opacity: 0.8 },
    animate: { scale: 1, opacity: 1, transition: { duration: 1.2 } },
    hover: { scale: 1.05, transition: { duration: 1.5 } }
  };

  return (
    <div className="relative pb-12">
      {/* Hero Image Section with improved margin and animations */}
   
<motion.div 
  className="relative w-full overflow-hidden mb-14 sm:mb-16 md:mb-20"
  initial={{ y: -20, opacity: 0 }}
  animate={{ y: 0, opacity: 1 }}
  transition={{ duration: 0.8 }}
>
  {/* Image container with responsive height and improved transitions */}
  <motion.div 
    className={`relative h-64 sm:h-80 md:h-96 bg-cover bg-center rounded-xl overflow-hidden`}
    style={{ 
      backgroundImage: `url(${backgroundImage})`,
      backgroundPosition: 'center 25%',
      boxShadow: '0 10px 30px -5px rgba(0,0,0,0.3)'
    }}
    variants={heroImageVariants}
    initial="initial"
    animate="animate"
    whileHover="hover"
  >
    {/* Loading overlay - only show when actually loading from API */}
    <AnimatePresence>
      {isPhotoLoading && (
        <motion.div 
          className="absolute inset-0 flex items-center justify-center bg-gray-900 bg-opacity-30 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div 
            className="flex flex-col items-center"
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 mb-2 animate-spin"></div>
            <span className="text-white text-sm font-medium">Loading destination image...</span>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>

    {/* Success indicator for loaded API image */}
    <AnimatePresence>
      {!isPhotoLoading && placePhotoUrl && (
        <motion.div 
          className="absolute top-4 right-4 bg-emerald-500 text-white px-2 py-1 rounded-full text-xs"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 0.75, x: 0 }}
          whileHover={{ opacity: 1, scale: 1.05 }}
          transition={{ duration: 0.5 }}
        >
          Live Photo
        </motion.div>
      )}
    </AnimatePresence>

    {/* Location overlay in top left */}
    <motion.div
      className="absolute top-4 left-4 z-10"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.8, delay: 0.2 }}
    >
      <motion.div 
        className="flex items-center gap-2 bg-black/40 backdrop-blur-sm px-3 py-1.5 rounded-lg"
        whileHover={{ scale: 1.05, backgroundColor: "rgba(0,0,0,0.6)" }}
      >
        <FaMapMarkerAlt className="text-red-400" />
        <span className="text-white font-semibold text-lg tracking-wide text-shadow-sm">
          {location}
        </span>
      </motion.div>
    </motion.div>

    {/* Weather display in bottom left corner */}
    {weather?.weatherPrediction && (
      <motion.div
        className="absolute bottom-4 left-4 z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.4 }}
      >
        <motion.div 
          className="flex items-center gap-3 bg-black/40 backdrop-blur-sm px-3 py-2 rounded-lg"
          whileHover={{ scale: 1.05, backgroundColor: "rgba(0,0,0,0.6)" }}
        >
          <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full">
            {weatherCondition.toLowerCase().includes('sun') ? (
              <FaSun className="text-yellow-300" />
            ) : weatherCondition.toLowerCase().includes('cloud') ? (
              <FaCloud className="text-gray-200" />
            ) : weatherCondition.toLowerCase().includes('rain') ? (
              <FaCloudRain className="text-blue-200" />
            ) : (
              <FaTemperatureHigh className="text-orange-300" />
            )}
          </div>
          <div>
            <div className="text-white font-bold text-lg">{temperature}</div>
            <div className="text-white/80 text-xs">{weatherCondition}</div>
          </div>
        </motion.div>
      </motion.div>
    )}

    {/* Animated gradient overlay with parallax effect */}
    <motion.div 
      className="absolute inset-0 bg-gradient-to-b from-black/5 via-black/30 to-black/70"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.2 }}
      style={{ 
        backgroundImage: "linear-gradient(to bottom, rgba(0,0,0,0.05), rgba(0,0,0,0.3), rgba(0,0,0,0.7))" 
      }}
    ></motion.div>
    
    {/* Animated particles effect */}
    <motion.div 
      className="absolute inset-0 pointer-events-none"
      initial={{ opacity: 0 }}
      animate={{ opacity: 0.6 }}
      transition={{ duration: 2 }}
    >
      {Array.from({ length: 20 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 rounded-full bg-white"
          initial={{ 
            x: Math.random() * 100 + "%", 
            y: Math.random() * 100 + "%",
            opacity: Math.random() * 0.5 + 0.3
          }}
          animate={{ 
            y: [null, Math.random() * 20 - 10 + "%"],
            opacity: [null, Math.random() * 0.3 + 0.1, Math.random() * 0.5 + 0.3]
          }}
          transition={{ 
            duration: Math.random() * 5 + 5,
            repeat: Infinity,
            repeatType: "reverse"
          }}
        />
      ))}
    </motion.div>
</motion.div>
</motion.div>

{/* Welcome Message with name from AuthContext/localStorage */}
<motion.div
  className="relative w-full max-w-4xl mx-auto -mt-6 mb-6 z-20 px-4"
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.7, delay: 0.9 }}
>
  <WelcomeMessage location={location} />
</motion.div>

{/* Navigation Tabs with improved positioning and styling */}
<motion.div 
  className="bg-white rounded-xl shadow-md mx-4 md:mx-auto max-w-4xl relative z-10 border border-gray-100"
  initial={{ y: 20, opacity: 0 }}
  animate={{ y: 0, opacity: 1 }}
  transition={{ duration: 0.6, delay: 0.5 }}
>
        <div className="flex overflow-x-auto scrollbar-hide relative" ref={tabsRef}>
          {tabs.map((tab) => (
            <motion.button 
              key={tab.id}
              onClick={() => {
                if (tab.id !== activeTab) {
                  setIsTransitioning(true);
                  setSwipeDirection(tabs.findIndex(t => t.id === tab.id) > activeTabIndex ? 'left' : 'right');
                  setActiveTab(tab.id);
                }
              }}
              className={`tab-${tab.id} flex-1 py-4 px-6 text-center font-medium transition-all duration-300 flex flex-col sm:flex-row items-center justify-center gap-2 ${
                activeTab === tab.id ? 
                'text-emerald-600 border-b-2 border-emerald-600 bg-emerald-50/50' : 
                'text-gray-500 hover:text-emerald-600 hover:bg-emerald-50/30'
              }`}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              <motion.span 
                className={`${activeTab === tab.id ? 'text-emerald-600' : 'text-gray-400'} transition-colors duration-300`}
                animate={{ 
                  scale: activeTab === tab.id ? [1, 1.2, 1] : 1,
                  rotate: activeTab === tab.id ? [0, -10, 10, 0] : 0
                }}
                transition={{ duration: 0.5 }}
              >
                {tab.icon}
              </motion.span>
              <span>{tab.label}</span>
            </motion.button>
          ))}
        </div>
        
        {/* Left & right navigation arrows */}
        <motion.button
          className="absolute left-0 top-1/2 -translate-y-1/2 bg-white/80 p-1.5 rounded-r-lg shadow-sm border-r border-t border-b border-gray-100 text-gray-500 hover:text-emerald-600 hidden sm:flex"
          onClick={prevTab}
          disabled={isTransitioning}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 0.7, x: 0 }}
          whileHover={{ opacity: 1, x: 2 }}
        >
          <FaChevronLeft size={16} />
        </motion.button>
        
        <motion.button
          className="absolute right-0 top-1/2 -translate-y-1/2 bg-white/80 p-1.5 rounded-l-lg shadow-sm border-l border-t border-b border-gray-100 text-gray-500 hover:text-emerald-600 hidden sm:flex"
          onClick={nextTab}
          disabled={isTransitioning}
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 0.7, x: 0 }}
          whileHover={{ opacity: 1, x: -2 }}
        >
          <FaChevronRight size={16} />
        </motion.button>
      </motion.div>
      
      {/* Content Section with improved animations */}
      <motion.div 
        className="bg-white rounded-b-xl p-6 sm:p-8 shadow-xl mx-4 md:mx-auto max-w-4xl relative z-10 min-h-[400px] border-t-0 border border-gray-100 overflow-hidden"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.5 }}
      >
        {/* Swipe hint animation */}
        <AnimatePresence>
          {showSwipeHint && (
            <motion.div 
              className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none bg-black/10 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              <motion.div 
                className="bg-black/70 text-white px-4 py-2 rounded-full flex items-center gap-2"
                animate={{ 
                  x: [0, -30, 30, 0], 
                  opacity: [0.9, 0.6, 0.6, 0.9] 
                }}
                transition={{ 
                  repeat: 2, 
                  duration: 2,
                  repeatType: "reverse"  
                }}
              >
                <FaHandPointer className="text-lg" />
                <span className="text-sm font-medium">Swipe to explore tabs</span>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
        
        <AnimatePresence custom={swipeDirection} mode="wait">
          <motion.div
            key={activeTab}
            custom={swipeDirection}
            variants={contentVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="min-h-[400px]"
          >
            {/* Tab Content */}
            {activeTab === 'overview' && <TripSummary trip={trip} />}
            {activeTab === 'hotels' && <HotelList hotels={trip?.tripData?.hotelsList || []} />}
            {activeTab === 'itinerary' && <SimpleItinerary itineraryData={trip.tripData?.itinerary || []} />}
          
          </motion.div>
        </AnimatePresence>

        {/* Pagination Dots - Enhanced */}
        <div className="flex justify-center gap-2 mt-8">
          {tabs.map((tab, index) => (
            <motion.button
              key={index}
              onClick={() => {
                setIsTransitioning(true);
                setSwipeDirection(index > activeTabIndex ? 'left' : 'right');
                setActiveTab(tab.id);
              }}
              className="relative h-2 rounded-full transition-all"
              animate={{ 
                width: activeTab === tab.id ? "1.5rem" : "0.5rem",
                backgroundColor: activeTab === tab.id ? "#10b981" : "#d1d5db" 
              }}
              transition={{ duration: 0.3 }}
              whileHover={{ 
                scale: 1.1,
                backgroundColor: activeTab === tab.id ? "#10b981" : "#9ca3af"
              }}
            >
              {activeTab === tab.id && (
                <motion.div 
                  className="absolute inset-0 rounded-full bg-emerald-300"
                  initial={{ opacity: 0, scale: 1 }}
                  animate={{ 
                    opacity: [0, 0.5, 0],
                    scale: [1, 1.5, 1.8],
                  }}
                  transition={{ 
                    duration: 1.5, 
                    repeat: Infinity,
                  }}
                />
              )}
            </motion.button>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

// Add these animations to your global CSS or within a <style> tag
// Add these animations to your global CSS or within a <style> tag
const style = document.createElement('style');
style.textContent = `
  @keyframes fade-in {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  
  @keyframes slide-up {
    from { transform: translateY(10px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
  }
  
  @keyframes float {
    0% { transform: translateY(0px); }
    50% { transform: translateY(-10px); }
    100% { transform: translateY(0px); }
  }
  
  @keyframes pulse {
    0% { opacity: 0.6; }
    50% { opacity: 1; }
    100% { opacity: 0.6; }
  }
  
  @keyframes shimmer {
    0% { background-position: -200% 0; }
    100% { background-position: 200% 0; }
  }
  
  .animate-fade-in {
    animation: fade-in 0.8s ease-out forwards;
  }
  
  .animate-slide-up {
    animation: slide-up 0.6s ease-out forwards;
  }
  
  .animate-float {
    animation: float 6s ease-in-out infinite;
  }
  
  .animate-pulse-slow {
    animation: pulse 3s ease-in-out infinite;
  }
  
  .animate-shimmer {
    background: linear-gradient(90deg, rgba(255,255,255,0), rgba(255,255,255,0.3), rgba(255,255,255,0));
    background-size: 200% 100%;
    animation: shimmer 3s infinite;
  }
  
  .text-shadow-sm {
    text-shadow: 0 1px 3px rgba(0, 0, 0, 0.4);
  }
  
  .text-shadow-lg {
    text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
  }
  
  /* Hide scrollbar but allow scrolling */
  .scrollbar-hide {
    -ms-overflow-style: none;  /* IE and Edge */
    scrollbar-width: none;  /* Firefox */
  }
  
  .scrollbar-hide::-webkit-scrollbar {
    display: none;  /* Chrome, Safari and Opera */
  }
`;
document.head.appendChild(style);

export default Information;