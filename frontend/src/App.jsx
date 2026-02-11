import React, { useState, useEffect } from 'react';
import Hero from './components/ui/custom/Hero';
import FeaturedDestinations from './components/ui/custom/FeaturedDestinations';
import LatestStories from './components/ui/custom/LatestStories';
import JourneyBegins from './components/ui/custom/JourneyBegins';
import JourneysCarousel from './components/ui/custom/JourneysCarousel';
import LoadingScreen from './components/ui/custom/Loading';

function App() {
  const [initialLoading, setInitialLoading] = useState(true);
  
  useEffect(() => {
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
        <div className="min-h-screen">
          <Hero />
          <FeaturedDestinations />
          <LatestStories />
          <JourneyBegins />
          <JourneysCarousel />
        </div>
      )}
    </>
  );
}

export default App;