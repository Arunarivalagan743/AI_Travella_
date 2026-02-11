import React, { useState, useEffect, useRef } from 'react';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  addDoc, 
  getDocs, 
  doc, 
  getDoc, 
  onSnapshot, 
  serverTimestamp, 
  updateDoc 
} from 'firebase/firestore';
import { db } from '/src/ModelWork/firebaseConfig.js';
import { useAuth } from '@/context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes, FaPaperPlane, FaUser, FaArrowLeft } from 'react-icons/fa';
import { toast } from 'react-hot-toast';

function ChatInterface({ 
  isOpen, 
  onClose, 
  selectedUserId = null, 
  sharedTrip = null,
  embedded = false 
}) {
  const { user } = useAuth();
  const [message, setMessage] = useState('');
  const [conversations, setConversations] = useState([]);
  const [currentChat, setCurrentChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [chatView, setChatView] = useState('conversations'); // 'conversations' or 'messages'
  const [userProfiles, setUserProfiles] = useState({});
  const [tripToShare, setTripToShare] = useState(sharedTrip);
  const messagesEndRef = useRef(null);

  // Effect to load conversations on component mount
  useEffect(() => {
    if (user && isOpen) {
      try {
        loadConversations();
      } catch (error) {
        console.error("Error in loadConversations:", error);
        if (error.code === 'permission-denied') {
          toast.error("Permission denied: Chat feature needs updated security rules");
        }
      }
    }
  }, [user, isOpen]);

  // Effect to handle selected user from outside (e.g., from followers list)
  useEffect(() => {
    if (selectedUserId && isOpen) {
      handleSelectChat(selectedUserId);
    }
  }, [selectedUserId, isOpen]);

  // Effect to scroll to bottom of messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Effect to load user profiles
  useEffect(() => {
    const userIds = new Set();
    
    // Add conversation participants
    conversations.forEach(conv => {
      if (conv.participants) {
        conv.participants.forEach(id => userIds.add(id));
      }
    });
    
    // Add message senders
    messages.forEach(msg => {
      if (msg.sender) userIds.add(msg.sender);
    });
    
    // Add selected user if any
    if (selectedUserId) userIds.add(selectedUserId);
    
    // Remove current user
    if (user) userIds.delete(user.email);
    
    // Fetch profiles
    userIds.forEach(id => {
      fetchUserProfile(id);
    });
  }, [conversations, messages, selectedUserId]);

  // Function to fetch user profile
  const fetchUserProfile = async (userId) => {
    if (userProfiles[userId] || !userId) return;
    
    try {
      const userDoc = await getDoc(doc(db, "users", userId));
      if (userDoc.exists()) {
        setUserProfiles(prev => ({
          ...prev,
          [userId]: userDoc.data()
        }));
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
    }
  };

  // Load conversations for the current user
  const loadConversations = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const q = query(
        collection(db, "conversations"),
        where("participants", "array-contains", user.email),
        orderBy("lastMessageTime", "desc")
      );
      
      // Set up real-time listener
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const conversationList = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setConversations(conversationList);
        setLoading(false);
      }, (error) => {
        console.error("Error in conversations snapshot:", error);
        if (error.code === 'permission-denied') {
          toast.error("Permission denied: Chat feature needs updated security rules");
          setConversations([]);
        }
        setLoading(false);
      });
      
      // Return unsubscribe function to clean up listener
      return unsubscribe;
    } catch (error) {
      console.error("Error loading conversations:", error);
      toast.error("Failed to load conversations");
      setLoading(false);
    }
  };

  // Function to handle selecting a conversation
  const handleSelectChat = async (userId) => {
    if (!user || !userId) return;
    
    try {
      // Find if conversation already exists
      const q = query(
        collection(db, "conversations"),
        where("participants", "array-contains", user.email)
      );
      
      const querySnapshot = await getDocs(q);
      let existingConversation = null;
      
      querySnapshot.forEach(doc => {
        const convData = doc.data();
        if (convData.participants.includes(userId)) {
          existingConversation = {
            id: doc.id,
            ...convData
          };
        }
      });
      
      // Create new conversation if it doesn't exist
      if (!existingConversation) {
        const newConversationRef = await addDoc(collection(db, "conversations"), {
          participants: [user.email, userId],
          lastMessage: "",
          lastMessageTime: serverTimestamp(),
          createdAt: serverTimestamp()
        });
        
        existingConversation = {
          id: newConversationRef.id,
          participants: [user.email, userId],
          lastMessage: "",
          lastMessageTime: new Date(),
          createdAt: new Date()
        };
      }
      
      // Set current chat and load messages
      setCurrentChat(existingConversation);
      setChatView('messages');
      
      // Load messages for this conversation
      loadMessages(existingConversation.id);
      
      // Make sure we have the other user's profile
      const otherUserId = existingConversation.participants.find(id => id !== user.email);
      fetchUserProfile(otherUserId);
      
    } catch (error) {
      console.error("Error selecting conversation:", error);
      toast.error("Failed to load chat");
    }
  };

  // Function to load messages for the current conversation
  const loadMessages = (conversationId) => {
    if (!conversationId) return;
    
    try {
      const q = query(
        collection(db, "conversations", conversationId, "messages"),
        orderBy("timestamp", "asc")
      );
      
      // Set up real-time listener
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const messageList = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          timestamp: doc.data().timestamp?.toDate() || new Date()
        }));
        setMessages(messageList);
      }, (error) => {
        console.error("Error in messages snapshot:", error);
        if (error.code === 'permission-denied') {
          toast.error("Permission denied: Chat feature needs updated security rules");
          setMessages([]);
        }
      });
      
      // Return unsubscribe function to clean up listener
      return unsubscribe;
    } catch (error) {
      console.error("Error loading messages:", error);
      toast.error("Failed to load messages");
    }
  };

  // Function to send a message
  const sendMessage = async (e) => {
    e.preventDefault();
    
    if ((!message.trim() && !tripToShare) || !currentChat || !user) return;
    
    try {
      // Prepare message content
      const messageContent = {
        text: message.trim(),
        sender: user.email,
        timestamp: serverTimestamp(),
        read: false
      };
      
      // Add shared trip data if available
      if (tripToShare) {
        messageContent.tripData = {
          id: tripToShare.id,
          title: tripToShare.title || tripToShare.name,
          description: tripToShare.description || '',
          image: tripToShare.image || '',
          type: 'shared_trip'
        };
      }
      
      // Add message to messages collection
      await addDoc(
        collection(db, "conversations", currentChat.id, "messages"),
        messageContent
      );
      
      // Update conversation with last message info
      const lastMessageText = tripToShare 
        ? `Shared a trip: ${tripToShare.title || tripToShare.name}` 
        : message.trim();
        
      await updateDoc(doc(db, "conversations", currentChat.id), {
        lastMessage: lastMessageText,
        lastMessageTime: serverTimestamp()
      });
      
      // Clear input and shared trip
      setMessage('');
      setTripToShare(null);
      
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message");
    }
  };

  // Function to get the other user in a conversation
  const getOtherParticipant = (conversation) => {
    if (!user || !conversation || !conversation.participants) return null;
    return conversation.participants.find(p => p !== user.email);
  };

  // Format timestamp
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return '';
    
    const date = new Date(timestamp);
    const now = new Date();
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return date.toLocaleDateString([], { weekday: 'short' });
    } else {
      return date.toLocaleDateString();
    }
  };

  // UI Components
  if (!embedded && !isOpen) return null;

  // Content component to avoid duplication
  const ChatContent = () => (
    <>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        {chatView === 'messages' && (
          <button 
            className="p-2 hover:bg-[#f5f0eb] transition-colors"
            onClick={() => setChatView('conversations')}
          >
            <FaArrowLeft className="text-gray-500" />
          </button>
        )}
        <h2 className="text-[12px] uppercase tracking-[0.15em] font-medium text-[#1a1a2e] flex-1 text-center">
          {chatView === 'conversations' ? 'Messages' : 
            (currentChat && getOtherParticipant(currentChat) ? 
              userProfiles[getOtherParticipant(currentChat)]?.displayName || getOtherParticipant(currentChat) 
              : 'Chat'
            )
          }
        </h2>
        {!embedded && (
          <button 
            className="p-2 hover:bg-[#f5f0eb] transition-colors"
            onClick={onClose}
          >
            <FaTimes className="text-gray-500" />
          </button>
        )}
      </div>
      
      {/* Content - Conversations List */}
      {chatView === 'conversations' && (
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-32 gap-3">
              <div className="w-[1px] h-8 bg-emerald-600 animate-pulse"></div>
              <p className="text-[10px] uppercase tracking-[0.2em] text-gray-400">Loading</p>
            </div>
          ) : conversations.length === 0 ? (
            <div className="text-center p-6">
              <p className="font-serif text-lg text-[#1a1a2e]">No Conversations</p>
              <p className="text-[12px] text-gray-400 mt-1 tracking-wide">Your chats will appear here</p>
            </div>
          ) : (
            <ul>
              {conversations.map(conv => {
                const otherUser = getOtherParticipant(conv);
                const profile = userProfiles[otherUser] || {};
                
                return (
                  <li key={conv.id}>
                    <button 
                      className="w-full p-3 flex items-center hover:bg-[#f5f0eb] border-b border-gray-100 transition-colors"
                      onClick={() => {
                        setCurrentChat(conv);
                        setChatView('messages');
                        loadMessages(conv.id);
                      }}
                    >
                      <div className="w-10 h-10 bg-[#f5f0eb] text-[#1a1a2e] flex items-center justify-center mr-3 overflow-hidden">
                        {profile.photoURL ? (
                          <img 
                            src={profile.photoURL} 
                            alt={profile.displayName || otherUser}
                            className="w-10 h-10 object-cover"
                          />
                        ) : (
                          <span className="font-serif text-sm">{(profile.displayName || otherUser || '?').charAt(0).toUpperCase()}</span>
                        )}
                      </div>
                      <div className="flex-1 text-left">
                        <div className="text-[12px] font-medium text-[#1a1a2e] tracking-wide">
                          {profile.displayName || otherUser}
                        </div>
                        <div className="text-[11px] text-gray-400 truncate">
                          {conv.lastMessage || 'Start a conversation'}
                        </div>
                      </div>
                      {conv.lastMessageTime && (
                        <div className="text-[10px] text-gray-400 tracking-wide">
                          {formatTimestamp(conv.lastMessageTime.toDate ? conv.lastMessageTime.toDate() : conv.lastMessageTime)}
                        </div>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
      
      {/* Content - Message View */}
      {chatView === 'messages' && currentChat && (
        <>
          <div className="flex-1 overflow-y-auto p-4" style={{ maxHeight: embedded ? undefined : 'calc(80vh - 120px)' }}>
            {messages.length === 0 ? (
              <div className="text-center py-8">
                <p className="font-serif text-lg text-[#1a1a2e]">No Messages</p>
                <p className="text-[12px] text-gray-400 mt-1 tracking-wide">Start the conversation</p>
              </div>
            ) : (
              <>
                {messages.map((msg) => {
                  const isCurrentUser = msg.sender === user.email;
                  
                  return (
                    <div 
                      key={msg.id} 
                      className={`mb-4 flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
                    >
                      <div 
                        className={`px-4 py-2 max-w-[80%] break-words ${
                          isCurrentUser 
                            ? 'bg-[#1a1a2e] text-white' 
                            : 'bg-[#f5f0eb] text-gray-800'
                        }`}
                      >
                        {/* Regular text message */}
                        {msg.text && <p className="text-sm">{msg.text}</p>}
                        
                        {/* Shared trip */}
                        {msg.tripData && (
                          <div className={`mt-2 p-3 ${
                            isCurrentUser ? 'bg-[#2a2a4e]' : 'bg-white border border-gray-200'
                          }`}>
                            <div className="flex items-center">
                              {msg.tripData.image ? (
                                <img 
                                  src={msg.tripData.image} 
                                  alt={msg.tripData.title} 
                                  className="w-12 h-12 object-cover mr-3"
                                />
                              ) : (
                                <div className={`w-12 h-12 flex items-center justify-center mr-3 ${
                                  isCurrentUser ? 'bg-[#1a1a2e] text-white' : 'bg-[#f5f0eb] text-[#1a1a2e]'
                                }`}>
                                  <span className="text-[10px] uppercase tracking-wider">Trip</span>
                                </div>
                              )}
                              <div>
                                <p className={`font-medium text-sm ${isCurrentUser ? 'text-white' : 'text-[#1a1a2e]'}`}>
                                  {msg.tripData.title}
                                </p>
                                <p className={`text-[10px] uppercase tracking-[0.1em] ${isCurrentUser ? 'text-gray-300' : 'text-gray-400'}`}>
                                  Shared Trip
                                </p>
                              </div>
                            </div>
                            {msg.tripData.description && (
                              <p className={`text-[12px] mt-2 ${isCurrentUser ? 'text-gray-300' : 'text-gray-500'}`}>
                                {msg.tripData.description.substring(0, 100)}
                                {msg.tripData.description.length > 100 ? '...' : ''}
                              </p>
                            )}
                            <a 
                              href={`/show_trip/trip_id/${msg.tripData.id}`}
                              target="_blank" 
                              rel="noopener noreferrer"
                              className={`text-[11px] uppercase tracking-[0.1em] mt-2 inline-block py-1 px-3 ${
                                isCurrentUser 
                                  ? 'bg-white text-[#1a1a2e] hover:bg-gray-100' 
                                  : 'bg-[#1a1a2e] text-white hover:bg-[#2a2a4e]'
                              } transition-colors`}
                            >
                              View Trip
                            </a>
                          </div>
                        )}
                        
                        {/* Timestamp */}
                        <div 
                          className={`text-[10px] mt-1 tracking-wide ${
                            isCurrentUser ? 'text-gray-400' : 'text-gray-400'
                          }`}
                        >
                          {formatTimestamp(msg.timestamp)}
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>
          
          {/* Trip Sharing Preview */}
          {tripToShare && (
            <div className="border-t border-gray-200 p-3">
              <div className="bg-[#f5f0eb] border border-gray-200 p-3 flex items-center justify-between">
                <div className="flex items-center">
                  {tripToShare.image ? (
                    <img 
                      src={tripToShare.image} 
                      alt={tripToShare.title || tripToShare.name} 
                      className="w-12 h-12 object-cover mr-3"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-[#1a1a2e] flex items-center justify-center mr-3">
                      <span className="text-white text-[10px] uppercase tracking-wider">Trip</span>
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-medium text-[#1a1a2e]">{tripToShare.title || tripToShare.name}</p>
                    <p className="text-[10px] uppercase tracking-[0.1em] text-gray-400">Trip to share</p>
                  </div>
                </div>
                <button 
                  type="button" 
                  className="text-gray-400 hover:text-gray-600"
                  onClick={() => setTripToShare(null)}
                >
                  <FaTimes />
                </button>
              </div>
            </div>
          )}
          
          {/* Message Input */}
          <form onSubmit={sendMessage} className="border-t border-gray-200 p-3 flex">
            <input
              type="text"
              placeholder={tripToShare ? "Add a message with your trip..." : "Type a message..."}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="flex-1 border border-gray-200 px-4 py-2 focus:outline-none focus:border-[#1a1a2e] text-sm transition-colors"
            />
            <button
              type="submit"
              disabled={!message.trim() && !tripToShare}
              className={`px-4 py-2 flex items-center justify-center ${
                message.trim() || tripToShare
                  ? 'bg-[#1a1a2e] text-white hover:bg-[#2a2a4e]' 
                  : 'bg-gray-100 text-gray-300 cursor-not-allowed'
              } transition-colors`}
            >
              <FaPaperPlane />
            </button>
          </form>
        </>
      )}
    </>
  );

  // For embedded mode (used in Chat.jsx page)
  if (embedded) {
    return (
      <div className="bg-white border border-gray-200 w-full h-full flex flex-col overflow-hidden">
        <ChatContent />
      </div>
    );
  }

  // For modal mode (used as popup from other components)
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div 
            className="bg-white border border-gray-200 w-full max-w-xl max-h-[80vh] flex flex-col"
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            onClick={(e) => e.stopPropagation()}
          >
            <ChatContent />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default ChatInterface;
