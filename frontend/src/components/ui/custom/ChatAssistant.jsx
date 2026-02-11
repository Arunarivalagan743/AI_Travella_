import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BiSend, BiX } from 'react-icons/bi';
import { FaRobot } from 'react-icons/fa';
import { RiUserSmileLine } from 'react-icons/ri';
import { MdOutlineRocketLaunch } from 'react-icons/md';
import { getGeminiModel } from '../../../ModelWork/geminiClient';

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
      const model = getGeminiModel();

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
      
      // Clean the response text first
      const cleanedText = cleanText(responseText);
      
      // Process the response
      let assistantMessage = cleanedText;
      let updatedItinerary = null;
      
      // Check if response contains JSON
      const jsonStartIndex = cleanedText.indexOf('[JSON_START]');
      const jsonEndIndex = cleanedText.indexOf('[JSON_END]');
      
      if (jsonStartIndex !== -1 && jsonEndIndex !== -1) {
        // Extract JSON part
        const jsonText = cleanedText.substring(jsonStartIndex + 12, jsonEndIndex).trim();
        
        try {
          // Parse the JSON
          updatedItinerary = JSON.parse(jsonText);
          
          // Remove the JSON part from the message
          assistantMessage = cleanedText.substring(0, jsonStartIndex).trim();
          
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
        className="fixed bottom-0 md:bottom-4 right-0 md:right-4 w-full md:w-[500px] h-[70vh] md:h-[450px] bg-white shadow-xl flex flex-col z-[70] overflow-hidden border border-gray-200"
      initial={{ opacity: 0, y: 20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.2 }}
    >
      {/* Header */}
      <div className="bg-[#1a1a2e] text-white p-3 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <FaRobot className="text-emerald-400 text-xl" />
          <div>
            <h3 className="text-[11px] uppercase tracking-[0.15em] font-medium">Trip Assistant</h3>
          </div>
        </div>
        <button 
          onClick={onClose}
          className="p-1 hover:bg-white/10 transition-colors"
          aria-label="Close assistant"
        >
          <BiX className="text-xl" />
        </button>
      </div>
      
      {/* Chat Messages */}
      <div className="flex-1 p-4 overflow-y-auto bg-[#f5f0eb]/30">
        {messages.map((message, index) => (
          <div key={index} className={`mb-4 flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`
              max-w-[80%] p-3 
              ${message.role === 'user' 
                ? 'bg-[#1a1a2e] text-white' 
                : 'bg-white border border-gray-200'}
            `}>
              <div className="flex items-center gap-2 mb-1">
                {message.role === 'user' 
                  ? <RiUserSmileLine className="text-emerald-400" /> 
                  : <FaRobot className="text-emerald-600" />
                }
                <span className="text-[10px] uppercase tracking-[0.15em] font-medium">
                  {message.role === 'user' ? 'You' : 'Assistant'}
                </span>
              </div>
              <p className="text-sm whitespace-pre-line leading-relaxed">{message.content}</p>
              
              {/* Action button if there's an updated itinerary */}
              {message.role === 'assistant' && message.updatedItinerary && (
                <motion.button
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-3 px-3 py-1.5 bg-emerald-600 text-white text-[11px] uppercase tracking-[0.1em] flex items-center gap-1.5"
                  onClick={() => handleApplyChanges(message.updatedItinerary)}
                >
                  <MdOutlineRocketLaunch />
                  <span>Apply Changes</span>
                </motion.button>
              )}
            </div>
          </div>
        ))}
        
        {/* Loading indicator */}
        {isLoading && (
          <div className="flex items-center gap-3 text-gray-400 mb-4">
            <div className="w-[1px] h-5 bg-emerald-600 animate-pulse"></div>
            <span className="text-[10px] uppercase tracking-[0.2em]">Thinking</span>
          </div>
        )}
        
        {/* Error message */}
        {error && (
          <div className="bg-[#f5f0eb] border-l-2 border-red-400 p-3 text-sm text-red-700 mb-4">
            {error}
          </div>
        )}
        
        {/* Invisible element to scroll to */}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Sample Questions */}
      {messages.length < 3 && (
        <div className="px-3 pb-2">
          <p className="text-[10px] uppercase tracking-[0.15em] text-gray-400 mb-1.5">Try asking:</p>
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
                className="text-[10px] bg-[#f5f0eb] hover:bg-gray-200 text-gray-600 px-2.5 py-1.5 transition-colors tracking-wide"
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
            placeholder="Ask about any destination..."
            className="flex-1 border border-gray-200 px-4 py-2 focus:outline-none focus:border-[#1a1a2e] text-sm transition-colors"
            disabled={isLoading}
          />
          <button
            type="submit"
            className="bg-[#1a1a2e] text-white p-2.5 hover:bg-[#2a2a4e] transition-colors disabled:opacity-50"
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

export default ChatAssistant;
