import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

function JourneyBegins() {
  const cards = [
    {
      id: 'plan',
      subtitle: 'START PLANNING',
      title: 'TRIPS',
      cta: 'PLAN NOW',
      ctaLink: '/create-trip',
      image: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=800&q=80',
    },
    {
      id: 'explore',
      subtitle: 'READ',
      title: 'STORIES',
      cta: 'FIND INSPIRATION',
      ctaLink: '/explore',
      image: 'https://images.unsplash.com/photo-1528164344705-47542687000d?w=800&q=80',
    },
    {
      id: 'ai',
      subtitle: "WE'LL PLAN YOUR TRIP",
      title: 'JOURNEYS',
      cta: 'EXPLORE AI',
      ctaLink: '/create-trip',
      image: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800&q=80',
    },
  ];

  return (
    <section className="py-16 md:py-20 bg-[#f5f0eb]">
      <div className="max-w-[1400px] mx-auto px-6 md:px-8">
        {/* Section Header - horizontal rule with text */}
        <div className="flex items-center justify-between mb-12">
          <span className="text-[12px] font-semibold tracking-[0.2em] text-gray-600 uppercase" style={{ fontFamily: "'Inter', sans-serif" }}>
            YOUR JOURNEY BEGINS HERE.
          </span>
          <div className="flex-1 mx-6 h-px bg-gray-400" />
          <span className="text-[12px] font-semibold tracking-[0.2em] text-gray-600 uppercase" style={{ fontFamily: "'Inter', sans-serif" }}>
            CHOOSE YOUR FIRST STEP.
          </span>
        </div>

        {/* Three Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {cards.map((card, index) => (
            <motion.div
              key={card.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.15 }}
              className="relative group overflow-hidden"
            >
              <Link to={card.ctaLink} className="block">
                <div className="relative aspect-[3/4] overflow-hidden">
                  <img
                    src={card.image}
                    alt={card.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  
                  {/* Card Content */}
                  <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
                    <p className="text-[11px] font-semibold tracking-[0.2em] text-gray-300 uppercase mb-2" style={{ fontFamily: "'Inter', sans-serif" }}>
                      {card.subtitle}
                    </p>
                    <h3 className="text-3xl md:text-4xl font-black text-white uppercase mb-6" style={{ fontFamily: "'Inter', sans-serif", letterSpacing: '0.02em' }}>
                      {card.title}
                    </h3>
                    <div className="inline-block border border-white/80 px-5 py-2.5 group-hover:bg-white group-hover:text-gray-900 transition-all duration-300">
                      <span className="text-[12px] font-semibold tracking-[0.15em] text-white uppercase group-hover:text-gray-900" style={{ fontFamily: "'Inter', sans-serif" }}>
                        {card.cta} →
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default JourneyBegins;
