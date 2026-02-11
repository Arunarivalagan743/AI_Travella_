import React, { useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '/src/ModelWork/firebaseConfig.js';
import { GetPlaceDetails, PHOTO_REF_URL } from '@/ModelWork/GlobalApi';

const FALLBACK_JOURNEYS = [
  {
    id: 'j1',
    duration: '10 DAYS / 9 NIGHTS',
    title: 'A PORTAL THROUGH PORTUGAL: LISBON, PORTO, AND THE COASTAL TREASURES IN BETWEEN',
    price: '₹3,120',
    image: 'https://images.unsplash.com/photo-1555881400-74d7acaacd8b?w=600&q=80',
  },
  {
    id: 'j2',
    duration: '10 DAYS / 9 NIGHTS',
    title: 'MEET MOROCCO: 10 DAYS IN MARRAKESH, ESSAOUIRA, THE ATLAS MOUNTAINS',
    price: '₹3,750',
    image: 'https://images.unsplash.com/photo-1539020140153-e479b8c22e70?w=600&q=80',
  },
  {
    id: 'j3',
    duration: '12 DAYS / 11 NIGHTS',
    title: "SOUTH AFRICA'S STUNNING SOUTH: CAPE TOWN, WINE COUNTRY, AND THE GARDEN ROUTE",
    price: '₹3,100',
    image: 'https://images.unsplash.com/photo-1580060839134-75a5edca2e99?w=600&q=80',
  },
  {
    id: 'j4',
    duration: '14 DAYS / 13 NIGHTS',
    title: 'PERU UNCOVERED: A JOURNEY FROM COAST TO ANDES',
    price: '₹4,895',
    image: 'https://images.unsplash.com/photo-1526392060635-9d6019884377?w=600&q=80',
  },
  {
    id: 'j5',
    duration: '11 DAYS / 10 NIGHTS',
    title: 'THE FRENCH PROVENCE: A JOURNEY THROUGH SOUTHERN FRANCE',
    price: '₹4,430',
    image: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=600&q=80',
  },
];

function JourneysCarousel() {
  const scrollRef = useRef(null);
  const [journeys, setJourneys] = useState(FALLBACK_JOURNEYS);

  useEffect(() => {
    const fetchJourneys = async () => {
      try {
        const tripsQuery = query(
          collection(db, "alltrips"),
          where("isPublic", "==", true),
          orderBy("likesCount", "desc"),
          limit(8)
        );
        const querySnapshot = await getDocs(tripsQuery);
        
        if (!querySnapshot.empty && querySnapshot.size >= 4) {
          const tripJourneys = [];
          
          for (const doc of querySnapshot.docs) {
            const trip = doc.data();
            const location = trip.userSelection?.location || trip.userSelection?.place?.label || 'Unknown';
            const duration = parseInt(trip.userSelection?.duration) || 5;
            const nights = duration - 1;
            const budget = trip.userSelection?.budget || 'moderate';
            
            const priceMap = { cheap: '₹1,200', moderate: '₹2,500', luxury: '₹4,800' };
            
            tripJourneys.push({
              id: doc.id,
              duration: `${duration} DAYS / ${nights} NIGHTS`,
              title: `${trip.userSelection?.travelType?.toUpperCase() || 'ADVENTURE'} IN ${location.toUpperCase()}: DISCOVER THE BEST OF ${location.toUpperCase()}`,
              price: priceMap[budget] || '₹2,500',
              image: null,
              tripId: doc.id,
            });
          }

          const withImages = await Promise.all(
            tripJourneys.map(async (journey) => {
              try {
                const loc = journey.title.split(' IN ')[1]?.split(':')[0] || journey.title;
                const response = await GetPlaceDetails({ textQuery: loc });
                if (response?.data?.places?.[0]?.photos?.length > 0) {
                  const photoIdx = Math.min(2, response.data.places[0].photos.length - 1);
                  const photoName = response.data.places[0].photos[photoIdx].name;
                  return { ...journey, image: PHOTO_REF_URL.replace('{Name}', photoName) };
                }
              } catch { /* use fallback */ }
              return journey;
            })
          );
          
          const valid = withImages.filter(j => j.image);
          if (valid.length >= 3) setJourneys(valid);
        }
      } catch (error) {
        console.log("Using fallback journeys");
      }
    };
    fetchJourneys();
  }, []);

  const scroll = (direction) => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -380 : 380,
        behavior: 'smooth'
      });
    }
  };

  return (
    <section className="py-16 md:py-20 bg-white border-t border-gray-100">
      <div className="max-w-[1400px] mx-auto px-6 md:px-8">
        {/* Description */}
        <div className="flex items-start justify-between mb-10">
          <div className="max-w-2xl">
            <p className="text-[15px] text-gray-700 leading-relaxed" style={{ fontFamily: "'Inter', sans-serif" }}>
              Lock in your 2026 travel plans with Travella AI Journeys. Check out our favorite ready-to-explore
              trips, crafted by our AI-powered travel planner for destinations all over the world.
            </p>
          </div>
          <div className="flex items-center gap-3">
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

        {/* Journeys Carousel */}
        <div
          ref={scrollRef}
          className="flex gap-5 overflow-x-auto scrollbar-hide pb-4"
          style={{ scrollSnapType: 'x mandatory', scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {journeys.map((journey) => (
            <Link
              key={journey.id}
              to={journey.tripId ? `/show-trip/${journey.tripId}` : '/create-trip'}
              className="flex-shrink-0 w-[300px] md:w-[320px] group cursor-pointer"
              style={{ scrollSnapAlign: 'start' }}
            >
              {/* Image with badge */}
              <div className="relative aspect-[4/5] overflow-hidden bg-gray-100 mb-4">
                <img
                  src={journey.image}
                  alt={journey.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  onError={(e) => {
                    e.target.src = 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=600&q=80';
                  }}
                />
                {/* Top Badge */}
                <div className="absolute top-0 left-0 right-0 bg-[#1a1a2e] px-4 py-2.5">
                  <span className="text-[11px] font-bold tracking-[0.2em] text-white uppercase" style={{ fontFamily: "'Inter', sans-serif" }}>
                    TRAVELLA AI JOURNEYS
                  </span>
                </div>
              </div>

              {/* Content */}
              <div>
                <p className="text-[11px] font-semibold tracking-[0.12em] text-gray-500 uppercase mb-2" style={{ fontFamily: "'Inter', sans-serif" }}>
                  {journey.duration}
                </p>
                <h3 className="text-[14px] font-bold tracking-[0.03em] text-gray-900 uppercase leading-relaxed mb-4 min-h-[60px]" style={{ fontFamily: "'Inter', sans-serif" }}>
                  {journey.title}
                </h3>
                <div className="flex items-center justify-between mt-auto">
                  <div>
                    <span className="text-[12px] font-semibold tracking-[0.05em] text-gray-500 uppercase" style={{ fontFamily: "'Inter', sans-serif" }}>
                      FROM{' '}
                    </span>
                    <span className="text-[15px] font-bold text-gray-900" style={{ fontFamily: "'Inter', sans-serif" }}>
                      {journey.price}
                    </span>
                    <br />
                    <span className="text-[11px] text-gray-500" style={{ fontFamily: "'Inter', sans-serif" }}>
                      per person
                    </span>
                  </div>
                  <div className="bg-emerald-600 text-white px-4 py-2 group-hover:bg-emerald-700 transition-colors">
                    <span className="text-[11px] font-bold tracking-[0.15em] uppercase" style={{ fontFamily: "'Inter', sans-serif" }}>
                      BOOK NOW →
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

export default JourneysCarousel;
