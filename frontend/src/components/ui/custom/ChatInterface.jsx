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
      <div className="flex items-center justify-between p-4 border-b">
        {chatView === 'messages' && (
          <button 
            className="p-2 rounded-full hover:bg-gray-100"
            onClick={() => setChatView('conversations')}
          >
            <FaArrowLeft />
          </button>
        )}
        <h2 className="text-lg font-semibold flex-1 text-center">
          {chatView === 'conversations' ? 'Messages' : 
            (currentChat && getOtherParticipant(currentChat) ? 
              userProfiles[getOtherParticipant(currentChat)]?.displayName || getOtherParticipant(currentChat) 
              : 'Chat'
            )
          }
        </h2>
        {!embedded && (
          <button 
            className="p-2 rounded-full hover:bg-gray-100"
            onClick={onClose}
          >
            <FaTimes />
          </button>
        )}
      </div>
      
      {/* Content - Conversations List */}
      {chatView === 'conversations' && (
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex justify-center items-center h-32">
              <div className="w-8 h-8 border-4 border-gray-200 border-t-emerald-500 rounded-full animate-spin"></div>
            </div>
          ) : conversations.length === 0 ? (
            <div className="text-center p-6 text-gray-500">
              <p>No conversations yet</p>
              <p className="text-sm mt-2">Your chats with followers will appear here</p>
            </div>
          ) : (
            <ul>
              {conversations.map(conv => {
                const otherUser = getOtherParticipant(conv);
                const profile = userProfiles[otherUser] || {};
                
                return (
                  <li key={conv.id}>
                    <button 
                      className="w-full p-3 flex items-center hover:bg-gray-50 border-b"
                      onClick={() => {
                        setCurrentChat(conv);
                        setChatView('messages');
                        loadMessages(conv.id);
                      }}
                    >
                      <div className="w-10 h-10 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mr-3">
                        {profile.photoURL ? (
                          <img 
                            src={profile.photoURL} 
                            alt={profile.displayName || otherUser}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : (
                          <FaUser />
                        )}
                      </div>
                      <div className="flex-1 text-left">
                        <div className="font-medium">
                          {profile.displayName || otherUser}
                        </div>
                        <div className="text-sm text-gray-600 truncate">
                          {conv.lastMessage || 'Start a conversation'}
                        </div>
                      </div>
                      {conv.lastMessageTime && (
                        <div className="text-xs text-gray-500">
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
              <div className="text-center py-8 text-gray-500">
                <p>No messages yet</p>
                <p className="text-sm mt-2">Start the conversation!</p>
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
                        className={`rounded-lg px-4 py-2 max-w-[80%] break-words ${
                          isCurrentUser 
                            ? 'bg-emerald-500 text-white' 
                            : 'bg-gray-200 text-gray-800'
                        }`}
                      >
                        {/* Regular text message */}
                        {msg.text && <p>{msg.text}</p>}
                        
                        {/* Shared trip */}
                        {msg.tripData && (
                          <div className={`mt-2 p-3 rounded ${
                            isCurrentUser ? 'bg-emerald-600' : 'bg-white border'
                          }`}>
                            <div className="flex items-center">
                              {msg.tripData.image ? (
                                <img 
                                  src={msg.tripData.image} 
                                  alt={msg.tripData.title} 
                                  className="w-12 h-12 rounded object-cover mr-3"
                                />
                              ) : (
                                <div className={`w-12 h-12 rounded flex items-center justify-center mr-3 ${
                                  isCurrentUser ? 'bg-emerald-700 text-white' : 'bg-emerald-100 text-emerald-700'
                                }`}>
                                  <span className="text-xs">Trip</span>
                                </div>
                              )}
                              <div>
                                <p className={`font-medium ${isCurrentUser ? 'text-white' : 'text-gray-800'}`}>
                                  {msg.tripData.title}
                                </p>
                                <p className={`text-xs ${isCurrentUser ? 'text-emerald-100' : 'text-gray-500'}`}>
                                  Shared Trip
                                </p>
                              </div>
                            </div>
                            {msg.tripData.description && (
                              <p className={`text-sm mt-2 ${isCurrentUser ? 'text-emerald-100' : 'text-gray-600'}`}>
                                {msg.tripData.description.substring(0, 100)}
                                {msg.tripData.description.length > 100 ? '...' : ''}
                              </p>
                            )}
                            <a 
                              href={`/show_trip/trip_id/${msg.tripData.id}`}
                              target="_blank" 
                              rel="noopener noreferrer"
                              className={`text-xs mt-2 inline-block py-1 px-3 rounded ${
                                isCurrentUser 
                                  ? 'bg-white text-emerald-700 hover:bg-gray-100' 
                                  : 'bg-emerald-500 text-white hover:bg-emerald-600'
                              }`}
                            >
                              View Trip
                            </a>
                          </div>
                        )}
                        
                        {/* Timestamp */}
                        <div 
                          className={`text-xs mt-1 ${
                            isCurrentUser ? 'text-emerald-100' : 'text-gray-500'
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
            <div className="border-t p-3">
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 flex items-center justify-between">
                <div className="flex items-center">
                  {tripToShare.image ? (
                    <img 
                      src={tripToShare.image} 
                      alt={tripToShare.title || tripToShare.name} 
                      className="w-12 h-12 rounded object-cover mr-3"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-emerald-200 rounded flex items-center justify-center mr-3">
                      <span className="text-emerald-700 text-xs">Trip</span>
                    </div>
                  )}
                  <div>
                    <p className="font-medium">{tripToShare.title || tripToShare.name}</p>
                    <p className="text-xs text-gray-500">Trip to share</p>
                  </div>
                </div>
                <button 
                  type="button" 
                  className="text-gray-500 hover:text-gray-700"
                  onClick={() => setTripToShare(null)}
                >
                  <FaTimes />
                </button>
              </div>
            </div>
          )}
          
          {/* Message Input */}
          <form onSubmit={sendMessage} className="border-t p-3 flex">
            <input
              type="text"
              placeholder={tripToShare ? "Add a message with your trip..." : "Type a message..."}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="flex-1 border rounded-l-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <button
              type="submit"
              disabled={!message.trim() && !tripToShare}
              className={`rounded-r-lg px-4 py-2 flex items-center justify-center ${
                message.trim() || tripToShare
                  ? 'bg-emerald-500 text-white hover:bg-emerald-600' 
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
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
      <div className="bg-white rounded-lg shadow-xl w-full h-full flex flex-col overflow-hidden">
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
            className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[80vh] flex flex-col"
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
