







// import React, { useState, useEffect } from 'react';
// import { GetPlaceDetails, PHOTO_REF_URL } from '../../ModelWork/GlobalApi';
// import { FaClock, FaRupeeSign, FaMapMarkerAlt, FaStar, FaSun, FaTag, FaSearchLocation } from 'react-icons/fa';

// const SimpleItinerary = ({ itineraryData }) => {
//   const [selectedDay, setSelectedDay] = useState(null);
//   const [placeImages, setPlaceImages] = useState({});

//   useEffect(() => {
//     if (itineraryData && itineraryData.length > 0) {
//       setSelectedDay(itineraryData[0].day);
//     }
//   }, [itineraryData]);

//   useEffect(() => {
//     if (!selectedDay || !itineraryData) return;
//     const currentDay = itineraryData.find(day => day.day === selectedDay);
//     if (!currentDay || !currentDay.places) return;
//     currentDay.places.forEach(activity => {
//       if (activity.placeName) {
//         fetchPlaceImage(activity.placeName, `${selectedDay}-${activity.placeName}`);
//       }
//     });
//     // eslint-disable-next-line
//   }, [selectedDay, itineraryData]);

//   const fetchPlaceImage = async (placeName, key) => {
//     if (!placeName || placeImages[key]) return;
//     try {
//       const searchQuery = { textQuery: placeName, languageCode: "en" };
//       const response = await GetPlaceDetails(searchQuery);
//       if (response.data.places && response.data.places.length > 0) {
//         const place = response.data.places[0];
//         if (place.photos && place.photos.length > 0) {
//           const photoName = place.photos[0].name;
//           const photoUrl = PHOTO_REF_URL.replace('{Name}', photoName);
//           setPlaceImages(prev => ({ ...prev, [key]: photoUrl }));
//         } else {
//           setPlaceImages(prev => ({ ...prev, [key]: 'https://via.placeholder.com/400x200?text=No+Image' }));
//         }
//       } else {
//         setPlaceImages(prev => ({ ...prev, [key]: 'https://via.placeholder.com/400x200?text=No+Image' }));
//       }
//     } catch {
//       setPlaceImages(prev => ({ ...prev, [key]: 'https://via.placeholder.com/400x200?text=Error' }));
//     }
//   };

//   if (!itineraryData || itineraryData.length === 0) {
//     return <div className="text-gray-500 text-center py-8">No itinerary data available</div>;
//   }
//   if (!selectedDay) {
//     return <div className="text-gray-400 text-center py-8">Loading itinerary...</div>;
//   }

//   const currentDayData = itineraryData.find(day => day.day === selectedDay);
//   const activities = currentDayData?.places || [];

