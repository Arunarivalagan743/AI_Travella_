import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../ModelWork/firebaseConfig';
import { useAuth } from '../context/AuthContext';
import ChatInterface from '../components/ui/custom/ChatInterface';
import FollowersList from '../components/ui/custom/FollowersList';
import { motion } from 'framer-motion';
import { FaComment, FaUsers } from 'react-icons/fa';

const Chat = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [view, setView] = useState('chat'); // 'chat' or 'followers'
  const [selectedUser, setSelectedUser] = useState(null);
  const [sharedTrip, setSharedTrip] = useState(null);
  
  useEffect(() => {
    // Check if there's a shared trip or selected user from navigation state
    if (location.state) {
      if (location.state.selectedUserId) {
        setSelectedUser(location.state.selectedUserId);
      }
      
      if (location.state.sharedTripId) {
        fetchTripDetails(location.state.sharedTripId);
      }
    }
  }, [location]);
  
  const fetchTripDetails = async (tripId) => {
    try {
      const tripDoc = await getDoc(doc(db, 'alltrips', tripId));
      if (tripDoc.exists()) {
        setSharedTrip({
          id: tripDoc.id,
          ...tripDoc.data()
        });
      }
    } catch (error) {
      console.error("Error fetching trip details:", error);
    }
  };
  
  const handleSelectUser = (userData) => {
    setSelectedUser(userData.email);
    setView('chat');
  };
  
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <div className="bg-white border border-gray-200 p-10 text-center max-w-md">
          <div className="text-4xl mb-5 text-[#1a1a2e]">💬</div>
          <h2 className="font-serif text-2xl text-[#1a1a2e] mb-2">Sign in to chat</h2>
          <div className="w-10 h-[2px] bg-emerald-600 mx-auto mb-4"></div>
          <p className="text-gray-500 text-sm tracking-wide mb-6">
            Please sign in to chat with your followers and share trips.
          </p>
          <button 
            onClick={() => window.location.href = '/'}
            className="px-6 py-3 bg-[#1a1a2e] hover:bg-[#2a2a4e] text-white text-[11px] uppercase tracking-[0.2em] font-medium transition-colors"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Dark banner header */}
      <div className="bg-[#1a1a2e] py-8 sm:py-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <span className="text-[11px] uppercase tracking-[0.25em] text-white/50 font-medium">Community</span>
          <h1 className="font-serif text-2xl sm:text-3xl text-white mt-1">Social Hub</h1>
          <div className="w-12 h-[2px] bg-emerald-600 mt-3"></div>
          
          {/* LP-style tabs */}
          <div className="flex items-center gap-8 mt-6 border-t border-white/10 pt-4">
            <button
              onClick={() => setView('chat')}
              className={`flex items-center gap-2 text-[12px] uppercase tracking-[0.2em] font-medium pb-2 transition-colors border-b-2 ${
                view === 'chat' 
                  ? 'text-white border-emerald-600' 
                  : 'text-white/50 border-transparent hover:text-white/80'
              }`}
            >
              <FaComment size={11} />
              <span>Messages</span>
            </button>
            
            <button
              onClick={() => setView('followers')}
              className={`flex items-center gap-2 text-[12px] uppercase tracking-[0.2em] font-medium pb-2 transition-colors border-b-2 ${
                view === 'followers' 
                  ? 'text-white border-emerald-600' 
                  : 'text-white/50 border-transparent hover:text-white/80'
              }`}
            >
              <FaUsers size={11} />
              <span>Followers</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="bg-white border border-gray-200 overflow-hidden min-h-[70vh]">
          {view === 'chat' ? (
            <div className="h-full">
              <ChatInterface 
                isOpen={true} 
                onClose={() => {}} 
                selectedUserId={selectedUser}
                sharedTrip={sharedTrip}
                embedded={true}
              />
            </div>
          ) : (
            <div className="p-6">
              <FollowersList 
                onClose={() => setView('chat')}
                showBackButton={false}
                onChatStart={handleSelectUser}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Chat;
