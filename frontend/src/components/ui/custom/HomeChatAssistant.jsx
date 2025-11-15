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

  // Clean and format text by removing markdown artifacts and extra formatting
  const cleanText = (text) => {
    if (!text) return '';
    
    return text
      // Remove excessive asterisks for bold/italic markdown
      .replace(/\*\*\*/g, '')
      .replace(/\*\*/g, '')
      .replace(/\*/g, '•')
      // Clean up bullet points
      .replace(/^\s*[•\-]\s*/gm, '• ')
      // Remove excessive whitespace
      .replace(/\n{3,}/g, '\n\n')
      .trim();
  };

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
      const apiKey = import.meta.env.VITE_GOOGLE_GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error("Gemini API key is not configured");
      }
      
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

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
      
      // Clean the response text
      const cleanedText = cleanText(responseText);
      
      // Process the response for trip creation intent
      const tripCreationIntent = cleanedText.toLowerCase().includes("plan my trip") || 
                                cleanedText.toLowerCase().includes("create a trip") ||
                                cleanedText.toLowerCase().includes("make an itinerary");
      
      // Add assistant message to chat
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: cleanedText,
        showPlanTripButton: tripCreationIntent
      }]);
      
    } catch (err) {
      console.error("Error communicating with AI:", err);
      console.error("Error details:", {
        message: err.message,
        status: err.status,
        statusText: err.statusText
      });
      setError("Sorry, I couldn't process your request. Please try again later.");
      
      // Add error message to chat
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: `Sorry, I'm having trouble connecting. Error: ${err.message || 'Unknown error'}` 
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
    <>
      {/* Backdrop for mobile */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="md:hidden fixed inset-0 bg-black/30 backdrop-blur-sm z-[60]"
        onClick={onClose}
      />
      
      <motion.div 
        className="fixed bottom-0 md:bottom-4 right-0 md:right-4 w-full md:w-80 h-[70vh] md:h-[450px] bg-white md:rounded-lg shadow-xl flex flex-col z-[70] overflow-hidden"
      initial={{ opacity: 0, y: 20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.2 }}
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-3 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FaRobot className="text-lg" />
          <h3 className="font-medium text-sm">Travel Explorer</h3>
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
      <div className="flex-1 p-3 overflow-y-auto bg-gray-50">
        {messages.map((message, index) => (
          <div key={index} className={`mb-3 flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`
              max-w-[85%] rounded-lg p-2.5 text-xs
              ${message.role === 'user' 
                ? 'bg-emerald-500 text-white rounded-tr-none' 
                : 'bg-white border border-gray-200 rounded-tl-none'}
            `}>
              <div className="flex items-center gap-1.5 mb-1">
                {message.role === 'user' 
                  ? <RiUserSmileLine className="text-white text-sm" /> 
                  : <FaRobot className="text-emerald-500 text-sm" />
                }
                <span className="text-[10px] font-medium">
                  {message.role === 'user' ? 'You' : 'Travel Explorer'}
                </span>
              </div>
              <p className="text-xs whitespace-pre-line leading-relaxed">{message.content}</p>
              
              {/* Create trip button if applicable */}
              {message.role === 'assistant' && message.showPlanTripButton && (
                <motion.button
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-2 px-2.5 py-1 bg-teal-600 text-white text-[10px] rounded-full flex items-center gap-1"
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
          <div className="flex items-center gap-2 text-gray-500 mb-3">
            <div className="flex space-x-1">
              <div className="h-1.5 w-1.5 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="h-1.5 w-1.5 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="h-1.5 w-1.5 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
            <span className="text-[10px]">Thinking...</span>
          </div>
        )}
        
        {/* Error message */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-2 text-[10px] text-red-700 mb-3">
            {error}
          </div>
        )}
        
        {/* Invisible element to scroll to */}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Sample Questions */}
      {messages.length < 3 && (
        <div className="px-3 pb-2">
          <p className="text-[10px] text-gray-500 mb-1">Try asking:</p>
          <div className="flex flex-wrap gap-1">
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
                className="text-[10px] bg-gray-100 hover:bg-gray-200 text-gray-700 px-2 py-1 rounded-full transition-colors"
              >
                {question}
              </button>
            ))}
          </div>
        </div>
      )}
      
      {/* Input Form */}
      <form onSubmit={handleSendMessage} className="p-2.5 border-t border-gray-200 bg-white">
        <div className="flex gap-1.5">
          <input
            ref={inputRef}
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Ask about destinations..."
            className="flex-1 border border-gray-300 rounded-full px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs"
            disabled={isLoading}
          />
          <button
            type="submit"
            className="bg-emerald-500 text-white rounded-full p-2 hover:bg-emerald-600 transition-colors disabled:opacity-50"
            disabled={isLoading || !inputMessage.trim()}
            aria-label="Send message"
          >
            <BiSend className="text-lg" />
          </button>
        </div>
      </form>
    </motion.div>
    </>
  );
};

export default HomeChatAssistant;
