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
        className="flex items-center gap-1 px-3 py-1 bg-[#1a1a2e] hover:bg-[#2a2a4e] text-white text-[11px] uppercase tracking-[0.1em] font-medium transition-colors"
      >
        <FaShare size={12} />
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
              className="bg-white border border-gray-200 w-full max-w-sm"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.2em] text-emerald-600 font-medium">Share</p>
                  <h2 className="font-serif text-lg text-[#1a1a2e]">Share Trip With</h2>
                </div>
                <button 
                  className="p-2 hover:bg-[#f5f0eb] transition-colors"
                  onClick={() => setIsModalOpen(false)}
                >
                  <FaTimes className="text-gray-400" />
                </button>
              </div>
              
              <div className="p-4 max-h-80 overflow-y-auto">
                {loading ? (
                  <div className="flex flex-col items-center justify-center h-32 gap-3">
                    <div className="w-[1px] h-8 bg-emerald-600 animate-pulse"></div>
                    <p className="text-[10px] uppercase tracking-[0.2em] text-gray-400">Loading</p>
                  </div>
                ) : followers.length === 0 ? (
                  <div className="text-center py-6">
                    <p className="font-serif text-[#1a1a2e]">No Followers</p>
                    <p className="text-[12px] text-gray-400 mt-1 tracking-wide">You need followers to share trips</p>
                  </div>
                ) : (
                  <ul className="divide-y divide-gray-100">
                    {followers.map(follower => (
                      <li key={follower.id} className="py-3">
                        <button 
                          className="w-full flex items-center hover:bg-[#f5f0eb] p-2 transition-colors"
                          onClick={() => handleSelectUser(follower)}
                        >
                          <div className="w-10 h-10 bg-[#f5f0eb] text-[#1a1a2e] flex items-center justify-center mr-3 overflow-hidden">
                            {follower.photoURL ? (
                              <img 
                                src={follower.photoURL} 
                                alt={follower.displayName}
                                className="w-10 h-10 object-cover"
                              />
                            ) : (
                              <span className="font-serif text-sm">{(follower.displayName || '?').charAt(0).toUpperCase()}</span>
                            )}
                          </div>
                          <div className="flex-1 text-left">
                            <div className="text-[13px] font-medium text-[#1a1a2e]">{follower.displayName}</div>
                            <div className="text-[11px] text-gray-400">{follower.email}</div>
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
