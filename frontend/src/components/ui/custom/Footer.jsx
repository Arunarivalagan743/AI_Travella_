import React from 'react';
import { Link } from 'react-router-dom';
import { FaFacebookF, FaTwitter, FaInstagram, FaYoutube } from 'react-icons/fa';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  const footerLinks = [
    {
      title: 'EXPLORE',
      links: [
        { name: 'Destinations', path: '/explore' },
        { name: 'Plan a Trip', path: '/create-trip' },
        { name: 'AI Assistant', path: '/create-trip' },
      ],
    },
    {
      title: 'ABOUT',
      links: [
        { name: 'About Travella', path: '/about' },
        { name: 'Contact', path: '/about' },
      ],
    },
    {
      title: 'ACCOUNT',
      links: [
        { name: 'Sign In', path: '/' },
        { name: 'My Trips', path: '/my-trips' },
        { name: 'My Profile', path: '/' },
      ],
    },
  ];
  
  return (
    <footer className="bg-[#1a1a2e] text-white">
      {/* Main Footer */}
      <div className="max-w-[1400px] mx-auto px-6 md:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand Column */}
          <div>
            <Link to="/" className="inline-block mb-6">
              <span className="text-xl font-bold tracking-[0.15em] uppercase" style={{ fontFamily: "'Inter', sans-serif" }}>
                Travella
              </span>
            </Link>
            <p className="text-sm text-gray-400 leading-relaxed mb-6">
              AI-powered travel planning. Discover your perfect journey with personalized recommendations.
            </p>
            <div className="flex gap-4">
              <a href="#" className="w-9 h-9 border border-gray-600 flex items-center justify-center text-gray-400 hover:text-white hover:border-white transition-colors">
                <FaFacebookF className="text-sm" />
              </a>
              <a href="#" className="w-9 h-9 border border-gray-600 flex items-center justify-center text-gray-400 hover:text-white hover:border-white transition-colors">
                <FaTwitter className="text-sm" />
              </a>
              <a href="#" className="w-9 h-9 border border-gray-600 flex items-center justify-center text-gray-400 hover:text-white hover:border-white transition-colors">
                <FaInstagram className="text-sm" />
              </a>
              <a href="#" className="w-9 h-9 border border-gray-600 flex items-center justify-center text-gray-400 hover:text-white hover:border-white transition-colors">
                <FaYoutube className="text-sm" />
              </a>
            </div>
          </div>
          
          {/* Link Columns */}
          {footerLinks.map((section) => (
            <div key={section.title}>
              <h4 className="text-[12px] font-bold tracking-[0.2em] text-gray-400 uppercase mb-5" style={{ fontFamily: "'Inter', sans-serif" }}>
                {section.title}
              </h4>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.name}>
                    <Link
                      to={link.path}
                      className="text-sm text-gray-400 hover:text-white transition-colors"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
      
      {/* Bottom Bar */}
      <div className="border-t border-gray-700/50">
        <div className="max-w-[1400px] mx-auto px-6 md:px-8 py-5 flex flex-col sm:flex-row justify-between items-center gap-3">
          <p className="text-xs text-gray-500">
            © {currentYear} Travella AI. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <Link to="/privacy" className="text-xs text-gray-500 hover:text-gray-300 transition-colors">Privacy</Link>
            <Link to="/terms" className="text-xs text-gray-500 hover:text-gray-300 transition-colors">Terms</Link>
            <Link to="/about" className="text-xs text-gray-500 hover:text-gray-300 transition-colors">Accessibility</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;