
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
      {/* Hero Image Section - LP Editorial */}
      <div className="relative w-full overflow-hidden mb-8 sm:mb-10">
        <div 
          className="relative h-64 sm:h-80 md:h-96 bg-cover bg-center overflow-hidden"
          style={{ 
            backgroundImage: `url(${backgroundImage})`,
            backgroundPosition: 'center 25%'
          }}
        >
          {/* Loading overlay */}
          {isPhotoLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-[#1a1a2e]/50">
              <div className="flex flex-col items-center">
                <div className="w-[1px] h-8 bg-white animate-pulse mb-2"></div>
                <span className="text-white text-[11px] uppercase tracking-[0.2em] font-medium">Loading image</span>
              </div>
            </div>
          )}

          {/* Live Photo badge */}
          {!isPhotoLoading && placePhotoUrl && (
            <div className="absolute top-4 right-4 bg-emerald-600 text-white px-3 py-1 text-[10px] uppercase tracking-[0.15em] font-medium">
              Live Photo
            </div>
          )}

          {/* Location overlay */}
          <div className="absolute top-4 left-4 z-10">
            <div className="flex items-center gap-2 bg-[#1a1a2e]/80 px-3 py-1.5">
              <FaMapMarkerAlt className="text-emerald-400 text-sm" />
              <span className="text-white font-medium text-sm tracking-wide">
                {location}
              </span>
            </div>
          </div>

          {/* Weather display */}
          {weather?.weatherPrediction && (
            <div className="absolute bottom-4 left-4 z-10">
              <div className="flex items-center gap-3 bg-[#1a1a2e]/80 px-3 py-2">
                <div className="flex items-center justify-center w-7 h-7 bg-emerald-600">
                  {weatherCondition.toLowerCase().includes('sun') ? (
                    <FaSun className="text-yellow-300 text-sm" />
                  ) : weatherCondition.toLowerCase().includes('cloud') ? (
                    <FaCloud className="text-gray-200 text-sm" />
                  ) : weatherCondition.toLowerCase().includes('rain') ? (
                    <FaCloudRain className="text-blue-200 text-sm" />
                  ) : (
                    <FaTemperatureHigh className="text-orange-300 text-sm" />
                  )}
                </div>
                <div>
                  <div className="text-white font-serif text-lg">{temperature}</div>
                  <div className="text-white/60 text-[11px] uppercase tracking-[0.1em]">{weatherCondition}</div>
                </div>
              </div>
            </div>
          )}

          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/5 via-black/20 to-black/60"></div>
        </div>
      </div>

      {/* Welcome Message */}
      <div className="relative w-full max-w-7xl mx-auto -mt-4 sm:-mt-6 mb-4 sm:mb-6 z-20 px-3 sm:px-4">
        <WelcomeMessage location={location} />
      </div>

      {/* Navigation Tabs - LP Style */}
      <div className="bg-white border border-gray-200 mx-3 sm:mx-4 md:mx-auto max-w-7xl relative z-10">
        <div className="flex overflow-x-auto scrollbar-hide relative" ref={tabsRef}>
          {tabs.map((tab) => (
            <button 
              key={tab.id}
              onClick={() => {
                if (tab.id !== activeTab) {
                  setIsTransitioning(true);
                  setSwipeDirection(tabs.findIndex(t => t.id === tab.id) > activeTabIndex ? 'left' : 'right');
                  setActiveTab(tab.id);
                }
              }}
              className={`tab-${tab.id} flex-1 py-4 px-6 text-center transition-all duration-300 flex flex-col sm:flex-row items-center justify-center gap-2 ${
                activeTab === tab.id ? 
                'text-emerald-600 border-b-2 border-emerald-600' : 
                'text-gray-400 hover:text-[#1a1a2e] border-b-2 border-transparent'
              }`}
            >
              <span className={`${activeTab === tab.id ? 'text-emerald-600' : 'text-gray-400'} transition-colors`}>
                {tab.icon}
              </span>
              <span className="text-[12px] uppercase tracking-[0.1em] font-medium">{tab.label}</span>
            </button>
          ))}
        </div>
        
        {/* Navigation arrows */}
        <button
          className="absolute left-0 top-1/2 -translate-y-1/2 bg-white/90 p-1.5 border-r border-gray-200 text-gray-400 hover:text-emerald-600 hidden sm:flex"
          onClick={prevTab}
          disabled={isTransitioning}
        >
          <FaChevronLeft size={14} />
        </button>
        
        <button
          className="absolute right-0 top-1/2 -translate-y-1/2 bg-white/90 p-1.5 border-l border-gray-200 text-gray-400 hover:text-emerald-600 hidden sm:flex"
          onClick={nextTab}
          disabled={isTransitioning}
        >
          <FaChevronRight size={14} />
        </button>
      </div>
      
      {/* Content Section - LP Style */}
      <div className="bg-white border border-gray-200 border-t-0 p-4 sm:p-6 md:p-8 mx-3 sm:mx-4 md:mx-auto max-w-7xl relative z-10 min-h-[300px] sm:min-h-[400px] overflow-hidden">
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
            {activeTab === 'hotels' && (
              (() => {
                // Debug: Log the trip data structure
                console.log("Full trip data:", trip);
                console.log("Trip data structure:", trip?.tripData);
                
                // Try different possible hotel data locations
                let hotelsList = [];
                
                // Check multiple possible locations for hotels data
                if (trip?.tripData?.hotelsList && Array.isArray(trip.tripData.hotelsList)) {
                  hotelsList = trip.tripData.hotelsList;
                } else if (trip?.tripData?.hotels && Array.isArray(trip.tripData.hotels)) {
                  hotelsList = trip.tripData.hotels;
                } else if (trip?.hotels && Array.isArray(trip.hotels)) {
                  hotelsList = trip.hotels;
                } else if (trip?.travelPlan?.hotelsList && Array.isArray(trip.travelPlan.hotelsList)) {
                  hotelsList = trip.travelPlan.hotelsList;
                } else if (trip?.travelPlan?.hotels && Array.isArray(trip.travelPlan.hotels)) {
                  hotelsList = trip.travelPlan.hotels;
                } else if (trip?.tripData?.travelPlan?.hotelsList && Array.isArray(trip.tripData.travelPlan.hotelsList)) {
                  hotelsList = trip.tripData.travelPlan.hotelsList;
                } else if (trip?.tripData?.travelPlan?.hotels && Array.isArray(trip.tripData.travelPlan.hotels)) {
                  hotelsList = trip.tripData.travelPlan.hotels;
                }
                                 
                console.log("Hotels data found:", hotelsList);
                console.log("Hotels array length:", hotelsList?.length || 0);
                
                return <HotelList hotels={hotelsList} />;
              })()
            )}
            {activeTab === 'itinerary' && (
              (() => {
                // Try different possible itinerary data locations
                let itineraryData = [];
                
                // Check if itinerary is in travelPlan and convert object format to array
                const travelPlanItinerary = trip?.tripData?.travelPlan?.itinerary;
                
                if (travelPlanItinerary && typeof travelPlanItinerary === 'object' && !Array.isArray(travelPlanItinerary)) {
                  console.log("Found itinerary in travelPlan object format:", travelPlanItinerary);
                  
                  // Convert day1, day2, etc. object format to array format
                  itineraryData = [];
                  Object.keys(travelPlanItinerary).forEach(dayKey => {
                    const dayNumber = parseInt(dayKey.replace('day', ''));
                    const places = travelPlanItinerary[dayKey];
                    
                    if (Array.isArray(places)) {
                      itineraryData.push({
                        day: dayNumber,
                        places: places
                      });
                    }
                  });
                  
                  // Sort by day number
                  itineraryData.sort((a, b) => a.day - b.day);
                } else if (trip?.tripData?.itinerary && Array.isArray(trip.tripData.itinerary)) {
                  itineraryData = trip.tripData.itinerary;
                } else if (trip?.itinerary && Array.isArray(trip.itinerary)) {
                  itineraryData = trip.itinerary;
                } else if (trip?.travelPlan?.itinerary && Array.isArray(trip.travelPlan.itinerary)) {
                  itineraryData = trip.travelPlan.itinerary;
                } else if (trip?.tripData?.travelPlan?.itinerary && Array.isArray(trip.tripData.travelPlan.itinerary)) {
                  itineraryData = trip.tripData.travelPlan.itinerary;
                }
                                    
                console.log("Final itinerary data:", itineraryData);
                console.log("Itinerary array length:", itineraryData?.length || 0);
                
                return <SimpleItinerary itineraryData={itineraryData} />;
              })()
            )}
          
          </motion.div>
        </AnimatePresence>

        {/* Tab step indicators */}
        <div className="flex justify-center gap-3 mt-8">
          {tabs.map((tab, index) => (
            <button
              key={index}
              onClick={() => {
                setIsTransitioning(true);
                setSwipeDirection(index > activeTabIndex ? 'left' : 'right');
                setActiveTab(tab.id);
              }}
              className={`h-[2px] transition-all duration-300 ${
                activeTab === tab.id ? 'w-8 bg-emerald-600' : 'w-3 bg-gray-300 hover:bg-gray-400'
              }`}
            />
          ))}
        </div>
      </div>
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