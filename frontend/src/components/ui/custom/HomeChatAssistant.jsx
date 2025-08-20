import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { motion } from 'framer-motion';
import { BiSend, BiX } from 'react-icons/bi';
import { FaRobot } from 'react-icons/fa';
import { RiUserSmileLine } from 'react-icons/ri';
import { useNavigate } from 'react-router-dom';

const HomeChatAssistant = ({ isOpen, onClose }) => {
  const [inputMessage, setInputMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  // Initial welcome message
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([
        { 
          role: 'assistant', 
          content: 'Hi there! I\'m your AI Travel Assistant. I can help you discover amazing destinations and create perfect travel plans. What kind of trip are you interested in?' 
        }
      ]);
    }
    
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen, messages.length]);

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

      // Prepare the prompt with focus on travel inspiration
      const prompt = `You are a helpful AI Travel Assistant for TravellaAI app. You help users discover destinations and plan trips.

CAPABILITIES:
1. Suggest popular destinations based on user preferences
2. Provide sample itineraries for destinations
3. Answer questions about travel logistics, best times to visit, cultural norms, etc.
4. Offer personalized travel recommendations based on interests

User Request: ${userMessage}

RESPONSE GUIDELINES:
1. Be conversational, friendly, and enthusiastic about travel
2. Provide specific destination recommendations with key attractions when appropriate
3. Mention best times to visit and special considerations
4. If the user seems ready to plan a specific trip, suggest they use the "Plan My Trip" feature
5. Keep responses concise but informative

IMPORTANT: If the user wants to create a specific trip, tell them about the "Plan My Trip" button at the top of the page, which will guide them through creating a detailed itinerary.`;

      // Generate content based on the prompt
      const result = await model.generateContent(prompt);
      const responseText = result.response.text();
      
      // Process the response for trip creation intent
      const tripCreationIntent = responseText.toLowerCase().includes("plan my trip") || 
                                responseText.toLowerCase().includes("create a trip") ||
                                responseText.toLowerCase().includes("make an itinerary");
      
      // Add assistant message to chat
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: responseText,
        showPlanTripButton: tripCreationIntent
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

  const handleCreateTrip = () => {
    onClose();
    navigate('/create-trip');
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
          <h3 className="font-medium">Travel Explorer</h3>
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
                  {message.role === 'user' ? 'You' : 'Travel Explorer'}
                </span>
              </div>
              <p className="text-sm whitespace-pre-wrap">{message.content}</p>
              
              {/* Create trip button if applicable */}
              {message.role === 'assistant' && message.showPlanTripButton && (
                <motion.button
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-3 px-3 py-1.5 bg-teal-600 text-white text-xs rounded-full flex items-center gap-1.5"
                  onClick={handleCreateTrip}
                >
                  <span>Plan My Trip Now</span>
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
              "Best places in Europe?",
              "Beach vacation ideas",
              "3-day Tokyo itinerary",
              "Family trips in USA",
              "When to visit Bali?"
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
            placeholder="Ask about destinations or trip ideas..."
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

export default HomeChatAssistant;
