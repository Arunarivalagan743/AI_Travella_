import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const Loading = () => {
  return (
    <AnimatePresence>
      <motion.div 
        className="fixed inset-0 bg-white bg-opacity-95 backdrop-blur-sm z-50 flex flex-col items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
      >
        <div className="text-center px-4">
          {/* Modern animated logo/symbol */}
          <div className="mb-8 relative">
            <motion.div 
              className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-400 to-teal-600"
              animate={{ 
                scale: [1, 1.1, 1],
              }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                repeatType: "reverse",
                ease: "easeInOut"
              }}
            />
            
            <motion.div 
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-12 h-12 border-4 border-white rounded-full"
              animate={{ 
                rotate: 360,
                scale: [1, 0.9, 1]
              }}
              transition={{ 
                rotate: { duration: 8, repeat: Infinity, ease: "linear" },
                scale: { duration: 2, repeat: Infinity, repeatType: "reverse" }
              }}
            />
            
            <motion.div
              className="absolute top-0 right-0 w-4 h-4 rounded-full bg-emerald-300"
              animate={{
                x: [0, 10, 0],
                y: [0, -10, 0],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                repeatType: "reverse",
                ease: "easeInOut"
              }}
            />
            
            <motion.div
              className="absolute bottom-0 left-0 w-6 h-6 rounded-full bg-teal-300"
              animate={{
                x: [0, -8, 0],
                y: [0, 8, 0],
              }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                repeatType: "reverse",
                ease: "easeInOut"
              }}
            />
          </div>
          
          <motion.h2
            className="text-xl font-medium text-gray-800 mb-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <span className="bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">
              Curating your perfect experience
            </span>
          </motion.h2>
          
          <motion.p
            className="text-gray-500 text-sm mb-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            Just a moment while we personalize your journey
          </motion.p>
          
          {/* Progress bar */}
          <motion.div
            className="w-48 h-1.5 mx-auto bg-gray-100 rounded-full overflow-hidden"
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: "12rem", opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <motion.div
              className="h-full bg-gradient-to-r from-emerald-400 via-teal-500 to-emerald-400 background-size-200"
              initial={{ backgroundPosition: "0% 0%" }}
              animate={{ backgroundPosition: ["0% 0%", "100% 100%"] }}
              transition={{ 
                repeat: Infinity,
                duration: 2,
                ease: "easeInOut" 
              }}
              style={{
                backgroundSize: "200% 200%"
              }}
            />
          </motion.div>
          
          {/* Loading dots */}
          <motion.div 
            className="flex justify-center mt-4 space-x-1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            {[0, 1, 2].map((dot) => (
              <motion.div
                key={dot}
                className="w-1.5 h-1.5 rounded-full bg-emerald-500"
                animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1, 0.8] }}
                transition={{
                  duration: 1.2,
                  repeat: Infinity,
                  delay: dot * 0.2,
                  ease: "easeInOut"
                }}
              />
            ))}
          </motion.div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default Loading;