//   return (
//     <div className="max-w-2xl mx-auto">
//       <h2 className="text-2xl font-bold mb-4 text-emerald-700 flex items-center gap-2">
//         <FaMapMarkerAlt className="text-emerald-500" /> Trip Itinerary
//       </h2>
//       {/* Day selection */}
//       <div className="flex gap-2 mb-6">
//         {itineraryData.map(day => (
//           <button
//             key={day.day}
//             onClick={() => setSelectedDay(day.day)}
//             className={`px-4 py-2 rounded-full font-medium transition-all duration-200 shadow-sm
//               ${selectedDay === day.day
//                 ? 'bg-emerald-500 text-white'
//                 : 'bg-gray-100 text-gray-700 hover:bg-emerald-100'}`}
//           >
//             Day {day.day}
//           </button>
//         ))}
//       </div>
//       {/* Activities for selected day */}
//       <div>
//         {activities.length === 0 ? (
//           <div className="text-gray-400 text-center py-8">No activities for this day</div>
//         ) : (
//           activities.map((activity, index) => {
//             const imageKey = `${selectedDay}-${activity.placeName}`;
//             return (
//               <div
//                 key={index}
//                 className="mb-8 rounded-xl shadow border border-gray-100 bg-white overflow-hidden"
//               >
//                 <img
//                   src={placeImages[imageKey] || 'https://via.placeholder.com/400x200?text=Loading...'}
//                   alt={activity.placeName}
//                   className="w-full h-48 object-cover"
//                 />
//                 <div className="p-4">
//                   <div className="flex items-center gap-2 mb-2">
//                     <FaMapMarkerAlt className="text-emerald-500" />
//                     <h3 className="text-lg font-semibold">{activity.placeName}</h3>
//                     {/* Map/search icon button */}
//                     <a
//                       href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(activity.placeName)}`}
//                       target="_blank"
//                       rel="noopener noreferrer"
//                       className="ml-2 text-emerald-600 hover:text-emerald-800 transition-colors duration-200"
//                       title="Search on Google Maps"
//                     >
//                       <FaSearchLocation className="text-lg" />
//                     </a>
//                     {activity.rating && (
//                       <span className="flex items-center ml-2 text-yellow-500 text-sm">
//                         <FaStar className="mr-1" /> {activity.rating}
//                       </span>
//                     )}
//                   </div>
//                   <p className="text-gray-600 mb-2">{activity.description}</p>
//                   <div className="flex flex-wrap gap-4 text-sm text-gray-700">
//                     {activity.bestTimeToVisit && (
//                       <span className="flex items-center gap-1">
//                         <FaSun className="text-orange-400" /> {activity.bestTimeToVisit}
//                       </span>
//                     )}
//                     {(activity.openingTime || activity.closingTime) && (
//                       <span className="flex items-center gap-1">
//                         <FaClock className="text-blue-400" />
//                         {activity.openingTime || 'N/A'} - {activity.closingTime || 'N/A'}
//                       </span>
//                     )}
//                     <span className="flex items-center gap-1">
//                       <FaRupeeSign className="text-green-500" />
//                       {activity.entryTicketPrice || 'Not specified'}
//                     </span>
//                     {activity.placeType && (
//                       <span className="flex items-center gap-1">
//                         <FaTag className="text-pink-400" /> {activity.placeType}
//                       </span>
//                     )}
//                   </div>
//                   {activity.additionalInfo && (
//                     <div className="mt-2 text-xs text-gray-500">
//                       <strong>Note:</strong> {activity.additionalInfo}
//                     </div>
//                   )}
//                 </div>
//               </div>
//             );
//           })
//         )}
//       </div>
//     </div>
//   );
// };

// export default SimpleItinerary;



// import React, { useState, useEffect } from 'react';
// import { GetPlaceDetails, PHOTO_REF_URL } from '../../ModelWork/GlobalApi';
// import { FaClock, FaRupeeSign, FaMapMarkerAlt, FaStar, FaSun, FaTag, FaSearchLocation } from 'react-icons/fa';

// const SimpleItinerary = ({ itineraryData }) => {
//   const [selectedDay, setSelectedDay] = useState(null);
//   const [placeImages, setPlaceImages] = useState({});
//   const [processedData, setProcessedData] = useState([]);

//   // Process and normalize itinerary data
//   useEffect(() => {
//     if (itineraryData && itineraryData.length > 0) {
//       console.log("Received itinerary data:", itineraryData);
      
//       // Transform data structure if needed
//       // Check if we have the expected structure (day objects with 'places' arrays)
//       // or if we have day objects with place details directly on them
//       const firstItem = itineraryData[0];
      
//       if (firstItem.places) {
//         // Data is already in the correct format
//         setProcessedData(itineraryData);
//       } else if (firstItem.placeName) {
//         // Data has place details directly on day objects, transform it
//         const transformed = itineraryData.map(item => ({
//           day: item.day,
//           // Create a places array with this single place
//           places: [{
//             placeName: item.placeName,
//             description: item.description,
//             placeType: item.placeType,
//             entryTicketPrice: item.entryTicketPrice,
//             openingTime: item.openingTime,
//             closingTime: item.closingTime,
//             rating: item.rating,
//             bestTimeToVisit: item.bestTimeToVisit,
//             additionalInfo: item.additionalInfo
//           }]
//         }));
//         console.log("Transformed data:", transformed);
//         setProcessedData(transformed);
//       } else {
//         // Unknown format, just use as is
//         setProcessedData(itineraryData);
//       }
      
//       // Set first day as selected
//       if (itineraryData.length > 0) {
//         setSelectedDay(itineraryData[0].day);
//       }
//     }
//   }, [itineraryData]);

