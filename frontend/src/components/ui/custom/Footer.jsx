import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-gray-50 border-t border-gray-100">
      {/* Upper line with links */}
      <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col sm:flex-row justify-between items-center text-sm text-gray-500">
        <div className="flex space-x-6">
          <Link to="/" className="hover:text-emerald-600 transition-colors">Home</Link>
          <Link to="/about" className="hover:text-emerald-600 transition-colors">About</Link>
          <Link to="/create-trip" className="hover:text-emerald-600 transition-colors">Plan Trip</Link>
          <Link to="/contact" className="hover:text-emerald-600 transition-colors">Contact</Link>
        </div>
        <div className="flex items-center space-x-4 mt-2 sm:mt-0">
          <a href="mailto:info@travella.com" className="hover:text-emerald-600 transition-colors">info@travella.com</a>
        </div>
      </div>
      
      {/* Lower line with copyright */}
      <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col sm:flex-row justify-between items-center text-xs text-gray-400 border-t border-gray-100">
        <p>© {currentYear} Travella. All rights reserved.</p>
        <div className="flex space-x-4 mt-1 sm:mt-0">
          <Link to="/privacy" className="hover:text-emerald-600 transition-colors">Privacy</Link>
          <Link to="/terms" className="hover:text-emerald-600 transition-colors">Terms</Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;