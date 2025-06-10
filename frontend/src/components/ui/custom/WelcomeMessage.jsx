import React from 'react'
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { FaSuitcase, FaMapMarkedAlt } from 'react-icons/fa';

// Welcome Message Component with aesthetic animations
function WelcomeMessage({ location }) {
  const { user } = useAuth();
  const [userName, setUserName] = useState('Traveler');
  
  useEffect(() => {
    // Try to get user name from AuthContext first
    if (user && user.name) {
      setUserName(user.name);
      return;
    }
    
    // If not available in AuthContext, try localStorage
    try {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        if (parsedUser.name) {
          setUserName(parsedUser.name);
          return;
        }
      }
      
      // If no name found in localStorage user object, try other keys
      const name = localStorage.getItem('userName') || 
                localStorage.getItem('name') ||
                localStorage.getItem('displayName');
      
      if (name) {
        setUserName(name);
      }
    } catch (error) {
      console.error("Error retrieving user name from localStorage:", error);
    }
  }, [user]);

  return (
    <motion.div 
      className="backdrop-blur-sm bg-gradient-to-r from-gray-900/90 to-gray-800/90 text-white px-6 py-4 rounded-xl shadow-2xl flex items-center justify-between overflow-hidden relative"
      initial={{ opacity: 0, filter: "grayscale(100%)" }}
      animate={{ 
        opacity: 1, 
        filter: "grayscale(0%)",
        boxShadow: [
          "0 4px 6px rgba(0,0,0,0.1)",
          "0 10px 15px rgba(0,0,0,0.2)",
          "0 15px 25px rgba(0,0,0,0.3)"
        ]
      }}
      transition={{ 
        duration: 1.4, 
        ease: "easeOut",
        boxShadow: { duration: 0.8, delay: 0.2 }
      }}
      whileHover={{ 
        scale: 1.02,
        background: "linear-gradient(to right, rgba(17,24,39,0.95), rgba(31,41,55,0.95))"
      }}
    >
      {/* Animated background elements */}
      <motion.div
        className="absolute inset-0 opacity-10 overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.1 }}
        transition={{ duration: 0.8, delay: 0.4 }}
      >
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-white"
            style={{
              width: Math.random() * 100 + 50,
              height: Math.random() * 100 + 50,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              opacity: [0.1, 0.2, 0.1],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 3 + Math.random() * 3,
              repeat: Infinity,
              repeatType: "reverse",
              delay: Math.random() * 2,
            }}
          />
        ))}
      </motion.div>

      {/* Content */}
      <div className="z-10">
        <motion.h2 
          className="text-xl sm:text-2xl font-bold text-shadow-sm mb-1 bg-clip-text text-transparent bg-gradient-to-r from-gray-50 to-white"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.7 }}
        >
          Welcome, @{userName}!
        </motion.h2>
        <motion.p
          className="text-sm sm:text-base text-gray-300"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.9 }}
        >
          Your personalized trip to <span className="font-medium text-gray-50">{location}</span> is ready
        </motion.p>
      </div>
      
      {/* Icon container with glow effect */}
      <motion.div 
        className="hidden sm:flex h-14 w-14 bg-gradient-to-br from-gray-700 to-gray-900 rounded-full items-center justify-center relative"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ 
          type: "spring", 
          stiffness: 260, 
          damping: 20, 
          delay: 1.1
        }}
      >
        {/* Glow effect */}
        <motion.div 
          className="absolute inset-0 rounded-full bg-white opacity-0"
          animate={{ 
            opacity: [0, 0.2, 0],
            scale: [0.8, 1.2, 0.8],
          }}
          transition={{ 
            duration: 2,
            repeat: Infinity,
            repeatType: "loop",
            ease: "easeInOut",
            delay: 1.5
          }}
        />
        
        {/* Icons that swap */}
        <motion.div className="relative">
          <motion.div
            animate={{ 
              opacity: [1, 0],
              rotate: 10,
              y: -5
            }}
            transition={{ 
              opacity: { duration: 2, repeat: Infinity, repeatType: "reverse" },
              rotate: { duration: 0.3 },
              y: { duration: 0.3 }
            }}
          >
            <FaSuitcase className="text-gray-200 text-xl" />
          </motion.div>
          
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            animate={{ 
              opacity: [0, 1],
              rotate: -10,
              y: 5
            }}
            transition={{ 
              opacity: { duration: 2, repeat: Infinity, repeatType: "reverse" },
              rotate: { duration: 0.3 },
              y: { duration: 0.3 }
            }}
          >
            <FaMapMarkedAlt className="text-gray-200 text-xl" />
          </motion.div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

export default WelcomeMessage;