//   useEffect(() => {
//     if (!selectedDay || !processedData.length) return;
    
//     const currentDay = processedData.find(day => day.day === selectedDay);
//     if (!currentDay) return;
    
//     const placesToFetch = currentDay.places || [];
    
//     placesToFetch.forEach(activity => {
//       if (activity.placeName) {
//         fetchPlaceImage(activity.placeName, `${selectedDay}-${activity.placeName}`);
//       }
//     });
//   }, [selectedDay, processedData]);

//   const fetchPlaceImage = async (placeName, key) => {
//     if (!placeName || placeImages[key]) return;
//     try {
//       const searchQuery = { textQuery: placeName, languageCode: "en" };
//       const response = await GetPlaceDetails(searchQuery);
//       if (response.data.places && response.data.places.length > 0) {
//         const place = response.data.places[0];
//         if (place.photos && place.photos.length > 0) {
//           const photoName = place.photos[0].name;
//           const photoUrl = PHOTO_REF_URL.replace('{Name}', photoName);
//           setPlaceImages(prev => ({ ...prev, [key]: photoUrl }));
//         } else {
//           setPlaceImages(prev => ({ ...prev, [key]: 'https://via.placeholder.com/400x200?text=No+Image' }));
//         }
//       } else {
//         setPlaceImages(prev => ({ ...prev, [key]: 'https://via.placeholder.com/400x200?text=No+Image' }));
//       }
//     } catch (error) {
//       console.error("Error fetching image for", placeName, error);
//       setPlaceImages(prev => ({ ...prev, [key]: 'https://via.placeholder.com/400x200?text=Error' }));
//     }
//   };

//   if (!processedData || processedData.length === 0) {
//     return <div className="text-gray-500 text-center py-8">No itinerary data available</div>;
//   }
  
//   if (!selectedDay) {
//     return <div className="text-gray-400 text-center py-8">Loading itinerary...</div>;
//   }

//   const currentDayData = processedData.find(day => day.day === selectedDay);
//   const activities = currentDayData?.places || [];

//   // Debug information
//   console.log("Selected day:", selectedDay);
//   console.log("Current day data:", currentDayData);
//   console.log("All days available:", processedData.map(day => day.day));

//   return (
//     <div className="max-w-2xl mx-auto">
//       <h2 className="text-2xl font-bold mb-4 text-emerald-700 flex items-center gap-2">
//         <FaMapMarkerAlt className="text-emerald-500" /> Trip Itinerary
//       </h2>
      
//       {/* Day selection - now with better overflow handling */}
//       <div className="overflow-x-auto pb-2 mb-4">
//         <div className="flex gap-2 min-w-max">
//           {processedData.map(day => (
//             <button
//               key={day.day}
//               onClick={() => setSelectedDay(day.day)}
//               className={`px-4 py-2 rounded-full font-medium transition-all duration-200 shadow-sm
//                 ${selectedDay === day.day
//                   ? 'bg-emerald-500 text-white'
//                   : 'bg-gray-100 text-gray-700 hover:bg-emerald-100'}`}
//             >
//               Day {day.day}
//             </button>
//           ))}
//         </div>
//       </div>
      
