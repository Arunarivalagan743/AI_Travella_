import React, { useState, useEffect } from 'react';
import { doc, getDoc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db } from '../ModelWork/firebaseConfig';
import { useAuth } from '../context/AuthContext';
import { FaUserCheck, FaTimesCircle, FaArrowLeft, FaHourglassHalf } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

function FollowerRequests() {
  const { user } = useAuth();
  const [receivedRequests, setReceivedRequests] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const [userProfiles, setUserProfiles] = useState({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('received');

  // Fetch follow requests
  useEffect(() => {
    if (!user) return;

    const fetchFollowRequests = async () => {
      try {
        setLoading(true);
        const userDocRef = doc(db, "users", user.email);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          const userData = userDoc.data();
          const received = userData.followRequestsReceived || [];
          const sent = userData.followRequestsSent || [];

          setReceivedRequests(received);
          setSentRequests(sent);
          
          // Fetch profiles for all users
          const allUsers = [...new Set([...received, ...sent])];
          await fetchUserProfiles(allUsers);
        }
      } catch (error) {
        console.error("Error fetching follow requests:", error);
        toast.error("Failed to load follow requests");
      } finally {
        setLoading(false);
      }
    };

    fetchFollowRequests();
  }, [user]);

  // Fetch user profiles for emails
  const fetchUserProfiles = async (emails) => {
    try {
      const profiles = {};
      
      await Promise.all(emails.map(async (email) => {
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
      
      setUserProfiles(profiles);
    } catch (error) {
      console.error("Error fetching user profiles:", error);
    }
  };

  // Accept follow request
  const acceptRequest = async (requesterEmail) => {
    if (!user) return;

    try {
      // Update current user's document
      const currentUserRef = doc(db, "users", user.email);
      await updateDoc(currentUserRef, {
        followRequestsReceived: arrayRemove(requesterEmail),
        followers: arrayUnion(requesterEmail)
      });

      // Update requester's document
      const requesterRef = doc(db, "users", requesterEmail);
      await updateDoc(requesterRef, {
        followRequestsSent: arrayRemove(user.email),
        following: arrayUnion(user.email)
      });

      // Update local state
      setReceivedRequests(prev => prev.filter(email => email !== requesterEmail));
      toast.success("Follow request accepted");
    } catch (error) {
      console.error("Error accepting follow request:", error);
      toast.error("Failed to accept request");
    }
  };

  // Reject follow request
  const rejectRequest = async (requesterEmail) => {
    if (!user) return;

    try {
      // Update current user's document
      const currentUserRef = doc(db, "users", user.email);
      await updateDoc(currentUserRef, {
        followRequestsReceived: arrayRemove(requesterEmail)
      });

      // Update requester's document
      const requesterRef = doc(db, "users", requesterEmail);
      await updateDoc(requesterRef, {
        followRequestsSent: arrayRemove(user.email)
      });

      // Update local state
      setReceivedRequests(prev => prev.filter(email => email !== requesterEmail));
      toast.success("Follow request rejected");
    } catch (error) {
      console.error("Error rejecting follow request:", error);
      toast.error("Failed to reject request");
    }
  };

  // Cancel sent request
  const cancelRequest = async (targetEmail) => {
    if (!user) return;

    try {
      // Update current user's document
      const currentUserRef = doc(db, "users", user.email);
      await updateDoc(currentUserRef, {
        followRequestsSent: arrayRemove(targetEmail)
      });

      // Update target user's document
      const targetRef = doc(db, "users", targetEmail);
      await updateDoc(targetRef, {
        followRequestsReceived: arrayRemove(user.email)
      });

      // Update local state
      setSentRequests(prev => prev.filter(email => email !== targetEmail));
      toast.success("Follow request cancelled");
    } catch (error) {
      console.error("Error cancelling follow request:", error);
      toast.error("Failed to cancel request");
    }
  };

  if (!user) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <p className="text-gray-600">Please sign in to view follower requests</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-8">
      <div className="mb-8 flex items-center gap-4">
        <Link to="/">
          <motion.button
            className="flex items-center gap-2 text-gray-600 hover:text-emerald-600 transition-colors"
            whileHover={{ x: -3 }}
          >
            <FaArrowLeft size={14} />
            <span>Back</span>
          </motion.button>
        </Link>
        <h1 className="text-3xl font-bold text-gray-800">Follower Requests</h1>
      </div>

      {/* Tab navigation */}
      <div className="border-b border-gray-200 mb-6">
        <div className="flex space-x-8">
          <button
            className={`pb-3 px-2 font-medium text-sm ${
              activeTab === 'received'
                ? 'border-b-2 border-emerald-500 text-emerald-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('received')}
          >
            Requests Received
          </button>
          <button
            className={`pb-3 px-2 font-medium text-sm ${
              activeTab === 'sent'
                ? 'border-b-2 border-emerald-500 text-emerald-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('sent')}
          >
            Requests Sent
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-emerald-500 border-t-transparent"></div>
        </div>
      ) : activeTab === 'received' ? (
        <div>
          {receivedRequests.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <p className="text-gray-600">No pending follow requests</p>
            </div>
          ) : (
            <ul className="space-y-4">
              {receivedRequests.map((email) => {
                const profile = userProfiles[email] || { displayName: email.split('@')[0], photoURL: null };
                
                return (
                  <li key={email} className="bg-white rounded-lg shadow-sm p-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-100 border border-gray-200">
                        {profile.photoURL ? (
                          <img src={profile.photoURL} alt={profile.displayName} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            <FaUserCircle size={30} />
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{profile.displayName}</p>
                        <p className="text-sm text-gray-500">{email}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => acceptRequest(email)}
                        className="px-3 py-1.5 bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-200 transition-colors flex items-center gap-1"
                      >
                        <FaUserCheck size={14} />
                        <span>Accept</span>
                      </button>
                      <button
                        onClick={() => rejectRequest(email)}
                        className="px-3 py-1.5 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors flex items-center gap-1"
                      >
                        <FaTimesCircle size={14} />
                        <span>Reject</span>
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      ) : (
        <div>
          {sentRequests.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <p className="text-gray-600">No pending requests sent</p>
            </div>
          ) : (
            <ul className="space-y-4">
              {sentRequests.map((email) => {
                const profile = userProfiles[email] || { displayName: email.split('@')[0], photoURL: null };
                
                return (
                  <li key={email} className="bg-white rounded-lg shadow-sm p-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-100 border border-gray-200">
                        {profile.photoURL ? (
                          <img src={profile.photoURL} alt={profile.displayName} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            <FaUserCircle size={30} />
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{profile.displayName}</p>
                        <p className="text-sm text-gray-500">{email}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <div className="flex items-center gap-1.5 text-yellow-600 text-sm">
                        <FaHourglassHalf size={14} />
                        <span>Pending</span>
                      </div>
                      <button
                        onClick={() => cancelRequest(email)}
                        className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                      >
                        Withdraw
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

export default FollowerRequests;
