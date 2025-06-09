

// import React, { useEffect, useState } from 'react';
// import { 
//   FaMapMarkerAlt, 
//   FaCalendarAlt, 
//   FaUsers, 
//   FaDollarSign, 
//   FaPlane, 
//   FaHotel, 
//   FaUtensils, 
//   FaMapMarkedAlt,
//   FaStar,
//   FaClock,
//   FaMoneyBillWave,
//   FaThermometerHalf,
//   FaSuitcase,
//   FaTemperatureHigh,
//   FaShieldAlt,
//   FaAmbulance,
//   FaBusAlt,
//   FaSun
// } from 'react-icons/fa';
// import TripSummary from './TripSummary';
// import HotelList from './HotelList';
// import ItineraryPlaces from './ItineraryPlaces';
// import DiningOptions from './DiningOption';
// import { GetPlaceDetails,PHOTO_REF_URL } from '@/ModelWork/GlobalApi';
// // const PHOTO_REF_URL ='https://places.googleapis.com/v1/{Name}/media?maxHeightPx=1200&maxWidthPx=1600&key='+import.meta.env.VITE_GOOGLE_PLACE_API_KEY;
// function Information({ trip }) {
//   const [activeTab, setActiveTab] = useState('overview');
//   const [placePhotoUrl, setPlacePhotoUrl] = useState('');
//   const [isLoading, setIsLoading] = useState(true);
//   const [tabChangeAnimation, setTabChangeAnimation] = useState(false);

//   useEffect(() => {
//     if (trip) {
//       getPlacePhoto();
//     }
//   }, [trip]);

//   // Add animation effect when changing tabs
//   useEffect(() => {
//     setTabChangeAnimation(true);
//     const timer = setTimeout(() => {
//       setTabChangeAnimation(false);
//     }, 500);
//     return () => clearTimeout(timer);
//   }, [activeTab]);

//   const getPlacePhoto = async () => {
//     if (!trip?.userSelection?.place?.label) return;
    
//     setIsLoading(true);
//     try {
//       const data = {
//         textQuery: trip.userSelection.place.label
//       };
      
//       const response = await GetPlaceDetails(data);
//       if (response?.data?.places?.[0]?.photos?.length > 0) {
//         // Try to get a horizontal landscape photo if available
//         const photoIndex = response.data.places[0].photos.length > 3 ? 3 : 0;
//         const photoName = response.data.places[0].photos[photoIndex].name;
//         const photoUrl = PHOTO_REF_URL.replace('{Name}', photoName);
//         setPlacePhotoUrl(photoUrl);
//         console.log("Place photo URL:", photoUrl);
//       }
//     } catch (error) {
//       console.error("Error fetching place photo:", error);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   if (!trip) return <div className="p-4 text-center">Loading trip information...</div>;

//   // Use the place photo URL if available, otherwise fall back to default images
//   const backgroundImage = placePhotoUrl || 
//     trip.image || 
//     trip?.tripData?.hotelsList?.[0]?.hotelImageUrl || 
//     "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1121&q=80";

//   const location = trip?.userSelection?.location || trip?.userSelection?.place?.label || "Destination";
//   const budget = trip?.userSelection?.budget || "Not specified";
//   const duration = trip?.userSelection?.duration || 0;
//   const travelers = trip?.userSelection?.travelers || "Not specified";
//   const travelType = trip?.userSelection?.travelType || "adventure";

//   // Format travel type to capitalize first letter
//   const formatTravelType = (type) => {
//     if (!type) return "Trip";
//     return type.charAt(0).toUpperCase() + type.slice(1).replace(/([A-Z])/g, ' $1');
//   };

//   // Get weather information
//   const weather = trip?.tripData?.weatherForecast || {};
//   const temperature = weather?.averageTemperature || "Not available";
//   const weatherCondition = weather?.weatherPrediction?.[0] || "Not available";