//       {/* Activities for selected day */}
//       <div>
//         {activities.length === 0 ? (
//           <div className="text-gray-400 text-center py-8">No activities for this day</div>
//         ) : (
//           activities.map((activity, index) => {
//             const imageKey = `${selectedDay}-${activity.placeName}`;
//             return (
//               <div
//                 key={index}
//                 className="mb-8 rounded-xl shadow border border-gray-100 bg-white overflow-hidden"
//               >
//                 <img
//                   src={placeImages[imageKey] || 'https://via.placeholder.com/400x200?text=Loading...'}
//                   alt={activity.placeName}
//                   className="w-full h-48 object-cover"
//                 />
//                 <div className="p-4">
//                   <div className="flex items-center gap-2 mb-2">
//                     <FaMapMarkerAlt className="text-emerald-500" />
//                     <h3 className="text-lg font-semibold">{activity.placeName}</h3>
//                     {/* Map/search icon button */}
//                     <a
//                       href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(activity.placeName)}`}
//                       target="_blank"
//                       rel="noopener noreferrer"
//                       className="ml-2 text-emerald-600 hover:text-emerald-800 transition-colors duration-200"
//                       title="Search on Google Maps"
//                     >
//                       <FaSearchLocation className="text-lg" />
//                     </a>
//                     {activity.rating && (
//                       <span className="flex items-center ml-2 text-yellow-500 text-sm">
//                         <FaStar className="mr-1" /> {activity.rating}
//                       </span>
//                     )}
//                   </div>
//                   <p className="text-gray-600 mb-2">{activity.description}</p>
//                   <div className="flex flex-wrap gap-4 text-sm text-gray-700">
//                     {activity.bestTimeToVisit && (
//                       <span className="flex items-center gap-1">
//                         <FaSun className="text-orange-400" /> {activity.bestTimeToVisit}
//                       </span>
//                     )}
//                     {(activity.openingTime || activity.closingTime) && (
//                       <span className="flex items-center gap-1">
//                         <FaClock className="text-blue-400" />
//                         {activity.openingTime || 'N/A'} - {activity.closingTime || 'N/A'}
//                       </span>
//                     )}
//                     <span className="flex items-center gap-1">
//                       <FaRupeeSign className="text-green-500" />
//                       {activity.entryTicketPrice || 'Not specified'}
//                     </span>
//                     {activity.placeType && (
//                       <span className="flex items-center gap-1">
//                         <FaTag className="text-pink-400" /> {activity.placeType}
//                       </span>
//                     )}
//                   </div>
//                   {activity.additionalInfo && (
//                     <div className="mt-2 text-xs text-gray-500">
//                       <strong>Note:</strong> {activity.additionalInfo}
//                     </div>
//                   )}
//                 </div>
//               </div>
//             );
//           })
//         )}
//       </div>
//     </div>
//   );
// };

// export default SimpleItinerary;









// import React, { useState, useEffect } from 'react';
// import { GetPlaceDetails, PHOTO_REF_URL } from '../../ModelWork/GlobalApi';
// import { FaClock, FaRupeeSign, FaMapMarkerAlt, FaStar, FaSun, FaTag, FaSearchLocation } from 'react-icons/fa';

// const SimpleItinerary = ({ itineraryData }) => {
//   const [selectedDay, setSelectedDay] = useState(null);
//   const [placeImages, setPlaceImages] = useState({});
//   const [processedData, setProcessedData] = useState([]);

//   // Process and normalize itinerary data
//   useEffect(() => {
//     if (!itineraryData || itineraryData.length === 0) return;
    
//     console.log("Original itinerary data:", itineraryData);
    
//     // Normalize the data structure by analyzing first day's format
//     const firstDay = itineraryData[0];
//     let normalizedData;
    
//     // Check which data structure we're working with
//     if (firstDay.places) {
//       // Already using the 'places' array format - keep as is
//       console.log("Using 'places' array format");
//       normalizedData = itineraryData;
//     } 
//     else if (firstDay.activities) {
//       // Using 'activities' array format - rename to 'places' for consistency
//       console.log("Converting 'activities' array format to 'places'");
//       normalizedData = itineraryData.map(day => ({
//         ...day,
//         places: day.activities,
//       }));
//     }
//     else if (firstDay.placeName) {
//       // Each day object directly has place details - wrap in places array
//       console.log("Converting direct place properties to 'places' array");
//       normalizedData = itineraryData.map(day => ({
//         day: day.day,
//         places: [{
//           placeName: day.placeName,
//           description: day.description,
//           placeType: day.placeType,
//           entryTicketPrice: day.entryTicketPrice,
//           openingTime: day.openingTime,
//           closingTime: day.closingTime,
//           rating: day.rating,
//           bestTimeToVisit: day.bestTimeToVisit,
//           additionalInfo: day.additionalInfo
//         }]
//       }));
//     } 
//     else {
//       // Unrecognized structure, attempt best-effort normalization
//       console.log("Unrecognized structure - attempting best-effort normalization");
//       normalizedData = itineraryData.map(day => ({
//         day: day.day || 1,
//         places: day.places || day.activities || []
//       }));
//     }
    
