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
        <div className="text-center">
          <p className="font-serif text-xl text-[#1a1a2e] mb-2">Sign In Required</p>
          <div className="w-10 h-[2px] bg-emerald-600 mx-auto mb-3"></div>
          <p className="text-gray-500 text-sm tracking-wide">Please sign in to view follower requests</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Dark banner header */}
      <div className="bg-[#1a1a2e] py-12 sm:py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <Link to="/" className="inline-flex items-center gap-2 text-white/50 hover:text-white text-[11px] uppercase tracking-[0.2em] font-medium transition-colors mb-6">
            <FaArrowLeft size={10} />
            <span>Back</span>
          </Link>
          <span className="block text-[11px] uppercase tracking-[0.25em] text-white/50 font-medium">Connections</span>
          <h1 className="font-serif text-3xl sm:text-4xl text-white mt-2">Follower Requests</h1>
          <div className="w-12 h-[2px] bg-emerald-600 mt-3"></div>

          {/* LP-style tabs */}
          <div className="flex items-center gap-8 mt-8 border-t border-white/10 pt-4">
            <button
              className={`text-[12px] uppercase tracking-[0.2em] font-medium pb-2 transition-colors border-b-2 ${
                activeTab === 'received'
                  ? 'text-white border-emerald-600'
                  : 'text-white/50 border-transparent hover:text-white/80'
              }`}
              onClick={() => setActiveTab('received')}
            >
              Received
            </button>
            <button
              className={`text-[12px] uppercase tracking-[0.2em] font-medium pb-2 transition-colors border-b-2 ${
                activeTab === 'sent'
                  ? 'text-white border-emerald-600'
                  : 'text-white/50 border-transparent hover:text-white/80'
              }`}
              onClick={() => setActiveTab('sent')}
            >
              Sent
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">

      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 gap-4">
          <div className="w-[1px] h-10 bg-emerald-600 animate-pulse"></div>
          <span className="text-[11px] uppercase tracking-[0.25em] text-gray-400 font-medium">Loading requests</span>
        </div>
      ) : activeTab === 'received' ? (
        <div>
          {receivedRequests.length === 0 ? (
            <div className="text-center py-16 bg-[#f5f0eb]">
              <p className="font-serif text-xl text-[#1a1a2e] mb-2">No pending requests</p>
              <div className="w-10 h-[2px] bg-emerald-600 mx-auto mb-3"></div>
              <p className="text-gray-500 text-sm tracking-wide">You have no follow requests at this time.</p>
            </div>
          ) : (
            <ul className="space-y-3">
              {receivedRequests.map((email) => {
                const profile = userProfiles[email] || { displayName: email.split('@')[0], photoURL: null };
                
                return (
                  <li key={email} className="bg-white border border-gray-200 p-4 sm:p-5 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-11 h-11 rounded-full overflow-hidden bg-gray-100 border border-gray-200">
                        {profile.photoURL ? (
                          <img src={profile.photoURL} alt={profile.displayName} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400 text-lg font-serif">
                            {(profile.displayName || '?')[0].toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-[#1a1a2e] text-sm">{profile.displayName}</p>
                        <p className="text-[11px] uppercase tracking-[0.1em] text-gray-400">{email}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => acceptRequest(email)}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] uppercase tracking-[0.15em] font-medium transition-colors flex items-center gap-1.5"
                      >
                        <FaUserCheck size={11} />
                        <span>Accept</span>
                      </button>
                      <button
                        onClick={() => rejectRequest(email)}
                        className="px-4 py-2 border border-gray-200 text-gray-600 hover:bg-gray-50 text-[11px] uppercase tracking-[0.15em] font-medium transition-colors flex items-center gap-1.5"
                      >
                        <FaTimesCircle size={11} />
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
            <div className="text-center py-16 bg-[#f5f0eb]">
              <p className="font-serif text-xl text-[#1a1a2e] mb-2">No sent requests</p>
              <div className="w-10 h-[2px] bg-emerald-600 mx-auto mb-3"></div>
              <p className="text-gray-500 text-sm tracking-wide">You haven't sent any follow requests.</p>
            </div>
          ) : (
            <ul className="space-y-3">
              {sentRequests.map((email) => {
                const profile = userProfiles[email] || { displayName: email.split('@')[0], photoURL: null };
                
                return (
                  <li key={email} className="bg-white border border-gray-200 p-4 sm:p-5 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-11 h-11 rounded-full overflow-hidden bg-gray-100 border border-gray-200">
                        {profile.photoURL ? (
                          <img src={profile.photoURL} alt={profile.displayName} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400 text-lg font-serif">
                            {(profile.displayName || '?')[0].toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-[#1a1a2e] text-sm">{profile.displayName}</p>
                        <p className="text-[11px] uppercase tracking-[0.1em] text-gray-400">{email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-[0.1em] text-amber-600 font-medium">
                        <FaHourglassHalf size={10} />
                        <span>Pending</span>
                      </div>
                      <button
                        onClick={() => cancelRequest(email)}
                        className="px-4 py-2 border border-gray-200 text-gray-600 hover:bg-gray-50 text-[11px] uppercase tracking-[0.15em] font-medium transition-colors"
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
    </div>
  );
}

export default FollowerRequests;
