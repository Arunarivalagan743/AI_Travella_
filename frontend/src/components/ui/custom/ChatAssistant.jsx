import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { motion } from 'framer-motion';
import { BiSend, BiX } from 'react-icons/bi';
import { FaRobot } from 'react-icons/fa';
import { RiUserSmileLine } from 'react-icons/ri';
import { MdOutlineRocketLaunch } from 'react-icons/md';

const ChatAssistant = ({ tripData, onTripUpdate, isOpen, onClose }) => {
  const [inputMessage, setInputMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Initial welcome message
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([
        { 
          role: 'assistant', 
          content: 'Hello! I\'m your Trip Assistant. I can help with:\n\n• Modifying your current itinerary (try "add a museum visit on Day 2")\n• Suggesting destinations (ask "What are the best places to visit in Japan?")\n• Creating sample itineraries (try "3-day itinerary for New York")\n• Answering travel questions (ask "When is the best time to visit Bali?")\n\nHow can I help with your travel plans today?' 
        }
      ]);
    }
    
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Scroll to bottom whenever messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;
    
    const userMessage = inputMessage;
    setInputMessage('');
    
    // Add user message to chat
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      // Initialize Gemini AI
      const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GOOGLE_GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

      // Create history for context
      const chatHistory = messages.map(msg => ({
        role: msg.role,
        parts: [{ text: msg.content }]
      }));

      // Prepare the prompt with trip context
      const prompt = `You are a helpful Trip Assistant AI for TravellaAI app. You are a travel expert who can both help users refine their existing travel plans and provide general travel advice about destinations worldwide.
      
CAPABILITIES:
1. Modify existing trip itineraries based on user preferences
2. Suggest popular destinations and attractions worldwide
3. Provide sample itineraries for destinations
4. Answer questions about travel logistics, best times to visit, cultural norms, etc.
5. Offer personalized travel recommendations based on interests

Current Trip Details (if the user is asking about modifying this specific trip):
Location: ${tripData.location || tripData.userSelection?.location}
Duration: ${tripData.duration || tripData.userSelection?.duration}
Trip Type: ${tripData.travelType || tripData.userSelection?.travelType}
Budget: ${tripData.budgetType || tripData.userSelection?.budgetType}

Current Itinerary (if relevant):
${JSON.stringify(tripData.itinerary || {}, null, 2)}

User Request: ${userMessage}

RESPONSE GUIDELINES:
1. For itinerary modification requests: Provide a friendly response explaining your suggested changes, then include a JSON block for the modified itinerary
2. For general travel queries: Provide detailed, helpful information about destinations, sample itineraries, or travel advice
3. Keep responses conversational, informative and focused on travel planning
4. When recommending destinations, mention key attractions, best times to visit, and special considerations

IMPORTANT: For itinerary modifications only, include a JSON block at the end between [JSON_START] and [JSON_END] markers. The JSON should match the existing structure. For general travel queries, just provide informative text without JSON.`;

      // Generate content based on the prompt
      const result = await model.generateContent(prompt);
      const responseText = result.response.text();
      
      // Process the response
      let assistantMessage = responseText;
      let updatedItinerary = null;
      
      // Check if response contains JSON
      const jsonStartIndex = responseText.indexOf('[JSON_START]');
      const jsonEndIndex = responseText.indexOf('[JSON_END]');
      
      if (jsonStartIndex !== -1 && jsonEndIndex !== -1) {
        // Extract JSON part
        const jsonText = responseText.substring(jsonStartIndex + 12, jsonEndIndex).trim();
        
        try {
          // Parse the JSON
          updatedItinerary = JSON.parse(jsonText);
          
          // Remove the JSON part from the message
          assistantMessage = responseText.substring(0, jsonStartIndex).trim();
          
          // If JSON was successfully parsed, offer to update itinerary
          assistantMessage += "\n\nI've prepared changes to your itinerary. Would you like me to update it?";
        } catch (jsonError) {
          console.error("Error parsing JSON from AI response:", jsonError);
        }
      }
      
      // Add assistant message to chat
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: assistantMessage,
        updatedItinerary: updatedItinerary 
      }]);
      
    } catch (err) {
      console.error("Error communicating with AI:", err);
      setError("Sorry, I couldn't process your request. Please try again later.");
      
      // Add error message to chat
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: "Sorry, I'm having trouble connecting to my brain. Please try again in a moment." 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApplyChanges = (updatedItinerary) => {
    if (onTripUpdate && updatedItinerary) {
      // Create a copy of the trip data with updated itinerary
      const updatedTripData = {
        ...tripData,
        itinerary: updatedItinerary
      };
      
      // Call the callback to update the trip
      onTripUpdate(updatedTripData);
      
      // Add confirmation message
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: "Great! I've updated your itinerary with these changes." 
      }]);
    }
  };

  if (!isOpen) return null;

  return (
    <motion.div 
      className="fixed bottom-4 right-4 w-96 h-[500px] bg-white rounded-lg shadow-xl flex flex-col z-50 overflow-hidden"
      initial={{ opacity: 0, y: 20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.2 }}
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-500 text-white p-3 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <FaRobot className="text-xl" />
          <h3 className="font-medium">Trip Assistant</h3>
        </div>
        <button 
          onClick={onClose}
          className="p-1 rounded-full hover:bg-white/20 transition-colors"
          aria-label="Close assistant"
        >
          <BiX className="text-xl" />
        </button>
      </div>
      
      {/* Chat Messages */}
      <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
        {messages.map((message, index) => (
          <div key={index} className={`mb-4 flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`
              max-w-[80%] rounded-lg p-3 
              ${message.role === 'user' 
                ? 'bg-emerald-500 text-white rounded-tr-none' 
                : 'bg-white border border-gray-200 rounded-tl-none'}
            `}>
              <div className="flex items-center gap-2 mb-1">
                {message.role === 'user' 
                  ? <RiUserSmileLine className="text-white" /> 
                  : <FaRobot className="text-emerald-500" />
                }
                <span className="text-xs font-medium">
                  {message.role === 'user' ? 'You' : 'Trip Assistant'}
                </span>
              </div>
              <p className="text-sm whitespace-pre-wrap">{message.content}</p>
              
              {/* Action button if there's an updated itinerary */}
              {message.role === 'assistant' && message.updatedItinerary && (
                <motion.button
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-3 px-3 py-1.5 bg-teal-600 text-white text-xs rounded-full flex items-center gap-1.5"
                  onClick={() => handleApplyChanges(message.updatedItinerary)}
                >
                  <MdOutlineRocketLaunch />
                  <span>Apply these changes</span>
                </motion.button>
              )}
            </div>
          </div>
        ))}
        
        {/* Loading indicator */}
        {isLoading && (
          <div className="flex items-center gap-2 text-gray-500 mb-4">
            <div className="flex space-x-1">
              <div className="h-2 w-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="h-2 w-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="h-2 w-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
            <span className="text-sm">Thinking...</span>
          </div>
        )}
        
        {/* Error message */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-3 text-sm text-red-700 mb-4">
            {error}
          </div>
        )}
        
        {/* Invisible element to scroll to */}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Sample Questions */}
      {messages.length < 3 && (
        <div className="px-3 pb-2">
          <p className="text-xs text-gray-500 mb-1.5">Try asking:</p>
          <div className="flex flex-wrap gap-1.5">
            {[
              "Add a museum to Day 2",
              "Best places in Tokyo?",
              "3-day Rome itinerary",
              "Make trip budget-friendly",
              "When to visit Santorini?"
            ].map((question, index) => (
              <button
                key={index}
                onClick={() => setInputMessage(question)}
                className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-2.5 py-1.5 rounded-full transition-colors"
              >
                {question}
              </button>
            ))}
          </div>
        </div>
      )}
      
      {/* Input Form */}
      <form onSubmit={handleSendMessage} className="p-3 border-t border-gray-200 bg-white">
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Ask about any destination or modify your trip..."
            className="flex-1 border border-gray-300 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
            disabled={isLoading}
          />
          <button
            type="submit"
            className="bg-emerald-500 text-white rounded-full p-2.5 hover:bg-emerald-600 transition-colors disabled:opacity-50"
            disabled={isLoading || !inputMessage.trim()}
            aria-label="Send message"
          >
            <BiSend className="text-lg" />
          </button>
        </div>
      </form>
    </motion.div>
  );
};

export default ChatAssistant;
