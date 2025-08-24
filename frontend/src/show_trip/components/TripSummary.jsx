
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  FaMapMarkerAlt, 
  FaCalendarAlt, 
  FaUsers, 
  FaDollarSign, 
  FaPlane,
  FaSuitcase,
  FaShieldAlt,
  FaAmbulance,
  FaTemperatureHigh,
  FaSun,
  FaLandmark,
  FaBed,
  FaUser
} from 'react-icons/fa';
import SocialInteractions from '../../components/ui/custom/SocialInteractions';
import Comments from '../../components/ui/custom/Comments';
import TripShareButton from '../../components/ui/custom/TripShareButton';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../ModelWork/firebaseConfig';

function TripSummary({ trip }) {
  const [showComments, setShowComments] = useState(false);
  const [tripStats, setTripStats] = useState({
    likedBy: [],
    likesCount: 0,
    commentsCount: 0
  });
  
  useEffect(() => {
    if (trip?.id) {
      fetchTripStats();
    }
  }, [trip?.id]);
  
  const fetchTripStats = async () => {
    try {
      const tripRef = doc(db, "alltrips", trip.id);
      const tripDoc = await getDoc(tripRef);
      
      if (tripDoc.exists()) {
        const data = tripDoc.data();
        setTripStats({
          likedBy: data.likedBy || [],
          likesCount: data.likesCount || 0,
          commentsCount: data.commentCount || 0
        });
      }
    } catch (error) {
      console.error("Error fetching trip stats:", error);
    }
  };
  
  if (!trip) return null;
  
  const location = trip?.userSelection?.location || trip?.userSelection?.place?.label || "Destination";
  const budget = trip?.userSelection?.budget || "Not specified";
  const duration = trip?.userSelection?.duration || 0;
  const travelers = trip?.userSelection?.travelers || "Not specified";
  const creatorEmail = trip?.userEmail;

  return (
    <div className="flex flex-wrap -mx-4">
      {/* Trip Summary */}
      <div className="w-full md:w-1/2 px-4 mb-6">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">Trip Summary</h2>
        
        <div className="space-y-4">
          <div className="flex items-center">
            <div className="bg-emerald-100 p-3 rounded-full mr-4">
              <FaMapMarkerAlt className="text-emerald-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Destination</p>
              <p className="font-medium">{location}</p>
            </div>
          </div>
          
          <div className="flex items-center">
            <div className="bg-emerald-100 p-3 rounded-full mr-4">
              <FaCalendarAlt className="text-emerald-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Duration</p>
              <p className="font-medium">{duration} {duration === 1 ? 'Day' : 'Days'}</p>
            </div>
          </div>
          
          <div className="flex items-center">
            <div className="bg-emerald-100 p-3 rounded-full mr-4">
              <FaUsers className="text-emerald-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Travelers</p>
              <p className="font-medium">{travelers} {travelers === 1 ? 'Person' : 'People'}</p>
            </div>
          </div>
          
          <div className="flex items-center">
            <div className="bg-emerald-100 p-3 rounded-full mr-4">
              <FaDollarSign className="text-emerald-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Budget</p>
              <p className="font-medium">${budget}</p>
            </div>
          </div>
        </div>
        
        {/* Weather Information */}
        <div className="mt-6 bg-blue-50 rounded-lg p-4">
          <div className="flex items-center mb-2">
            <FaTemperatureHigh className="text-blue-500 mr-2" />
            <h3 className="font-semibold text-blue-700">Weather</h3>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Temperature</p>
              <p className="font-medium">{trip?.tripData?.weatherForecast?.averageTemperature || "Not available"}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Conditions</p>
              <div className="flex items-center">
                <FaSun className="text-amber-500 mr-1" />
                <p className="font-medium">{trip?.tripData?.weatherForecast?.weatherPrediction?.[0] || "Not available"}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Transportation & Safety */}
      <div className="w-full md:w-1/2 px-4">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">Getting Around</h2>
        
        <div className="bg-gray-50 rounded-lg p-4 mb-4">
          <div className="flex items-start mb-2">
            <div className="bg-emerald-100 p-2 rounded-full mr-3 mt-1">
              <FaPlane className="text-emerald-600 text-sm" />
            </div>
            <div>
              <p className="font-medium">From Airport</p>
              <p className="text-gray-600 text-sm">
                {trip?.tripData?.transportSuggestions?.airportToHotelTransport || "Not specified"}
              </p>
            </div>
          </div>
          
          <div className="mt-3">
            <p className="font-medium mb-1">Local Transport Options</p>
            <div className="flex flex-wrap gap-2 mt-1">
              {trip?.tripData?.transportSuggestions?.localTransportOptions?.length > 0 ? (
                trip.tripData.transportSuggestions.localTransportOptions.map((option, index) => (
                  <span key={index} className="bg-blue-100 text-blue-700 px-2 py-1 rounded-md text-xs">
                    {option}
                  </span>
                ))
              ) : (
                <span>Not specified</span>
              )}
            </div>
          </div>
          
          <div className="mt-3">
            <p className="font-medium">Estimated Daily Transport Cost</p>
            <p className="text-gray-600 text-sm">
              {trip?.tripData?.transportSuggestions?.estimatedDailyCost || "Not specified"}
            </p>
          </div>
        </div>
        
        <div className="bg-amber-50 rounded-lg p-4">
          <div className="flex items-center mb-2">
            <FaShieldAlt className="text-amber-600 mr-2" />
            <h3 className="font-semibold text-amber-700">Safety Tips</h3>
          </div>
          <ul className="text-sm text-gray-600 list-disc pl-5 space-y-1">
            {trip?.tripData?.safetyTips?.locationPrecautions?.length > 0 ? (
              trip.tripData.safetyTips.locationPrecautions.map((tip, index) => (
                <li key={index}>{tip}</li>
              ))
            ) : (
              <li>No specific safety tips available</li>
            )}
          </ul>
          <div className="mt-2">
            <p className="text-xs text-gray-500">Safe Hours: {trip?.tripData?.safetyTips?.safeHoursToTravel || "Not specified"}</p>
          </div>
          {trip?.tripData?.safetyTips?.emergencyNumbers && (
            <div className="flex items-center mt-2">
              <FaAmbulance className="text-red-500 mr-2" />
              <p className="text-sm font-medium text-red-600">
                Emergency: {trip.tripData.safetyTips.emergencyNumbers.join(', ')}
              </p>
            </div>
          )}
        </div>
      </div>
      
      {/* What to Bring Section */}
      {trip?.tripData?.weatherForecast?.whatToCarry?.length > 0 && (
        <div className="w-full mt-6 border-t pt-4">
          <div className="flex items-center mb-2">
            <FaSuitcase className="text-emerald-500 mr-2" />
            <h3 className="font-semibold text-gray-700">What to Pack</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {trip.tripData.weatherForecast.whatToCarry.map((item, index) => (
              <span key={index} className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
                {item}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Day by Day Plan */}
      {trip?.tripData?.dayPlans?.length > 0 && (
        <div className="w-full mt-8 border-t pt-6">
          <h2 className="text-2xl font-bold mb-4 text-gray-800">Day by Day Plan</h2>
          <div className="space-y-6">
            {trip.tripData.dayPlans.map((day, index) => (
              <div key={index} className="bg-white rounded-lg shadow-sm border p-4">
                {/* Attractions for the day */}
                <div className="mb-4">
                  <div className="flex items-center mb-2">
                    <div className="bg-purple-100 p-2 rounded-full mr-3">
                      <FaLandmark className="text-purple-600" />
                    </div>
                    <h4 className="font-medium text-gray-800">Places to Visit</h4>
                  </div>
                  <div className="ml-9">
                    {day.attractions?.length > 0 ? (
                      <ul className="list-disc pl-5 space-y-1">
                        {day.attractions.map((attraction, attrIndex) => (
                          <li key={attrIndex} className="text-gray-700">
                            {typeof attraction === 'string' ? attraction : attraction.name || attraction.place}
                            {attraction.description && (
                              <p className="text-sm text-gray-500 mt-1">{attraction.description}</p>
                            )}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-gray-500">No attractions specified for this day</p>
                    )}
                  </div>
                </div>

                {/* Accommodation */}
                <div>
                  <div className="flex items-center mb-2">
                    <div className="bg-indigo-100 p-2 rounded-full mr-3">
                      <FaBed className="text-indigo-600" />
                    </div>
                    <h4 className="font-medium text-gray-800">Accommodation</h4>
                  </div>
                  <div className="ml-9">
                    {day.accommodation ? (
                      <div className="text-gray-700">
                        <p className="font-medium">{day.accommodation.name || day.accommodation}</p>
                        {day.accommodation.description && (
                          <p className="text-sm text-gray-500">{day.accommodation.description}</p>
                        )}
                      </div>
                    ) : (
                      <p className="text-gray-500">No accommodation specified for this day</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Creator and Social Interactions */}
      <div className="w-full px-4 mt-8">
        <div className="border-t border-gray-200 pt-4 pb-2 flex justify-between items-center">
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center mr-2">
              <FaUser className="text-emerald-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Created by</p>
              <Link 
                to={`/user/${creatorEmail}`} 
                className="text-blue-600 hover:underline font-medium"
              >
                {creatorEmail ? creatorEmail.split('@')[0] : 'Unknown'}
              </Link>
            </div>
          </div>
          
          {/* Share Button */}
          <div>
            <TripShareButton trip={trip} />
          </div>
        </div>
        
        {/* Social Interactions Component */}
        <div className="mt-2">
          <SocialInteractions 
            tripId={trip.id}
            creatorEmail={creatorEmail}
            likedBy={tripStats.likedBy}
            likesCount={tripStats.likesCount}
            commentsCount={tripStats.commentsCount}
            onCommentClick={() => setShowComments(true)}
            onUpdate={fetchTripStats}
          />
        </div>
        
        {/* Comments Modal */}
        <Comments 
          tripId={trip.id} 
          isOpen={showComments} 
          onClose={() => setShowComments(false)} 
        />
      </div>
    </div>
  );
}

export default TripSummary;
