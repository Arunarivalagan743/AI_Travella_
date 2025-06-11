import React, { useEffect } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { FaMapMarkedAlt, FaRobot, FaPlaneDeparture, FaRegLightbulb, FaStar } from 'react-icons/fa';

const About = () => {
  // Animation controls for scroll reveal effects
  const controls = {
    title: useAnimation(),
    image: useAnimation(),
    content: useAnimation(),
    cards: useAnimation(),
    video: useAnimation()
  };
  
  // Intersection observers
  const [titleRef, titleInView] = useInView({ threshold: 0.3, triggerOnce: true });
  const [aboutRef, aboutInView] = useInView({ threshold: 0.3, triggerOnce: true });
  const [howRef, howInView] = useInView({ threshold: 0.3, triggerOnce: true });
  const [experienceRef, experienceInView] = useInView({ threshold: 0.3, triggerOnce: true });

  // Trigger animations when sections come into view
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

  // Card animation for staggered reveal
  const cardVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  return (
    <div className="bg-gradient-to-b from-emerald-50 to-white min-h-screen text-gray-800 font-sans">
      
      {/* Hero Section with Animated Logo */}
      <section ref={titleRef} className="relative overflow-hidden py-24 px-4">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-100 to-teal-50" style={{ zIndex: "-1" }}></div>
        <motion.div className="absolute opacity-30 right-10 top-20 w-64 h-64 rounded-full bg-teal-200"
          animate={{ 
            scale: [1, 1.2, 1],
            x: [0, -30, 0],
            y: [0, 20, 0]
          }} 
          transition={{ 
            duration: 20,
            repeat: Infinity,
            repeatType: "reverse"
          }} 
          style={{ filter: "blur(60px)" }}
        />
        <motion.div className="absolute opacity-20 left-10 bottom-10 w-48 h-48 rounded-full bg-emerald-300"
          animate={{ 
            scale: [1, 1.4, 1],
            x: [0, 40, 0],
            y: [0, -20, 0]
          }} 
          transition={{ 
            duration: 15,
            repeat: Infinity,
            repeatType: "reverse"
          }} 
          style={{ filter: "blur(50px)" }}
        />

        <div className="max-w-6xl mx-auto text-center relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={controls.title}
          >
            <div className="flex items-center justify-center mb-6">
              <motion.div
                className="relative h-14 w-14 mr-3"
                animate={{ 
                  rotate: [0, 5, 0, -5, 0],
                }}
                transition={{ 
                  duration: 6, 
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-emerald-600 to-teal-400 flex items-center justify-center">
                  <FaStar className="text-white text-2xl" />
                </div>
                <motion.div 
                  className="absolute -inset-2 rounded-full border-2 border-emerald-400 border-opacity-50"
                  animate={{ 
                    scale: [1, 1.2, 1],
                    opacity: [0.7, 0.3, 0.7]
                  }}
                  transition={{ 
                    duration: 3, 
                    repeat: Infinity 
                  }}
                />
              </motion.div>
              <h1 className="text-5xl md:text-6xl font-bold">
                <span className="bg-gradient-to-r from-emerald-700 via-teal-600 to-emerald-600 bg-clip-text text-transparent">
                  AI Travella
                </span>
              </h1>
            </div>
            <p className="text-lg md:text-xl max-w-2xl mx-auto text-gray-700 leading-relaxed">
              Reimagine your journey with intelligent travel planning powered by cutting-edge AI and curated experiences.
            </p>
          </motion.div>
        </div>
      </section>

      {/* About Section */}
      <section ref={aboutRef} className="py-20 px-6 md:px-16 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row items-center gap-12">
          <motion.div 
            className="md:w-1/2"
            initial={{ opacity: 0, x: -80 }}
            animate={controls.image}
          >
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-tr from-emerald-500 to-teal-400 rounded-xl opacity-20 blur-lg"></div>
              <img
                src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e"
                alt="Scenic destination beach"
                className="rounded-xl shadow-xl relative z-10 w-full object-cover aspect-4/3"
              />
              <div className="absolute -bottom-3 -right-3 w-20 h-20 bg-white rounded-lg shadow-lg flex items-center justify-center">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                >
                  <FaRobot className="text-3xl text-emerald-600" />
                </motion.div>
              </div>
            </div>
          </motion.div>
          
          <motion.div 
            className="md:w-1/2"
            initial={{ opacity: 0, x: 80 }}
            animate={controls.content}
          >
            <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-emerald-700 to-teal-600 bg-clip-text text-transparent mb-6">
              Intelligent Travel Planning
            </h2>
            <p className="text-gray-700 leading-relaxed mb-5">
              AI Travella uses advanced artificial intelligence to transform how you plan your travels. Our platform creates personalized itineraries by analyzing your preferences alongside real-time data on weather, local events, and travel conditions.
            </p>
            <p className="text-gray-700 leading-relaxed mb-6">
              From hidden local gems to efficient route planning, we handle the complex details so you can focus on making memories. Whether you're seeking relaxation, adventure, or cultural immersion, AI Travella crafts journeys tailored to your unique travel style.
            </p>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-100">
                <div className="flex items-center text-emerald-700 font-semibold mb-1">
                  <motion.div 
                    animate={{ rotate: [0, 10, 0, -10, 0] }}
                    transition={{ duration: 3, repeat: Infinity }}
                    className="mr-2"
                  >
                    <FaMapMarkedAlt />
                  </motion.div>
                  <span>Smart Destinations</span>
                </div>
                <p className="text-sm text-gray-600">AI-curated locations based on your interests</p>
              </div>
              <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-100">
                <div className="flex items-center text-emerald-700 font-semibold mb-1">
                  <motion.div 
                    animate={{ y: [0, -3, 0, 3, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="mr-2"
                  >
                    <FaPlaneDeparture />
                  </motion.div>
                  <span>Effortless Planning</span>
                </div>
                <p className="text-sm text-gray-600">Complete itineraries in seconds, not hours</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* How It Works */}
      <section ref={howRef} className="py-20 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            animate={controls.cards}
          >
            <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-emerald-700 to-teal-600 bg-clip-text text-transparent mb-3">
              How AI Travella Works
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Our intelligent platform simplifies your journey from inspiration to destination
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: <FaMapMarkedAlt />,
                title: "Choose Location",
                description: "Select your dream destination or let our AI suggest personalized options based on your travel style",
                color: "from-emerald-500 to-emerald-700"
              },
              {
                icon: <FaRobot />,
                title: "AI Analysis",
                description: "Our algorithm processes thousands of data points including weather, events, and traveler insights",
                color: "from-teal-400 to-teal-600"
              },
              {
                icon: <FaPlaneDeparture />,
                title: "Custom Itinerary",
                description: "Receive a complete day-by-day plan with accommodations, activities, and transit options",
                color: "from-emerald-400 to-teal-500"
              },
              {
                icon: <FaRegLightbulb />,
                title: "Smart Insights",
                description: "Get local tips, packing suggestions, and cultural guidance to enhance your experience",
                color: "from-teal-500 to-emerald-600"
              }
            ].map((card, index) => (
              <motion.div 
                key={index}
                className="bg-white rounded-xl overflow-hidden shadow-lg transform transition-all hover:-translate-y-1 hover:shadow-xl"
                variants={cardVariants}
                initial="hidden"
                animate={controls.cards}
              >
                <div className={`h-2 bg-gradient-to-r ${card.color}`}></div>
                <div className="p-7">
                  <div className="mb-5 bg-emerald-50 w-14 h-14 rounded-full flex items-center justify-center text-2xl text-emerald-600">
                    {card.icon}
                  </div>
                  <h3 className="font-semibold text-xl text-gray-800 mb-2">
                    {card.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {card.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Experience Section */}
      <section ref={experienceRef} className="py-20 px-6 bg-gradient-to-b from-white to-emerald-50">
        <div className="max-w-5xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={controls.video}
            className="text-center mb-10"
          >
            <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-emerald-700 to-teal-600 bg-clip-text text-transparent mb-4">
              Experience AI Travella
            </h2>
            <p className="text-gray-700 max-w-2xl mx-auto mb-8">
              Watch how our intelligent platform transforms your travel planning experience
            </p>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 1 }}
            className="text-center mt-12"
          >
            <a 
              href="/create-trip" 
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-500 text-white font-medium rounded-lg shadow-lg hover:shadow-xl transform transition hover:-translate-y-0.5"
            >
              <span className="mr-2">Start Your Journey</span>
              <motion.span 
                animate={{ x: [0, 5, 0] }} 
                transition={{ repeat: Infinity, duration: 1.5 }}
              >
                →
              </motion.span>
            </a>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default About;