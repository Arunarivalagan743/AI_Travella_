
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

  // If not logged in, show sign in required message with animation
  if (!user) {
    return (
      <motion.div
        className="min-h-[60vh] flex flex-col items-center justify-center p-8 text-center "
        initial={{ opacity: 0, scale: 0.95, y: 40 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <motion.div
          className="bg-white rounded-xl shadow-lg px-8 py-10 flex flex-col items-center max-w-md w-full"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.4, type: "spring" }}
        >
          <motion.div
            className="mb-4"
            initial={{ rotate: -10, scale: 0.8 }}
            animate={{ rotate: 0, scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 12 }}
          >
            <FaSuitcase className="text-emerald-600 text-5xl" />
          </motion.div>
          <motion.div
            className="text-2xl font-bold text-emerald-700 mb-2"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            Sign in Required
          </motion.div>
          <motion.div
            className="text-gray-600 mb-6 text-center"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            Please sign in to view your trips and access your saved journeys.
          </motion.div>
      
        </motion.div>
      </motion.div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 text-center">
        <div className="bg-amber-50 border border-amber-200 text-amber-800 px-6 py-4 rounded-lg max-w-md">
          <h2 className="text-xl font-bold mb-2">Authentication Required</h2>
          <p className="mb-4">{errorMessage}</p>
          <Link to="/" className="inline-block bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-md">
            Go to Home Page
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6 max-w-7xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <h1 className="text-3xl font-bold text-gray-800">My Trips</h1>
        
        <div className="flex flex-wrap items-center gap-3">
          {/* View mode toggle */}
          <div className="bg-gray-100 rounded-lg p-1 flex">
            <button
              onClick={() => setViewMode('all')}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'all' 
                  ? 'bg-white shadow-sm text-emerald-700' 
                  : 'text-gray-600 hover:bg-gray-200'
              }`}
            >
              All Trips
            </button>
            <button
              onClick={() => setViewMode('favorites')}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center gap-1 ${
                viewMode === 'favorites'
                  ? 'bg-white shadow-sm text-emerald-700'
                  : 'text-gray-600 hover:bg-gray-200'
              }`}
            >
              <FaHeart className="text-xs" />
              Favorites
            </button>
          </div>
          
          <Link 
            to="/create-trip" 
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg transition-all shadow-md hover:shadow-lg"
          >
            <FaPlus />
            <span>Create New Trip</span>
          </Link>
        </div>
      </div>

      {trips.length === 0 ? (
        <div className="bg-gray-50 rounded-xl p-12 text-center shadow-sm">
          <FaSuitcase className="mx-auto text-gray-300 text-5xl mb-4" />
          <h2 className="text-2xl font-semibold text-gray-700 mb-2">
            {viewMode === 'favorites' ? "No favorite trips yet" : "No trips yet"}
          </h2>
          <p className="text-gray-500 mb-6">
            {viewMode === 'favorites' 
              ? "Add trips to your favorites to see them here!" 
              : "Start planning your next adventure today!"}
          </p>
          {viewMode === 'favorites' ? (
            <button 
              onClick={() => setViewMode('all')}
              className="inline-block bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-lg transition-all shadow-md hover:shadow-lg"
            >
              View All Trips
            </button>
          ) : (
            <Link 
              to="/" 
              className="inline-block bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-lg transition-all shadow-md hover:shadow-lg"
            >
              Create Your First Trip
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
                className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all border border-gray-100 relative"
                whileHover={{ y: -5 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                {/* Favorite Button */}
                <motion.button
                  className="absolute top-4 right-4 z-10 bg-white/80 backdrop-blur-sm p-2 rounded-full shadow-md"
                  onClick={(e) => {
                    e.preventDefault(); 
                    e.stopPropagation();
                    toggleFavorite(trip.id, trip.isFavorite);
                  }}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  {trip.isFavorite ? (
                    <FaHeart className="text-red-500" size={16} />
                  ) : (
                    <FaRegHeart className="text-gray-600 hover:text-red-500" size={16} />
                  )}
                </motion.button>
                
                <div className="h-48 relative overflow-hidden">
                  {/* Loading indicator for images */}
                  {loadingImages[trip.id] && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-100/80 z-10">
                      <div className="flex flex-col items-center">
                        <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mb-1"></div>
                        <span className="text-xs text-gray-500">Loading image...</span>
                      </div>
                    </div>
                  )}
                  
                  {/* Place API badge */}
                  {placeImages[trip.id] && (
                    <div className="absolute top-3 left-3 z-10 bg-emerald-700/70 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-md flex items-center gap-1">
                      <FaImage size={10} />
                      <span>Live Photo</span>
                    </div>
                  )}
                  
                  <img 
                    src={tripImage} 
                    alt={location}
                    className="w-full h-full object-cover transition-transform duration-700 hover:scale-110"
                    onError={(e) => {
                      // Fallback if image fails to load
                      e.target.onerror = null;
                      e.target.src = "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?ixlib=rb-4.0.3&auto=format&fit=crop&w=1121&q=80";
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>
                  <div className="absolute bottom-0 left-0 p-4">
                    <span className="bg-emerald-600 text-white px-3 py-1 rounded-full text-xs font-medium inline-flex items-center gap-1">
                      <FaSuitcase className="text-white/90" size={10} />
                      {formatTravelType(travelType)}
                    </span>
                  </div>
                </div>
                
                <div className="p-5">
                  <h3 className="font-bold text-xl mb-2 text-gray-800 line-clamp-1">{location}</h3>
                  
                  <div className="flex flex-col gap-2 text-sm text-gray-600 mb-4">
                    <div className="flex items-center gap-2">
                      <FaCalendarAlt className="text-emerald-600" />
                      <span>{trip.userSelection?.duration || 0} {trip.userSelection?.duration === 1 ? 'Day' : 'Days'}</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <FaUser className="text-emerald-600" />
                      <span>{trip.userSelection?.travelers || 1} {trip.userSelection?.travelers === 1 ? 'Traveler' : 'Travelers'}</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <FaMapMarkerAlt className="text-emerald-600" />
                      <span className="line-clamp-1">{location}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">{formatDate(trip.createdAt)}</span>
                    <div className="flex gap-2">
                      {/* Delete button */}
                      <button 
                        onClick={() => setShowDeleteConfirm(trip.id)}
                        className="inline-flex items-center bg-red-50 hover:bg-red-100 text-red-600 hover:text-red-700 p-2 rounded-lg text-sm transition-colors"
                        aria-label="Delete trip"
                      >
                        <FaTrash size={14} />
                      </button>
                      
                      {/* View button */}
                      <Link 
                        to={`/show-trip/${trip.id}`}
                        className="inline-block bg-gray-100 hover:bg-emerald-100 text-emerald-600 hover:text-emerald-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                      >
                        View Trip
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
              className="bg-white rounded-xl p-6 max-w-md w-full shadow-2xl"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center gap-3 text-red-600 mb-4">
                <FaExclamationTriangle size={20} />
                <h3 className="text-lg font-bold">Delete Trip</h3>
              </div>
              
              <p className="mb-6 text-gray-700">
                Are you sure you want to delete this trip? This action cannot be undone.
              </p>
              
              <div className="flex gap-3 justify-end">
                <button
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors font-medium disabled:opacity-50"
                  onClick={() => !isDeleting && setShowDeleteConfirm(null)}
                  disabled={isDeleting}
                >
                  Cancel
                </button>
                <button
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-medium flex items-center gap-2 disabled:opacity-50"
                  onClick={() => deleteTrip(showDeleteConfirm)}
                  disabled={isDeleting}
                >
                  {isDeleting ? (
                    <>
                      <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Deleting...
                    </>
                  ) : (
                    <>
                      <FaTrash size={14} />
                      Delete Trip
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default MyTrips;