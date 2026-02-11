import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaMapMarkedAlt, FaCompass, FaRobot, FaSearch, FaInfoCircle } from 'react-icons/fa';
import { useAuth } from '../../../context/AuthContext';
import HomeChatAssistant from './HomeChatAssistant';

function Hero() {
  const { user } = useAuth();
  const [showChatAssistant, setShowChatAssistant] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/explore?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <div className="relative w-full">
      {/* Hero Section - Full bleed */}
      <div className="relative h-[85vh] min-h-[600px] max-h-[900px] overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80"
            alt="Travel Hero"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-black/10" />
        </div>

        {/* Hero Content */}
        <div className="relative h-full flex flex-col justify-center px-6 md:px-12 lg:px-20">
          {/* Bold headline block */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="mb-8 md:mb-12"
          >
            <div className="inline-block bg-emerald-600 px-6 py-4 md:px-10 md:py-8">
              <h1 className="text-white font-black text-5xl md:text-7xl lg:text-8xl leading-[0.9] tracking-tight uppercase" style={{ fontFamily: "'Inter', sans-serif" }}>
                WE KNOW
                <br />
                WHERE TO GO
              </h1>
            </div>
          </motion.div>

          {/* Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="max-w-xl"
          >
            <form onSubmit={handleSearch} className="bg-white rounded-sm shadow-2xl overflow-hidden">
              <div className="flex items-center">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="WHAT ARE YOU LOOKING FOR?"
                  className="flex-1 px-5 py-4 text-[13px] font-semibold tracking-[0.15em] text-gray-800 placeholder-gray-400 focus:outline-none uppercase"
                  style={{ fontFamily: "'Inter', sans-serif" }}
                />
                <button type="submit" className="px-5 py-4 text-gray-500 hover:text-emerald-600 transition-colors">
                  <FaSearch className="text-lg" />
                </button>
              </div>
              <div className="px-5 pb-3 flex items-center gap-2">
                <FaInfoCircle className="text-gray-400 text-xs" />
                <p className="text-xs text-gray-500">You can search for your favorite destinations like "Japan" and "Porto"</p>
              </div>
            </form>
          </motion.div>
        </div>

        {/* Side Banner */}
       <motion.div
  initial={{ opacity: 0, x: 20 }}
  animate={{ opacity: 1, x: 0 }}
  transition={{ duration: 0.8, delay: 0.6 }}
  className="absolute top-6 right-6 hidden md:block"
>
  <Link to="/create-trip">
    <div className="bg-black text-white px-4 py-8 writing-vertical-lr text-center cursor-pointer 
                    hover:bg-red-600 hover:text-white transition-colors duration-300">
      <span
        className="text-[11px] font-bold tracking-[0.2em] uppercase"
        style={{ writingMode: 'vertical-lr', fontFamily: "'Inter', sans-serif" }}
      >
        AI TRIP PLANNER ↓
      </span>
    </div>
  </Link>
</motion.div>

      </div>

      {/* Chat Assistant */}
      <AnimatePresence>
        <HomeChatAssistant 
          isOpen={showChatAssistant} 
          onClose={() => setShowChatAssistant(false)} 
        />
      </AnimatePresence>
      
      {/* Chat Assistant Button */}
      {!showChatAssistant && (
        <motion.div className="fixed bottom-6 right-6 z-50">
          <motion.div
            className="absolute right-16 top-2 bg-white rounded-lg shadow-lg px-4 py-2 w-64 text-sm"
            initial={{ opacity: 0, scale: 0.8, x: -10 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            transition={{ delay: 2, duration: 0.3 }}
          >
            <div className="text-gray-800 font-medium">Explore with AI Travel Assistant</div>
            <div className="text-gray-500 text-xs mt-1">Discover destinations and get personalized travel ideas!</div>
            <div className="absolute -right-2 top-1/2 transform -translate-y-1/2 w-0 h-0 border-t-8 border-b-8 border-l-8 border-transparent border-l-white"></div>
          </motion.div>
          
          <motion.button
            onClick={() => setShowChatAssistant(true)}
            className="bg-emerald-600 text-white rounded-full p-4 shadow-lg"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", delay: 1.5 }}
            whileHover={{ scale: 1.1, boxShadow: "0 10px 25px -5px rgba(16, 185, 129, 0.4)" }}
            whileTap={{ scale: 0.95 }}
          >
            <FaRobot size={24} />
            <span className="absolute -top-2 -right-2 bg-yellow-400 text-gray-900 text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
              AI
            </span>
          </motion.button>
        </motion.div>
      )}
    </div>
  );
}

export default Hero;