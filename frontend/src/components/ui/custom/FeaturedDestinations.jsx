import React, { useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '/src/ModelWork/firebaseConfig.js';
import { GetPlaceDetails, PHOTO_REF_URL } from '@/ModelWork/GlobalApi';

const FALLBACK_DESTINATIONS = [
  { id: 'sri-lanka', region: 'ASIA', name: 'SRI LANKA', image: 'https://images.unsplash.com/photo-1586523969200-7b6b18bfc81a?w=600&q=80' },
  { id: 'london', region: 'ENGLAND', name: 'LONDON', image: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=600&q=80' },
  { id: 'puerto-rico', region: 'CARIBBEAN', name: 'PUERTO RICO', image: 'https://images.unsplash.com/photo-1579687196544-08ae57ab7b96?w=600&q=80' },
  { id: 'new-orleans', region: 'THE USA', name: 'NEW ORLEANS', image: 'https://images.unsplash.com/photo-1568402102990-bc541580b59f?w=600&q=80' },
  { id: 'copenhagen', region: 'DENMARK', name: 'COPENHAGEN', image: 'https://images.unsplash.com/photo-1513622470522-26c3c8a854bc?w=600&q=80' },
  { id: 'tokyo', region: 'JAPAN', name: 'TOKYO', image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=600&q=80' },
  { id: 'barcelona', region: 'SPAIN', name: 'BARCELONA', image: 'https://images.unsplash.com/photo-1583422409516-2895a77efded?w=600&q=80' },
  { id: 'bali', region: 'INDONESIA', name: 'BALI', image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=600&q=80' },
];

function FeaturedDestinations() {
  const scrollRef = useRef(null);
  const [destinations, setDestinations] = useState(FALLBACK_DESTINATIONS);
  const [hoveredId, setHoveredId] = useState(null);

  // Try to fetch real trip destinations from Firebase
  useEffect(() => {
    const fetchDestinations = async () => {
      try {
        const tripsQuery = query(
          collection(db, "alltrips"),
          where("isPublic", "==", true),
          orderBy("likesCount", "desc"),
          limit(10)
        );
        const querySnapshot = await getDocs(tripsQuery);
        
        if (!querySnapshot.empty) {
          const tripDestinations = [];
          for (const doc of querySnapshot.docs) {
            const trip = doc.data();
            const location = trip.userSelection?.location || trip.userSelection?.place?.label;
            if (location && !tripDestinations.find(d => d.name === location.toUpperCase())) {
              tripDestinations.push({
                id: doc.id,
                region: trip.userSelection?.travelType?.toUpperCase() || 'ADVENTURE',
                name: location.toUpperCase(),
                image: null,
                tripId: doc.id,
              });
            }
          }
          
          if (tripDestinations.length >= 4) {
            // Fetch images for each destination
            const withImages = await Promise.all(
              tripDestinations.map(async (dest) => {
                try {
                  const response = await GetPlaceDetails({ textQuery: dest.name });
                  if (response?.data?.places?.[0]?.photos?.length > 0) {
                    const photoName = response.data.places[0].photos[0].name;
                    return { ...dest, image: PHOTO_REF_URL.replace('{Name}', photoName) };
                  }
                } catch { /* use fallback */ }
                return dest;
              })
            );
            setDestinations(withImages.filter(d => d.image));
          }
        }
      } catch (error) {
        console.log("Using fallback destinations");
      }
    };
    fetchDestinations();
  }, []);

  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = 320;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  return (
    <section className="py-16 md:py-20 bg-white">
      <div className="max-w-[1400px] mx-auto px-6 md:px-8">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-10">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900" style={{ fontFamily: "'Playfair Display', serif" }}>
            Featured destinations
          </h2>
          <div className="flex items-center gap-3">
            <Link to="/explore" className="text-[13px] font-semibold tracking-[0.12em] text-gray-800 border-b-2 border-gray-800 pb-0.5 hover:text-emerald-600 hover:border-emerald-600 transition-colors uppercase hidden sm:block" style={{ fontFamily: "'Inter', sans-serif" }}>
              VIEW ALL
            </Link>
            <button
              onClick={() => scroll('left')}
              className="w-10 h-10 border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors"
            >
              <FaChevronLeft className="text-sm" />
            </button>
            <button
              onClick={() => scroll('right')}
              className="w-10 h-10 bg-gray-900 text-white flex items-center justify-center hover:bg-gray-800 transition-colors"
            >
              <FaChevronRight className="text-sm" />
            </button>
          </div>
        </div>

        {/* Destinations Carousel */}
        <div
          ref={scrollRef}
          className="flex gap-5 overflow-x-auto scrollbar-hide pb-4"
          style={{ scrollSnapType: 'x mandatory', scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {destinations.map((dest) => (
            <Link
              key={dest.id}
              to={dest.tripId ? `/show-trip/${dest.tripId}` : '/explore'}
              className="flex-shrink-0 w-[280px] md:w-[300px] group cursor-pointer"
              style={{ scrollSnapAlign: 'start' }}
              onMouseEnter={() => setHoveredId(dest.id)}
              onMouseLeave={() => setHoveredId(null)}
            >
              <div className={`relative aspect-[4/5] overflow-hidden bg-gray-100 mb-4 transition-shadow duration-300 ${hoveredId === dest.id ? 'shadow-xl ring-2 ring-gray-200' : ''}`}>
                <img
                  src={dest.image}
                  alt={dest.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  onError={(e) => {
                    e.target.src = 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=600&q=80';
                  }}
                />
              </div>
              <div>
                <p className="text-[11px] font-semibold tracking-[0.15em] text-gray-500 uppercase mb-1" style={{ fontFamily: "'Inter', sans-serif" }}>
                  {dest.region}
                </p>
                <h3 className="text-[15px] font-bold tracking-[0.08em] text-gray-900 uppercase" style={{ fontFamily: "'Inter', sans-serif" }}>
                  {dest.name}
                </h3>
                {hoveredId === dest.id && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-3"
                  >
                    <span className="text-[12px] font-semibold tracking-[0.1em] text-gray-800 uppercase border-b border-gray-800 pb-0.5" style={{ fontFamily: "'Inter', sans-serif" }}>
                      DISCOVER →
                    </span>
                  </motion.div>
                )}
              </div>
              <div className="w-full h-px bg-emerald-500 mt-4" />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

export default FeaturedDestinations;