//   return (
//     <div className="relative pb-12">
//       {/* Hero Image Section with improved margin */}
//       <div className="relative w-full overflow-hidden mb-14 sm:mb-16 md:mb-20">
//         {/* Image container with responsive height and improved transitions */}
//         <div 
//           className="relative h-64 sm:h-80 md:h-96 bg-cover bg-center rounded-xl overflow-hidden transform transition-all duration-700 hover:scale-[1.01]"
//           style={{ 
//             backgroundImage: `url(${backgroundImage})`,
//             backgroundPosition: 'center 25%',
//             boxShadow: '0 10px 30px -5px rgba(0,0,0,0.3)'
//           }}
//         >
//           {isLoading && (
//             <div className="absolute inset-0 flex items-center justify-center bg-gray-200 bg-opacity-50 backdrop-blur-sm">
//               <div className="animate-pulse flex flex-col items-center">
//                 <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 mb-2 animate-spin"></div>
//                 <span className="text-emerald-700 text-sm font-medium">Loading image...</span>
//               </div>
//             </div>
//           )}
//           <div className="absolute inset-0 bg-gradient-to-b from-black/5 via-black/30 to-black/70"></div>
//         </div>

//         {/* Content overlay - improved positioning and animations */}
//         <div className="absolute inset-x-0 bottom-0 p-4 sm:p-6 md:p-8 text-white transform transition-all duration-500 hover:translate-y-[-2px]">
//           <div className="max-w-4xl mx-auto">
//             <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 text-shadow-lg animate-fade-in">
//               {location}
//             </h1>
//             <div className="flex flex-wrap gap-3 mb-4 md:mb-6 animate-slide-up">
//               <span className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-4 py-1.5 rounded-full text-sm font-medium shadow-lg flex items-center gap-1.5 transition-all duration-300 hover:shadow-emerald-300/50 hover:from-emerald-600 hover:to-emerald-700">
//                 <FaSuitcase className="text-white/90" />
//                 {formatTravelType(travelType)}
//               </span>
//               {weather?.weatherPrediction && (
//                 <span className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-1.5 rounded-full text-sm font-medium shadow-lg flex items-center gap-1.5 transition-all duration-300 hover:shadow-blue-300/50 hover:from-blue-600 hover:to-blue-700">
//                   <FaSun className="text-yellow-300" />
//                   <span>{weatherCondition}, {temperature}</span>
//                 </span>
//               )}
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Navigation Tabs with improved positioning and styling */}
//       <div className="bg-white rounded-t-xl shadow-md mx-4 md:mx-auto max-w-4xl -mt-24 sm:-mt-20 relative z-10 border border-gray-100">
//         <div className="flex overflow-x-auto scrollbar-hide">
//           {[
//             { id: 'overview', label: 'Overview', icon: <FaMapMarkedAlt /> },
//             { id: 'hotels', label: 'Hotels', icon: <FaHotel /> },
//             { id: 'itinerary', label: 'Itinerary', icon: <FaCalendarAlt /> },
//             { id: 'dining', label: 'Dining', icon: <FaUtensils /> }
//           ].map(tab => (
//             <button 
//               key={tab.id}
//               onClick={() => setActiveTab(tab.id)}
//               className={`flex-1 py-4 px-6 text-center font-medium transition-all duration-300 flex flex-col sm:flex-row items-center justify-center gap-2 
//                 ${activeTab === tab.id ? 
//                   'text-emerald-600 border-b-2 border-emerald-600 bg-emerald-50/50' : 
//                   'text-gray-500 hover:text-emerald-600 hover:bg-emerald-50/30'}`}
//             >
//               <span className={`${activeTab === tab.id ? 'text-emerald-600' : 'text-gray-400'} transition-colors duration-300`}>
//                 {tab.icon}
//               </span>
//               <span>{tab.label}</span>
//             </button>
//           ))}
//         </div>
//       </div>
      
//       {/* Content Section with improved animations */}
//       <div className="bg-white rounded-b-xl p-6 sm:p-8 shadow-xl mx-4 md:mx-auto max-w-4xl relative z-10 min-h-[300px] border-t-0 border border-gray-100">
//         <div className={`transition-all duration-500 ${tabChangeAnimation ? 'opacity-0 transform translate-y-4' : 'opacity-100 transform translate-y-0'}`}>
//           {/* Overview Tab */}
//           {activeTab === 'overview' && <TripSummary trip={trip} />}

