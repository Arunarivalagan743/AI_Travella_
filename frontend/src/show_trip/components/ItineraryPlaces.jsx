







import React, { useState, useEffect } from 'react';
import { GetPlaceDetails, PHOTO_REF_URL } from '../../ModelWork/GlobalApi';
import { FaClock, FaRupeeSign, FaMapMarkerAlt, FaStar, FaSun, FaTag, FaSearchLocation } from 'react-icons/fa';

const SimpleItinerary = ({ itineraryData }) => {
  const [selectedDay, setSelectedDay] = useState(null);
  const [placeImages, setPlaceImages] = useState({});

  useEffect(() => {
    if (itineraryData && itineraryData.length > 0) {
      setSelectedDay(itineraryData[0].day);
    }
  }, [itineraryData]);

  useEffect(() => {
    if (!selectedDay || !itineraryData) return;
    const currentDay = itineraryData.find(day => day.day === selectedDay);
    if (!currentDay || !currentDay.places) return;
    currentDay.places.forEach(activity => {
      if (activity.placeName) {
        fetchPlaceImage(activity.placeName, `${selectedDay}-${activity.placeName}`);
      }
    });
    // eslint-disable-next-line
  }, [selectedDay, itineraryData]);

  const fetchPlaceImage = async (placeName, key) => {
    if (!placeName || placeImages[key]) return;
    try {
      const searchQuery = { textQuery: placeName, languageCode: "en" };
      const response = await GetPlaceDetails(searchQuery);
      if (response.data.places && response.data.places.length > 0) {
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
    } catch {
      setPlaceImages(prev => ({ ...prev, [key]: 'https://via.placeholder.com/400x200?text=Error' }));
    }
  };

  if (!itineraryData || itineraryData.length === 0) {
    return <div className="text-gray-500 text-center py-8">No itinerary data available</div>;
  }
  if (!selectedDay) {
    return <div className="text-gray-400 text-center py-8">Loading itinerary...</div>;
  }

  const currentDayData = itineraryData.find(day => day.day === selectedDay);
  const activities = currentDayData?.places || [];

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-4 text-emerald-700 flex items-center gap-2">
        <FaMapMarkerAlt className="text-emerald-500" /> Trip Itinerary
      </h2>
      {/* Day selection */}
      <div className="flex gap-2 mb-6">
        {itineraryData.map(day => (
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