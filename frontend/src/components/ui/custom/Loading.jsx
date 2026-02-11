import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const Loading = () => {
  return (
    <AnimatePresence>
      <motion.div 
        className="fixed inset-0 bg-[#1a1a2e] z-50 flex flex-col items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
      >
        <div className="text-center px-4">
          {/* Minimal LP-style loading indicator */}
          <div className="mb-10">
            <motion.div 
              className="w-[2px] h-12 bg-emerald-500 mx-auto"
              animate={{ scaleY: [1, 0.4, 1] }}
              transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
            />
          </div>
          
          <motion.p
            className="text-[11px] uppercase tracking-[0.25em] text-white/50 font-medium mb-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            TRAVELLA AI
          </motion.p>
          
          <motion.h2
            className="font-serif text-2xl text-white mb-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            Curating your experience
          </motion.h2>
          
          <motion.p
            className="text-white/40 text-sm tracking-wide mb-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            Just a moment while we personalize your journey
          </motion.p>
          
          {/* Minimal progress bar */}
          <motion.div
            className="w-48 h-[2px] mx-auto bg-white/10 overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <motion.div
              className="h-full bg-emerald-500 w-full origin-left"
              animate={{ scaleX: [0, 1, 0] }}
              transition={{ 
                repeat: Infinity,
                duration: 2,
                ease: "easeInOut" 
              }}
            />
          </motion.div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default Loading;