//           {/* Hotels Tab */}
//           {activeTab === 'hotels' && <HotelList hotels={trip?.tripData?.hotelsList || []} />}

//           {/* Itinerary Tab */}
//           {activeTab === 'itinerary' && <ItineraryPlaces itinerary={trip?.tripData?.itinerary || []} />}

//           {/* Dining Tab */}
//           {activeTab === 'dining' && <DiningOptions restaurants={trip?.tripData?.diningRecommendations || []} />}
//         </div>
//       </div>
//     </div>
//   );
// }

// // Add these animations to your global CSS or within a <style> tag
// const style = document.createElement('style');
// style.textContent = `
//   @keyframes fade-in {
//     from { opacity: 0; }
//     to { opacity: 1; }
//   }
  
//   @keyframes slide-up {
//     from { transform: translateY(10px); opacity: 0; }
//     to { transform: translateY(0); opacity: 1; }
//   }
  
//   .animate-fade-in {
//     animation: fade-in 0.8s ease-out forwards;
//   }
  
//   .animate-slide-up {
//     animation: slide-up 0.6s ease-out forwards;
//   }
  
//   .text-shadow-lg {
//     text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
//   }
// `;
// document.head.appendChild(style);

// export default Information;
import React, { useEffect, useState, useMemo } from 'react';
import { 
  FaMapMarkerAlt, 
  FaCalendarAlt, 
  FaUsers, 
  FaDollarSign, 
  FaPlane, 
  FaHotel, 
  FaUtensils, 
  FaMapMarkedAlt,
  FaStar,
  FaClock,
  FaMoneyBillWave,
  FaThermometerHalf,
  FaSuitcase,
  FaTemperatureHigh,
  FaShieldAlt,
  FaAmbulance,
  FaBusAlt,
  FaSun
} from 'react-icons/fa';
import TripSummary from './TripSummary';
import HotelList from './HotelList';
import ItineraryPlaces from './ItineraryPlaces';
import DiningOptions from './DiningOption';
import { GetPlaceDetails, PHOTO_REF_URL } from '@/ModelWork/GlobalApi';

