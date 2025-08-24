import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '/src/ModelWork/firebaseConfig.js';
import { useAuth } from '@/context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { FaShare, FaTimes, FaUser, FaCheck } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import ChatInterface from './ChatInterface';

const TripShareButton = ({ trip }) => {
  const { user } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [followers, setFollowers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Load followers when modal opens
  useEffect(() => {
    if (isModalOpen) {
      loadFollowers();
    }
  }, [isModalOpen]);
  
  // Function to load the current user's followers
  const loadFollowers = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Get users who follow the current user
      const q = query(
        collection(db, "followers"),
        where("followedUserId", "==", user.email)
      );
      
      const querySnapshot = await getDocs(q);
      const followersList = [];
      
      // Get detailed user info for each follower
      for (const doc of querySnapshot.docs) {
        const followerData = doc.data();
        const userDocRef = await getDocs(
          query(collection(db, "users"), where("email", "==", followerData.userId))
        );
        
        if (!userDocRef.empty) {
          const userData = userDocRef.docs[0].data();
          followersList.push({
            id: doc.id,
            userId: followerData.userId,
            displayName: userData.displayName || followerData.userId,
            photoURL: userData.photoURL || null,
            email: followerData.userId // Email is the userId
          });
        } else {
          followersList.push({
            id: doc.id,
            userId: followerData.userId,
            displayName: followerData.userId,
            email: followerData.userId
          });
        }
      }
      
      setFollowers(followersList);
    } catch (error) {
      console.error("Error loading followers:", error);
      toast.error("Failed to load followers");
    }
    setLoading(false);
  };
  
  // Function to handle selecting a user to share with
  const handleSelectUser = (follower) => {
    setSelectedUser(follower.userId);
    setIsChatOpen(true);
    setIsModalOpen(false);
  };
  
  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className="flex items-center gap-1 px-3 py-1 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full text-sm"
      >
        <FaShare size={14} />
        <span>Share</span>
      </button>
      
      {/* Followers Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsModalOpen(false)}
          >
            <motion.div 
              className="bg-white rounded-lg shadow-xl w-full max-w-sm"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-4 border-b">
                <h2 className="text-lg font-semibold">Share Trip With</h2>
                <button 
                  className="p-2 rounded-full hover:bg-gray-100"
                  onClick={() => setIsModalOpen(false)}
                >
                  <FaTimes />
                </button>
              </div>
              
              <div className="p-4 max-h-80 overflow-y-auto">
                {loading ? (
                  <div className="flex justify-center items-center h-32">
                    <div className="w-8 h-8 border-4 border-gray-200 border-t-emerald-500 rounded-full animate-spin"></div>
                  </div>
                ) : followers.length === 0 ? (
                  <div className="text-center py-6 text-gray-500">
                    <p>No followers yet</p>
                    <p className="text-sm mt-2">You need followers to share trips</p>
                  </div>
                ) : (
                  <ul className="divide-y">
                    {followers.map(follower => (
                      <li key={follower.id} className="py-3">
                        <button 
                          className="w-full flex items-center hover:bg-gray-50 p-2 rounded"
                          onClick={() => handleSelectUser(follower)}
                        >
                          <div className="w-10 h-10 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mr-3">
                            {follower.photoURL ? (
                              <img 
                                src={follower.photoURL} 
                                alt={follower.displayName}
                                className="w-10 h-10 rounded-full object-cover"
                              />
                            ) : (
                              <FaUser />
                            )}
                          </div>
                          <div className="flex-1 text-left">
                            <div className="font-medium">{follower.displayName}</div>
                            <div className="text-sm text-gray-600">{follower.email}</div>
                          </div>
                          <FaShare className="text-emerald-500" />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Chat Interface */}
      <ChatInterface 
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        selectedUserId={selectedUser}
        sharedTrip={trip}
      />
    </>
  );
};

export default TripShareButton;