//     console.log("Normalized data:", normalizedData);
//     setProcessedData(normalizedData);
    
//     // Set first day as selected
//     if (normalizedData.length > 0) {
//       setSelectedDay(normalizedData[0].day);
//     }
//   }, [itineraryData]);

//   // Fetch images for the selected day
//   useEffect(() => {
//     if (!selectedDay || processedData.length === 0) return;
    
//     const currentDay = processedData.find(day => day.day === selectedDay);
//     if (!currentDay || !currentDay.places) return;

//     // Fetch images for all places in this day
//     currentDay.places.forEach(activity => {
//       if (activity.placeName) {
//         fetchPlaceImage(activity.placeName, `${selectedDay}-${activity.placeName}`);
//       }
//     });
//     // eslint-disable-next-line
//   }, [selectedDay, processedData]);

//   const fetchPlaceImage = async (placeName, key) => {
//     if (!placeName || placeImages[key]) return;
//     try {
//       const searchQuery = { textQuery: placeName, languageCode: "en" };
//       const response = await GetPlaceDetails(searchQuery);
//       if (response.data.places && response.data.places.length > 0) {
//         const place = response.data.places[0];
//         if (place.photos && place.photos.length > 0) {
//           const photoName = place.photos[0].name;
//           const photoUrl = PHOTO_REF_URL.replace('{Name}', photoName);
//           setPlaceImages(prev => ({ ...prev, [key]: photoUrl }));
//         } else {
//           setPlaceImages(prev => ({ ...prev, [key]: 'https://via.placeholder.com/400x200?text=No+Image' }));
//         }
//       } else {
//         setPlaceImages(prev => ({ ...prev, [key]: 'https://via.placeholder.com/400x200?text=No+Image' }));
//       }
//     } catch (error) {
//       console.error("Error fetching image for", placeName, error);
//       setPlaceImages(prev => ({ ...prev, [key]: 'https://via.placeholder.com/400x200?text=Error' }));
//     }
//   };

//   // Handling loading and empty states
//   if (!processedData || processedData.length === 0) {
//     return <div className="text-gray-500 text-center py-8">No itinerary data available</div>;
//   }
  
//   if (!selectedDay) {
//     return <div className="text-gray-400 text-center py-8">Loading itinerary...</div>;
//   }

//   const currentDayData = processedData.find(day => day.day === selectedDay);
//   const activities = currentDayData?.places || [];

//   // Debug information
//   console.log("Selected day:", selectedDay);
//   console.log("Current day data:", currentDayData);
//   console.log("All days available:", processedData.map(day => day.day));
//   console.log("Activities for this day:", activities);

//   return (
//     <div className="max-w-2xl mx-auto">
//       <h2 className="text-2xl font-bold mb-4 text-emerald-700 flex items-center gap-2">
//         <FaMapMarkerAlt className="text-emerald-500" /> Trip Itinerary
//       </h2>
      
//       {/* Day selection - with horizontal scrolling for many days */}
//       <div className="overflow-x-auto pb-2 mb-4">
//         <div className="flex gap-2 min-w-max">
//           {processedData.map(day => (
//             <button
//               key={day.day}
//               onClick={() => setSelectedDay(day.day)}
//               className={`px-4 py-2 rounded-full font-medium transition-all duration-200 shadow-sm
//                 ${selectedDay === day.day
//                   ? 'bg-emerald-500 text-white'
//                   : 'bg-gray-100 text-gray-700 hover:bg-emerald-100'}`}
//             >
//               Day {day.day}
//             </button>
//           ))}
//         </div>
//       </div>
      
