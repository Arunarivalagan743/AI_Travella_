import React from 'react'
import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';

// Welcome Message Component - LP Editorial Style
function WelcomeMessage({ location }) {
  const { user } = useAuth();
  const [userName, setUserName] = useState('Traveler');
  
  useEffect(() => {
    if (user && user.name) {
      setUserName(user.name);
      return;
    }
    
    try {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        if (parsedUser.name) {
          setUserName(parsedUser.name);
          return;
        }
      }
      
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
    <div className="bg-[#1a1a2e] text-white px-6 py-4 flex items-center justify-between">
      <div>
        <p className="text-[11px] uppercase tracking-[0.2em] text-white/50 font-medium mb-1">Welcome Back</p>
        <h2 className="font-serif text-xl sm:text-2xl text-white mb-1">
          @{userName}
        </h2>
        <p className="text-sm text-white/60">
          Your personalized trip to <span className="font-medium text-emerald-400">{location}</span> is ready
        </p>
      </div>
      
      <div className="hidden sm:flex h-12 w-12 bg-emerald-600 items-center justify-center">
        <span className="text-white font-serif text-lg">{userName.charAt(0).toUpperCase()}</span>
      </div>
    </div>
  );
}

export default WelcomeMessage;