function Information({ trip }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [placePhotoUrl, setPlacePhotoUrl] = useState('');
  const [isPhotoLoading, setIsPhotoLoading] = useState(true);
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [tabChangeAnimation, setTabChangeAnimation] = useState(false);

  // Memoize the fallback image to avoid recalculation
  const fallbackImage = useMemo(() => {
    return trip?.image || 
           trip?.tripData?.hotelsList?.[0]?.hotelImageUrl || 
           "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1121&q=80";
  }, [trip]);

  // Final background image with immediate fallback
  const backgroundImage = placePhotoUrl || fallbackImage;

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
    }, 500);
    return () => clearTimeout(timer);
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

  return (
    <div className="relative pb-12">
      {/* Hero Image Section with improved margin */}
      <div className="relative w-full overflow-hidden mb-14 sm:mb-16 md:mb-20">
        {/* Image container with responsive height and improved transitions */}
        <div 
          className={`relative h-64 sm:h-80 md:h-96 bg-cover bg-center rounded-xl overflow-hidden transform transition-all duration-700 hover:scale-[1.01] ${
            isImageLoaded && placePhotoUrl ? 'opacity-100' : 'opacity-90'
          }`}
          style={{ 
            backgroundImage: `url(${backgroundImage})`,
            backgroundPosition: 'center 25%',
            boxShadow: '0 10px 30px -5px rgba(0,0,0,0.3)'
          }}
        >
          {/* Loading overlay - only show when actually loading from API */}
          {isPhotoLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-900 bg-opacity-30 backdrop-blur-sm">
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 mb-2 animate-spin"></div>
                <span className="text-white text-sm font-medium">Loading destination image...</span>
              </div>
            </div>
          )}

          {/* Success indicator for loaded API image */}
          {!isPhotoLoading && placePhotoUrl && (
            <div className="absolute top-4 right-4 bg-emerald-500 text-white px-2 py-1 rounded-full text-xs opacity-75 transition-opacity duration-300 hover:opacity-100">
              Live Photo
            </div>
          )}

          <div className="absolute inset-0 bg-gradient-to-b from-black/5 via-black/30 to-black/70"></div>
        </div>

        {/* Content overlay - improved positioning and animations */}
        <div className="absolute inset-x-0 bottom-0 p-4 sm:p-6 md:p-8 text-white transform transition-all duration-500 hover:translate-y-[-2px]">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 text-shadow-lg animate-fade-in">
              {location}
            </h1>
            <div className="flex flex-wrap gap-3 mb-4 md:mb-6 animate-slide-up">
              <span className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-4 py-1.5 rounded-full text-sm font-medium shadow-lg flex items-center gap-1.5 transition-all duration-300 hover:shadow-emerald-300/50 hover:from-emerald-600 hover:to-emerald-700">
                <FaSuitcase className="text-white/90" />
                {formatTravelType(travelType)}
              </span>
              {weather?.weatherPrediction && (
                <span className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-1.5 rounded-full text-sm font-medium shadow-lg flex items-center gap-1.5 transition-all duration-300 hover:shadow-blue-300/50 hover:from-blue-600 hover:to-blue-700">
                  <FaSun className="text-yellow-300" />
                  <span>{weatherCondition}, {temperature}</span>
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs with improved positioning and styling */}
      <div className="bg-white rounded-t-xl shadow-md mx-4 md:mx-auto max-w-4xl -mt-24 sm:-mt-20 relative z-10 border border-gray-100">
        <div className="flex overflow-x-auto scrollbar-hide">
          {[
            { id: 'overview', label: 'Overview', icon: <FaMapMarkedAlt /> },
            { id: 'hotels', label: 'Hotels', icon: <FaHotel /> },
            { id: 'itinerary', label: 'Itinerary', icon: <FaCalendarAlt /> },
            { id: 'dining', label: 'Dining', icon: <FaUtensils /> }
          ].map(tab => (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-4 px-6 text-center font-medium transition-all duration-300 flex flex-col sm:flex-row items-center justify-center gap-2 
                ${activeTab === tab.id ? 
                  'text-emerald-600 border-b-2 border-emerald-600 bg-emerald-50/50' : 
                  'text-gray-500 hover:text-emerald-600 hover:bg-emerald-50/30'}`}
            >
              <span className={`${activeTab === tab.id ? 'text-emerald-600' : 'text-gray-400'} transition-colors duration-300`}>
                {tab.icon}
              </span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>
      
      {/* Content Section with improved animations */}
      <div className="bg-white rounded-b-xl p-6 sm:p-8 shadow-xl mx-4 md:mx-auto max-w-4xl relative z-10 min-h-[300px] border-t-0 border border-gray-100">
        <div className={`transition-all duration-500 ${tabChangeAnimation ? 'opacity-0 transform translate-y-4' : 'opacity-100 transform translate-y-0'}`}>
          {/* Overview Tab */}
          {activeTab === 'overview' && <TripSummary trip={trip} />}

          {/* Hotels Tab */}
          {activeTab === 'hotels' && <HotelList hotels={trip?.tripData?.hotelsList || []} />}

          {/* Itinerary Tab */}
          {activeTab === 'itinerary' && <ItineraryPlaces itinerary={trip?.tripData?.itinerary || []} />}

          {/* Dining Tab */}
          {activeTab === 'dining' && <DiningOptions restaurants={trip?.tripData?.diningRecommendations || []} />}
        </div>
      </div>
    </div>
  );
}

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
  
  .animate-fade-in {
    animation: fade-in 0.8s ease-out forwards;
  }
  
  .animate-slide-up {
    animation: slide-up 0.6s ease-out forwards;
  }
  
  .text-shadow-lg {
    text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
  }
`;
document.head.appendChild(style);

export default Information;