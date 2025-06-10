import React, { useState, useEffect } from 'react';
import { Outlet, useNavigation, useLocation } from 'react-router-dom';
import Header from '../ui/custom/Header';
import Footer from '../ui/custom/Footer';
import LoadingScreen from '../ui/custom/Loading';

export const Layout = () => {
  const navigation = useNavigation();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(true);
  
  // Handle initial load - hide the HTML spinner and show our React loader
  useEffect(() => {
    // Hide the initial HTML loader if it exists
    if (window.hideInitialLoader) {
      window.hideInitialLoader();
    }
    
    // Short delay for smoother transition
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Handle navigation loading states
  useEffect(() => {
    if (navigation.state === "loading") {
      setIsLoading(true);
    } else {
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 500); // Shorter time for navigation
      return () => clearTimeout(timer);
    }
  }, [navigation.state]);
  
  // Handle page refreshes specifically
  useEffect(() => {
    // Only show loading on actual refresh, not on navigation
    const pageLoadTime = performance.now();
    const isHardRefresh = !sessionStorage.getItem('lastNavTime') || 
                          (pageLoadTime - sessionStorage.getItem('lastNavTime') > 300);
    
    if (isHardRefresh) {
      setIsLoading(true);
      
      // Shorter loading time for better UX
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 700);
      
      return () => clearTimeout(timer);
    }
    
    // Store time for future refresh detection
    sessionStorage.setItem('lastNavTime', pageLoadTime);
  }, [location.key]); // location.key changes on both navigation and refresh
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow relative">
        {isLoading && <LoadingScreen />}
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};