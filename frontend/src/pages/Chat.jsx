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
        <div className="bg-white shadow-md rounded-xl p-8 text-center max-w-md">
          <div className="text-6xl mb-6 text-emerald-500">💬</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Sign in to chat</h2>
          <p className="text-gray-600 mb-6">
            Please sign in to chat with your followers and share trips.
          </p>
          <button 
            onClick={() => window.location.href = '/'}
            className="px-6 py-3 bg-emerald-600 text-white rounded-lg shadow-md hover:bg-emerald-700 transition-colors"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar Navigation */}
        <div className="md:w-64 bg-white shadow-md rounded-xl p-4 h-fit">
          <h2 className="text-xl font-bold text-gray-800 mb-6 border-b pb-3">
            Social Hub
          </h2>
          
          <div className="flex flex-col gap-2">
            <button
              onClick={() => setView('chat')}
              className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                view === 'chat' 
                ? 'bg-emerald-50 text-emerald-700' 
                : 'hover:bg-gray-100 text-gray-700'
              }`}
            >
              <FaComment size={18} />
              <span className="font-medium">Messages</span>
            </button>
            
            <button
              onClick={() => setView('followers')}
              className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                view === 'followers' 
                ? 'bg-emerald-50 text-emerald-700' 
                : 'hover:bg-gray-100 text-gray-700'
              }`}
            >
              <FaUsers size={18} />
              <span className="font-medium">Followers</span>
            </button>
          </div>
        </div>
        
        {/* Main Content */}
        <div className="flex-1">
          <div className="bg-white shadow-md rounded-xl overflow-hidden min-h-[70vh]">
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
    </div>
  );
};

export default Chat;
