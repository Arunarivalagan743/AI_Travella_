import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaMapMarkedAlt, FaCompass, FaRobot } from 'react-icons/fa';
import { useAuth } from '../../../context/AuthContext'; // <-- import
import HomeChatAssistant from './HomeChatAssistant';

function Hero() {
  const { user } = useAuth();
  const [showChatAssistant, setShowChatAssistant] = useState(false);
  return (
    <div className="relative bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 py-24 px-6 overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -right-10 -top-20 w-72 h-72 bg-emerald-100 rounded-full opacity-30 blur-3xl"></div>
        <div className="absolute left-10 bottom-10 w-96 h-96 bg-teal-100 rounded-full opacity-20 blur-3xl"></div>
      </div>
      <div className="max-w-6xl mx-auto relative">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center md:text-left"
          >
            <h1 className="font-extrabold text-4xl md:text-5xl lg:text-6xl tracking-tight text-gray-800 mb-6 leading-tight">
              Discover Your{' '}
              <span className="bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">
                Perfect Journey
              </span>{' '}
              with Travella
            </h1>
            <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-2xl font-light leading-relaxed">
              Personalized travel experiences powered by AI. Explore destinations tailored to your preferences, 
              discover hidden gems, and create memories that last a lifetime.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link to="/create-trip">
                  <button className="w-full px-8 py-3.5 bg-gradient-to-r from-emerald-600 to-teal-500 text-white font-medium rounded-lg hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2">
                    <FaMapMarkedAlt />
                    <span>Plan My Trip</span>
                  </button>
                </Link>
              </motion.div>
              {user && (
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                 <a 
  href="https://www.404arunfound.me" 
  target="_blank" 
  rel="noopener noreferrer"
>
  <button className="w-full px-8 py-3.5 bg-white backdrop-blur-sm bg-opacity-80 text-gray-700 font-medium rounded-lg border border-gray-200 hover:border-emerald-300 hover:shadow-md transition-all duration-300 flex items-center justify-center gap-2">
    <FaCompass />
    <span>Explore My Works</span>
  </button>
</a>
                </motion.div>
              )}
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="hidden md:block"
          >
            <div className="relative">
              <div className="absolute -right-4 -bottom-4 w-full h-full rounded-2xl bg-emerald-200 opacity-30"></div>
              <div className="relative backdrop-blur-sm bg-white bg-opacity-40 p-6 rounded-2xl shadow-lg border border-white border-opacity-40">
                <div className="absolute top-3 left-3 w-2 h-2 rounded-full bg-red-400"></div>
                <div className="absolute top-3 left-7 w-2 h-2 rounded-full bg-yellow-400"></div>
                <div className="absolute top-3 left-11 w-2 h-2 rounded-full bg-green-400"></div>
                <div className="pt-5 space-y-6">
                  <div className="w-full h-32 bg-emerald-100 bg-opacity-30 rounded-lg overflow-hidden flex items-center justify-center">
                    <img
                      src="https://images.unsplash.com/photo-1506197603052-3cc9c3a201bd?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80"
                      alt="Travel destination"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="h-3 w-3/4 bg-emerald-100 rounded-full"></div>
                    <div className="h-3 w-1/2 bg-emerald-100 rounded-full"></div>
                    <div className="h-3 w-5/6 bg-emerald-100 rounded-full"></div>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex space-x-2">
                      <div className="h-8 w-8 bg-emerald-100 rounded-full"></div>
                      <div className="h-8 w-16 bg-emerald-100 rounded-full"></div>
                    </div>
                    <div className="h-8 w-8 bg-emerald-200 rounded-full"></div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
      
      {/* Chat Assistant */}
      <AnimatePresence>
        <HomeChatAssistant 
          isOpen={showChatAssistant} 
          onClose={() => setShowChatAssistant(false)} 
        />
      </AnimatePresence>
      
      {/* Chat Assistant Button with tooltip */}
      {!showChatAssistant && (
        <motion.div className="fixed bottom-6 right-6 z-50">
          {/* Floating tooltip */}
          <motion.div
            className="absolute right-16 top-2 bg-white rounded-lg shadow-lg px-4 py-2 w-64 text-sm"
            initial={{ opacity: 0, scale: 0.8, x: -10 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            transition={{ delay: 2, duration: 0.3 }}
            exit={{ opacity: 0, scale: 0.8, x: -10 }}
          >
            <div className="text-gray-800 font-medium">Explore with AI Travel Assistant</div>
            <div className="text-gray-500 text-xs mt-1">Discover destinations and get personalized travel ideas!</div>
            <div className="absolute -right-2 top-1/2 transform -translate-y-1/2 w-0 h-0 border-t-8 border-b-8 border-l-8 border-transparent border-l-white"></div>
          </motion.div>
          
          <motion.button
            onClick={() => setShowChatAssistant(true)}
            className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-full p-4 shadow-lg"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", delay: 1.5 }}
            whileHover={{ scale: 1.1, boxShadow: "0 10px 25px -5px rgba(16, 185, 129, 0.4)" }}
            whileTap={{ scale: 0.95 }}
          >
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <FaRobot size={24} />
            </motion.div>
            <span className="absolute -top-2 -right-2 bg-emerald-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              AI
            </span>
          </motion.button>
        </motion.div>
      )}
    </div>
  );
}

export default Hero;