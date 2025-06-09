
import React, { useState, useEffect } from 'react';
import {
  FaMapMarkedAlt,
  FaStar,
  FaClock,
  FaMoneyBillWave,
  FaThermometerHalf,
  FaCalendarDay,
  FaChevronDown,
  FaChevronUp,
  FaMapMarkerAlt,
  FaLink,
  FaSearch
} from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { GetPlaceDetails } from '../../ModelWork/GlobalApi';

// Get the photo reference URL directly from the Information component to ensure consistency
// const PHOTO_REF_URL = 'https://places.googleapis.com/v1/{Name}/media?maxHeightPx=1200&maxWidthPx=1600&key='+import.meta.env.VITE_GOOGLE_PLACE_API_KEY;

function ItineraryPlaces({ itinerary }) {
  const [expandedDays, setExpandedDays] = useState({});
  const [placeDetails, setPlaceDetails] = useState({});
  const [loading, setLoading] = useState({});
  
  // Toggle day expansion
  const toggleDayExpansion = (day) => {
    setExpandedDays(prev => ({
      ...prev,
      [day]: !prev[day]
    }));
  };
  
  // ...existing code...
useEffect(() => {
  const fetchPlaceDetails = async (placeName, specificLocation = '') => {
    const placeKey = placeName; // <-- Move this to the top!
    try {
      // Skip API call if we already have details for this place
      if (placeDetails[placeKey]) return;

      // Mark as loading to prevent duplicate requests
      setLoading(prev => ({...prev, [placeKey]: true}));

      // Create a more specific query by combining place name with location info if available
      const searchQuery = specificLocation 
        ? `${placeName} ${specificLocation}` 
        : placeName;

      console.log("Fetching place details for:", searchQuery);

      // Prepare search query for Google Places API
      const searchData = {
        textQuery: searchQuery,
        languageCode: "en"
      };

      const response = await GetPlaceDetails(searchData);

      if (response.data && response.data.places && response.data.places.length > 0) {
        const place = response.data.places[0];
        const placeId = place.id;

        let photoUrl = null;
 // ...existing code...
if (place.photos && place.photos.length > 0) {
  // Construct the photo URL properly
photoUrl = `/api/google-photo?ref=${encodeURIComponent(place.photos[0].name)}`;
  console.log('Google Places photoUrl:', photoUrl); // <-- Add this line
}
// ...existing code...

        setPlaceDetails(prev => ({
          ...prev,
          [placeKey]: {
            placeId,
            photoUrl,
            displayName: place.displayName?.text || placeName
          }
        }));
      }
    } catch (error) {
      console.error('Error fetching place details for', placeName, error);
    } finally {
      // Clear loading state whether successful or not
      setLoading(prev => ({...prev, [placeKey]: false}));
    }
  };
// ...existing code...

    // Extract all place names from the itinerary
    if (itinerary) {
      const hasDayStructure = itinerary && Array.isArray(itinerary) && 
        itinerary.length > 0 && itinerary[0]?.day && itinerary[0]?.places;
      
      if (hasDayStructure) {
        // Day-based structure
        itinerary.forEach(day => {
          if (day.places) {
            day.places.forEach(place => {
              if (place.placeName && !loading[place.placeName]) {
                // We can get more specific results by including location information
                const locationInfo = place.placeLocation || '';
                fetchPlaceDetails(place.placeName, locationInfo);
              }
            });
          }
        });
      } else {
        // Flat structure
        itinerary.forEach(place => {
          if (place?.placeName && !loading[place.placeName]) {
            const locationInfo = place.placeLocation || '';
            fetchPlaceDetails(place.placeName, locationInfo);
          }
        });
      }
    }
  }, [itinerary]);

  const getPlaceImage = (place) => {
    // Check if we have a Google Places photo for this place
  if (place?.placeName && placeDetails[place.placeName]?.photoUrl) {
  return placeDetails[place.placeName].photoUrl;
}
    
    // Fallback to category-based images
    if (!place.placeType) return 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80';
    
    const type = place.placeType.toLowerCase();
    let imageUrl;

    if (type.includes('historical') || type.includes('heritage')) {
      imageUrl =
        'https://images.unsplash.com/photo-1549893072-4bc598b80907?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60';
    } else if (type.includes('adventure') || type.includes('outdoor')) {
      imageUrl =
        'https://images.unsplash.com/photo-1533240332313-0db49b459ad6?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60';
    } else if (type.includes('educational') || type.includes('museum')) {
      imageUrl =
        'https://images.unsplash.com/photo-1590739292723-0e977d7abef6?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60';
    } else if (type.includes('romantic')) {
      imageUrl =
        'https://images.unsplash.com/photo-1596394723269-b2cbca4e6313?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60';
    } else {
      imageUrl =
        'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80';
    }

    return imageUrl;
  };

  const getPlaceTypeColor = (type) => {
    // Handle undefined or empty type
    if (!type) return 'bg-gray-100 text-gray-700';
    
    const lowerType = type.toLowerCase();

    if (lowerType.includes('historical')) return 'bg-amber-100 text-amber-700';
    if (lowerType.includes('adventure')) return 'bg-emerald-100 text-emerald-700';
    if (lowerType.includes('educational')) return 'bg-blue-100 text-blue-700';
    if (lowerType.includes('romantic')) return 'bg-pink-100 text-pink-700';

    return 'bg-blue-100 text-blue-700';
  };

  // Generate Google Maps URL with placeId if available
  const getGoogleMapsUrl = (place) => {
    const query = encodeURIComponent(place?.placeName || 'Unknown location');
    const placeId = place?.placeName && placeDetails[place.placeName]?.placeId;
    
    if (placeId) {
      return `https://www.google.com/maps/search/?api=1&query=${query}&query_place_id=${placeId}`;
    }
    return `https://www.google.com/maps/search/?api=1&query=${query}`;
  };

  // Check if itinerary is structured with days
  const hasDayStructure = itinerary && Array.isArray(itinerary) && 
    itinerary.length > 0 && itinerary[0]?.day && itinerary[0]?.places;

  // Ensure itinerary is valid before rendering
  if (!itinerary || !Array.isArray(itinerary) || itinerary.length === 0) {
    return (
      <div className="px-4 py-6">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">
          <span className="flex items-center">
            <FaMapMarkedAlt className="text-emerald-600 mr-2" />
            Places to Visit
          </span>
        </h2>
        <p className="text-gray-500 text-center py-8">No itinerary information available.</p>
      </div>
    );
  }

  console.log("Itinerary data:", itinerary);
  console.log("Place details state:", placeDetails);

  return (
    <div className="px-4 py-6 animate-fade-in">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">
        <span className="flex items-center">
          <FaMapMarkedAlt className="text-emerald-600 mr-2" />
          Places to Visit
        </span>
      </h2>

      {hasDayStructure ? (
        // Render day-based itinerary structure
        <div className="space-y-8">
          {itinerary.map((day) => (
            <div key={day.day} className="border border-gray-200 rounded-lg overflow-hidden shadow-sm">
              {/* Day Header */}
              <button 
                className="w-full bg-gradient-to-r from-blue-50 to-emerald-50 px-6 py-4 flex justify-between items-center cursor-pointer hover:from-blue-100 hover:to-emerald-100 transition-colors"
                onClick={() => toggleDayExpansion(day.day)}
              >
                <div className="flex items-center">
                  <FaCalendarDay className="text-emerald-600 mr-3 text-xl" />
                  <h3 className="text-xl font-bold text-gray-800">Day {day.day}</h3>
                </div>
                {expandedDays[day.day] ? (
                  <FaChevronUp className="text-gray-500" />
                ) : (
                  <FaChevronDown className="text-gray-500" />
                )}
              </button>

              {/* Day Content */}
              {(expandedDays[day.day] || expandedDays[day.day] === undefined) && (
                <div className="divide-y divide-gray-100">
                  {day.places && day.places.map((place, placeIdx) => (
                    <div 
                      key={placeIdx}
                      className="bg-white overflow-hidden transition-all duration-500 hover:bg-gray-50"
                    >
                      <div className="md:flex">
                        <div className="md:w-1/4 h-48 md:h-auto overflow-hidden group relative">
                          <Link
                            to={getGoogleMapsUrl(place)}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                       <img
  src={getPlaceImage(place)}
  alt={place?.placeName || 'Location image'}
  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
  onError={(e) => {
    e.target.onerror = null;
    e.target.src =
      'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80';
  }}
/>
                            <div className="absolute bottom-0 right-0 bg-emerald-500 p-2 rounded-tl-md text-white opacity-0 group-hover:opacity-100 transition-opacity">
                              <FaLink size={16} />
                            </div>
                          </Link>
                        </div>

                        <div className="p-5 md:w-3/4">
                          <div className="flex flex-wrap justify-between items-start mb-3">
                            <div className="flex-1">
                              <div className="flex items-center">
                                <h3 className="font-bold text-lg text-gray-800">
                                  {(place?.placeName && placeDetails[place.placeName]?.displayName) || 
                                    place?.placeName || 'Unknown Location'}
                                </h3>
                                {place?.rating && (
                                  <div className="ml-3 flex items-center bg-amber-50 px-2 py-0.5 rounded-md text-amber-600 text-sm">
                                    <FaStar className="mr-1" /> 
                                    <span>{place.rating}</span>
                                  </div>
                                )}
                              </div>
                              
                              <div className="flex items-center flex-wrap gap-2 mt-2">
                                {place?.placeType && (
                                  <span
                                    className={`px-3 py-1 rounded-full text-xs font-medium ${getPlaceTypeColor(
                                      place.placeType
                                    )}`}
                                  >
                                    {place.placeType}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          {place?.description && (
                            <p className="text-gray-600 mt-2 text-sm mb-4 leading-relaxed">
                              {place.description}
                            </p>
                          )}

                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-3 pt-3 border-t border-gray-100">
                            {(place?.openingTime || place?.closingTime) && (
                              <div className="flex items-center px-2 py-1 rounded-md bg-gray-50">
                                <FaClock className="text-emerald-500 mr-2" />
                                <div>
                                  <p className="text-xs font-medium text-gray-500">Hours</p>
                                  <p className="text-sm text-gray-700 font-medium">
                                    {place?.openingTime || 'N/A'} - {place?.closingTime || 'N/A'}
                                  </p>
                                </div>
                              </div>
                            )}

                            {place?.entryTicketPrice && (
                              <div className="flex items-center px-2 py-1 rounded-md bg-gray-50">
                                <FaMoneyBillWave className="text-emerald-500 mr-2" />
                                <div>
                                  <p className="text-xs font-medium text-gray-500">Entry Fee</p>
                                  <p className="text-sm text-gray-700 font-medium">{place.entryTicketPrice}</p>
                                </div>
                              </div>
                            )}

                            {place?.bestTimeToVisit && (
                              <div className="flex items-center px-2 py-1 rounded-md bg-gray-50">
                                <FaThermometerHalf className="text-emerald-500 mr-2" />
                                <div>
                                  <p className="text-xs font-medium text-gray-500">Best Time</p>
                                  <p className="text-sm text-gray-700 font-medium">{place.bestTimeToVisit}</p>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        // Render flat structure (backwards compatibility)
        <div className="space-y-6">
          {itinerary.map((place, index) => (
            <div
              key={index}
              className="bg-white border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="md:flex">
                <div className="md:w-1/3 h-48 md:h-auto overflow-hidden group">
                  <Link
                    to={getGoogleMapsUrl(place)}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <img
                      src={getPlaceImage(place)}
                      alt={place?.placeName || 'Location image'}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src =
                          'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80';
                      }}
                    />
                  </Link>
                </div>

                <div className="p-5 md:w-2/3">
                  <div className="flex flex-wrap justify-between items-start">
                    <div>
                      <h3 className="font-bold text-lg text-gray-800">
                        {(place?.placeName && placeDetails[place.placeName]?.displayName) || 
                          place?.placeName || 'Unknown Location'}
                      </h3>
                      <div className="flex items-center mt-1">
                        {place?.placeType && (
                          <span
                            className={`px-2 py-0.5 rounded text-xs font-medium ${getPlaceTypeColor(
                              place.placeType
                            )}`}
                          >
                            {place.placeType}
                          </span>
                        )}
                        {place?.rating && (
                          <span className="ml-2 flex items-center text-amber-500 text-sm">
                            <FaStar className="mr-1" /> {place.rating}
                          </span>
                        )}
                      </div>
                      {place?.description && <p className="text-gray-600 mt-2 text-sm">{place.description}</p>}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4">
                    {(place?.openingTime || place?.closingTime) && (
                      <div className="flex items-center">
                        <FaClock className="text-gray-400 mr-2" />
                        <div>
                          <p className="text-xs font-medium text-gray-500">Hours</p>
                          <p className="text-sm text-gray-600">
                            {place?.openingTime || 'N/A'} - {place?.closingTime || 'N/A'}
                          </p>
                        </div>
                      </div>
                    )}

                    {place?.entryTicketPrice && (
                      <div className="flex items-center">
                        <FaMoneyBillWave className="text-gray-400 mr-2" />
                        <div>
                          <p className="text-xs font-medium text-gray-500">Entry Fee</p>
                          <p className="text-sm text-gray-600">{place.entryTicketPrice}</p>
                        </div>
                      </div>
                    )}

                    {place?.bestTimeToVisit && (
                      <div className="flex items-center">
                        <FaThermometerHalf className="text-gray-400 mr-2" />
                        <div>
                          <p className="text-xs font-medium text-gray-500">Best Time</p>
                          <p className="text-sm text-gray-600">{place.bestTimeToVisit}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ItineraryPlaces;