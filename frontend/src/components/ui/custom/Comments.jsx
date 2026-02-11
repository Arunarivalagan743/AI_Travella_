import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes, FaPaperPlane, FaTrash, FaRegClock } from 'react-icons/fa';
import { useAuth } from '../../../context/AuthContext';
import { db, auth } from '../../../ModelWork/firebaseConfig';
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  doc, 
  deleteDoc, 
  updateDoc,
  serverTimestamp,
  getDoc,
  increment
} from 'firebase/firestore';
import { toast } from 'react-hot-toast';

const Comments = ({ tripId, isOpen, onClose }) => {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [userProfiles, setUserProfiles] = useState({});
  const commentInputRef = useRef(null);
  const commentsEndRef = useRef(null);

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen && commentInputRef.current) {
      setTimeout(() => commentInputRef.current.focus(), 300);
    }
  }, [isOpen]);

  // Scroll to bottom when new comments are added
  useEffect(() => {
    commentsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [comments]);

  // Load comments when modal opens
  useEffect(() => {
    if (!isOpen || !tripId) return;

    const commentsRef = collection(db, 'comments');
    const q = query(
      commentsRef, 
      where('tripId', '==', tripId),
      orderBy('createdAt', 'asc')
    );

    const unsubscribe = onSnapshot(
      q, 
      (snapshot) => {
        const commentsData = [];
        const userEmails = new Set();

        snapshot.forEach((docSnap) => {
          const data = { id: docSnap.id, ...docSnap.data() };
          commentsData.push(data);
          if (data.userEmail) userEmails.add(data.userEmail);
        });

        setComments(commentsData);
        setLoading(false);

        // Fetch user profiles
        userEmails.forEach((email) => {
          fetchUserProfile(email);
        });
      },
      (error) => {
        console.error("Error fetching comments:", error);
        setLoading(false);
        toast.error("Failed to load comments");
      }
    );

    return () => unsubscribe();
  }, [isOpen, tripId]);

  // Fetch user profile
  const fetchUserProfile = async (userEmail) => {
    if (userProfiles[userEmail]) return; // already loaded

    try {
      // Use safe email as doc ID (replace '.' with '_')
      const safeEmail = userEmail.replace(/\./g, "_");
      const userDocRef = doc(db, "users", safeEmail);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        setUserProfiles((prev) => ({
          ...prev,
          [userEmail]: userDoc.data()
        }));
      } else {
        setUserProfiles((prev) => ({
          ...prev,
          [userEmail]: {
            displayName: userEmail.split('@')[0],
            email: userEmail,
            photoURL: null
          }
        }));
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
    }
  };

  // Add new comment
  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!user) {
      toast.error("Please sign in to add a comment");
      return;
    }
    if (!newComment.trim() || submitting) return;

    setSubmitting(true);

    try {
      if (!auth.currentUser) {
        toast.error("Firebase authentication not initialized. Please sign in again.");
        setSubmitting(false);
        return;
      }

      const tripRef = doc(db, "alltrips", tripId);
      const tripDoc = await getDoc(tripRef);

      if (!tripDoc.exists()) {
        toast.error("Trip not found");
        return;
      }

      await addDoc(collection(db, "comments"), {
        tripId,
        text: newComment.trim(),
        userEmail: user.email,
        userName: user.displayName || user.email.split('@')[0],
        userPhoto: user.photoURL || null,
        createdAt: serverTimestamp(),
        likes: []
      });

      await updateDoc(tripRef, {
        commentCount: increment(1)
      });

      setNewComment('');
      toast.success("Comment added");
    } catch (error) {
      console.error("Error adding comment:", error);
      toast.error("Failed to add comment");
    } finally {
      setSubmitting(false);
    }
  };

  // Delete comment
  const handleDeleteComment = async (commentId, commentUserEmail) => {
    if (!user) return;
    if (commentUserEmail !== user.email) {
      toast.error("You can only delete your own comments");
      return;
    }

    try {
      const commentRef = doc(db, "comments", commentId);
      await deleteDoc(commentRef);

      const tripRef = doc(db, "alltrips", tripId);
      await updateDoc(tripRef, {
        commentCount: increment(-1)
      });

      toast.success("Comment deleted");
    } catch (error) {
      console.error("Error deleting comment:", error);
      toast.error("Failed to delete comment");
    }
  };

  // Format timestamp
  const formatTime = (timestamp) => {
    if (!timestamp) return "Just now";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) return "Just now";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return date.toLocaleDateString();
  };

  // Get user info
  const getUserInfo = (comment) => {
    const profile = userProfiles[comment.userEmail];
    return {
      name: profile?.displayName || comment.userName || comment.userEmail?.split('@')[0] || "User",
      photo: profile?.photoURL || comment.userPhoto || null
    };
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div 
            className="bg-white w-full max-w-md max-h-[80vh] flex flex-col border border-gray-200"
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.9 }}
          >
            {/* Header */}
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <div>
                <p className="text-[10px] uppercase tracking-[0.2em] text-emerald-600 font-medium">Discussion</p>
                <h3 className="font-serif text-lg text-[#1a1a2e]">Comments</h3>
              </div>
              <button 
                className="p-2 hover:bg-[#f5f0eb] transition-colors"
                onClick={onClose}
              >
                <FaTimes className="text-gray-500" />
              </button>
            </div>
            
            {/* Comments */}
            <div className="overflow-y-auto flex-grow p-4">
              {loading ? (
                <div className="flex flex-col items-center justify-center h-32 gap-3">
                  <div className="w-[1px] h-8 bg-emerald-600 animate-pulse"></div>
                  <p className="text-[10px] uppercase tracking-[0.2em] text-gray-400">Loading</p>
                </div>
              ) : comments.length === 0 ? (
                <div className="text-center py-12 bg-[#f5f0eb]">
                  <p className="font-serif text-lg text-[#1a1a2e] mb-1">No Comments Yet</p>
                  <p className="text-[12px] text-gray-400 tracking-wide">Be the first to share your thoughts</p>
                </div>
              ) : (
                <>
                  {comments.map((comment) => {
                    const userInfo = getUserInfo(comment);
                    return (
                      <div key={comment.id} className="mb-4">
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 overflow-hidden bg-gray-200 flex-shrink-0">
                            {userInfo.photo ? (
                              <img 
                                src={userInfo.photo}
                                alt={userInfo.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full bg-[#1a1a2e] flex items-center justify-center text-white text-[11px] font-serif">
                                {userInfo.name.charAt(0).toUpperCase()}
                              </div>
                            )}
                          </div>
                          <div className="flex-grow">
                            <div className="bg-[#f5f0eb] px-4 py-2">
                              <p className="text-[11px] uppercase tracking-[0.1em] font-medium text-[#1a1a2e]">{userInfo.name}</p>
                              <p className="text-gray-700 text-sm mt-1">{comment.text}</p>
                            </div>
                            <div className="flex items-center mt-1 ml-1 text-[11px] text-gray-400 tracking-wide">
                              <FaRegClock className="mr-1" size={10} />
                              <span>{formatTime(comment.createdAt)}</span>
                              {user && comment.userEmail === user.email && (
                                <button 
                                  className="ml-2 text-red-400 hover:text-red-600"
                                  onClick={() => handleDeleteComment(comment.id, comment.userEmail)}
                                >
                                  <FaTrash size={10} />
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={commentsEndRef} />
                </>
              )}
            </div>
            
            {/* Comment form */}
            <div className="p-4 border-t border-gray-200">
              {user ? (
                <form onSubmit={handleSubmitComment} className="flex gap-2">
                  <input
                    ref={commentInputRef}
                    type="text"
                    placeholder="Add a comment..."
                    className="flex-grow p-2 border border-gray-200 text-sm focus:outline-none focus:border-[#1a1a2e] transition-colors"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                  />
                  <button 
                    type="submit"
                    disabled={!newComment.trim() || submitting}
                    className={`p-2 ${
                      !newComment.trim() || submitting
                        ? 'bg-gray-100 text-gray-300 cursor-not-allowed'
                        : 'bg-[#1a1a2e] text-white hover:bg-[#2a2a4e]'
                    } transition-colors`}
                  >
                    <FaPaperPlane />
                  </button>
                </form>
              ) : (
                <div className="text-center py-2 text-gray-400 text-[12px] uppercase tracking-[0.1em]">
                  Please sign in to comment
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Comments;
