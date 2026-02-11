
import React, { useState, useEffect } from 'react';
import { 
  FaHeart, FaRegHeart, 
  FaRegCommentAlt, 
  FaShare, FaRegUserCircle, FaUserCheck,
  FaUserPlus, FaHourglassHalf, FaTimesCircle
} from 'react-icons/fa';
import { doc, updateDoc, getDoc, arrayUnion, arrayRemove, onSnapshot, setDoc } from 'firebase/firestore';
import { db, auth } from '../../../ModelWork/firebaseConfig';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../../context/AuthContext';
import ShareOptions from './ShareOptions';
import TripShareButton from './TripShareButton';

const SocialInteractions = ({ 
  tripId, 
  creatorEmail,
  likedBy = [],
  likesCount = 0,
  commentsCount = 0,
  isFollowing = false,
  onCommentClick,
  size = 'md',
  layout = 'row'
}) => {
  const { user } = useAuth();

  // Local state
  const [isLiked, setIsLiked] = useState(user ? likedBy.includes(user.email) : false);
  const [likeCount, setLikeCount] = useState(likesCount);
  const [liveCommentsCount, setLiveCommentsCount] = useState(commentsCount);
  const [isUserFollowing, setIsUserFollowing] = useState(isFollowing);
  const [followRequestStatus, setFollowRequestStatus] = useState('none'); // 'none', 'requested', 'pending'
  const [isProcessing, setIsProcessing] = useState({ like: false, follow: false, share: false });
  const [showShareOptions, setShowShareOptions] = useState(false);
  const [followers, setFollowers] = useState([]);

  // Subscribe to trip doc in Firestore (real-time updates)
  useEffect(() => {
    if (!tripId) return;
    const tripRef = doc(db, "alltrips", tripId);

    const unsub = onSnapshot(tripRef, (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        setLikeCount(data.likesCount || 0);
        setLiveCommentsCount(data.commentCount || 0);
        if (user) {
          setIsLiked((data.likedBy || []).includes(user.email));
        }
      }
    });

    return () => unsub();
  }, [tripId, user]);

  // Update from props when they change
  useEffect(() => {
    setIsUserFollowing(isFollowing);
  }, [isFollowing]);
  
  // Update follow request status from props
  useEffect(() => {
    if (followRequestStatus !== 'none') {
      setFollowRequestStatus(followRequestStatus);
    }
  }, [followRequestStatus]);
  
  // Check follow request status
  useEffect(() => {
    if (!user || !creatorEmail || user.email === creatorEmail) return;
    
    const checkFollowRequestStatus = async () => {
      try {
        // Check if the user has sent a follow request to the creator
        const currentUserRef = doc(db, "users", user.email);
        const currentUserDoc = await getDoc(currentUserRef);
        
        // Check if the creator has sent a follow request to the user
        const targetUserRef = doc(db, "users", creatorEmail);
        const targetUserDoc = await getDoc(targetUserRef);
        
        if (currentUserDoc.exists() && targetUserDoc.exists()) {
          const currentUserData = currentUserDoc.data();
          const targetUserData = targetUserDoc.data();
          
          // Check for pending follow requests
          const sentRequests = currentUserData.followRequestsSent || [];
          const receivedRequests = currentUserData.followRequestsReceived || [];
          const targetSentRequests = targetUserData.followRequestsSent || [];
          
          if (sentRequests.includes(creatorEmail)) {
            setFollowRequestStatus('requested');
          } else if (targetSentRequests.includes(user.email)) {
            setFollowRequestStatus('pending');
          } else {
            setFollowRequestStatus('none');
          }
        }
      } catch (error) {
        console.error("Error checking follow request status:", error);
      }
    };
    
    checkFollowRequestStatus();
  }, [user, creatorEmail]);

  // Icon sizes
  const iconSizes = { sm: 16, md: 20, lg: 24 };
  const iconSize = iconSizes[size] || iconSizes.md;

  // Toggle like
  const handleToggleLike = async () => {
    if (!user) {
      toast.error("Please sign in to like this content");
      return;
    }
    if (isProcessing.like) return;
    if (!auth.currentUser) {
      toast.error("Authentication expired. Please sign in again.");
      return;
    }

    try {
      setIsProcessing(prev => ({ ...prev, like: true }));
      const tripRef = doc(db, "alltrips", tripId);
      const tripDoc = await getDoc(tripRef);

      if (!tripDoc.exists()) {
        toast.error("Content not found");
        return;
      }

      const tripData = tripDoc.data();
      const currentLikedBy = tripData.likedBy || [];
      const userHasLiked = currentLikedBy.includes(user.email);

      if (userHasLiked) {
        await updateDoc(tripRef, {
          likedBy: arrayRemove(user.email),
          likesCount: Math.max((tripData.likesCount || 1) - 1, 0)
        });
      } else {
        await updateDoc(tripRef, {
          likedBy: arrayUnion(user.email),
          likesCount: (tripData.likesCount || 0) + 1
        });
      }

      toast.success(userHasLiked ? "Like removed" : "Content liked!");
    } catch (error) {
      console.error("Error toggling like:", error);
      toast.error("Failed to update like");
    } finally {
      setIsProcessing(prev => ({ ...prev, like: false }));
    }
  };

  // Toggle follow with request system
  const handleToggleFollow = async () => {
    if (!user) {
      toast.error("Please sign in to follow users");
      return;
    }
    
    if (user.email === creatorEmail) {
      toast.error("You can't follow yourself");
      return;
    }
    
    if (isProcessing.follow) return;
    
    try {
      setIsProcessing(prev => ({ ...prev, follow: true }));
      
      // Get current user document
      const currentUserRef = doc(db, "users", user.email);
      const currentUserDoc = await getDoc(currentUserRef);
      
      // Get target user document
      const targetUserRef = doc(db, "users", creatorEmail);
      const targetUserDoc = await getDoc(targetUserRef);
      
      let currentUserData;
      let targetUserData;
      
      // Check if documents exist and create them if they don't
      if (!currentUserDoc.exists()) {
        currentUserData = {
          displayName: user.name || user.email.split('@')[0],
          email: user.email,
          photoURL: user.picture || null,
          following: [],
          followers: [],
          followRequestsSent: [],
          followRequestsReceived: [],
          bio: "",
          createdAt: new Date().toISOString()
        };
        
        await setDoc(currentUserRef, currentUserData);
      } else {
        currentUserData = currentUserDoc.data();
        // Ensure these arrays exist
        if (!currentUserData.followRequestsSent) currentUserData.followRequestsSent = [];
        if (!currentUserData.followRequestsReceived) currentUserData.followRequestsReceived = [];
      }
      
      if (!targetUserDoc.exists()) {
        targetUserData = {
          displayName: creatorEmail.split('@')[0],
          email: creatorEmail,
          photoURL: null,
          following: [],
          followers: [],
          followRequestsSent: [],
          followRequestsReceived: [],
          bio: "",
          createdAt: new Date().toISOString()
        };
        
        await setDoc(targetUserRef, targetUserData);
      } else {
        targetUserData = targetUserDoc.data();
        // Ensure these arrays exist
        if (!targetUserData.followRequestsSent) targetUserData.followRequestsSent = [];
        if (!targetUserData.followRequestsReceived) targetUserData.followRequestsReceived = [];
      }
      
      // Check current status
      const following = currentUserData.following || [];
      const isCurrentlyFollowing = following.includes(creatorEmail);
      
      if (isCurrentlyFollowing) {
        // Unfollow
        await updateDoc(currentUserRef, {
          following: arrayRemove(creatorEmail)
        });
        
        await updateDoc(targetUserRef, {
          followers: arrayRemove(user.email)
        });
        
        setIsUserFollowing(false);
        
        // Make sure to call onUpdate for parent components
        if (onUpdate) {
          onUpdate({ followStatus: 'none' });
        }
        
        toast.success("Unfollowed user");
      } else if (followRequestStatus === 'requested') {
        // Cancel follow request
        await updateDoc(currentUserRef, {
          followRequestsSent: arrayRemove(creatorEmail)
        });
        
        await updateDoc(targetUserRef, {
          followRequestsReceived: arrayRemove(user.email)
        });
        
        setFollowRequestStatus('none');
        
        // Make sure to call onUpdate for parent components
        if (onUpdate) {
          onUpdate({ followStatus: 'none' });
        }
        
        toast.success("Follow request cancelled");
      } else if (followRequestStatus === 'pending') {
        // Accept follow request
        await updateDoc(currentUserRef, {
          followRequestsReceived: arrayRemove(creatorEmail),
          followers: arrayUnion(creatorEmail)
        });
        
        await updateDoc(targetUserRef, {
          followRequestsSent: arrayRemove(user.email),
          following: arrayUnion(user.email)
        });
        
        setFollowRequestStatus('none');
        setIsUserFollowing(true);
        
        // Make sure to call onUpdate for parent components
        if (onUpdate) {
          onUpdate({ followStatus: 'following' });
        }
        
        toast.success("Follow request accepted");
      } else {
        // Send follow request
        await updateDoc(currentUserRef, {
          followRequestsSent: arrayUnion(creatorEmail)
        });
        
        await updateDoc(targetUserRef, {
          followRequestsReceived: arrayUnion(user.email)
        });
        
        setFollowRequestStatus('requested');
        
        // Make sure to call onUpdate for parent components
        if (onUpdate) {
          onUpdate({ followStatus: 'requested' });
        }
        
        toast.success("Follow request sent");
      }
    } catch (error) {
      console.error("Error toggling follow:", error);
      toast.error("Failed to update follow status");
    } finally {
      setIsProcessing(prev => ({ ...prev, follow: false }));
    }
  };
  
  // Fetch followers for sharing
  useEffect(() => {
    const fetchFollowers = async () => {
      if (!user) return;
      
      try {
        const userDocRef = doc(db, "users", user.email);
        const userDoc = await getDoc(userDocRef);
        
        if (userDoc.exists()) {
          const userData = userDoc.data();
          const followersList = userData.followers || [];
          
          // Fetch follower profiles
          const followerProfiles = await Promise.all(
            followersList.map(async (email) => {
              const followerDocRef = doc(db, "users", email);
              const followerDoc = await getDoc(followerDocRef);
              
              if (followerDoc.exists()) {
                const followerData = followerDoc.data();
                return {
                  id: email,
                  email: email,
                  displayName: followerData.displayName || email.split('@')[0],
                  photoURL: followerData.photoURL || null
                };
              }
              return null;
            })
          );
          
          setFollowers(followerProfiles.filter(Boolean));
        }
      } catch (error) {
        console.error("Error fetching followers:", error);
      }
    };
    
    if (user) fetchFollowers();
  }, [user]);

  // Enhanced Share functionality
  const handleShare = () => {
    if (isProcessing.share) return;
    setShowShareOptions(true);
  };

  // Layout classes
  const containerClass = layout === 'row' 
    ? 'flex items-center gap-6' 
    : 'flex flex-col items-center gap-4';

  return (
    <>
      <div className={containerClass}>
        {/* Like */}
        <button 
          onClick={handleToggleLike}
          disabled={isProcessing.like}
          className="flex items-center gap-1.5 hover:opacity-70 active:scale-95 transition-all"
        >
          {isLiked 
            ? <FaHeart className="text-red-500" size={iconSize} /> 
            : <FaRegHeart className="text-gray-600" size={iconSize} />
          }
          <span className="text-[12px] tracking-wide font-medium">{likeCount}</span>
        </button>

        {/* Comment */}
        <button 
          onClick={onCommentClick}
          className="flex items-center gap-1.5 hover:opacity-70 active:scale-95 transition-all"
        >
          <FaRegCommentAlt className="text-gray-600" size={iconSize} />
          <span className="text-[12px] tracking-wide">{liveCommentsCount}</span>
        </button>

        {/* Share */}
        <button
          onClick={handleShare}
          disabled={isProcessing.share}
          className="flex items-center gap-1.5 hover:opacity-70 active:scale-95 transition-all"
        >
          <FaShare className="text-gray-600" size={iconSize} />
          <span className="text-[12px] tracking-wide uppercase">Share</span>
        </button>

        {/* Follow button with request system */}
        {user && creatorEmail && user.email !== creatorEmail && (
        <button
          onClick={handleToggleFollow}
          className={`flex items-center gap-0.5 transition-colors px-1.5 py-0.5 text-[8px] uppercase tracking-[0.01em] font-medium rounded ${
            isUserFollowing
              ? 'bg-gray-100 text-gray-700 border border-gray-300'
              : followRequestStatus === 'requested'
                ? 'bg-gray-100 text-gray-500 border border-gray-300'
                : followRequestStatus === 'pending'
                  ? 'bg-blue-100 text-blue-700 border border-blue-300'
                  : 'bg-[#1a1a2e] text-white'
          }`}
          disabled={isProcessing.follow}
        >
          {isUserFollowing ? (
            <>
              <FaUserCheck size={10} />
              <span>Following</span>
            </>
          ) : followRequestStatus === 'requested' ? (
            <>
              <FaHourglassHalf size={10} />
              <span>Requested</span>
            </>
          ) : followRequestStatus === 'pending' ? (
            <>
              <FaUserPlus size={10} />
              <span>Accept</span>
            </>
          ) : (
            <>
              <FaRegUserCircle size={10} />
              <span>Follow</span>
            </>
          )}
        </button>
      )}
      </div>
      
      {/* Enhanced Share Options Modal */}
      {showShareOptions && (
        <ShareOptions
          tripId={tripId}
          creatorEmail={creatorEmail}
          isOpen={showShareOptions}
          onClose={() => setShowShareOptions(false)}
          followers={followers}
        />
      )}
    </>
  );
};

export default SocialInteractions;
