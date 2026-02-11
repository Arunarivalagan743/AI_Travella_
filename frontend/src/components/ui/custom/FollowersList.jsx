import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { doc, getDoc, updateDoc, arrayRemove, arrayUnion, query, collection, where, getDocs } from 'firebase/firestore';
import { db } from '@/ModelWork/firebaseConfig';
import { useAuth } from '@/context/AuthContext';
import { FaUserCircle, FaTimesCircle, FaChevronLeft, FaUserPlus, FaUserCheck, FaEnvelope, FaComment, FaShare } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import { Link } from 'react-router-dom';

const FollowersList = ({ userId = null, onClose, showBackButton = true, onChatStart }) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('followers');
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [profiles, setProfiles] = useState({});
  const [loading, setLoading] = useState(true);

  // If userId is not provided, use the current logged in user
  const targetUserId = userId || (user ? user.email : null);

  useEffect(() => {
    if (!targetUserId) {
      setLoading(false);
      return;
    }
    
    fetchFollowData();
  }, [targetUserId, activeTab]);

  const fetchFollowData = async () => {
    try {
      setLoading(true);
      const userDocRef = doc(db, 'users', targetUserId);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        const userData = userDoc.data();
        const followersList = userData.followers || [];
        const followingList = userData.following || [];
        
        if (activeTab === 'followers') {
          setFollowers(followersList);
          await fetchUserProfiles(followersList);
        } else {
          setFollowing(followingList);
          await fetchUserProfiles(followingList);
        }
      }
    } catch (error) {
      console.error('Error fetching follow data:', error);
      toast.error('Failed to load followers');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserProfiles = async (emailList) => {
    try {
      const newProfiles = { ...profiles };
      
      await Promise.all(emailList.map(async (email) => {
        if (newProfiles[email]) return; // Skip if already fetched
        
        const userDocRef = doc(db, 'users', email);
        const userDoc = await getDoc(userDocRef);
        
        if (userDoc.exists()) {
          newProfiles[email] = userDoc.data();
        } else {
          // Fallback profile if user document doesn't exist
          newProfiles[email] = {
            displayName: email.split('@')[0],
            email: email,
            photoURL: null
          };
        }
      }));
      
      setProfiles(newProfiles);
    } catch (error) {
      console.error('Error fetching user profiles:', error);
    }
  };

  const handleFollow = async (targetEmail) => {
    if (!user) {
      toast.error('Please sign in to follow users');
      return;
    }
    
    if (user.email === targetEmail) {
      toast.error('You cannot follow yourself');
      return;
    }
    
    try {
      // Check if already following
      const currentUserRef = doc(db, 'users', user.email);
      const currentUserDoc = await getDoc(currentUserRef);
      
      if (currentUserDoc.exists()) {
        const userData = currentUserDoc.data();
        const following = userData.following || [];
        
        if (following.includes(targetEmail)) {
          // Unfollow
          await updateDoc(currentUserRef, {
            following: arrayRemove(targetEmail)
          });
          
          const targetUserRef = doc(db, 'users', targetEmail);
          await updateDoc(targetUserRef, {
            followers: arrayRemove(user.email)
          });
          
          toast.success('Unfollowed user');
        } else {
          // Follow
          await updateDoc(currentUserRef, {
            following: arrayUnion(targetEmail)
          });
          
          const targetUserRef = doc(db, 'users', targetEmail);
          await updateDoc(targetUserRef, {
            followers: arrayUnion(user.email)
          });
          
          toast.success('Following user');
        }
        
        // Refresh the lists
        fetchFollowData();
      }
    } catch (error) {
      console.error('Error updating follow status:', error);
      toast.error('Failed to update follow status');
    }
  };

  const isFollowing = (email) => {
    if (!user) return false;
    return profiles[user.email]?.following?.includes(email) || false;
  };

  const handleStartChat = (targetUser) => {
    if (onChatStart) {
      onChatStart(targetUser);
    }
  };

  const renderUserItem = (email) => {
    const profile = profiles[email] || {
      displayName: email.split('@')[0],
      email,
      photoURL: null
    };
    
    return (
      <motion.div
        key={email}
        className="bg-white border border-gray-200 p-4 flex items-center justify-between"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 overflow-hidden bg-[#f5f0eb]">
            {profile.photoURL ? (
              <img 
                src={profile.photoURL} 
                alt={profile.displayName} 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-[#1a1a2e] text-white">
                <span className="font-serif">{(profile.displayName || '?').charAt(0).toUpperCase()}</span>
              </div>
            )}
          </div>
          
          <div>
            <Link to={`/user-profile/${email}`} className="text-[13px] font-medium text-[#1a1a2e] hover:text-emerald-600 tracking-wide">
              {profile.displayName}
            </Link>
            <div className="text-[11px] text-gray-400 flex items-center gap-1 tracking-wide">
              <FaEnvelope size={10} className="opacity-70" />
              <span>{email}</span>
            </div>
          </div>
        </div>
        
        <div className="flex gap-2">
          {user && user.email !== email && (
            <>
              <button
                onClick={() => handleStartChat(profile)}
                className="p-2 text-[#1a1a2e] hover:bg-[#f5f0eb] transition-colors"
                title="Start chat"
              >
                <FaComment size={14} />
              </button>
              
              <button
                onClick={() => handleFollow(email)}
                className={`px-3 py-1.5 flex items-center gap-1 text-[11px] uppercase tracking-[0.1em] font-medium ${
                  isFollowing(email)
                    ? 'bg-[#f5f0eb] text-[#1a1a2e] hover:bg-red-50 hover:text-red-600'
                    : 'bg-[#1a1a2e] text-white hover:bg-[#2a2a4e]'
                } transition-colors`}
              >
                {isFollowing(email) ? (
                  <>
                    <FaUserCheck size={10} />
                    <span className="hidden sm:inline">Following</span>
                  </>
                ) : (
                  <>
                    <FaUserPlus size={10} />
                    <span className="hidden sm:inline">Follow</span>
                  </>
                )}
              </button>
            </>
          )}
        </div>
      </motion.div>
    );
  };

  return (
    <div className="bg-white border border-gray-200 p-6 w-full max-w-2xl">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          {showBackButton && (
            <button
              onClick={onClose}
              className="p-2 hover:bg-[#f5f0eb] transition-colors"
            >
              <FaChevronLeft size={14} className="text-gray-500" />
            </button>
          )}
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-emerald-600 font-medium">Network</p>
            <h2 className="font-serif text-xl text-[#1a1a2e]">
              {targetUserId === user?.email ? 'Your Network' : `${profiles[targetUserId]?.displayName || 'User'}'s Network`}
            </h2>
          </div>
        </div>
        
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600"
        >
          <FaTimesCircle size={18} />
        </button>
      </div>

      <div className="border-b border-gray-200 mb-6">
        <div className="flex space-x-8">
          <button
            className={`pb-3 px-2 text-[11px] uppercase tracking-[0.15em] font-medium transition-colors ${
              activeTab === 'followers'
                ? 'border-b-2 border-emerald-600 text-[#1a1a2e]'
                : 'text-gray-400 hover:text-gray-600'
            }`}
            onClick={() => setActiveTab('followers')}
          >
            Followers
          </button>
          <button
            className={`pb-3 px-2 text-[11px] uppercase tracking-[0.15em] font-medium transition-colors ${
              activeTab === 'following'
                ? 'border-b-2 border-emerald-600 text-[#1a1a2e]'
                : 'text-gray-400 hover:text-gray-600'
            }`}
            onClick={() => setActiveTab('following')}
          >
            Following
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center h-60 gap-3">
          <div className="w-[1px] h-10 bg-emerald-600 animate-pulse"></div>
          <p className="text-[10px] uppercase tracking-[0.2em] text-gray-400">Loading</p>
        </div>
      ) : activeTab === 'followers' ? (
        followers.length === 0 ? (
          <div className="text-center py-12 bg-[#f5f0eb]">
            <p className="font-serif text-lg text-[#1a1a2e] mb-1">No Followers</p>
            <p className="text-[12px] text-gray-400 tracking-wide">
              {targetUserId === user?.email 
                ? "When people follow you, they'll appear here" 
                : "This user doesn't have any followers yet"}
            </p>
          </div>
        ) : (
          <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
            {followers.map(renderUserItem)}
          </div>
        )
      ) : (
        following.length === 0 ? (
          <div className="text-center py-12 bg-[#f5f0eb]">
            <p className="font-serif text-lg text-[#1a1a2e] mb-1">Not Following Anyone</p>
            <p className="text-[12px] text-gray-400 tracking-wide">
              {targetUserId === user?.email 
                ? "When you follow people, they'll appear here" 
                : "This user isn't following anyone yet"}
            </p>
          </div>
        ) : (
          <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
            {following.map(renderUserItem)}
          </div>
        )
      )}
    </div>
  );
};

export default FollowersList;
