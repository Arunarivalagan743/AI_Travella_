import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { collection, query, where, getDocs, doc, getDoc, orderBy } from 'firebase/firestore';
import { db } from '../ModelWork/firebaseConfig';
import { useAuth } from '../context/AuthContext';
import { Layout } from '../components/layout/Layout';
import { motion } from 'framer-motion';
import { FaEnvelope, FaMapMarkerAlt, FaUser, FaClock, FaCalendarAlt } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import SocialInteractions from '../components/ui/custom/SocialInteractions';

function UserProfile() {
  const { userId } = useParams(); // userId is the email address
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [trips, setTrips] = useState([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingTrips, setLoadingTrips] = useState(true);
  const [stats, setStats] = useState({
    tripCount: 0,
    followers: 0,
    following: 0
  });

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
    }
  }, [user, profile]);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const userDocRef = doc(db, "users", userId);
      const userDoc = await getDoc(userDocRef);
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        setProfile(userData);
        
        // Set stats
        setStats({
          tripCount: 0, // Will be updated when we fetch trips
          followers: userData.followers?.length || 0,
          following: userData.following?.length || 0
        });
      } else {
        toast.error("User not found");
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
      toast.error("Failed to load user profile");
    } finally {
      setLoading(false);
    }
  };

  const fetchUserTrips = async () => {
    try {
      setLoadingTrips(true);
      const tripsQuery = query(
        collection(db, "alltrips"),
        where("userEmail", "==", userId),
        where("isPublic", "==", true),
        orderBy("createdAt", "desc")
      );
      
      const querySnapshot = await getDocs(tripsQuery);
      const userTrips = [];
      
      querySnapshot.forEach((doc) => {
        userTrips.push({ id: doc.id, ...doc.data() });
      });
      
      setTrips(userTrips);
      setStats(prev => ({ ...prev, tripCount: userTrips.length }));
    } catch (error) {
      console.error("Error fetching user trips:", error);
      toast.error("Failed to load user trips");
    } finally {
      setLoadingTrips(false);
    }
  };

  const checkFollowStatus = async () => {
    if (user.email === userId) return; // Can't follow yourself
    
    try {
      const currentUserRef = doc(db, "users", user.email);
      const currentUserDoc = await getDoc(currentUserRef);
      
      if (currentUserDoc.exists()) {
        const following = currentUserDoc.data().following || [];
        setIsFollowing(following.includes(userId));
      }
    } catch (error) {
      console.error("Error checking follow status:", error);
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return "Unknown date";
    
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return new Intl.DateTimeFormat('en-US', { 
      year: 'numeric', 
      month: 'long',
      day: 'numeric'
    }).format(date);
  };

  // Get location name from trip
  const getLocationName = (trip) => {
    return trip.userSelection?.location || 
           trip.userSelection?.place?.label || 
           "Unknown Destination";
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-500 border-t-transparent"></div>
        </div>
      </Layout>
    );
  }

  if (!profile) {
    return (
      <Layout>
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-gray-800">User not found</h1>
          <p className="text-gray-600 mt-2">The user you're looking for doesn't exist or has been deleted.</p>
          <Link to="/explore" className="mt-6 inline-block bg-emerald-600 text-white px-4 py-2 rounded-lg">
            Back to Explore
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Profile Header */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-emerald-500 to-blue-500 h-32"></div>
          
          <div className="p-6 relative">
            {/* Profile Picture */}
            <div className="absolute -top-16 left-6">
              <div className="w-24 h-24 rounded-full border-4 border-white overflow-hidden bg-emerald-100">
                {profile.photoURL ? (
                  <img 
                    src={profile.photoURL} 
                    alt={profile.displayName} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-emerald-500 text-white text-2xl font-bold">
                    {profile.displayName?.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
            </div>
            
            {/* User Info */}
            <div className="ml-32 flex justify-between items-start">
              <div>
                <h1 className="text-2xl font-bold text-gray-800">{profile.displayName}</h1>
                <div className="flex items-center text-gray-600 mt-1">
                  <FaEnvelope className="mr-2" size={14} />
                  <span>{userId}</span>
                </div>
                {profile.bio && (
                  <p className="mt-3 text-gray-700">{profile.bio}</p>
                )}
              </div>
              
              {/* Follow Button (only show if not the current user) */}
              {user && userId !== user.email && (
                <SocialInteractions
                  tripId={null}
                  creatorEmail={userId}
                  isFollowing={isFollowing}
                  onUpdate={() => fetchUserProfile()} // Refresh stats after follow/unfollow
                />
              )}
            </div>
            
            {/* User Stats */}
            <div className="flex mt-6 border-t pt-4">
              <div className="flex-1 text-center">
                <div className="text-2xl font-bold text-gray-800">{stats.tripCount}</div>
                <div className="text-sm text-gray-600">Trips</div>
              </div>
              <div className="flex-1 text-center border-l border-r">
                <div className="text-2xl font-bold text-gray-800">{stats.followers}</div>
                <div className="text-sm text-gray-600">Followers</div>
              </div>
              <div className="flex-1 text-center">
                <div className="text-2xl font-bold text-gray-800">{stats.following}</div>
                <div className="text-sm text-gray-600">Following</div>
              </div>
            </div>
          </div>
        </div>
        
        {/* User's Trips */}
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Trips by {profile.displayName}</h2>
        
        {loadingTrips ? (
          <div className="flex justify-center items-center h-48">
            <div className="animate-spin rounded-full h-8 w-8 border-4 border-emerald-500 border-t-transparent"></div>
          </div>
        ) : trips.length === 0 ? (
          <div className="bg-gray-50 rounded-xl p-12 text-center">
            <div className="text-gray-400 text-6xl mb-4">🌍</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No public trips yet</h3>
            <p className="text-gray-500">This user hasn't shared any trips yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {trips.map((trip) => (
              <motion.div
                key={trip.id}
                className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Link to={`/show-trip/${trip.id}`}>
                  <div className="h-48 bg-gray-200 relative">
                    {trip.coverImage || trip.tripData?.hotelsList?.[0]?.hotelImageUrl ? (
                      <img 
                        src={trip.coverImage || trip.tripData?.hotelsList?.[0]?.hotelImageUrl}
                        alt={getLocationName(trip)}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-r from-emerald-400 to-blue-400 text-white">
                        <span className="text-2xl font-bold">{getLocationName(trip).split(' ')[0]}</span>
                      </div>
                    )}
                    
                    <div className="absolute top-3 right-3 bg-white bg-opacity-90 px-3 py-1 rounded-full text-sm font-medium text-emerald-700">
                      {trip.userSelection?.duration || "?"} {trip.userSelection?.duration === 1 ? 'Day' : 'Days'}
                    </div>
                  </div>
                  
                  <div className="p-4">
                    <h3 className="font-bold text-lg text-gray-800 mb-1 truncate">
                      {getLocationName(trip)}
                    </h3>
                    
                    <div className="flex items-center text-sm text-gray-600 mb-3">
                      <FaMapMarkerAlt className="mr-1 text-emerald-500" size={14} />
                      <span>{trip.userSelection?.country || "Travel Plan"}</span>
                      <span className="mx-2">•</span>
                      <FaCalendarAlt className="mr-1 text-emerald-500" size={14} />
                      <span>{formatDate(trip.createdAt)}</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="bg-emerald-100 text-emerald-800 text-xs px-2 py-1 rounded">
                          {trip.userSelection?.travelType || "Adventure"}
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
      </div>
    </Layout>
  );
}

export default UserProfile;
