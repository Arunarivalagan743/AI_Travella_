
import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '/src/ModelWork/firebaseConfig.js';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaMapMarkerAlt, 
  FaCalendarAlt, 
  FaSuitcase, 
  FaUser, 
  FaPlus,
  FaHeart,
  FaRegHeart,
  FaTrash,
  FaExclamationTriangle,
  FaImage
} from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import { GetPlaceDetails, PHOTO_REF_URL } from '@/ModelWork/GlobalApi';
import { useAuth } from '../context/AuthContext'; // <-- Import auth context

function MyTrips() {
  const { user } = useAuth(); // <-- Use auth context
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [viewMode, setViewMode] = useState('all'); // 'all' or 'favorites'
  const [placeImages, setPlaceImages] = useState({}); // Store fetched images by trip ID
  const [loadingImages, setLoadingImages] = useState({}); // Track loading status by trip ID

  useEffect(() => {
    if (user) {
      fetchUserTrips();
    } else {
      setLoading(false);
      setTrips([]);
    }
  }, [viewMode, user]); // <-- Include user in dependencies

  const fetchUserTrips = async () => {
    try {
      setLoading(true);
      
      if (!user) {
        setErrorMessage('Please sign in to view your trips');
        setLoading(false);
        return;
      }

      const userEmail = user.email;
      
      // Query Firestore for trips with matching email
      let q = query(collection(db, "alltrips"), where("userEmail", "==", userEmail));
      
      // If we're viewing favorites only, add that condition
      if (viewMode === 'favorites') {
        q = query(collection(db, "alltrips"), 
                 where("userEmail", "==", userEmail),
                 where("isFavorite", "==", true));
      }
      
      const querySnapshot = await getDocs(q);
      
      const userTrips = [];
      querySnapshot.forEach((doc) => {
        userTrips.push({ id: doc.id, ...doc.data() });
      });
      
      setTrips(userTrips);
      
      // After setting trips, fetch place images for locations
      userTrips.forEach(trip => {
        const locationName = trip.userSelection?.place?.label || 
                            trip.userSelection?.location;
        if (locationName) {
          fetchPlaceImage(trip.id, locationName);
        }
      });
    } catch (error) {
      console.error("Error fetching trips:", error);
      setErrorMessage("Failed to load your trips. Please try again later.");
      toast.error("Failed to load trips");
    } finally {
      setLoading(false);
    }
  };

  const fetchPlaceImage = async (tripId, locationName) => {
    // Skip if we already have an image for this trip or are already loading one
    if (placeImages[tripId] || loadingImages[tripId]) return;
    
    try {
      // Set loading state for this trip
      setLoadingImages(prev => ({ ...prev, [tripId]: true }));
      
      const data = { textQuery: locationName };
      const response = await GetPlaceDetails(data);
      
      if (response?.data?.places?.[0]?.photos?.length > 0) {
        // Try to get a horizontal landscape photo if available
        const photoIndex = response.data.places[0].photos.length > 2 ? 2 : 0;
        const photoName = response.data.places[0].photos[photoIndex].name;
        const photoUrl = PHOTO_REF_URL.replace('{Name}', photoName);
        
        // Preload the image
        const img = new Image();
        img.onload = () => {
          setPlaceImages(prev => ({ ...prev, [tripId]: photoUrl }));
          setLoadingImages(prev => ({ ...prev, [tripId]: false }));
        };
        img.onerror = () => {
          console.log("Failed to load place image for", locationName);
          setLoadingImages(prev => ({ ...prev, [tripId]: false }));
        };
        img.src = photoUrl;
      } else {
        setLoadingImages(prev => ({ ...prev, [tripId]: false }));
      }
    } catch (error) {
      console.error("Error fetching place image:", error);
      setLoadingImages(prev => ({ ...prev, [tripId]: false }));
    }
  };

  const toggleFavorite = async (tripId, currentStatus) => {
    try {
      const tripRef = doc(db, "alltrips", tripId);
      await updateDoc(tripRef, {
        isFavorite: !currentStatus
      });

      // Update local state
      setTrips(trips.map(trip => {
        if (trip.id === tripId) {
          return { ...trip, isFavorite: !currentStatus };
        }
        return trip;
      }));

      toast.success(currentStatus ? "Removed from favorites" : "Added to favorites");
    } catch (error) {
      console.error("Error updating favorite status:", error);
      toast.error("Failed to update favorite status");
    }
  };

  const deleteTrip = async (tripId) => {
    try {
      setIsDeleting(true);
      await deleteDoc(doc(db, "alltrips", tripId));
      
      // Update local state by removing the deleted trip
      setTrips(trips.filter(trip => trip.id !== tripId));
      setShowDeleteConfirm(null);
      toast.success("Trip deleted successfully");
    } catch (error) {
      console.error("Error deleting trip:", error);
      toast.error("Failed to delete trip");
    } finally {
      setIsDeleting(false);
    }
  };

  // Format travel type to capitalize first letter
  const formatTravelType = (type) => {
    if (!type) return "Trip";
    return type.charAt(0).toUpperCase() + type.slice(1).replace(/([A-Z])/g, ' $1');
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Unknown date";
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric', 
      month: 'short', 
      day: 'numeric'
    }).format(date);
  };

  // Get the best available image for a trip
  const getTripImage = (trip) => {
    // First try the real place image from API
    if (placeImages[trip.id]) {
      return placeImages[trip.id];
    }
    
    // Then try hotel image
    if (trip.tripData?.hotelsList?.[0]?.hotelImageUrl) {
      return trip.tripData.hotelsList[0].hotelImageUrl;
    }
    
    // Then use default fallback image
    return "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?ixlib=rb-4.0.3&auto=format&fit=crop&w=1121&q=80";
  };

  // If not logged in, show sign in required message
  if (!user) {
    return (
      <motion.div
        className="min-h-[60vh] flex flex-col items-center justify-center p-8 text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="bg-white border border-gray-200 px-10 py-12 flex flex-col items-center max-w-md w-full">
          <FaSuitcase className="text-[#1a1a2e] text-4xl mb-5" />
          <h2 className="font-serif text-2xl text-[#1a1a2e] mb-2">Sign In Required</h2>
          <div className="w-10 h-[2px] bg-emerald-600 mb-4"></div>
          <p className="text-gray-500 text-sm tracking-wide mb-6">
            Please sign in to view your trips and access your saved journeys.
          </p>
        </div>
      </motion.div>
    );
  }

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[60vh] gap-4">
        <div className="w-[1px] h-10 bg-emerald-600 animate-pulse"></div>
        <span className="text-[11px] uppercase tracking-[0.25em] text-gray-400 font-medium">Loading trips</span>
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 text-center">
        <div className="bg-[#f5f0eb] border border-gray-200 px-8 py-6 max-w-md">
          <h2 className="font-serif text-xl text-[#1a1a2e] mb-2">Authentication Required</h2>
          <div className="w-10 h-[2px] bg-emerald-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-sm mb-5">{errorMessage}</p>
          <Link to="/" className="inline-block bg-[#1a1a2e] hover:bg-[#2a2a4e] text-white text-[11px] uppercase tracking-[0.2em] font-medium px-6 py-3 transition-colors">
            GO TO HOME
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Dark banner header */}
      <div className="bg-[#1a1a2e] py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
            <div>
              <span className="text-[11px] uppercase tracking-[0.25em] text-white/50 font-medium">Your Collection</span>
              <h1 className="font-serif text-3xl sm:text-4xl text-white mt-2">My Trips</h1>
              <div className="w-12 h-[2px] bg-emerald-600 mt-3"></div>
            </div>
            <Link 
              to="/create-trip" 
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] uppercase tracking-[0.2em] font-medium px-6 py-3 transition-colors"
            >
              <FaPlus size={10} />
              <span>NEW TRIP</span>
            </Link>
          </div>
          
          {/* LP-style tabs */}
          <div className="flex items-center gap-8 mt-8 border-t border-white/10 pt-4">
            <button
              onClick={() => setViewMode('all')}
              className={`text-[12px] uppercase tracking-[0.2em] font-medium pb-2 transition-colors border-b-2 ${
                viewMode === 'all' 
                  ? 'text-white border-emerald-600' 
                  : 'text-white/50 border-transparent hover:text-white/80'
              }`}
            >
              All Trips
            </button>
            <button
              onClick={() => setViewMode('favorites')}
              className={`text-[12px] uppercase tracking-[0.2em] font-medium pb-2 transition-colors border-b-2 flex items-center gap-2 ${
                viewMode === 'favorites'
                  ? 'text-white border-emerald-600'
                  : 'text-white/50 border-transparent hover:text-white/80'
              }`}
            >
              <FaHeart size={10} />
              Favorites
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">

      {trips.length === 0 ? (
        <div className="bg-[#f5f0eb] p-16 text-center">
          <FaSuitcase className="mx-auto text-[#1a1a2e]/20 text-4xl mb-5" />
          <h2 className="font-serif text-2xl text-[#1a1a2e] mb-2">
            {viewMode === 'favorites' ? "No favorite trips yet" : "No trips yet"}
          </h2>
          <div className="w-10 h-[2px] bg-emerald-600 mx-auto mb-4"></div>
          <p className="text-gray-500 text-sm tracking-wide mb-8 max-w-sm mx-auto">
            {viewMode === 'favorites' 
              ? "Add trips to your favorites to see them here." 
              : "Start planning your next adventure today."}
          </p>
          {viewMode === 'favorites' ? (
            <button 
              onClick={() => setViewMode('all')}
              className="inline-block bg-[#1a1a2e] hover:bg-[#2a2a4e] text-white text-[11px] uppercase tracking-[0.2em] font-medium px-8 py-3 transition-colors"
            >
              VIEW ALL TRIPS
            </button>
          ) : (
            <Link 
              to="/" 
              className="inline-block bg-[#1a1a2e] hover:bg-[#2a2a4e] text-white text-[11px] uppercase tracking-[0.2em] font-medium px-8 py-3 transition-colors"
            >
              CREATE YOUR FIRST TRIP
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {trips.map((trip) => {
            const location = trip.userSelection?.location || trip.userSelection?.place?.label || "Unknown Location";
            const travelType = trip.userSelection?.travelType || "adventure";
            const tripImage = getTripImage(trip);
            
            return (
              <motion.div
                key={trip.id}
                className="bg-white border border-gray-200 overflow-hidden relative group"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                {/* Favorite Button */}
                <button
                  className="absolute top-3 right-3 z-10 bg-white/90 backdrop-blur-sm p-2 transition-colors hover:bg-white"
                  onClick={(e) => {
                    e.preventDefault(); 
                    e.stopPropagation();
                    toggleFavorite(trip.id, trip.isFavorite);
                  }}
                >
                  {trip.isFavorite ? (
                    <FaHeart className="text-red-500" size={14} />
                  ) : (
                    <FaRegHeart className="text-gray-600 hover:text-red-500" size={14} />
                  )}
                </button>
                
                <div className="h-52 relative overflow-hidden">
                  {/* Loading indicator for images */}
                  {loadingImages[trip.id] && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-100/80 z-10">
                      <div className="w-[1px] h-6 bg-emerald-600 animate-pulse"></div>
                    </div>
                  )}
                  
                  {/* Place API badge */}
                  {placeImages[trip.id] && (
                    <div className="absolute top-3 left-3 z-10 bg-[#1a1a2e]/80 backdrop-blur-sm text-white text-[10px] uppercase tracking-[0.15em] px-2 py-1 flex items-center gap-1">
                      <FaImage size={8} />
                      <span>Live</span>
                    </div>
                  )}
                  
                  <img 
                    src={tripImage} 
                    alt={location}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?ixlib=rb-4.0.3&auto=format&fit=crop&w=1121&q=80";
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
                  <div className="absolute bottom-3 left-3">
                    <span className="bg-[#1a1a2e] text-white text-[10px] uppercase tracking-[0.15em] font-medium px-3 py-1.5 inline-flex items-center gap-1.5">
                      <FaSuitcase size={8} />
                      {formatTravelType(travelType)}
                    </span>
                  </div>
                </div>
                
                <div className="p-5">
                  <h3 className="font-serif text-xl text-[#1a1a2e] mb-3 line-clamp-1">{location}</h3>
                  
                  <div className="flex flex-col gap-2 text-sm text-gray-500 mb-4">
                    <div className="flex items-center gap-2">
                      <FaCalendarAlt className="text-emerald-600" size={12} />
                      <span>{trip.userSelection?.duration || 0} {trip.userSelection?.duration === 1 ? 'Day' : 'Days'}</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <FaUser className="text-emerald-600" size={12} />
                      <span>{trip.userSelection?.travelers || 1} {trip.userSelection?.travelers === 1 ? 'Traveler' : 'Travelers'}</span>
                    </div>
                  </div>
                  
                  <div className="border-t border-gray-100 pt-4 flex items-center justify-between">
                    <span className="text-[10px] uppercase tracking-[0.15em] text-gray-400">{formatDate(trip.createdAt)}</span>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => setShowDeleteConfirm(trip.id)}
                        className="inline-flex items-center text-gray-400 hover:text-red-500 p-2 transition-colors"
                        aria-label="Delete trip"
                      >
                        <FaTrash size={13} />
                      </button>
                      
                      <Link 
                        to={`/show-trip/${trip.id}`}
                        className="inline-block bg-[#1a1a2e] hover:bg-[#2a2a4e] text-white text-[11px] uppercase tracking-[0.15em] font-medium px-4 py-2 transition-colors"
                      >
                        View
                      </Link>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
      
      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div 
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => !isDeleting && setShowDeleteConfirm(null)}
          >
            <motion.div 
              className="bg-white p-8 max-w-md w-full"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center gap-3 text-red-600 mb-2">
                <FaExclamationTriangle size={18} />
                <h3 className="font-serif text-lg text-[#1a1a2e]">Delete Trip</h3>
              </div>
              <div className="w-10 h-[2px] bg-red-500 mb-4"></div>
              
              <p className="text-gray-600 text-sm mb-6 leading-relaxed">
                Are you sure you want to delete this trip? This action cannot be undone.
              </p>
              
              <div className="flex gap-3 justify-end">
                <button
                  className="px-5 py-2.5 text-[11px] uppercase tracking-[0.15em] font-medium text-gray-600 border border-gray-200 hover:bg-gray-50 transition-colors disabled:opacity-50"
                  onClick={() => !isDeleting && setShowDeleteConfirm(null)}
                  disabled={isDeleting}
                >
                  Cancel
                </button>
                <button
                  className="px-5 py-2.5 text-[11px] uppercase tracking-[0.15em] font-medium bg-red-600 hover:bg-red-700 text-white transition-colors flex items-center gap-2 disabled:opacity-50"
                  onClick={() => deleteTrip(showDeleteConfirm)}
                  disabled={isDeleting}
                >
                  {isDeleting ? (
                    <>
                      <div className="h-3 w-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Deleting
                    </>
                  ) : (
                    <>
                      <FaTrash size={11} />
                      Delete
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      </div>
    </div>
  );
}

export default MyTrips;