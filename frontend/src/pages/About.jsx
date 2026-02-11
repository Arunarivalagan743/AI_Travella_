import React, { useEffect } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { FaMapMarkedAlt, FaRobot, FaPlaneDeparture, FaRegLightbulb, FaArrowRight } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const About = () => {
  const controls = {
    title: useAnimation(),
    image: useAnimation(),
    content: useAnimation(),
    cards: useAnimation(),
    video: useAnimation()
  };
  
  const [titleRef, titleInView] = useInView({ threshold: 0.3, triggerOnce: true });
  const [aboutRef, aboutInView] = useInView({ threshold: 0.3, triggerOnce: true });
  const [howRef, howInView] = useInView({ threshold: 0.3, triggerOnce: true });
  const [experienceRef, experienceInView] = useInView({ threshold: 0.3, triggerOnce: true });

  useEffect(() => {
    if (titleInView) {
      controls.title.start({ opacity: 1, y: 0, transition: { duration: 0.7, ease: "easeOut" } });
    }
    if (aboutInView) {
      controls.image.start({ opacity: 1, x: 0, transition: { duration: 0.8, ease: "easeOut" } });
      controls.content.start({ opacity: 1, x: 0, transition: { duration: 0.8, delay: 0.2, ease: "easeOut" } });
    }
    if (howInView) {
      controls.cards.start({ opacity: 1, y: 0, transition: { duration: 0.5, staggerChildren: 0.15, ease: "easeOut" } });
    }
    if (experienceInView) {
      controls.video.start({ opacity: 1, y: 0, transition: { duration: 0.7, ease: "easeOut" } });
    }
  }, [titleInView, aboutInView, howInView, experienceInView, controls]);

  const cardVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  return (
    <div className="bg-white min-h-screen text-gray-900">
      
      {/* Hero Section — LP editorial style */}
      <section ref={titleRef} className="relative overflow-hidden">
        <div 
          className="relative h-[70vh] min-h-[500px] bg-cover bg-center"
          style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1506929562872-bb421503ef21?auto=format&fit=crop&w=2000&q=80")' }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-[#1a1a2e] via-[#1a1a2e]/60 to-transparent" />
          
          <div className="absolute inset-0 flex items-end">
            <motion.div 
              className="max-w-4xl mx-auto w-full px-6 pb-16"
              initial={{ opacity: 0, y: 30 }}
              animate={controls.title}
            >
              <p className="text-[11px] uppercase tracking-[0.2em] text-emerald-400 font-medium mb-4">
                ABOUT TRAVELLA AI
              </p>
              <h1 className="font-serif text-5xl md:text-7xl text-white leading-[1.05] mb-6">
                Where Intelligence<br />Meets Adventure
              </h1>
              <p className="text-lg text-white/80 max-w-xl leading-relaxed tracking-wide">
                Reimagine your journey with intelligent travel planning powered by cutting-edge AI and curated experiences.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* About Section — clean editorial */}
      <section ref={aboutRef} className="py-20 px-6 md:px-16 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row items-start gap-16">
          <motion.div 
            className="md:w-1/2"
            initial={{ opacity: 0, x: -60 }}
            animate={controls.image}
          >
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e"
                alt="Scenic destination beach"
                className="w-full object-cover aspect-[4/3]"
              />
              <div className="absolute bottom-0 left-0 bg-emerald-600 px-4 py-2">
                <span className="text-[11px] uppercase tracking-[0.2em] text-white font-medium">AI-POWERED</span>
              </div>
            </div>
          </motion.div>
          
          <motion.div 
            className="md:w-1/2"
            initial={{ opacity: 0, x: 60 }}
            animate={controls.content}
          >
            <p className="text-[11px] uppercase tracking-[0.2em] text-emerald-600 font-medium mb-4">OUR MISSION</p>
            <h2 className="font-serif text-3xl md:text-4xl text-[#1a1a2e] mb-6 leading-tight">
              Intelligent Travel Planning
            </h2>
            <div className="w-12 h-[2px] bg-emerald-600 mb-6" />
            <p className="text-gray-600 leading-relaxed mb-5 tracking-wide">
              AI Travella uses advanced artificial intelligence to transform how you plan your travels. Our platform creates personalized itineraries by analyzing your preferences alongside real-time data on weather, local events, and travel conditions.
            </p>
            <p className="text-gray-600 leading-relaxed mb-8 tracking-wide">
              From hidden local gems to efficient route planning, we handle the complex details so you can focus on making memories. Whether you're seeking relaxation, adventure, or cultural immersion, AI Travella crafts journeys tailored to your unique travel style.
            </p>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="border border-gray-200 p-5">
                <div className="flex items-center gap-2 mb-2">
                  <FaMapMarkedAlt className="text-emerald-600" />
                  <span className="text-[12px] uppercase tracking-[0.15em] font-semibold text-[#1a1a2e]">Smart Destinations</span>
                </div>
                <p className="text-sm text-gray-500 leading-relaxed">AI-curated locations based on your interests</p>
              </div>
              <div className="border border-gray-200 p-5">
                <div className="flex items-center gap-2 mb-2">
                  <FaPlaneDeparture className="text-emerald-600" />
                  <span className="text-[12px] uppercase tracking-[0.15em] font-semibold text-[#1a1a2e]">Effortless Planning</span>
                </div>
                <p className="text-sm text-gray-500 leading-relaxed">Complete itineraries in seconds, not hours</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* How It Works — LP card style */}
      <section ref={howRef} className="py-20 px-6 bg-[#f5f0eb]">
        <div className="max-w-6xl mx-auto">
          <motion.div 
            className="mb-16"
            initial={{ opacity: 0, y: 30 }}
            animate={controls.cards}
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="flex-1 h-[1px] bg-[#1a1a2e]/20" />
              <p className="text-[11px] uppercase tracking-[0.2em] text-[#1a1a2e]/60 font-medium">HOW IT WORKS</p>
              <div className="flex-1 h-[1px] bg-[#1a1a2e]/20" />
            </div>
            <h2 className="font-serif text-3xl md:text-4xl text-[#1a1a2e] text-center">
              Your Journey in Four Steps
            </h2>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: <FaMapMarkedAlt />,
                step: "01",
                title: "Choose Location",
                description: "Select your dream destination or let our AI suggest personalized options based on your travel style"
              },
              {
                icon: <FaRobot />,
                step: "02",
                title: "AI Analysis",
                description: "Our algorithm processes thousands of data points including weather, events, and traveler insights"
              },
              {
                icon: <FaPlaneDeparture />,
                step: "03",
                title: "Custom Itinerary",
                description: "Receive a complete day-by-day plan with accommodations, activities, and transit options"
              },
              {
                icon: <FaRegLightbulb />,
                step: "04",
                title: "Smart Insights",
                description: "Get local tips, packing suggestions, and cultural guidance to enhance your experience"
              }
            ].map((card, index) => (
              <motion.div 
                key={index}
                className="bg-white overflow-hidden hover:-translate-y-1 transition-all duration-300 group"
                variants={cardVariants}
                initial="hidden"
                animate={controls.cards}
              >
                <div className="h-[3px] bg-emerald-600 w-0 group-hover:w-full transition-all duration-500" />
                <div className="p-7">
                  <div className="flex items-center justify-between mb-6">
                    <span className="text-[11px] uppercase tracking-[0.2em] text-emerald-600 font-semibold">STEP {card.step}</span>
                    <span className="text-emerald-600 text-xl">{card.icon}</span>
                  </div>
                  <h3 className="text-[13px] uppercase tracking-[0.15em] font-bold text-[#1a1a2e] mb-3">
                    {card.title}
                  </h3>
                  <p className="text-sm text-gray-500 leading-relaxed">
                    {card.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section — LP editorial style */}
      <section ref={experienceRef} className="py-24 px-6 bg-[#1a1a2e]">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={controls.video}
          >
            <p className="text-[11px] uppercase tracking-[0.2em] text-emerald-400 font-medium mb-6">START YOUR ADVENTURE</p>
            <h2 className="font-serif text-4xl md:text-5xl text-white mb-6 leading-tight">
              Ready to Experience<br />AI-Powered Travel?
            </h2>
            <p className="text-white/60 max-w-xl mx-auto mb-10 leading-relaxed tracking-wide">
              Let our intelligent platform transform your travel planning. Create your first AI-generated trip in minutes.
            </p>
            <div className="flex items-center justify-center gap-4">
              <Link 
                to="/create-trip"
                className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3 text-[12px] uppercase tracking-[0.15em] font-semibold transition-colors"
              >
                PLAN YOUR TRIP <FaArrowRight size={12} />
              </Link>
              <Link 
                to="/explore"
                className="inline-flex items-center gap-2 border border-white/30 hover:border-white text-white px-8 py-3 text-[12px] uppercase tracking-[0.15em] font-semibold transition-colors"
              >
                EXPLORE STORIES
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default About;