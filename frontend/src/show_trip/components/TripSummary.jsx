
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  FaMapMarkerAlt, 
  FaCalendarAlt, 
  FaUsers, 
  FaRupeeSign, 
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
  
  // Debug: Log trip data structure
  console.log("TripSummary received trip data:", trip);
  console.log("Trip data travelPlan:", trip?.tripData?.travelPlan);
  
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
        <p className="text-[11px] uppercase tracking-[0.2em] text-emerald-600 font-medium mb-2">Details</p>
        <h2 className="font-serif text-2xl text-[#1a1a2e] mb-4">Trip Summary</h2>
        <div className="w-12 h-[2px] bg-emerald-600 mb-6"></div>
        
        <div className="space-y-4">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-[#f5f0eb] flex items-center justify-center mr-4">
              <FaMapMarkerAlt className="text-emerald-600" />
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-[0.1em] text-gray-400 font-medium">Destination</p>
              <p className="font-medium text-[#1a1a2e] text-sm">{location}</p>
            </div>
          </div>
          
          <div className="flex items-center">
            <div className="w-10 h-10 bg-[#f5f0eb] flex items-center justify-center mr-4">
              <FaCalendarAlt className="text-emerald-600" />
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-[0.1em] text-gray-400 font-medium">Duration</p>
              <p className="font-medium text-[#1a1a2e] text-sm">{duration} {duration === 1 ? 'Day' : 'Days'}</p>
            </div>
          </div>
          
          <div className="flex items-center">
            <div className="w-10 h-10 bg-[#f5f0eb] flex items-center justify-center mr-4">
              <FaUsers className="text-emerald-600" />
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-[0.1em] text-gray-400 font-medium">Travelers</p>
              <p className="font-medium text-[#1a1a2e] text-sm">{travelers} {travelers === 1 ? 'Person' : 'People'}</p>
            </div>
          </div>
          
          <div className="flex items-center">
            <div className="w-10 h-10 bg-[#f5f0eb] flex items-center justify-center mr-4">
              <FaRupeeSign className="text-emerald-600" />
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-[0.1em] text-gray-400 font-medium">Budget</p>
              <p className="font-medium text-[#1a1a2e] text-sm">₹{budget}</p>
            </div>
          </div>
        </div>
        
        {/* Weather Information */}
        <div className="mt-6 bg-[#f5f0eb] p-4">
          <div className="flex items-center mb-3">
            <FaTemperatureHigh className="text-emerald-600 mr-2" />
            <h3 className="text-[11px] uppercase tracking-[0.15em] font-medium text-[#1a1a2e]">Weather</h3>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] uppercase tracking-[0.1em] text-gray-400 font-medium">Temperature</p>
              <p className="font-medium text-[#1a1a2e] text-sm">{trip?.tripData?.travelPlan?.weather?.averageTemperature || trip?.tripData?.weatherForecast?.averageTemperature || "Not available"}</p>
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-[0.1em] text-gray-400 font-medium">Conditions</p>
              <div className="flex items-center">
                <FaSun className="text-amber-500 mr-1" />
                <p className="font-medium text-[#1a1a2e] text-sm">{trip?.tripData?.travelPlan?.weather?.weatherPrediction?.[0] || trip?.tripData?.weatherForecast?.weatherPrediction?.[0] || "Not available"}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Transportation & Safety */}
      <div className="w-full md:w-1/2 px-4">
        <p className="text-[11px] uppercase tracking-[0.2em] text-emerald-600 font-medium mb-2">Logistics</p>
        <h2 className="font-serif text-2xl text-[#1a1a2e] mb-4">Getting Around</h2>
        <div className="w-12 h-[2px] bg-emerald-600 mb-6"></div>
        
        <div className="bg-[#f5f0eb] p-4 mb-4">
          <div className="flex items-start mb-2">
            <div className="w-8 h-8 bg-[#1a1a2e] flex items-center justify-center mr-3 mt-1">
              <FaPlane className="text-white text-xs" />
            </div>
            <div>
              <p className="font-medium text-[#1a1a2e] text-sm">From Airport</p>
              <p className="text-gray-500 text-sm mt-1">
                {trip?.tripData?.travelPlan?.transport?.airportToHotelTransport || trip?.tripData?.transportSuggestions?.airportToHotelTransport || "Not specified"}
              </p>
            </div>
          </div>
          
          <div className="mt-3">
            <p className="text-[11px] uppercase tracking-[0.1em] text-gray-400 font-medium mb-2">Local Transport Options</p>
            <div className="flex flex-wrap gap-2 mt-1">
              {(trip?.tripData?.travelPlan?.transport?.localTransportOptions || trip?.tripData?.transportSuggestions?.localTransportOptions)?.length > 0 ? (
                (trip?.tripData?.travelPlan?.transport?.localTransportOptions || trip?.tripData?.transportSuggestions?.localTransportOptions).map((option, index) => (
                  <span key={index} className="bg-white text-[#1a1a2e] px-2 py-1 text-xs border border-gray-200">
                    {option}
                  </span>
                ))
              ) : (
                <span className="text-sm text-gray-400">Not specified</span>
              )}
            </div>
          </div>
          
          <div className="mt-3">
            <p className="text-[11px] uppercase tracking-[0.1em] text-gray-400 font-medium">Estimated Daily Cost</p>
            <p className="text-gray-600 text-sm mt-1">
              {trip?.tripData?.travelPlan?.transport?.estimatedDailyCost || trip?.tripData?.transportSuggestions?.estimatedDailyCost || "Not specified"}
            </p>
          </div>
        </div>
        
        <div className="border border-amber-200 bg-amber-50/50 p-4">
          <div className="flex items-center mb-2">
            <FaShieldAlt className="text-amber-600 mr-2" />
            <h3 className="text-[11px] uppercase tracking-[0.15em] font-medium text-amber-700">Safety Tips</h3>
          </div>
          <ul className="text-sm text-gray-600 list-disc pl-5 space-y-1">
            {(trip?.tripData?.travelPlan?.safety?.locationPrecautions || trip?.tripData?.safetyTips?.locationPrecautions)?.length > 0 ? (
              (trip?.tripData?.travelPlan?.safety?.locationPrecautions || trip?.tripData?.safetyTips?.locationPrecautions).map((tip, index) => (
                <li key={index}>{tip}</li>
              ))
            ) : (
              <li>No specific safety tips available</li>
            )}
          </ul>
          <div className="mt-2">
            <p className="text-xs text-gray-400">Safe Hours: {trip?.tripData?.travelPlan?.safety?.safeHoursToTravel || trip?.tripData?.safetyTips?.safeHoursToTravel || "Not specified"}</p>
          </div>
          {(trip?.tripData?.travelPlan?.safety?.emergencyNumbers || trip?.tripData?.safetyTips?.emergencyNumbers) && (
            <div className="flex items-center mt-2">
              <FaAmbulance className="text-red-500 mr-2" />
              <p className="text-sm font-medium text-red-600">
                Emergency: {(trip?.tripData?.travelPlan?.safety?.emergencyNumbers || trip?.tripData?.safetyTips?.emergencyNumbers).join(', ')}
              </p>
            </div>
          )}
        </div>
      </div>
      
      {/* What to Bring Section */}
      {trip?.tripData?.weatherForecast?.whatToCarry?.length > 0 && (
        <div className="w-full mt-6 border-t border-gray-200 pt-4">
          <div className="flex items-center mb-3">
            <FaSuitcase className="text-emerald-600 mr-2" />
            <h3 className="text-[11px] uppercase tracking-[0.15em] font-medium text-[#1a1a2e]">What to Pack</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {trip.tripData.weatherForecast.whatToCarry.map((item, index) => (
              <span key={index} className="bg-[#f5f0eb] text-gray-700 px-3 py-1 text-sm">
                {item}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Day by Day Plan */}
      {trip?.tripData?.dayPlans?.length > 0 && (
        <div className="w-full mt-8 border-t border-gray-200 pt-6">
          <p className="text-[11px] uppercase tracking-[0.2em] text-emerald-600 font-medium mb-2">Schedule</p>
          <h2 className="font-serif text-2xl text-[#1a1a2e] mb-4">Day by Day Plan</h2>
          <div className="w-12 h-[2px] bg-emerald-600 mb-6"></div>
          <div className="space-y-4">
            {trip.tripData.dayPlans.map((day, index) => (
              <div key={index} className="bg-white border border-gray-200 p-4">
                {/* Attractions */}
                <div className="mb-4">
                  <div className="flex items-center mb-2">
                    <div className="w-8 h-8 bg-[#f5f0eb] flex items-center justify-center mr-3">
                      <FaLandmark className="text-emerald-600 text-sm" />
                    </div>
                    <h4 className="font-medium text-[#1a1a2e] text-sm">Places to Visit</h4>
                  </div>
                  <div className="ml-11">
                    {day.attractions?.length > 0 ? (
                      <ul className="list-disc pl-5 space-y-1">
                        {day.attractions.map((attraction, attrIndex) => (
                          <li key={attrIndex} className="text-gray-700 text-sm">
                            {typeof attraction === 'string' ? attraction : attraction.name || attraction.place}
                            {attraction.description && (
                              <p className="text-xs text-gray-400 mt-1">{attraction.description}</p>
                            )}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-gray-400 text-sm">No attractions specified</p>
                    )}
                  </div>
                </div>

                {/* Accommodation */}
                <div>
                  <div className="flex items-center mb-2">
                    <div className="w-8 h-8 bg-[#f5f0eb] flex items-center justify-center mr-3">
                      <FaBed className="text-emerald-600 text-sm" />
                    </div>
                    <h4 className="font-medium text-[#1a1a2e] text-sm">Accommodation</h4>
                  </div>
                  <div className="ml-11">
                    {day.accommodation ? (
                      <div className="text-gray-700 text-sm">
                        <p className="font-medium">{day.accommodation.name || day.accommodation}</p>
                        {day.accommodation.description && (
                          <p className="text-xs text-gray-400">{day.accommodation.description}</p>
                        )}
                      </div>
                    ) : (
                      <p className="text-gray-400 text-sm">No accommodation specified</p>
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
            <div className="w-8 h-8 bg-[#1a1a2e] flex items-center justify-center mr-2">
              <FaUser className="text-white text-xs" />
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-[0.1em] text-gray-400 font-medium">Created by</p>
              <Link 
                to={`/user/${creatorEmail}`} 
                className="text-emerald-600 hover:text-emerald-700 font-medium text-sm transition-colors"
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
