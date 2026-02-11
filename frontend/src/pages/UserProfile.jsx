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
  FaHeart,
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
      <div className="flex flex-col justify-center items-center h-96 gap-4">
        <div className="w-[1px] h-10 bg-emerald-600 animate-pulse"></div>
        <span className="text-[11px] uppercase tracking-[0.25em] text-gray-400 font-medium">Loading profile</span>
      </div>
    );
  }

  // Render not found state
  if (!profile) {
    return (
      <div className="text-center py-16">
        <h1 className="font-serif text-2xl text-[#1a1a2e] mb-2">User not found</h1>
        <div className="w-10 h-[2px] bg-emerald-600 mx-auto mb-4"></div>
        <p className="text-gray-500 text-sm tracking-wide mb-6">
          The user you're looking for doesn't exist or has been deleted.
        </p>
        <Link
          to="/explore"
          className="inline-block bg-[#1a1a2e] hover:bg-[#2a2a4e] text-white text-[11px] uppercase tracking-[0.2em] font-medium px-6 py-3 transition-colors"
        >
          BACK TO EXPLORE
        </Link>
      </div>
    );
  }

  // Render main UI
  return (
    <div className="min-h-screen bg-white">
      {/* Dark banner profile header */}
      <div 
        className="relative"
        style={{
          background: latestTripImage 
            ? `linear-gradient(rgba(26, 26, 46, 0.75), rgba(26, 26, 46, 0.9)), url(${latestTripImage}) center/cover no-repeat`
            : '#1a1a2e'
        }}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
          <div className="flex flex-col sm:flex-row sm:items-end gap-6">
            {/* Profile Picture */}
            <div className="w-20 h-20 sm:w-24 sm:h-24 border-2 border-white/30 overflow-hidden bg-gray-700">
              {profile.photoURL ? (
                <img src={profile.photoURL} alt={profile.displayName} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-emerald-600 text-white text-2xl font-serif">
                  {profile.displayName?.charAt(0).toUpperCase()}
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <span className="text-[11px] uppercase tracking-[0.25em] text-white/40 font-medium">Traveler Profile</span>
              <h1 className="font-serif text-2xl sm:text-3xl text-white mt-1 truncate">{profile.displayName}</h1>
              <div className="flex items-center gap-2 text-white/50 text-sm mt-1">
                <FaEnvelope size={12} />
                <span className="truncate">{userId}</span>
              </div>
              {profile.bio && (
                <p className="mt-3 text-white/60 text-sm line-clamp-2">{profile.bio}</p>
              )}
              <div className="w-12 h-[2px] bg-emerald-600 mt-4"></div>
            </div>

            {/* Action Buttons */}
            {user && userId !== user.email && (
              <div className="flex gap-2">
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
                <button className="p-2.5 border border-white/20 text-white/60 hover:text-white hover:border-white/40 transition-colors">
                  <FaEnvelope size={14} />
                </button>
              </div>
            )}
            
            {user && userId === user.email && (
              <button className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] uppercase tracking-[0.15em] font-medium transition-colors">
                <FaEdit size={12} />
                <span>Edit</span>
              </button>
            )}
          </div>

          {/* Stats row */}
          <div className="flex items-center gap-8 mt-8 border-t border-white/10 pt-6">
            <div className="text-center">
              <div className="text-xl sm:text-2xl font-serif text-white">{stats.tripCount}</div>
              <div className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-medium mt-1">Trips</div>
            </div>
            <div className="text-center">
              <div className="text-xl sm:text-2xl font-serif text-white">{stats.followers}</div>
              <div className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-medium mt-1">Followers</div>
            </div>
            <div className="text-center">
              <div className="text-xl sm:text-2xl font-serif text-white">{stats.following}</div>
              <div className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-medium mt-1">Following</div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* LP-style tabs */}
        <div className="border-b border-gray-200 flex overflow-x-auto">
          <button
            className={`flex items-center gap-2 px-5 py-4 text-[12px] uppercase tracking-[0.2em] font-medium whitespace-nowrap transition-all border-b-2 ${
              activeTab === 'trips'
                ? 'text-[#1a1a2e] border-emerald-600'
                : 'text-gray-400 border-transparent hover:text-gray-600'
            }`}
            onClick={() => setActiveTab('trips')}
          >
            <FaGlobe size={12} />
            <span>Trips</span>
          </button>
          
          <button
            className={`flex items-center gap-2 px-5 py-4 text-[12px] uppercase tracking-[0.2em] font-medium whitespace-nowrap transition-all border-b-2 ${
              activeTab === 'followers'
                ? 'text-[#1a1a2e] border-emerald-600'
                : 'text-gray-400 border-transparent hover:text-gray-600'
            }`}
            onClick={() => setActiveTab('followers')}
          >
            <FaUsers size={12} />
            <span>Followers</span>
          </button>
          
          <button
            className={`flex items-center gap-2 px-5 py-4 text-[12px] uppercase tracking-[0.2em] font-medium whitespace-nowrap transition-all border-b-2 ${
              activeTab === 'following'
                ? 'text-[#1a1a2e] border-emerald-600'
                : 'text-gray-400 border-transparent hover:text-gray-600'
            }`}
            onClick={() => setActiveTab('following')}
          >
            <FaUserPlus size={12} />
            <span>Following</span>
          </button>
          
          {activeTab === 'followerTrips' && selectedFollower && (
            <button className="flex items-center gap-2 px-5 py-4 text-[12px] uppercase tracking-[0.2em] font-medium whitespace-nowrap text-[#1a1a2e] border-b-2 border-emerald-600">
              <FaArrowLeft size={10} />
              <span className="truncate max-w-32 sm:max-w-none">
                {followersProfiles[selectedFollower]?.displayName || selectedFollower.split('@')[0]}'s Trips
              </span>
            </button>
          )}
        </div>

        <div className="py-8 sm:py-10">

        {/* Trips Tab Content */}
        {activeTab === 'trips' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase tracking-[0.2em] text-gray-400 font-medium">Adventures</span>
                <h2 className="font-serif text-xl sm:text-2xl text-[#1a1a2e]">
                  Travel Collection
                </h2>
              </div>
              <div className="text-[11px] uppercase tracking-[0.15em] text-gray-400 font-medium">
                {stats.tripCount} {stats.tripCount === 1 ? 'trip' : 'trips'}
              </div>
            </div>

            {loadingTrips ? (
              <div className="flex flex-col items-center justify-center h-64 gap-4">
                <div className="w-[1px] h-8 bg-emerald-600 animate-pulse"></div>
                <span className="text-[11px] uppercase tracking-[0.25em] text-gray-400 font-medium">Loading trips</span>
              </div>
            ) : trips.length === 0 ? (
              <div className="bg-[#f5f0eb] p-12 sm:p-16 text-center">
                <FaGlobe className="mx-auto text-[#1a1a2e]/20 text-3xl mb-4" />
                <h3 className="font-serif text-xl text-[#1a1a2e] mb-2">No adventures shared yet</h3>
                <div className="w-10 h-[2px] bg-emerald-600 mx-auto mb-4"></div>
                <p className="text-gray-500 text-sm tracking-wide max-w-md mx-auto">
                  {userId === user?.email 
                    ? "Start planning your first trip and share your adventures."
                    : "This traveler hasn't shared any public trips yet."}
                </p>
                {userId === user?.email && (
                  <Link 
                    to="/create-trip"
                    className="inline-flex items-center gap-2 mt-6 bg-[#1a1a2e] hover:bg-[#2a2a4e] text-white text-[11px] uppercase tracking-[0.2em] font-medium px-6 py-3 transition-colors"
                  >
                    <FaGlobe size={11} />
                    PLAN YOUR FIRST TRIP
                  </Link>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
                {trips.map((trip) => (
                  <motion.div
                    key={trip.id}
                    className="group bg-white border border-gray-200 overflow-hidden"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Link to={`/show-trip/${trip.id}`}>
                      <div className="relative aspect-[4/3] bg-gray-100 overflow-hidden">
                        {loadingImages[trip.id] && (
                          <div className="absolute inset-0 flex items-center justify-center bg-gray-100/80 z-10">
                            <div className="w-[1px] h-6 bg-emerald-600 animate-pulse"></div>
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
                        
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
                        
                        <div className="absolute top-3 right-3 bg-[#1a1a2e]/80 backdrop-blur-sm text-white text-[10px] uppercase tracking-[0.15em] font-medium px-2.5 py-1">
                          {trip.userSelection?.duration || '?'} Days
                        </div>
                        
                        <div className="absolute bottom-3 left-3 flex items-center gap-1 text-white/90 text-xs">
                          <FaHeart size={10} />
                          <span>{trip.likesCount || 0}</span>
                        </div>
                      </div>

                      <div className="p-4 sm:p-5">
                        <span className="text-[10px] uppercase tracking-[0.2em] text-emerald-600 font-medium">
                          {trip.userSelection?.travelType || 'Adventure'}
                        </span>
                        <h3 className="font-serif text-lg text-[#1a1a2e] mt-1 mb-2 line-clamp-1 group-hover:text-emerald-700 transition-colors">
                          {getLocationName(trip)}
                        </h3>

                        <div className="border-t border-gray-100 pt-3 flex items-center justify-between">
                          <span className="text-[10px] uppercase tracking-[0.15em] text-gray-400">{formatDate(trip.createdAt)}</span>
                          <FaChevronRight className="text-gray-300 group-hover:text-emerald-600 transition-colors" size={12} />
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

        {/* Followers Tab Content */}
        {activeTab === 'followers' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase tracking-[0.2em] text-gray-400 font-medium">Community</span>
                <h2 className="font-serif text-xl sm:text-2xl text-[#1a1a2e]">Followers</h2>
              </div>
              <div className="text-[11px] uppercase tracking-[0.15em] text-gray-400 font-medium">
                {stats.followers} {stats.followers === 1 ? 'follower' : 'followers'}
              </div>
            </div>

            {loadingFollowers ? (
              <div className="flex flex-col items-center justify-center h-48 gap-4">
                <div className="w-[1px] h-8 bg-emerald-600 animate-pulse"></div>
                <span className="text-[11px] uppercase tracking-[0.25em] text-gray-400 font-medium">Loading</span>
              </div>
            ) : followers.length === 0 ? (
              <div className="bg-[#f5f0eb] p-12 text-center">
                <FaUsers className="mx-auto text-[#1a1a2e]/20 text-3xl mb-4" />
                <h3 className="font-serif text-xl text-[#1a1a2e] mb-2">No followers yet</h3>
                <div className="w-10 h-[2px] bg-emerald-600 mx-auto mb-4"></div>
                <p className="text-gray-500 text-sm tracking-wide max-w-md mx-auto">
                  {userId === user?.email 
                    ? "Share amazing trips to attract fellow travel enthusiasts."
                    : "This traveler is just getting started on their journey."}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                {followers.map((email) => {
                  const followerProfile = followersProfiles[email] || { 
                    displayName: email.split('@')[0],
                    photoURL: null,
                    email: email
                  };
                  
                  return (
                    <div
                      key={email}
                      className="bg-white border border-gray-200 p-5"
                    >
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-11 h-11 overflow-hidden bg-emerald-600">
                          {followerProfile.photoURL ? (
                            <img src={followerProfile.photoURL} alt={followerProfile.displayName} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-white font-serif text-lg">
                              {followerProfile.displayName.charAt(0).toUpperCase()}
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-[#1a1a2e] text-sm truncate">{followerProfile.displayName}</h3>
                          <p className="text-[11px] uppercase tracking-[0.1em] text-gray-400 truncate">{followerProfile.email}</p>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <button 
                          onClick={() => viewFollowerTrips(followerProfile.email)}
                          className="flex-1 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] uppercase tracking-[0.15em] font-medium transition-colors"
                        >
                          Trips
                        </button>
                        <Link 
                          to={`/user/${followerProfile.email}`}
                          className="px-3 py-2 border border-gray-200 hover:bg-gray-50 text-gray-600 text-[11px] uppercase tracking-[0.15em] font-medium transition-colors"
                        >
                          Profile
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Following Tab Content */}
        {activeTab === 'following' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase tracking-[0.2em] text-gray-400 font-medium">Community</span>
                <h2 className="font-serif text-xl sm:text-2xl text-[#1a1a2e]">Following</h2>
              </div>
              <div className="text-[11px] uppercase tracking-[0.15em] text-gray-400 font-medium">
                {stats.following} {stats.following === 1 ? 'person' : 'people'}
              </div>
            </div>

            {loadingFollowing ? (
              <div className="flex flex-col items-center justify-center h-48 gap-4">
                <div className="w-[1px] h-8 bg-emerald-600 animate-pulse"></div>
                <span className="text-[11px] uppercase tracking-[0.25em] text-gray-400 font-medium">Loading</span>
              </div>
            ) : following.length === 0 ? (
              <div className="bg-[#f5f0eb] p-12 text-center">
                <FaUserPlus className="mx-auto text-[#1a1a2e]/20 text-3xl mb-4" />
                <h3 className="font-serif text-xl text-[#1a1a2e] mb-2">Not following anyone yet</h3>
                <div className="w-10 h-[2px] bg-emerald-600 mx-auto mb-4"></div>
                <p className="text-gray-500 text-sm tracking-wide max-w-md mx-auto">
                  {userId === user?.email 
                    ? "Discover amazing travelers and start following them."
                    : "This traveler hasn't started following others yet."}
                </p>
                {userId === user?.email && (
                  <Link 
                    to="/explore"
                    className="inline-flex items-center gap-2 mt-6 bg-[#1a1a2e] hover:bg-[#2a2a4e] text-white text-[11px] uppercase tracking-[0.2em] font-medium px-6 py-3 transition-colors"
                  >
                    <FaUsers size={11} />
                    DISCOVER TRAVELERS
                  </Link>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                {following.map((followingEmail) => {
                  const followingProfile = followingProfiles[followingEmail] || {
                    displayName: followingEmail.split('@')[0],
                    email: followingEmail,
                    photoURL: null
                  };
                  
                  const isOwnProfile = user && user.email && userId && userId === user.email;
                  
                  return (
                    <div
                      key={followingEmail}
                      className="bg-white border border-gray-200 p-5"
                    >
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-11 h-11 overflow-hidden bg-[#1a1a2e]">
                          {followingProfile.photoURL ? (
                            <img src={followingProfile.photoURL} alt={followingProfile.displayName} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-white font-serif text-lg">
                              {followingProfile.displayName.charAt(0).toUpperCase()}
                            </div>
                          )}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-[#1a1a2e] text-sm truncate">{followingProfile.displayName}</h3>
                          <p className="text-[11px] uppercase tracking-[0.1em] text-gray-400 truncate">{followingProfile.email}</p>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <button 
                          onClick={() => viewFollowerTrips(followingProfile.email)}
                          className="flex-1 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] uppercase tracking-[0.15em] font-medium transition-colors"
                        >
                          Trips
                        </button>
                        
                        <Link 
                          to={`/user/${followingProfile.email}`}
                          className="px-3 py-2 border border-gray-200 hover:bg-gray-50 text-gray-600 text-[11px] uppercase tracking-[0.15em] font-medium transition-colors"
                        >
                          Profile
                        </Link>
                        
                        {isOwnProfile && (
                          <button
                            onClick={() => handleUnfollow(followingProfile.email)}
                            className="px-3 py-2 border border-red-200 hover:bg-red-50 text-red-500 transition-colors"
                          >
                            <FaTimesCircle size={13} />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Follower Trips Tab Content - Simplified for space */}
        {activeTab === 'followerTrips' && selectedFollower && (
          <div className="space-y-6">
            <div>
              <button 
                onClick={() => setActiveTab('followers')}
                className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.15em] font-medium text-emerald-600 hover:text-emerald-700 mb-4 transition-colors"
              >
                <FaArrowLeft size={10} />
                Back to Followers
              </button>
              <p className="text-[11px] uppercase tracking-[0.2em] text-emerald-600 font-medium mb-2">Traveler</p>
              <h2 className="font-serif text-2xl sm:text-3xl text-[#1a1a2e]">
                {followersProfiles[selectedFollower]?.displayName || selectedFollower.split('@')[0]}'s Adventures
              </h2>
              <div className="w-12 h-[2px] bg-emerald-600 mt-3"></div>
            </div>

            {loadingFollowerTrips ? (
              <div className="flex flex-col items-center justify-center py-20">
                <div className="w-[1px] h-10 bg-emerald-600 animate-pulse mb-4"></div>
                <p className="text-[11px] uppercase tracking-[0.2em] text-gray-400 font-medium">Loading trips</p>
              </div>
            ) : followerTrips.length === 0 ? (
              <div className="bg-[#f5f0eb] p-10 sm:p-14 text-center">
                <FaGlobe className="text-emerald-600 text-2xl mx-auto mb-4" />
                <h3 className="font-serif text-xl text-[#1a1a2e] mb-2">No Public Trips Yet</h3>
                <p className="text-sm text-gray-500">This traveler hasn't shared any adventures yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                {followerTrips.map((trip) => (
                  <div key={trip.id} className="group bg-white border border-gray-200 overflow-hidden">
                    <Link to={`/show-trip/${trip.id}`}>
                      <div className="relative aspect-[4/3] bg-gray-100 overflow-hidden">
                        <img 
                          src={getTripImage(trip)} 
                          alt={getLocationName(trip)}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?ixlib=rb-4.0.3&auto=format&fit=crop&w=1121&q=80";
                          }}
                        />
                        
                        <div className="absolute top-3 left-3 bg-[#1a1a2e] text-white px-3 py-1 text-[10px] uppercase tracking-[0.15em] font-medium">
                          {trip.userSelection?.travelType || 'Adventure'}
                        </div>
                        
                        <div className="absolute bottom-3 right-3 flex items-center gap-1 bg-white px-2 py-1 text-[11px] font-medium">
                          <FaHeart className="text-red-500" size={10} />
                          <span className="text-gray-700">{trip.likesCount || 0}</span>
                        </div>
                      </div>

                      <div className="p-4">
                        <h3 className="font-serif text-lg text-[#1a1a2e] mb-2 line-clamp-1 group-hover:text-emerald-700 transition-colors">
                          {getLocationName(trip)}
                        </h3>

                        <div className="space-y-1.5 mb-3">
                          <div className="flex items-center text-[12px] text-gray-500">
                            <FaMapMarkerAlt className="mr-2 text-emerald-600 flex-shrink-0" size={10} />
                            <span className="truncate">{trip.userSelection?.country || 'Adventure'}</span>
                          </div>
                          <div className="flex items-center text-[12px] text-gray-500">
                            <FaCalendarAlt className="mr-2 text-emerald-600 flex-shrink-0" size={10} />
                            <span>{formatDate(trip.createdAt)}</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                          <span className="text-[11px] uppercase tracking-[0.1em] text-gray-400 font-medium">
                            {trip.userSelection?.duration || '?'} days
                          </span>
                          <span className="text-[11px] uppercase tracking-[0.1em] text-emerald-600 font-medium group-hover:text-emerald-700">
                            View Trip →
                          </span>
                        </div>
                      </div>
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
      </div>
    </div>
  );
}

export default UserProfile;
