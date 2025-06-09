import React from 'react';
import { Link } from 'react-router-dom';
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin, FaMapMarkedAlt, FaPaperPlane } from 'react-icons/fa';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="relative bg-gradient-to-r from-emerald-900 via-teal-800 to-emerald-900 text-white overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -right-20 top-0 w-64 h-64 bg-emerald-700 rounded-full opacity-10 blur-2xl"></div>
        <div className="absolute left-10 bottom-0 w-56 h-56 bg-teal-700 rounded-full opacity-10 blur-2xl"></div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8 relative">
        {/* Main Footer Content - Simplified to 3 columns */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* About Section - Condensed */}
          <div>
            <h3 className="text-base font-bold mb-2 text-emerald-100">About Travella</h3>
            <p className="text-emerald-200 mb-3 text-sm leading-relaxed">
              AI-powered personalized travel itineraries tailored to your preferences and budget.
            </p>
            <div className="flex space-x-4">
              <a href="https://facebook.com" className="text-emerald-200 hover:text-white transition-colors">
                <FaFacebook size={18} />
              </a>
              <a href="https://twitter.com" className="text-emerald-200 hover:text-white transition-colors">
                <FaTwitter size={18} />
              </a>
              <a href="https://instagram.com" className="text-emerald-200 hover:text-white transition-colors">
                <FaInstagram size={18} />
              </a>
              <a href="https://linkedin.com" className="text-emerald-200 hover:text-white transition-colors">
                <FaLinkedin size={18} />
              </a>
            </div>
          </div>
          
          {/* Quick Links - Simplified */}
          <div>
            <h3 className="text-base font-bold mb-2 text-emerald-100">Quick Links</h3>
            <div className="grid grid-cols-2 gap-1 text-sm">
              <Link to="/" className="text-emerald-200 hover:text-white transition-colors">Home</Link>
              <Link to="/about" className="text-emerald-200 hover:text-white transition-colors">About Us</Link>
              <Link to="/create-trip" className="text-emerald-200 hover:text-white transition-colors">Plan a Trip</Link>
              <Link to="/explore-destinations" className="text-emerald-200 hover:text-white transition-colors">Destinations</Link>
              <Link to="/contact" className="text-emerald-200 hover:text-white transition-colors">Contact</Link>
              <Link to="/faq" className="text-emerald-200 hover:text-white transition-colors">FAQ</Link>
            </div>
          </div>
          
          {/* Newsletter - More Compact */}
          <div>
            <h3 className="text-base font-bold mb-2 text-emerald-100">Stay Updated</h3>
            <div className="flex">
              <input 
                type="email" 
                placeholder="Your email" 
                className="px-3 py-2 text-sm rounded-l-lg w-full bg-emerald-800/50 border border-emerald-700 text-white focus:outline-none"
              />
              <button className="bg-gradient-to-r from-emerald-600 to-teal-500 text-white px-3 py-2 rounded-r-lg font-medium text-sm">
                Subscribe
              </button>
            </div>
            <div className="mt-3 text-xs text-emerald-300 flex items-center gap-2">
              <FaMapMarkedAlt size={12} />
              <span>123 Travel Street, Adventure City</span>
            </div>
            <div className="text-xs text-emerald-300 flex items-center gap-2">
              <FaPaperPlane size={12} />
              <span>info@travella.com • +1 (555) 123-4567</span>
            </div>
          </div>
        </div>
        
        {/* Copyright - Simplified */}
        <div className="border-t border-emerald-700/50 mt-5 pt-4 flex flex-col md:flex-row justify-between items-center text-xs">
          <p className="text-emerald-300">
            © {currentYear} Travella. All rights reserved.
          </p>
          <div className="flex space-x-4 mt-2 md:mt-0">
            <Link to="/privacy" className="text-emerald-300 hover:text-white transition-colors">
              Privacy
            </Link>
            <Link to="/terms" className="text-emerald-300 hover:text-white transition-colors">
              Terms
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;