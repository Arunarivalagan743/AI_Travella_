
import React, { useEffect, useState } from 'react';
import {
  FaHotel,
  FaStar,
  FaWifi,
  FaParking,
  FaSwimmingPool,
  FaUtensils,
  FaDumbbell,
  FaMapMarkerAlt,
} from 'react-icons/fa';
import { GetPlaceDetails, PHOTO_REF_URL } from '../../ModelWork/GlobalApi';

function HotelList({ hotels }) {
  const [hotelDetails, setHotelDetails] = useState({});
  const [loading, setLoading] = useState({});
  
  // Debug: Log hotels data
  console.log("HotelList received hotels:", hotels);
  console.log("Hotels type:", typeof hotels);
  console.log("Is hotels array?", Array.isArray(hotels));
  
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
        
        const response = await GetPlaceDetails(searchData);
        
        if (response.data && response.data.places && response.data.places.length > 0) {
          const place = response.data.places[0];
          const placeId = place.id;
          
          let photoUrl = null;
          if (place.photos && place.photos.length > 0) {
            photoUrl = PHOTO_REF_URL.replace('{Name}', place.photos[0].name);
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
    // eslint-disable-next-line
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
    <div className="px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 max-w-7xl mx-auto">
      <div className="mb-6 sm:mb-8">
        <p className="text-[11px] uppercase tracking-[0.2em] text-emerald-600 font-medium mb-2">Accommodation</p>
        <h2 className="font-serif text-2xl sm:text-3xl text-[#1a1a2e]">
          Recommended Hotels
        </h2>
        <div className="w-12 h-[2px] bg-emerald-600 mt-3"></div>
      </div>

      {hotels.length > 0 ? (
        <div className="space-y-4 sm:space-y-5">
          {hotels.map((hotel, index) => (
            <div
              key={index}
              className="bg-white border border-gray-200 overflow-hidden hover:border-emerald-600/30 transition-colors"
            >
              <div className="p-4 sm:p-5 lg:p-6">
                {/* Header section */}
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 sm:gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <div>
                        <h3 className="font-serif text-lg sm:text-xl text-[#1a1a2e] line-clamp-2">
                          {hotelDetails[hotel.hotelName]?.displayName || hotel.hotelName}
                        </h3>
                        <p className="text-[12px] text-gray-400 break-words mt-1">
                          {hotel.hotelAddress}
                        </p>
                      </div>
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                          hotel.hotelAddress
                        )}${hotelDetails[hotel.hotelName]?.placeId ? `&query_place_id=${hotelDetails[hotel.hotelName].placeId}` : ''}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-2 text-emerald-600 hover:text-emerald-800 transition-colors"
                        title="View on map"
                      >
                        <FaMapMarkerAlt className="text-lg" />
                      </a>
                    </div>
                  </div>
                  
                  {/* Price and rating */}
                  <div className="flex sm:flex-col items-start sm:items-end justify-between sm:justify-start gap-2 sm:gap-1 shrink-0">
                    <p className="font-serif text-lg text-emerald-600 whitespace-nowrap">
                      {hotel.pricePerNight}
                    </p>
                    <div className="flex justify-end text-sm">
                      {renderStars(hotel.starRating)}
                    </div>
                  </div>
                </div>

                {/* Review summary */}
                <p className="text-gray-600 mt-3 text-sm leading-relaxed">
                  {hotel.reviewSummary}
                </p>

                {/* Amenities section */}
                {hotel.amenities && hotel.amenities.length > 0 && (
                  <div className="mt-4">
                    <p className="text-[11px] uppercase tracking-[0.15em] text-gray-400 font-medium mb-2">
                      Amenities
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {hotel.amenities.map((amenity, i) => (
                        <div
                          key={i}
                          className="flex items-center bg-[#f5f0eb] text-gray-700 px-2 sm:px-3 py-1 sm:py-1.5 text-xs"
                        >
                          <span className="text-xs mr-1">
                            {getAmenityIcon(amenity)}
                          </span>
                          <span className="truncate max-w-24 sm:max-w-none">{amenity}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Hotel image */}
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(hotel.hotelAddress)}${
                    hotelDetails[hotel.hotelName]?.placeId ? `&query_place_id=${hotelDetails[hotel.hotelName].placeId}` : ''
                  }`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block mt-4 overflow-hidden h-32 sm:h-40 lg:h-48 transform transition duration-300 hover:opacity-90"
                  title="View on map"
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
                </a>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-[#f5f0eb]">
          <FaHotel className="mx-auto text-3xl text-gray-400 mb-4" />
          <p className="font-serif text-lg text-[#1a1a2e] mb-1">No Hotels Available</p>
          <p className="text-sm text-gray-400">No hotel recommendations available for this trip.</p>
        </div>
      )}
    </div>
  );
}

export default HotelList;