//       {/* Activities for selected day */}
//       <div>
//         {activities.length === 0 ? (
//           <div className="text-gray-400 text-center py-8">No activities for this day</div>
//         ) : (
//           activities.map((activity, index) => {
//             const imageKey = `${selectedDay}-${activity.placeName}`;
//             return (
//               <div
//                 key={index}
//                 className="mb-8 rounded-xl shadow border border-gray-100 bg-white overflow-hidden"
//               >
//                 <img
//                   src={placeImages[imageKey] || 'https://via.placeholder.com/400x200?text=Loading...'}
//                   alt={activity.placeName}
//                   className="w-full h-48 object-cover"
//                 />
//                 <div className="p-4">
//                   <div className="flex items-center gap-2 mb-2">
//                     <FaMapMarkerAlt className="text-emerald-500" />
//                     <h3 className="text-lg font-semibold">{activity.placeName}</h3>
//                     {/* Map/search icon button */}
//                     <a
//                       href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(activity.placeName)}`}
//                       target="_blank"
//                       rel="noopener noreferrer"
//                       className="ml-2 text-emerald-600 hover:text-emerald-800 transition-colors duration-200"
//                       title="Search on Google Maps"
//                     >
//                       <FaSearchLocation className="text-lg" />
//                     </a>
//                     {activity.rating && (
//                       <span className="flex items-center ml-2 text-yellow-500 text-sm">
//                         <FaStar className="mr-1" /> {activity.rating}
//                       </span>
//                     )}
//                   </div>
//                   <p className="text-gray-600 mb-2">{activity.description}</p>
//                   <div className="flex flex-wrap gap-4 text-sm text-gray-700">
//                     {activity.bestTimeToVisit && (
//                       <span className="flex items-center gap-1">
//                         <FaSun className="text-orange-400" /> {activity.bestTimeToVisit}
//                       </span>
//                     )}
//                     {(activity.openingTime || activity.closingTime) && (
//                       <span className="flex items-center gap-1">
//                         <FaClock className="text-blue-400" />
//                         {activity.openingTime || 'N/A'} - {activity.closingTime || 'N/A'}
//                       </span>
//                     )}
//                     <span className="flex items-center gap-1">
//                       <FaRupeeSign className="text-green-500" />
//                       {activity.entryTicketPrice || 'Not specified'}
//                     </span>
//                     {activity.placeType && (
//                       <span className="flex items-center gap-1">
//                         <FaTag className="text-pink-400" /> {activity.placeType}
//                       </span>
//                     )}
//                   </div>
//                   {activity.additionalInfo && (
//                     <div className="mt-2 text-xs text-gray-500">
//                       <strong>Note:</strong> {activity.additionalInfo}
//                     </div>
//                   )}
//                 </div>
//               </div>
//             );
//           })
//         )}
//       </div>
//     </div>
//   );
// };

// export default SimpleItinerary;
import React, { useState, useEffect } from 'react';
import { GetPlaceDetails, PHOTO_REF_URL } from '../../ModelWork/GlobalApi';
import { FaClock, FaRupeeSign, FaMapMarkerAlt, FaStar, FaSun, FaTag, FaSearchLocation } from 'react-icons/fa';

