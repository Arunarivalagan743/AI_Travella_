import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { collection, query, where, getDocs, doc, getDoc, orderBy, arrayRemove, updateDoc } from 'firebase/firestore';
import { db } from '../ModelWork/firebaseConfig';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { FaEnvelope, FaMapMarkerAlt, FaUser, FaCalendarAlt, FaTimesCircle, FaUserCircle } from 'react-icons/fa';
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
    <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-8">
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
              <h1 className="text-2xl font-bold text-gray-800">
                {profile.displayName}
              </h1>
              <div className="flex items-center text-gray-600 mt-1">
                <FaEnvelope className="mr-2" size={14} />
                <span>{userId}</span>
              </div>
              {profile.bio && (
                <p className="mt-3 text-gray-700">{profile.bio}</p>
              )}
            </div>

            {/* Follow/Unfollow */}
            {user && userId !== user.email && (
              <div className="flex flex-col gap-2">
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

                {isFollowing.status === 'following' && (
                  <button
                    onClick={async () => {
                      try {
                        const currentUserRef = doc(db, 'users', user.email);
                        await updateDoc(currentUserRef, {
                          following: arrayRemove(userId)
                        });

                        const targetUserRef = doc(db, 'users', userId);
                        await updateDoc(targetUserRef, {
                          followers: arrayRemove(user.email)
                        });

                        toast.success('Unfollowed user');
                        fetchUserProfile();
                        checkFollowStatus();
                      } catch (error) {
                        console.error('Error unfollowing user:', error);
                        toast.error('Failed to unfollow user');
                      }
                    }}
                    className="text-xs text-red-600 hover:text-red-800 flex items-center gap-1 self-end"
                  >
                    <FaTimesCircle size={12} />
                    <span>Unfollow</span>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Stats */}
          <div className="flex mt-6 border-t pt-4">
            <div className="flex-1 text-center">
              <div className="text-2xl font-bold text-gray-800">
                {stats.tripCount}
              </div>
              <div className="text-sm text-gray-600">Trips</div>
            </div>
            <div className="flex-1 text-center border-l border-r">
              <div className="text-2xl font-bold text-gray-800">
                {stats.followers}
              </div>
              <div className="text-sm text-gray-600">Followers</div>
            </div>
            <div className="flex-1 text-center">
              <div className="text-2xl font-bold text-gray-800">
                {stats.following}
              </div>
              <div className="text-sm text-gray-600">Following</div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="border-b border-gray-200 mb-6">
        <div className="flex space-x-8">
          <button
            className={`pb-3 px-2 font-medium ${
              activeTab === 'trips'
                ? 'border-b-2 border-emerald-500 text-emerald-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('trips')}
          >
            Trips ({stats.tripCount})
          </button>
          <button
            className={`pb-3 px-2 font-medium ${
              activeTab === 'followers'
                ? 'border-b-2 border-emerald-500 text-emerald-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('followers')}
          >
            Followers ({stats.followers})
          </button>
          <button
            className={`pb-3 px-2 font-medium ${
              activeTab === 'following'
                ? 'border-b-2 border-emerald-500 text-emerald-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('following')}
          >
            Following ({stats.following})
          </button>
          {activeTab === 'followerTrips' && selectedFollower && (
            <button
              className="pb-3 px-2 font-medium border-b-2 border-emerald-500 text-emerald-600"
            >
              {followersProfiles[selectedFollower]?.displayName || selectedFollower.split('@')[0]}'s Trips
            </button>
          )}
        </div>
      </div>

      {/* Trips Tab Content */}
      {activeTab === 'trips' && (
        <>
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            Trips by {profile.displayName}
          </h2>

          {loadingTrips ? (
            <div className="flex justify-center items-center h-48">
              <div className="animate-spin rounded-full h-8 w-8 border-4 border-emerald-500 border-t-transparent"></div>
            </div>
          ) : trips.length === 0 ? (
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
        <>
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            Followers of {profile.displayName}
          </h2>

          {loadingFollowers ? (
            <div className="flex justify-center items-center h-48">
              <div className="animate-spin rounded-full h-8 w-8 border-4 border-emerald-500 border-t-transparent"></div>
            </div>
          ) : followers.length === 0 ? (
            <div className="bg-gray-50 rounded-xl p-12 text-center">
              <div className="text-gray-400 text-6xl mb-4">👤</div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                No followers yet
              </h3>
              <p className="text-gray-500">
                This user doesn't have any followers yet.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {followers.map((email) => {
                const followerProfile = followersProfiles[email] || { 
                  displayName: email.split('@')[0],
                  photoURL: null,
                  email: email
                };
                
                return (
                  <motion.div
                    key={email}
                    className="bg-white rounded-lg overflow-hidden shadow-md p-4 flex items-center justify-between"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-full overflow-hidden bg-emerald-100 border border-gray-200">
                        {followerProfile.photoURL ? (
                          <img 
                            src={followerProfile.photoURL} 
                            alt={followerProfile.displayName} 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-emerald-500 text-white text-xl">
                            <FaUserCircle size={28} />
                          </div>
                        )}
                      </div>
                      
                      <div>
                        <h3 className="font-semibold text-gray-800">
                          {followerProfile.displayName}
                        </h3>
                        <p className="text-sm text-gray-500">{followerProfile.email}</p>
                      </div>
                    </div>
                    
                    <div className="flex flex-col md:flex-row gap-2">
                      <button 
                        onClick={() => viewFollowerTrips(followerProfile.email)}
                        className="px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-lg hover:bg-emerald-100 transition-colors text-sm text-center"
                      >
                        View Trips
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* Following Tab Content */}
      {activeTab === 'following' && (
        <>
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            Following
          </h2>

          {loadingFollowing ? (
            <div className="flex justify-center items-center h-48">
              <div className="animate-spin rounded-full h-8 w-8 border-4 border-emerald-500 border-t-transparent"></div>
            </div>
          ) : following.length === 0 ? (
            <div className="bg-gray-50 rounded-xl p-12 text-center">
              <div className="text-gray-400 text-6xl mb-4">👥</div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                Not following anyone yet
              </h3>
              <p className="text-gray-500">
                {userId === user?.email ? "Start exploring and follow other travelers!" : "This user hasn't followed anyone yet."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {following.map((followingEmail) => {
                const followingProfile = followingProfiles[followingEmail] || {
                  displayName: followingEmail.split('@')[0],
                  email: followingEmail,
                  photoURL: null
                };
                
                // Check if this is the current user's profile
                const isOwnProfile = user && user.email && userId && userId === user.email;
                
                return (
                  <motion.div
                    key={followingEmail}
                    className="bg-white rounded-lg shadow-md p-4 flex items-center justify-between"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full overflow-hidden bg-gradient-to-br from-emerald-400 to-blue-500 flex items-center justify-center">
                        {followingProfile.photoURL ? (
                          <img
                            src={followingProfile.photoURL}
                            alt={followingProfile.displayName}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <FaUserCircle className="text-white" size={32} />
                        )}
                      </div>
                      
                      <div>
                        <h3 className="font-semibold text-gray-800">
                          {followingProfile.displayName}
                        </h3>
                        <p className="text-sm text-gray-500">{followingProfile.email}</p>
                      </div>
                    </div>
                    
                    <div className="flex flex-col md:flex-row gap-2">
                      <button 
                        onClick={() => viewFollowerTrips(followingProfile.email)}
                        className="px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-lg hover:bg-emerald-100 transition-colors text-sm text-center"
                      >
                        View Trips
                      </button>
                      
                      {/* Show unfollow button only when viewing your own profile */}
                      {isOwnProfile && (
                        <button
                          onClick={() => handleUnfollow(followingProfile.email)}
                          className="px-3 py-1.5 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors text-sm flex items-center justify-center gap-1 whitespace-nowrap"
                        >
                          <FaTimesCircle size={12} />
                          <span>Unfollow</span>
                        </button>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default UserProfile;
