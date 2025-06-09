import React from 'react';
import { FaMapMarkedAlt, FaRobot, FaPlaneDeparture, FaRegLightbulb } from 'react-icons/fa';

const About = () => {
  return (
    <div className="bg-emerald-50 min-h-screen text-gray-800 font-sans">
      
      {/* Hero Section */}
      <section className="text-center py-16 bg-emerald-100">
        <h1 className="text-4xl md:text-5xl font-bold text-emerald-800 mb-4">Welcome to AI Trip Planner</h1>
        <p className="text-lg max-w-2xl mx-auto text-emerald-700">Plan your perfect journey in seconds with smart suggestions powered by AI and real-time travel data.</p>
      </section>

      {/* About Section */}
      <section className="py-12 px-6 md:px-16 flex flex-col md:flex-row items-center gap-10">
        <div className="md:w-1/2">
          <img
            src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e"
            alt="Trip planning"
            className="rounded-xl shadow-lg"
          />
        </div>
        <div className="md:w-1/2">
          <h2 className="text-3xl font-semibold text-emerald-700 mb-4">About Our AI Planner</h2>
          <p className="text-gray-700 leading-relaxed mb-3">
            Our platform uses artificial intelligence to help you craft the ideal travel itinerary based on your preferences, budget, location, weather forecasts, and much more.
          </p>
          <p className="text-gray-700 leading-relaxed">
            From suggesting destinations to optimizing your routes, we make travel planning effortless and personalized — whether it's a quick weekend getaway or an international adventure.
          </p>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-14 px-6 bg-white">
        <h2 className="text-center text-3xl font-bold text-emerald-800 mb-10">How It Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center">
          <div className="p-6 rounded-xl bg-emerald-100 shadow">
            <FaMapMarkedAlt className="text-3xl text-emerald-700 mx-auto mb-3" />
            <h3 className="font-semibold text-emerald-700">Choose Location</h3>
            <p className="text-sm text-gray-600">Pick your dream destination or let the AI suggest one.</p>
          </div>
          <div className="p-6 rounded-xl bg-emerald-100 shadow">
            <FaRobot className="text-3xl text-emerald-700 mx-auto mb-3" />
            <h3 className="font-semibold text-emerald-700">AI Recommendations</h3>
            <p className="text-sm text-gray-600">Get personalized suggestions based on budget, weather, and preferences.</p>
          </div>
          <div className="p-6 rounded-xl bg-emerald-100 shadow">
            <FaPlaneDeparture className="text-3xl text-emerald-700 mx-auto mb-3" />
            <h3 className="font-semibold text-emerald-700">Plan Itinerary</h3>
            <p className="text-sm text-gray-600">View day-by-day plans with attractions, transport, and accommodation.</p>
          </div>
          <div className="p-6 rounded-xl bg-emerald-100 shadow">
            <FaRegLightbulb className="text-3xl text-emerald-700 mx-auto mb-3" />
            <h3 className="font-semibold text-emerald-700">Get Smart Tips</h3>
            <p className="text-sm text-gray-600">Learn safety, packing, and local tips tailored to your trip.</p>
          </div>
        </div>
      </section>

      {/* Video Section */}
      <section className="py-12 px-6 bg-emerald-50 text-center">
        <h2 className="text-3xl font-bold text-emerald-800 mb-6">See It In Action</h2>
        <div className="max-w-4xl mx-auto rounded-xl overflow-hidden shadow-lg">
          <iframe
            className="w-full h-64 md:h-96"
            src="https://www.youtube.com/embed/GEZhD3J89ZE" // Replace with your demo video link
            title="AI Trip Planner Demo"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        </div>
      </section>

    </div>
  );
};

export default About;
