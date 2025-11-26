import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { collection, query, where, getDocs, doc, getDoc, orderBy, arrayRemove, updateDoc } from 'firebase/firestore';
import { db } from '../ModelWork/firebaseConfig';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { GetPlaceDetails, PHOTO_REF_URL } from '../ModelWork/GlobalApi';
import { 
  FaEnvelope, 
  FaMapMarkerAlt, 
  FaUser, 
  FaCalendarAlt, 
  FaTimesCircle, 
  FaUserCircle,
  FaHeart,
  FaComment,
  FaShare,
  FaEdit,
  FaChevronRight,
  FaGlobe,
  FaUsers,
  FaUserPlus,
  FaArrowLeft
} from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import SocialInteractions from '../components/ui/custom/SocialInteractions';

function UserProfile() {
  const { userId } = useParams(); // userId is the email address
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [trips, setTrips] = useState([]);
  const [isFollowing, setIsFollowing] = useState({ status: 'none' });
  const [loading, setLoading] = useState(true);
  const [loadingTrips, setLoadingTrips] = useState(true);
  const [activeTab, setActiveTab] = useState('trips');
  const [followers, setFollowers] = useState([]);
  const [followersProfiles, setFollowersProfiles] = useState({});
  const [loadingFollowers, setLoadingFollowers] = useState(false);
  const [following, setFollowing] = useState([]);
  const [followingProfiles, setFollowingProfiles] = useState({});
  const [loadingFollowing, setLoadingFollowing] = useState(false);
  const [followerTrips, setFollowerTrips] = useState([]);
  const [selectedFollower, setSelectedFollower] = useState(null);
  const [loadingFollowerTrips, setLoadingFollowerTrips] = useState(false);
  const [stats, setStats] = useState({
    tripCount: 0,
    followers: 0,
    following: 0,
    pendingRequests: 0
  });
  const [placeImages, setPlaceImages] = useState({});
  const [loadingImages, setLoadingImages] = useState({});
  const [latestTripImage, setLatestTripImage] = useState(null);

  // Fetch place image using same approach as Explore page
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

  // Helper function to validate if URL is a real image URL
  const isValidImageUrl = (url) => {
    if (!url || typeof url !== 'string') return false;
    // Check for example/placeholder URLs
    if (url.includes('example.com') || url.includes('placeholder') || url.includes('demo.')) return false;
    // Check for valid image extensions or common image hosting patterns
    const imageExtensions = /\.(jpg|jpeg|png|gif|webp|svg)$/i;
    const imageHostingPatterns = /(googleapis|cloudinary|unsplash|pexels|pixabay|imgur)/i;
    return imageExtensions.test(url) || imageHostingPatterns.test(url);
  };

  // Get the best available image for a trip (same as Explore page)
  const getTripImage = (trip) => {
    // First try the real place image from API
    if (placeImages[trip.id]) {
      return placeImages[trip.id];
    }
    
    // Then try hotel image if it's valid
    if (trip.tripData?.hotelsList?.[0]?.hotelImageUrl && isValidImageUrl(trip.tripData.hotelsList[0].hotelImageUrl)) {
      return trip.tripData.hotelsList[0].hotelImageUrl;
    }
    
    // Then use default fallback image (same as Explore page)
    return "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?ixlib=rb-4.0.3&auto=format&fit=crop&w=1121&q=80";
  };

  // Fetch user profile data and trips
  useEffect(() => {
    if (userId) {
      fetchUserProfile();
      fetchUserTrips();
    }
  }, [userId]);

  // Check if current user is following this profile
  useEffect(() => {
    if (user && profile) {
      checkFollowStatus();

      // Refresh follow status every 5s
      const intervalId = setInterval(() => {
        if (user && profile) {
          checkFollowStatus();
        }
      }, 5000);

      return () => clearInterval(intervalId);
    }
  }, [user, profile]);

  // Fetch follower profiles when profile changes
  useEffect(() => {
    if (profile && profile.followers && profile.followers.length > 0) {
      fetchFollowerProfiles();
    }
    if (profile && profile.following && profile.following.length > 0) {
      fetchFollowingProfiles();
    }
  }, [profile]);

  // Fetch trip images when trips are loaded (using Explore page approach)
  useEffect(() => {
    const fetchTripImages = async () => {
      if (trips.length === 0) return;

      let latestImage = null;
      
      // Fetch images for trips that don't have them already
      trips.forEach(trip => {
        const location = trip.userSelection?.location || trip.userSelection?.place?.label || "Unknown Location";
        
        // Only fetch if we don't already have an image and it's not loading
        if (!placeImages[trip.id] && !loadingImages[trip.id]) {
          fetchPlaceImage(trip.id, location);
        }
      });
      
      // Wait a bit for images to load, then set the latest image
      setTimeout(() => {
        // Find the best image from the first (latest) trip
        for (const trip of trips) {
          // Priority: API fetched image > valid hotel/cover image
          if (placeImages[trip.id]) {
            latestImage = placeImages[trip.id];
            break;
          } else if (trip.coverImage && isValidImageUrl(trip.coverImage)) {
            latestImage = trip.coverImage;
            break;
          } else if (trip.tripData?.hotelsList?.[0]?.hotelImageUrl && isValidImageUrl(trip.tripData.hotelsList[0].hotelImageUrl)) {
            latestImage = trip.tripData.hotelsList[0].hotelImageUrl;
            break;
          }
        }
        
        setLatestTripImage(latestImage);
      }, 1000); // Give time for API images to load
    };

    fetchTripImages();
  }, [trips, placeImages]); // Also depend on placeImages to update when new images load

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const userDocRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        const userData = userDoc.data();
        setProfile(userData);

        // Ensure arrays exist
        if (!userData.followRequestsReceived) userData.followRequestsReceived = [];
        if (!userData.followRequestsSent) userData.followRequestsSent = [];

        setStats({
          tripCount: 0, // updated after trips fetch
          followers: userData.followers?.length || 0,
          following: userData.following?.length || 0,
          pendingRequests: userData.followRequestsReceived?.length || 0
        });
      } else {
        toast.error('User not found');
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      toast.error('Failed to load user profile');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserTrips = async () => {
    try {
      setLoadingTrips(true);
      const tripsQuery = query(
        collection(db, 'alltrips'),
        where('userEmail', '==', userId),
        where('isPublic', '==', true),
        orderBy('createdAt', 'desc')
      );

      const querySnapshot = await getDocs(tripsQuery);
      const userTrips = [];

      querySnapshot.forEach((doc) => {
        userTrips.push({ id: doc.id, ...doc.data() });
      });

      setTrips(userTrips);
      setStats((prev) => ({ ...prev, tripCount: userTrips.length }));
    } catch (error) {
      console.error('Error fetching user trips:', error);
      toast.error('Failed to load user trips');
    } finally {
      setLoadingTrips(false);
    }
  };

  const fetchFollowerProfiles = async () => {
    try {
      setLoadingFollowers(true);
      const profiles = {};
      
      if (!profile || !profile.followers) return;
      
      await Promise.all((profile.followers || []).map(async (email) => {
        const userDocRef = doc(db, "users", email);
        const userDoc = await getDoc(userDocRef);
        
        if (userDoc.exists()) {
          profiles[email] = userDoc.data();
        } else {
          // Fallback profile if user document doesn't exist
          profiles[email] = {
            displayName: email.split('@')[0],
            email: email,
            photoURL: null
          };
        }
      }));
      
      setFollowersProfiles(profiles);
      setFollowers(profile.followers || []);
    } catch (error) {
      console.error("Error fetching follower profiles:", error);
      toast.error("Failed to load followers");
    } finally {
      setLoadingFollowers(false);
    }
  };

  const fetchFollowingProfiles = async () => {
    try {
      setLoadingFollowing(true);
      const profiles = {};
      
      if (!profile || !profile.following) return;
      
      await Promise.all((profile.following || []).map(async (email) => {
        const userDocRef = doc(db, "users", email);
        const userDoc = await getDoc(userDocRef);
        
        if (userDoc.exists()) {
          profiles[email] = userDoc.data();
        } else {
          // Fallback profile if user document doesn't exist
          profiles[email] = {
            displayName: email.split('@')[0],
            email: email,
            photoURL: null
          };
        }
      }));
      
      setFollowingProfiles(profiles);
      setFollowing(profile.following || []);
    } catch (error) {
      console.error("Error fetching following profiles:", error);
      toast.error("Failed to load following list");
    } finally {
      setLoadingFollowing(false);
    }
  };

  const checkFollowStatus = async () => {
    if (!user || user.email === userId) return; // can't follow yourself

    try {
      const currentUserRef = doc(db, 'users', user.email);
      const currentUserDoc = await getDoc(currentUserRef);

      if (currentUserDoc.exists()) {
        const userData = currentUserDoc.data();
        const following = userData.following || [];
        const requestsSent = userData.followRequestsSent || [];
        const requestsReceived = userData.followRequestsReceived || [];

        setIsFollowing({
          status: following.includes(userId)
            ? 'following'
            : requestsSent.includes(userId)
            ? 'requested'
            : requestsReceived.includes(userId)
            ? 'pending'
            : 'none'
        });
      }
    } catch (error) {
      console.error('Error checking follow status:', error);
    }
  };

  const viewFollowerTrips = async (followerEmail) => {
    try {
      setSelectedFollower(followerEmail);
      setLoadingFollowerTrips(true);
      setActiveTab('followerTrips');
      
      // Query for the follower's public trips
      const tripsQuery = query(
        collection(db, 'alltrips'),
        where('userEmail', '==', followerEmail),
        where('isPublic', '==', true),
        orderBy('createdAt', 'desc')
      );

      const querySnapshot = await getDocs(tripsQuery);
      const userTrips = [];

      querySnapshot.forEach((doc) => {
        userTrips.push({ id: doc.id, ...doc.data() });
      });

      setFollowerTrips(userTrips);
      
      // Get follower profile data for display
      if (!followersProfiles[followerEmail]) {
        const userDocRef = doc(db, "users", followerEmail);
        const userDoc = await getDoc(userDocRef);
        
        if (userDoc.exists()) {
          const updatedProfiles = { ...followersProfiles };
          updatedProfiles[followerEmail] = userDoc.data();
          setFollowersProfiles(updatedProfiles);
        }
      }
    } catch (error) {
      console.error("Error fetching follower trips:", error);
      toast.error("Failed to load trips");
    } finally {
      setLoadingFollowerTrips(false);
    }
  };
  
  const handleUnfollow = async (followerEmail) => {
    if (!user) return;

    try {
      // Update current user's document
      const currentUserRef = doc(db, "users", user.email);
      await updateDoc(currentUserRef, {
        following: arrayRemove(followerEmail)
      });

      // Update follower's document
      const followerRef = doc(db, "users", followerEmail);
      await updateDoc(followerRef, {
        followers: arrayRemove(user.email)
      });

      const displayName = followersProfiles[followerEmail]?.displayName || followingProfiles[followerEmail]?.displayName || followerEmail;
      toast.success(`Unfollowed ${displayName}`);
      // Refresh profile and status
      await fetchUserProfile();
      await checkFollowStatus();
    } catch (error) {
      console.error("Error unfollowing user:", error);
      toast.error("Failed to unfollow user");
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'Unknown date';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  };

  const getLocationName = (trip) => {
    return (
      trip.userSelection?.location ||
      trip.userSelection?.place?.label ||
      'Unknown Destination'
    );
  };

  // Render loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-500 border-t-transparent"></div>
      </div>
    );
  }

  // Render not found state
  if (!profile) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold text-gray-800">User not found</h1>
        <p className="text-gray-600 mt-2">
          The user you're looking for doesn't exist or has been deleted.
        </p>
        <Link
          to="/explore"
          className="mt-6 inline-block bg-emerald-600 text-white px-4 py-2 rounded-lg"
        >
          Back to Explore
        </Link>
      </div>
    );
  }

  // Render main UI
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile-first responsive container */}
      <div className="max-w-6xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6">
        
        {/* Modern Profile Header */}
        <div className="bg-white shadow-sm border border-gray-200 overflow-hidden mb-6 sm:mb-8">
          {/* Cover Image with latest trip background */}
          <div 
            className="relative h-40 sm:h-48 lg:h-56"
            style={{
              background: latestTripImage 
                ? `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.6)), url(${latestTripImage}) center/cover no-repeat`
                : 'linear-gradient(135deg, #059669, #047857)'
            }}
          >
            <div className="absolute inset-0 bg-black/5"></div>
            {latestTripImage && (
              <div className="absolute bottom-3 right-3 px-3 py-1.5 bg-white/20 backdrop-blur-sm text-white text-xs sm:text-sm font-medium rounded-full border border-white/30">
                Latest Adventure
              </div>
            )}
            
            {/* Gradient overlay for better text contrast */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/20"></div>
          </div>

          <div className="px-4 sm:px-6 lg:px-8 pb-6 sm:pb-8 relative">
            {/* Profile Picture - Responsive positioning */}
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between relative -mt-12 sm:-mt-16">
              <div className="flex flex-col sm:flex-row sm:items-end gap-4 sm:gap-6">
                <div className="relative">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 lg:w-28 lg:h-28 border-4 border-white overflow-hidden bg-gray-100 shadow-lg">
                    {profile.photoURL ? (
                      <img
                        src={profile.photoURL}
                        alt={profile.displayName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-emerald-500 text-white text-xl sm:text-2xl font-bold">
                        {profile.displayName?.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  {/* Online/Active indicator */}
                  <div className="absolute bottom-1 right-1 w-4 h-4 sm:w-5 sm:h-5 bg-green-500 border-2 border-white"></div>
                </div>

                {/* User Info */}
                <div className="flex-1 min-w-0 pt-2 sm:pt-0">
                  <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 truncate">
                    {profile.displayName}
                  </h1>
                  <div className="flex items-center text-gray-600 mt-1 text-sm sm:text-base">
                    <FaEnvelope className="mr-2 text-emerald-500 flex-shrink-0" size={14} />
                    <span className="truncate">{userId}</span>
                  </div>
                  {profile.bio && (
                    <p className="mt-2 sm:mt-3 text-gray-700 text-sm sm:text-base line-clamp-2">
                      {profile.bio}
                    </p>
                  )}
                </div>
              </div>

              {/* Action Buttons - Responsive layout */}
              {user && userId !== user.email && (
                <div className="flex gap-2 sm:gap-3 mt-4 sm:mt-0 sm:ml-4">
                  <SocialInteractions
                    tripId={null}
                    creatorEmail={userId}
                    isFollowing={isFollowing.status === 'following'}
                    followRequestStatus={isFollowing.status}
                    onUpdate={() => {
                      fetchUserProfile();
                      checkFollowStatus();
                    }}
                  />
                  
                  <button className="p-2 sm:p-2.5 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                    <FaEnvelope className="text-gray-600" size={16} />
                  </button>
                </div>
              )}
              
              {/* Edit button for own profile */}
              {user && userId === user.email && (
                <button className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors text-sm font-medium mt-4 sm:mt-0">
                  <FaEdit size={14} />
                  <span className="hidden sm:inline">Edit Profile</span>
                </button>
              )}
            </div>

            {/* Stats Cards - Responsive grid */}
            <div className="grid grid-cols-3 gap-3 sm:gap-4 lg:gap-6 mt-6 sm:mt-8">
              <div className="bg-blue-50 border border-blue-200 p-3 sm:p-4 text-center">
                <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-blue-700">
                  {stats.tripCount}
                </div>
                <div className="text-xs sm:text-sm text-blue-600 font-medium mt-1">
                  Trips
                </div>
              </div>
              
              <div className="bg-emerald-50 border border-emerald-200 p-3 sm:p-4 text-center">
                <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-emerald-700">
                  {stats.followers}
                </div>
                <div className="text-xs sm:text-sm text-emerald-600 font-medium mt-1">
                  Followers
                </div>
              </div>
              
              <div className="bg-gray-50 border border-gray-200 p-3 sm:p-4 text-center">
                <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-700">
                  {stats.following}
                </div>
                <div className="text-xs sm:text-sm text-gray-600 font-medium mt-1">
                  Following
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modern Tabs Navigation */}
        <div className="bg-white shadow-sm border border-gray-200 mb-6 sm:mb-8 overflow-hidden">
          <div className="flex overflow-x-auto">
            <button
              className={`flex items-center gap-2 px-4 sm:px-6 py-3 sm:py-4 font-medium whitespace-nowrap transition-all ${
                activeTab === 'trips'
                  ? 'bg-emerald-50 text-emerald-700 border-b-2 border-emerald-500'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
              }`}
              onClick={() => setActiveTab('trips')}
            >
              <FaGlobe size={16} />
              <span>Trips</span>
              <span className="bg-gray-200 text-gray-700 text-xs px-2 py-1 ml-1">
                {stats.tripCount}
              </span>
            </button>
            
            <button
              className={`flex items-center gap-2 px-4 sm:px-6 py-3 sm:py-4 font-medium whitespace-nowrap transition-all ${
                activeTab === 'followers'
                  ? 'bg-emerald-50 text-emerald-700 border-b-2 border-emerald-500'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
              }`}
              onClick={() => setActiveTab('followers')}
            >
              <FaUsers size={16} />
              <span>Followers</span>
              <span className="bg-gray-200 text-gray-700 text-xs px-2 py-1 ml-1">
                {stats.followers}
              </span>
            </button>
            
            <button
              className={`flex items-center gap-2 px-4 sm:px-6 py-3 sm:py-4 font-medium whitespace-nowrap transition-all ${
                activeTab === 'following'
                  ? 'bg-emerald-50 text-emerald-700 border-b-2 border-emerald-500'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
              }`}
              onClick={() => setActiveTab('following')}
            >
              <FaUserPlus size={16} />
              <span>Following</span>
              <span className="bg-gray-200 text-gray-700 text-xs px-2 py-1 ml-1">
                {stats.following}
              </span>
            </button>
            
            {activeTab === 'followerTrips' && selectedFollower && (
              <button className="flex items-center gap-2 px-4 sm:px-6 py-3 sm:py-4 font-medium whitespace-nowrap bg-emerald-50 text-emerald-700 border-b-2 border-emerald-500">
                <FaArrowLeft size={14} />
                <span className="truncate max-w-32 sm:max-w-none">
                  {followersProfiles[selectedFollower]?.displayName || selectedFollower.split('@')[0]}'s Trips
                </span>
              </button>
            )}
          </div>
        </div>

        {/* Modern Trips Tab Content */}
        {activeTab === 'trips' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                Travel Adventures
              </h2>
              <div className="text-sm text-gray-500">
                {stats.tripCount} {stats.tripCount === 1 ? 'trip' : 'trips'}
              </div>
            </div>

            {loadingTrips ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-4 border-emerald-500 border-t-transparent"></div>
              </div>
            ) : trips.length === 0 ? (
              <div className="bg-white border border-gray-200 p-8 sm:p-12 text-center shadow-sm">
                <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-4 sm:mb-6 bg-emerald-100 border border-emerald-200 flex items-center justify-center">
                  <FaGlobe className="text-emerald-500 text-2xl sm:text-3xl" />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-2">
                  No adventures shared yet
                </h3>
                <p className="text-gray-600 text-sm sm:text-base max-w-md mx-auto">
                  {userId === user?.email 
                    ? "Start planning your first trip and share your adventures with the community!"
                    : "This traveler hasn't shared any public trips yet. Check back later for amazing adventures!"}
                </p>
                {userId === user?.email && (
                  <Link 
                    to="/create-trip"
                    className="inline-flex items-center gap-2 mt-6 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white border border-emerald-600 font-medium transition-colors"
                  >
                    <FaGlobe size={16} />
                    Plan Your First Trip
                  </Link>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {trips.map((trip) => (
                  <motion.div
                    key={trip.id}
                    className="group bg-white border border-gray-200 overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    whileHover={{ y: -4 }}
                  >
                    <Link to={`/show-trip/${trip.id}`}>
                      <div className="relative aspect-[4/3] bg-gray-100 overflow-hidden">
                        {/* Loading indicator for images */}
                        {loadingImages[trip.id] && (
                          <div className="absolute inset-0 flex items-center justify-center bg-gray-100/80 z-10">
                            <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                          </div>
                        )}
                        
                        <img 
                          src={getTripImage(trip)} 
                          alt={getLocationName(trip)}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?ixlib=rb-4.0.3&auto=format&fit=crop&w=1121&q=80";
                          }}
                        />
                        
                        {/* Gradient overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none"></div>
                        
                        {/* Duration badge */}
                        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold text-emerald-700">
                          {trip.userSelection?.duration || '?'}d
                        </div>
                        
                        {/* Like count */}
                        <div className="absolute bottom-3 right-3 flex items-center gap-1 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full text-xs font-medium">
                          <FaHeart className="text-red-500" size={12} />
                          <span className="text-gray-700">{trip.likesCount || 0}</span>
                        </div>
                      </div>

                      <div className="p-4 sm:p-5">
                        <h3 className="font-bold text-base sm:text-lg text-gray-900 mb-2 line-clamp-1 group-hover:text-emerald-700 transition-colors">
                          {getLocationName(trip)}
                        </h3>

                        <div className="space-y-2 mb-3">
                          <div className="flex items-center text-xs sm:text-sm text-gray-600">
                            <FaMapMarkerAlt className="mr-2 text-emerald-500 flex-shrink-0" size={12} />
                            <span className="truncate">{trip.userSelection?.country || 'Adventure'}</span>
                          </div>
                          
                          <div className="flex items-center text-xs sm:text-sm text-gray-600">
                            <FaCalendarAlt className="mr-2 text-emerald-500 flex-shrink-0" size={12} />
                            <span>{formatDate(trip.createdAt)}</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex flex-wrap gap-1 sm:gap-2">
                            <span className="bg-emerald-50 text-emerald-700 text-xs px-2 py-1 rounded-md font-medium">
                              {trip.userSelection?.travelType || 'Adventure'}
                            </span>
                            {trip.userSelection?.budgetType && (
                              <span className="bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded-md font-medium">
                                {trip.userSelection?.budgetType}
                              </span>
                            )}
                          </div>

                          <FaChevronRight className="text-gray-400 group-hover:text-emerald-600 transition-colors" size={14} />
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        )}

      {/* Follower Trips Tab Content */}
      {activeTab === 'followerTrips' && selectedFollower && (
        <>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800">
              Trips by {followersProfiles[selectedFollower]?.displayName || selectedFollower.split('@')[0]}
            </h2>
            <button 
              onClick={() => setActiveTab('followers')}
              className="text-sm text-emerald-600 flex items-center gap-1"
            >
              <span>Back to Followers</span>
            </button>
          </div>

          {loadingFollowerTrips ? (
            <div className="flex justify-center items-center h-48">
              <div className="animate-spin rounded-full h-8 w-8 border-4 border-emerald-500 border-t-transparent"></div>
            </div>
          ) : followerTrips.length === 0 ? (
            <div className="bg-gray-50 rounded-xl p-12 text-center">
              <div className="text-gray-400 text-6xl mb-4">🌍</div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                No public trips yet
              </h3>
              <p className="text-gray-500">
                This user hasn't shared any trips yet.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {followerTrips.map((trip) => (
                <motion.div
                  key={trip.id}
                  className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Link to={`/show-trip/${trip.id}`}>
                    <div className="h-48 bg-gray-200 relative">
                      {trip.coverImage ||
                      trip.tripData?.hotelsList?.[0]?.hotelImageUrl ? (
                        <img
                          src={
                            trip.coverImage ||
                            trip.tripData?.hotelsList?.[0]?.hotelImageUrl
                          }
                          alt={getLocationName(trip)}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-r from-emerald-400 to-blue-400 text-white">
                          <span className="text-2xl font-bold">
                            {getLocationName(trip).split(' ')[0]}
                          </span>
                        </div>
                      )}

                      <div className="absolute top-3 right-3 bg-white bg-opacity-90 px-3 py-1 rounded-full text-sm font-medium text-emerald-700">
                        {trip.userSelection?.duration || '?'}{' '}
                        {trip.userSelection?.duration === 1 ? 'Day' : 'Days'}
                      </div>
                    </div>

                    <div className="p-4">
                      <h3 className="font-bold text-lg text-gray-800 mb-1 truncate">
                        {getLocationName(trip)}
                      </h3>

                      <div className="flex items-center text-sm text-gray-600 mb-3">
                        <FaMapMarkerAlt
                          className="mr-1 text-emerald-500"
                          size={14}
                        />
                        <span>{trip.userSelection?.country || 'Travel Plan'}</span>
                        <span className="mx-2">•</span>
                        <FaCalendarAlt
                          className="mr-1 text-emerald-500"
                          size={14}
                        />
                        <span>{formatDate(trip.createdAt)}</span>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="bg-emerald-100 text-emerald-800 text-xs px-2 py-1 rounded">
                            {trip.userSelection?.travelType || 'Adventure'}
                          </span>
                          {trip.userSelection?.budgetType && (
                            <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                              {trip.userSelection?.budgetType}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center text-gray-500">
                          <span className="mr-1">{trip.likesCount || 0}</span>
                          <FaUser size={12} />
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </>
      )}

        {/* Modern Followers Tab Content */}
        {activeTab === 'followers' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                Followers
              </h2>
              <div className="text-sm text-gray-500">
                {stats.followers} {stats.followers === 1 ? 'follower' : 'followers'}
              </div>
            </div>

            {loadingFollowers ? (
              <div className="flex justify-center items-center h-48">
                <div className="animate-spin rounded-full h-8 w-8 border-4 border-emerald-500 border-t-transparent"></div>
              </div>
            ) : followers.length === 0 ? (
              <div className="bg-white rounded-xl sm:rounded-2xl p-8 sm:p-12 text-center shadow-sm border border-gray-100">
                <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-4 sm:mb-6 bg-gray-100 border border-gray-200 flex items-center justify-center">
                  <FaUsers className="text-purple-500 text-2xl sm:text-3xl" />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-2">
                  No followers yet
                </h3>
                <p className="text-gray-600 text-sm sm:text-base max-w-md mx-auto">
                  {userId === user?.email 
                    ? "Share amazing trips to attract fellow travel enthusiasts!"
                    : "This traveler is just getting started on their journey."}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {followers.map((email) => {
                  const followerProfile = followersProfiles[email] || { 
                    displayName: email.split('@')[0],
                    photoURL: null,
                    email: email
                  };
                  
                  return (
                    <motion.div
                      key={email}
                      className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      whileHover={{ y: -2 }}
                    >
                      <div className="flex items-center gap-4 mb-4">
                        <div className="relative">
                          <div className="w-12 h-12 sm:w-14 sm:h-14 border-2 border-white shadow-lg overflow-hidden bg-emerald-500">
                            {followerProfile.photoURL ? (
                              <img 
                                src={followerProfile.photoURL} 
                                alt={followerProfile.displayName} 
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-white font-bold text-lg">
                                {followerProfile.displayName.charAt(0).toUpperCase()}
                              </div>
                            )}
                          </div>
                          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 text-sm sm:text-base truncate">
                            {followerProfile.displayName}
                          </h3>
                          <p className="text-xs sm:text-sm text-gray-500 truncate">{followerProfile.email}</p>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <button 
                          onClick={() => viewFollowerTrips(followerProfile.email)}
                          className="flex-1 px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg transition-colors text-sm font-medium"
                        >
                          View Trips
                        </button>
                        
                        <Link 
                          to={`/user/${followerProfile.email}`}
                          className="px-3 py-2 border border-gray-200 hover:border-gray-300 text-gray-700 rounded-lg transition-colors text-sm font-medium"
                        >
                          Profile
                        </Link>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Modern Following Tab Content */}
        {activeTab === 'following' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                Following
              </h2>
              <div className="text-sm text-gray-500">
                {stats.following} {stats.following === 1 ? 'person' : 'people'}
              </div>
            </div>

            {loadingFollowing ? (
              <div className="flex justify-center items-center h-48">
                <div className="animate-spin rounded-full h-8 w-8 border-4 border-emerald-500 border-t-transparent"></div>
              </div>
            ) : following.length === 0 ? (
              <div className="bg-white rounded-xl sm:rounded-2xl p-8 sm:p-12 text-center shadow-sm border border-gray-100">
                <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-4 sm:mb-6 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center">
                  <FaUserPlus className="text-blue-500 text-2xl sm:text-3xl" />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-2">
                  Not following anyone yet
                </h3>
                <p className="text-gray-600 text-sm sm:text-base max-w-md mx-auto">
                  {userId === user?.email 
                    ? "Discover amazing travelers and start following them to see their adventures!"
                    : "This traveler hasn't started following others yet."}
                </p>
                {userId === user?.email && (
                  <Link 
                    to="/explore"
                    className="inline-flex items-center gap-2 mt-6 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors"
                  >
                    <FaUsers size={16} />
                    Discover Travelers
                  </Link>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {following.map((followingEmail) => {
                  const followingProfile = followingProfiles[followingEmail] || {
                    displayName: followingEmail.split('@')[0],
                    email: followingEmail,
                    photoURL: null
                  };
                  
                  const isOwnProfile = user && user.email && userId && userId === user.email;
                  
                  return (
                    <motion.div
                      key={followingEmail}
                      className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      whileHover={{ y: -2 }}
                    >
                      <div className="flex items-center gap-4 mb-4">
                        <div className="relative">
                          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full overflow-hidden bg-gradient-to-br from-purple-400 to-pink-500 border-2 border-white shadow-lg">
                            {followingProfile.photoURL ? (
                              <img
                                src={followingProfile.photoURL}
                                alt={followingProfile.displayName}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-white font-bold text-lg">
                                {followingProfile.displayName.charAt(0).toUpperCase()}
                              </div>
                            )}
                          </div>
                          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 text-sm sm:text-base truncate">
                            {followingProfile.displayName}
                          </h3>
                          <p className="text-xs sm:text-sm text-gray-500 truncate">{followingProfile.email}</p>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <button 
                          onClick={() => viewFollowerTrips(followingProfile.email)}
                          className="flex-1 px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg transition-colors text-sm font-medium"
                        >
                          View Trips
                        </button>
                        
                        <Link 
                          to={`/user/${followingProfile.email}`}
                          className="px-3 py-2 border border-gray-200 hover:border-gray-300 text-gray-700 rounded-lg transition-colors text-sm font-medium"
                        >
                          Profile
                        </Link>
                        
                        {isOwnProfile && (
                          <button
                            onClick={() => handleUnfollow(followingProfile.email)}
                            className="px-3 py-2 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg transition-colors text-sm font-medium"
                          >
                            <FaTimesCircle size={14} />
                          </button>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Follower Trips Tab Content - Simplified for space */}
        {activeTab === 'followerTrips' && selectedFollower && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                  {followersProfiles[selectedFollower]?.displayName || selectedFollower.split('@')[0]}'s Adventures
                </h2>
                <button 
                  onClick={() => setActiveTab('followers')}
                  className="text-emerald-600 hover:text-emerald-700 text-sm flex items-center gap-1 mt-1"
                >
                  <FaArrowLeft size={12} />
                  Back to Followers
                </button>
              </div>
            </div>

            {loadingFollowerTrips ? (
              <div className="flex justify-center items-center h-48">
                <div className="animate-spin rounded-full h-8 w-8 border-4 border-emerald-500 border-t-transparent"></div>
              </div>
            ) : followerTrips.length === 0 ? (
              <div className="bg-white rounded-xl sm:rounded-2xl p-8 sm:p-12 text-center shadow-sm border border-gray-100">
                <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-4 sm:mb-6 bg-gradient-to-br from-emerald-100 to-blue-100 rounded-full flex items-center justify-center">
                  <FaGlobe className="text-emerald-500 text-2xl sm:text-3xl" />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-2">
                  No public trips yet
                </h3>
                <p className="text-gray-600 text-sm sm:text-base">
                  This traveler hasn't shared any adventures yet.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {followerTrips.map((trip) => (
                  <motion.div
                    key={trip.id}
                    className="group bg-white rounded-xl sm:rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    whileHover={{ y: -4 }}
                  >
                    <Link to={`/show-trip/${trip.id}`}>
                      <div className="relative aspect-[4/3] bg-gray-100 overflow-hidden">
                        {/* Loading indicator for images */}
                        {loadingImages[trip.id] && (
                          <div className="absolute inset-0 flex items-center justify-center bg-gray-100/80 z-10">
                            <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                          </div>
                        )}
                        
                        <img 
                          src={getTripImage(trip)} 
                          alt={getLocationName(trip)}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?ixlib=rb-4.0.3&auto=format&fit=crop&w=1121&q=80";
                          }}
                        />
                        
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent"></div>
                        
                        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold text-emerald-700">
                          {trip.userSelection?.duration || '?'}d
                        </div>
                        
                        <div className="absolute bottom-3 right-3 flex items-center gap-1 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full text-xs font-medium">
                          <FaHeart className="text-red-500" size={12} />
                          <span className="text-gray-700">{trip.likesCount || 0}</span>
                        </div>
                      </div>

                      <div className="p-4 sm:p-5">
                        <h3 className="font-bold text-base sm:text-lg text-gray-900 mb-2 line-clamp-1 group-hover:text-emerald-700 transition-colors">
                          {getLocationName(trip)}
                        </h3>

                        <div className="space-y-2 mb-3">
                          <div className="flex items-center text-xs sm:text-sm text-gray-600">
                            <FaMapMarkerAlt className="mr-2 text-emerald-500 flex-shrink-0" size={12} />
                            <span className="truncate">{trip.userSelection?.country || 'Adventure'}</span>
                          </div>
                          
                          <div className="flex items-center text-xs sm:text-sm text-gray-600">
                            <FaCalendarAlt className="mr-2 text-emerald-500 flex-shrink-0" size={12} />
                            <span>{formatDate(trip.createdAt)}</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex flex-wrap gap-1 sm:gap-2">
                            <span className="bg-emerald-50 text-emerald-700 text-xs px-2 py-1 rounded-md font-medium">
                              {trip.userSelection?.travelType || 'Adventure'}
                            </span>
                          </div>
                          <FaChevronRight className="text-gray-400 group-hover:text-emerald-600 transition-colors" size={14} />
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default UserProfile;