const SimpleItinerary = ({ itineraryData }) => {
  const [selectedDay, setSelectedDay] = useState(null);
  const [placeImages, setPlaceImages] = useState({});
  const [processedData, setProcessedData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Process and normalize itinerary data
  useEffect(() => {
    console.log("ItineraryPlaces received data:", itineraryData);
    console.log("Itinerary data type:", typeof itineraryData);
    console.log("Is itinerary array?", Array.isArray(itineraryData));
    
    if (!itineraryData || itineraryData.length === 0) {
      console.log("No itinerary data provided or empty array");
      return;
    }
    
    console.log("Original itinerary data:", itineraryData);
    setIsLoading(true);
    
    try {
      // Check if the data has days already organized
      const hasDays = itineraryData.some(item => item.day !== undefined && item.day !== null);
      
      if (hasDays) {
        // Data is already organized by days
        let normalizedData;
        const firstDay = itineraryData[0];
        
        if (firstDay.places) {
          console.log("Using 'places' array format");
          normalizedData = itineraryData;
        } 
        else if (firstDay.activities) {
          console.log("Converting 'activities' array format to 'places'");
          normalizedData = itineraryData.map(day => ({
            ...day,
            places: day.activities,
          }));
        }
        else if (firstDay.placeName) {
          console.log("Converting direct place properties to 'places' array");
          normalizedData = itineraryData.map(day => ({
            day: day.day,
            places: [{
              placeName: day.placeName,
              description: day.description,
              placeType: day.placeType,
              entryTicketPrice: day.entryTicketPrice,
              openingTime: day.openingTime,
              closingTime: day.closingTime,
              rating: day.rating,
              bestTimeToVisit: day.bestTimeToVisit,
              additionalInfo: day.additionalInfo
            }]
          }));
        } else {
          throw new Error("Unrecognized data format with days");
        }
        
        console.log("Normalized data with existing days:", normalizedData);
        setProcessedData(normalizedData);
      } 
      else {
        // Data is a flat list of places - organize into days
        console.log("Processing flat list of places into days");
        
        // Determine number of days from trip length or default to a reasonable allocation
        const totalPlaces = itineraryData.length;
        const suggestedDays = Math.min(Math.ceil(totalPlaces / 3), Math.ceil(totalPlaces / 2));
        const numDays = Math.max(1, Math.min(suggestedDays, 10)); // Between 1 and 10 days
        
        // Distribute places across days
        const placesPerDay = Math.ceil(totalPlaces / numDays);
        
        const normalizedData = [];
        
        for (let day = 1; day <= numDays; day++) {
          const startIndex = (day - 1) * placesPerDay;
          const endIndex = Math.min(startIndex + placesPerDay, totalPlaces);
          const dayPlaces = itineraryData.slice(startIndex, endIndex);
          
          if (dayPlaces.length === 0) continue;
          
          // Check if data has places or is places directly
          if (dayPlaces[0].placeName) {
            normalizedData.push({
              day: day,
              places: dayPlaces.map(place => ({
                placeName: place.placeName,
                description: place.description,
                placeType: place.placeType,
                entryTicketPrice: place.entryTicketPrice,
                openingTime: place.openingTime,
                closingTime: place.closingTime,
                rating: place.rating,
                bestTimeToVisit: place.bestTimeToVisit,
                additionalInfo: place.additionalInfo
              }))
            });
          } else {
            // If data is already complex objects, just organize by day
            normalizedData.push({
              day: day,
              places: dayPlaces
            });
          }
        }
        
        console.log("Normalized data with generated days:", normalizedData);
        setProcessedData(normalizedData);
      }
      
      // Set first day as selected
      setSelectedDay(1); // Always start with day 1
    } catch (error) {
      console.error("Error processing itinerary data:", error);
      // Create a fallback data structure for error cases
      const fallbackData = [{
        day: 1,
        places: itineraryData.map(place => ({
          placeName: place.placeName || "Unknown Place",
          description: place.description || "No description available",
          placeType: place.placeType || "Sightseeing",
          entryTicketPrice: place.entryTicketPrice || "Not specified",
          bestTimeToVisit: place.bestTimeToVisit || "Anytime"
        }))
      }];
      setProcessedData(fallbackData);
      setSelectedDay(1);
    } finally {
      setIsLoading(false);
    }
  }, [itineraryData]);

  // Fetch images for the selected day
  useEffect(() => {
    if (!selectedDay || processedData.length === 0) return;
    
    const currentDay = processedData.find(day => day.day === selectedDay);
    if (!currentDay || !currentDay.places) return;

    // Fetch images for all places in this day
    currentDay.places.forEach(activity => {
      if (activity?.placeName) {
        fetchPlaceImage(activity.placeName, `${selectedDay}-${activity.placeName}`);
      }
    });
    // eslint-disable-next-line
  }, [selectedDay, processedData]);

  const fetchPlaceImage = async (placeName, key) => {
    if (!placeName || placeImages[key]) return;
    try {
      const searchQuery = { textQuery: placeName, languageCode: "en" };
      const response = await GetPlaceDetails(searchQuery);
      if (response?.data?.places && response.data.places.length > 0) {
        const place = response.data.places[0];
        if (place.photos && place.photos.length > 0) {
          const photoName = place.photos[0].name;
          const photoUrl = PHOTO_REF_URL.replace('{Name}', photoName);
          setPlaceImages(prev => ({ ...prev, [key]: photoUrl }));
        } else {
          setPlaceImages(prev => ({ ...prev, [key]: 'https://via.placeholder.com/400x200?text=No+Image' }));
        }
      } else {
        setPlaceImages(prev => ({ ...prev, [key]: 'https://via.placeholder.com/400x200?text=No+Image' }));
      }
    } catch (error) {
      console.error("Error fetching image for", placeName, error);
      setPlaceImages(prev => ({ ...prev, [key]: 'https://via.placeholder.com/400x200?text=Error' }));
    }
  };

  // Handling loading and empty states
  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto py-6 sm:py-8 text-center px-3 sm:px-4">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-8 bg-gray-200 rounded w-1/2 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-6"></div>
          <div className="flex gap-2 mb-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-10 bg-gray-200 rounded-full w-16"></div>
            ))}
          </div>
          <div className="h-48 bg-gray-200 rounded-lg w-full mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-5/6 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-4/6 mb-2"></div>
        </div>
      </div>
    );
  }

  if (!processedData || processedData.length === 0) {
    return <div className="text-gray-500 text-center py-8">No itinerary data available</div>;
  }

  const currentDayData = processedData.find(day => day.day === selectedDay);
  const activities = currentDayData?.places || [];

  // Debug information
  console.log("Selected day:", selectedDay);
  console.log("Current day data:", currentDayData);
  console.log("All days available:", processedData.map(day => day.day));
  console.log("Activities for this day:", activities);

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-4">
      <h2 className="text-xl sm:text-2xl font-bold mb-4 text-emerald-700 flex items-center gap-2">
        <FaMapMarkerAlt className="text-emerald-500" /> Trip Itinerary
      </h2>
      
      {/* Day selection - with horizontal scrolling for many days */}
      <div className="overflow-x-auto pb-2 mb-4">
        <div className="flex gap-2 min-w-max\">
          {processedData.map(day => (
            <button
              key={day.day}
              onClick={() => setSelectedDay(day.day)}
              className={`px-4 py-2 rounded-full font-medium transition-all duration-200 shadow-sm
                ${selectedDay === day.day
                  ? 'bg-emerald-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-emerald-100'}`}
            >
              Day {day.day}
            </button>
          ))}
        </div>
      </div>
      
      {/* Activities for selected day */}
      <div>
        {activities.length === 0 ? (
          <div className="text-gray-400 text-center py-8">No activities for this day</div>
        ) : (
          activities.map((activity, index) => {
            const imageKey = `${selectedDay}-${activity.placeName}`;
            return (
              <div
                key={index}
                className="mb-8 rounded-xl shadow border border-gray-100 bg-white overflow-hidden"
              >
                <img
                  src={placeImages[imageKey] || 'https://via.placeholder.com/400x200?text=Loading...'}
                  alt={activity.placeName}
                  className="w-full h-48 object-cover"
                />
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <FaMapMarkerAlt className="text-emerald-500" />
                    <h3 className="text-lg font-semibold">{activity.placeName}</h3>
                    {/* Map/search icon button */}
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(activity.placeName)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-2 text-emerald-600 hover:text-emerald-800 transition-colors duration-200"
                      title="Search on Google Maps"
                    >
                      <FaSearchLocation className="text-lg" />
                    </a>
                    {activity.rating && (
                      <span className="flex items-center ml-2 text-yellow-500 text-sm">
                        <FaStar className="mr-1" /> {activity.rating}
                      </span>
                    )}
                  </div>
                  <p className="text-gray-600 mb-2">{activity.description}</p>
                  <div className="flex flex-wrap gap-4 text-sm text-gray-700">
                    {activity.bestTimeToVisit && (
                      <span className="flex items-center gap-1">
                        <FaSun className="text-orange-400" /> {activity.bestTimeToVisit}
                      </span>
                    )}
                    {(activity.openingTime || activity.closingTime) && (
                      <span className="flex items-center gap-1">
                        <FaClock className="text-blue-400" />
                        {activity.openingTime || 'N/A'} - {activity.closingTime || 'N/A'}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <FaRupeeSign className="text-green-500" />
                      {activity.entryTicketPrice || 'Not specified'}
                    </span>
                    {activity.placeType && (
                      <span className="flex items-center gap-1">
                        <FaTag className="text-pink-400" /> {activity.placeType}
                      </span>
                    )}
                  </div>
                  {activity.additionalInfo && (
                    <div className="mt-2 text-xs text-gray-500">
                      <strong>Note:</strong> {activity.additionalInfo}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default SimpleItinerary;