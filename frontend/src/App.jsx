import React, { useState, useEffect } from 'react';
import Hero from './components/ui/custom/Hero';
import LoadingScreen from './components/ui/custom/Loading';

function App() {
  const [initialLoading, setInitialLoading] = useState(true);
  
  useEffect(() => {
    // Show loading screen for initial app load
    const timer = setTimeout(() => {
      setInitialLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);
  
  return (
    <>
      {initialLoading ? (
        <LoadingScreen />
      ) : (
        <Hero />
      )}
    </>
  );
}

export default App;