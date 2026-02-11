import React, { useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '/src/ModelWork/firebaseConfig.js';
import { GetPlaceDetails, PHOTO_REF_URL } from '@/ModelWork/GlobalApi';

const FALLBACK_STORIES = [
  {
    id: 'story-1',
    date: 'FEB 10, 2026',
    readTime: '8 MIN READ',
    title: 'HIGHLAND HYGGE: 6 WAYS TO FIND COORIE IN SCOTLAND',
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=80',
  },
  {
    id: 'story-2',
    date: 'FEB 10, 2026',
    readTime: '6 MIN READ',
    title: 'HOW TO GET AROUND IN CROATIA',
    image: 'https://images.unsplash.com/photo-1555990538-1bb7b2dbe1c7?w=600&q=80',
  },
  {
    id: 'story-3',
    date: 'FEB 10, 2026',
    readTime: '6 MIN READ',
    title: '10 TIPS FOR ENJOYING SINGAPORE ON A BUDGET',
    image: 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=600&q=80',
  },
  {
    id: 'story-4',
    date: 'FEB 10, 2026',
    readTime: '7 MIN READ',
    title: 'THE BEST NEIGHBORHOODS TO VISIT IN MEXICO CITY',
    image: 'https://images.unsplash.com/photo-1518105779142-d975f22f1b0a?w=600&q=80',
  },
  {
    id: 'story-5',
    date: 'FEB 9, 2026',
    readTime: '5 MIN READ',
    title: 'COSTUMES FROM AROUND THE WORLD OVER THE CENTURIES',
    image: 'https://images.unsplash.com/photo-1504805572947-34fad45aed93?w=600&q=80',
  },
];

function LatestStories() {
  const scrollRef = useRef(null);
  const [stories, setStories] = useState(FALLBACK_STORIES);

  useEffect(() => {
    const fetchStories = async () => {
      try {
        const tripsQuery = query(
          collection(db, "alltrips"),
          where("isPublic", "==", true),
          orderBy("createdAt", "desc"),
          limit(8)
        );
        const querySnapshot = await getDocs(tripsQuery);
        
        if (!querySnapshot.empty && querySnapshot.size >= 4) {
          const tripStories = [];
          for (const doc of querySnapshot.docs) {
            const trip = doc.data();
            const location = trip.userSelection?.location || trip.userSelection?.place?.label || '';
            const duration = trip.userSelection?.duration || 3;
            const createdAt = trip.createdAt ? new Date(trip.createdAt) : new Date();
            
            tripStories.push({
              id: doc.id,
              date: createdAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase(),
              readTime: `${Math.max(3, duration)} MIN READ`,
              title: `${trip.userSelection?.travelType?.toUpperCase() || 'ADVENTURE'} IN ${location.toUpperCase()}`,
              image: null,
              tripId: doc.id,
              summary: trip.tripData?.summary || '',
            });
          }

          // Fetch images
          const withImages = await Promise.all(
            tripStories.map(async (story) => {
              try {
                const location = story.title.split(' IN ')[1] || story.title;
                const response = await GetPlaceDetails({ textQuery: location });
                if (response?.data?.places?.[0]?.photos?.length > 0) {
                  const photoIdx = response.data.places[0].photos.length > 1 ? 1 : 0;
                  const photoName = response.data.places[0].photos[photoIdx].name;
                  return { ...story, image: PHOTO_REF_URL.replace('{Name}', photoName) };
                }
              } catch { /* fallback */ }
              return story;
            })
          );
          
          const validStories = withImages.filter(s => s.image);
          if (validStories.length >= 3) {
            setStories(validStories);
          }
        }
      } catch (error) {
        console.log("Using fallback stories");
      }
    };
    fetchStories();
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
        {/* Section Header */}
        <div className="flex items-center justify-between mb-10">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900" style={{ fontFamily: "'Playfair Display', serif" }}>
            Latest stories
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

        {/* Stories Carousel */}
        <div
          ref={scrollRef}
          className="flex gap-6 overflow-x-auto scrollbar-hide pb-4"
          style={{ scrollSnapType: 'x mandatory', scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {stories.map((story) => (
            <Link
              key={story.id}
              to={story.tripId ? `/show-trip/${story.tripId}` : '/explore'}
              className="flex-shrink-0 w-[320px] md:w-[350px] group cursor-pointer"
              style={{ scrollSnapAlign: 'start' }}
            >
              <div className="relative aspect-[4/3] overflow-hidden bg-gray-100 mb-4">
                <img
                  src={story.image}
                  alt={story.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  onError={(e) => {
                    e.target.src = 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=600&q=80';
                  }}
                />
              </div>
              <div className="flex items-center gap-6 mb-3">
                <span className="text-[11px] font-semibold tracking-[0.1em] text-gray-500" style={{ fontFamily: "'Inter', sans-serif" }}>
                  {story.date}
                </span>
                <span className="text-[11px] font-semibold tracking-[0.1em] text-gray-500" style={{ fontFamily: "'Inter', sans-serif" }}>
                  {story.readTime}
                </span>
              </div>
              <h3 className="text-[14px] font-bold tracking-[0.05em] text-gray-900 uppercase leading-relaxed group-hover:text-emerald-700 transition-colors" style={{ fontFamily: "'Inter', sans-serif" }}>
                {story.title}
              </h3>
              <div className="w-full h-px bg-emerald-500 mt-5" />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

export default LatestStories;
