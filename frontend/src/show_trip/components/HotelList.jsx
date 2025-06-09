
import React, { useEffect, useState } from 'react';
import {
  FaHotel,
  FaStar,
  FaWifi,
  FaParking,
  FaSwimmingPool,
  FaUtensils,
  FaDumbbell,
} from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { GetPlaceDetails, PHOTO_REF_URL } from '../../ModelWork/GlobalApi';

function HotelList({ hotels }) {
  const [hotelDetails, setHotelDetails] = useState({});
  const [loading, setLoading] = useState({});
  
  useEffect(() => {
    // Fetch place details for each hotel
    const fetchPlaceDetails = async (hotel) => {
      try {
        // Skip if already loaded or loading
        if (hotelDetails[hotel.hotelName] || loading[hotel.hotelName]) {
          return;
        }
        
        // Mark as loading to prevent duplicate API calls
        setLoading(prev => ({...prev, [hotel.hotelName]: true}));
        
        // Search query for Google Places API
        const searchData = {
          textQuery: `${hotel.hotelName} ${hotel.hotelAddress}`,
          languageCode: "en"
        };
        
        console.log("Fetching details for:", hotel.hotelName);
        const response = await GetPlaceDetails(searchData);
        
        if (response.data && response.data.places && response.data.places.length > 0) {
          const place = response.data.places[0];
          const placeId = place.id;
          
          let photoUrl = null;
          if (place.photos && place.photos.length > 0) {
            photoUrl = PHOTO_REF_URL.replace('{Name}', place.photos[0].name);
            console.log("Photo URL generated:", photoUrl);
          }
          
          setHotelDetails(prev => ({
            ...prev,
            [hotel.hotelName]: {
              placeId,
              photoUrl,
              displayName: place.displayName?.text || hotel.hotelName
            }
          }));
        }
      } catch (error) {
        console.error('Error fetching place details for', hotel.hotelName, error);
      } finally {
        setLoading(prev => ({...prev, [hotel.hotelName]: false}));
      }
    };

    // Fetch details for each hotel
    if (hotels && hotels.length > 0) {
      hotels.forEach(hotel => {
        if (hotel.hotelName) {
          fetchPlaceDetails(hotel);
        }
      });
    }
  }, [hotels]);

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.5;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<FaStar key={`full-${i}`} className="text-amber-400" />);
    }

    if (halfStar) {
      stars.push(<FaStar key="half" className="text-amber-400 opacity-50" />);
    }

    const emptyStars = 5 - stars.length;
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<FaStar key={`empty-${i}`} className="text-gray-300" />);
    }

    return <div className="flex">{stars}</div>;
  };

  const getAmenityIcon = (amenity) => {
    const lowerCaseAmenity = amenity.toLowerCase();
    if (lowerCaseAmenity.includes('wifi')) return <FaWifi className="text-blue-500" />;
    if (lowerCaseAmenity.includes('parking')) return <FaParking className="text-blue-500" />;
    if (lowerCaseAmenity.includes('pool')) return <FaSwimmingPool className="text-blue-500" />;
    if (lowerCaseAmenity.includes('breakfast') || lowerCaseAmenity.includes('food'))
      return <FaUtensils className="text-blue-500" />;
    if (lowerCaseAmenity.includes('gym')) return <FaDumbbell className="text-blue-500" />;
    return null;
  };

  return (
    <div className="px-2 sm:px-4 lg:px-6 py-4 sm:py-6 max-w-7xl mx-auto">
      <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-4 sm:mb-6 text-gray-800">
        <span className="flex items-center">
          <FaHotel className="text-emerald-600 mr-2 text-lg sm:text-xl lg:text-2xl" />
          Recommended Hotels
        </span>
      </h2>

      {hotels.length > 0 ? (
        <div className="space-y-4 sm:space-y-6">
          {hotels.map((hotel, index) => (
            <div
              key={index}
              className="bg-white border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-300"
            >
              <div className="p-3 sm:p-4 lg:p-5">
                {/* Header section - responsive layout */}
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 sm:gap-4">
                  <div className="flex-1 min-w-0">
                    <Link
                      to={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                        hotel.hotelAddress
                      )}${hotelDetails[hotel.hotelName]?.placeId ? `&query_place_id=${hotelDetails[hotel.hotelName].placeId}` : ''}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline block"
                    >
                      <div className="space-y-1">
                        <h3 className="font-bold text-base sm:text-lg lg:text-xl text-gray-800 line-clamp-2">
                          {hotelDetails[hotel.hotelName]?.displayName || hotel.hotelName}
                        </h3>
                        <p className="text-gray-500 text-xs sm:text-sm lg:text-base break-words">
                          {hotel.hotelAddress}
                        </p>
                      </div>
                    </Link>
                  </div>
                  
                  {/* Price and rating section */}
                  <div className="flex sm:flex-col items-start sm:items-end justify-between sm:justify-start gap-2 sm:gap-1 shrink-0">
                    <p className="font-bold text-emerald-600 text-sm sm:text-base lg:text-lg whitespace-nowrap">
                      {hotel.pricePerNight}
                    </p>
                    <div className="flex justify-end text-sm sm:text-base">
                      {renderStars(hotel.starRating)}
                    </div>
                  </div>
                </div>

                {/* Review summary */}
                <p className="text-gray-600 mt-3 text-sm sm:text-base leading-relaxed">
                  {hotel.reviewSummary}
                </p>

                {/* Amenities section */}
                {hotel.amenities && hotel.amenities.length > 0 && (
                  <div className="mt-4">
                    <p className="text-xs sm:text-sm font-medium text-gray-700 mb-2">
                      Amenities
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {hotel.amenities.map((amenity, i) => (
                        <div
                          key={i}
                          className="flex items-center bg-gray-100 text-gray-700 px-2 sm:px-3 py-1 sm:py-1.5 rounded text-xs sm:text-sm"
                        >
                          <span className="text-xs sm:text-sm mr-1">
                            {getAmenityIcon(amenity)}
                          </span>
                          <span className="truncate max-w-24 sm:max-w-none">{amenity}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Hotel image */}
                <Link
                  to={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(hotel.hotelAddress)}${
                    hotelDetails[hotel.hotelName]?.placeId ? `&query_place_id=${hotelDetails[hotel.hotelName].placeId}` : ''
                  }`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block mt-4 rounded-lg overflow-hidden h-32 sm:h-40 lg:h-48 transform transition duration-300 hover:scale-[1.02] hover:shadow-lg"
                >
                  <img
                    src={
                      hotelDetails[hotel.hotelName]?.photoUrl || 
                      (hotel.hotelImageUrl && hotel.hotelImageUrl !== 'https://example.com/hotel1.jpg'
                        ? hotel.hotelImageUrl
                        : 'https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8aG90ZWx8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=500&q=60')
                    }
                    alt={`Hotel - ${hotel.hotelName}`}
                    className="w-full h-full object-cover"
                    loading="lazy"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src =
                        'https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8aG90ZWx8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=500&q=60';
                    }}
                  />
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 sm:py-12">
          <FaHotel className="mx-auto text-4xl sm:text-5xl text-gray-300 mb-4" />
          <p className="text-gray-500 text-sm sm:text-base">
            No hotel recommendations available.
          </p>
        </div>
      )}
    </div>
  );
}

export default HotelList;