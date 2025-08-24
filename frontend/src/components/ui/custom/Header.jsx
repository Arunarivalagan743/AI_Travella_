
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaUserCircle, FaSignOutAlt, FaSuitcaseRolling, FaHome, FaInfoCircle, FaGlobe } from 'react-icons/fa';
import { MdClose } from 'react-icons/md';
import { Link, useLocation } from 'react-router-dom';
import { useGoogleLogin } from '@react-oauth/google';
import axios from 'axios';
import { useAuth } from '../../../context/AuthContext';

const menuItems = [
  { name: 'Home', path: '/', icon: <FaHome className="inline mr-2 mb-0.5" /> },
  { name: 'Explore', path: '/explore', icon: <FaGlobe className="inline mr-2 mb-0.5" /> },
  { name: 'About Us', path: '/about', icon: <FaInfoCircle className="inline mr-2 mb-0.5" /> },
];

function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { user, login, loginWithFirebase, logout } = useAuth();
  const location = useLocation();

  // Close mobile nav on desktop resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) setMobileMenuOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Add body class to prevent scrolling when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.classList.add('overflow-hidden');
    } else {
      document.body.classList.remove('overflow-hidden');
    }
    return () => {
      document.body.classList.remove('overflow-hidden');
    };
  }, [mobileMenuOpen]);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://cdn.lordicon.com/lordicon.js';
    script.defer = true;
    document.body.appendChild(script);
    return () => document.body.removeChild(script);
  }, []);

  // Use direct Firebase Authentication instead of Google OAuth
  const handleFirebaseLogin = async () => {
    try {
      setOpenDialog(false);
      setIsLoading(true);
      await loginWithFirebase();
    } catch (error) {
      console.error("Failed to login with Firebase:", error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Keep the original Google OAuth method as a fallback
  const googleLogin = useGoogleLogin({
    onSuccess: (response) => {
      setOpenDialog(false);
      setIsLoading(true);
      GetUserProfile(response);
    },
    onError: () => setIsLoading(false)
  });

  const GetUserProfile = async (tokenInfo) => {
    if (!tokenInfo?.access_token) {
      setIsLoading(false);
      return;
    }
    try {
      // Try to use the access token to sign in with Firebase
      const userData = { access_token: tokenInfo.access_token };
      await login(userData, tokenInfo.access_token);
    } catch (error) {
      console.error("Failed to authenticate with Firebase using token:", error);
      setIsLoading(false);
    }
  };

  const handleSignOut = () => logout();

  const dialogVariants = {
    hidden: { opacity: 0, scale: 0.9, y: 20 },
    visible: { opacity: 1, scale: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 30 } },
    exit: { opacity: 0, scale: 0.9, y: 20, transition: { duration: 0.2 } }
  };

  return (
    <>
      <header className="sticky top-0 z-50 w-full py-3 px-6 md:px-8 shadow-sm border-b border-gray-100 bg-white/60 backdrop-blur-lg">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          {/* Logo */}
          <motion.div className="flex items-center gap-3">
            <motion.div
              className="relative w-12 h-12 rounded-xl overflow-hidden flex items-center justify-center backdrop-blur-sm"
              whileHover={{ scale: 1.1, rotate: 5 }}
              whileTap={{ scale: 0.95 }}
            >
              <motion.img
                src="/wired-outline-2026-gdansk-city-hover-pinch.gif"
                alt="Travella Logo"
                className="w-10 h-10 object-contain mix-blend-screen"
              />
            </motion.div>
            <div>
              <span className="font-extrabold text-xl bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent block tracking-tight">
                Travella
              </span>
              <span className="text-xs text-gray-500 font-light tracking-wide">Explore the world</span>
            </div>
          </motion.div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            <nav className="flex items-center gap-6">
              {menuItems.map(item => (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`flex items-center gap-2 text-gray-800 hover:text-emerald-600 font-medium text-sm transition-colors py-1 px-2 z-10 relative ${
                    location.pathname === item.path ? 'text-emerald-700' : ''
                  }`}
                >
                  {item.icon}
                  {item.name}
                  {location.pathname === item.path && (
                    <motion.div
                      layoutId="navHighlight"
                      className="absolute inset-0 bg-gradient-to-r from-emerald-100 to-teal-100 opacity-10 rounded-lg -z-10"
                    />
                  )}
                </Link>
              ))}
            </nav>
            <div className="flex items-center gap-4">
              {user ? (
                <div className="flex items-center gap-3">
                  <Link to="/my-trips">
                    <motion.button
                      className="px-4 py-2 bg-teal-50 text-emerald-600 rounded-full flex items-center gap-2 hover:bg-teal-100 transition-colors"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <FaSuitcaseRolling className="text-sm" />
                      <span className="text-sm font-medium">My Trips</span>
                    </motion.button>
                  </Link>
                  <div className="flex items-center gap-2 group relative">
                    <motion.div
                      className="w-10 h-10 rounded-full overflow-hidden border-2 border-emerald-500 shadow-md"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <img
                        src={user.picture}
                        alt={user.name}
                        className="w-full h-full object-cover"
                      />
                    </motion.div>
                    <div className="absolute right-0 top-full mt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 pt-2">
                      <motion.div
                        className="bg-white shadow-lg rounded-lg overflow-hidden w-48 border border-gray-100"
                      >
                        <div className="p-3 border-b border-gray-100">
                          <p className="font-medium text-sm text-gray-800">{user.name}</p>
                          <p className="text-xs text-gray-500 truncate">{user.email}</p>
                        </div>
                        <div className="p-2">
                          <motion.button
                            onClick={handleSignOut}
                            className="w-full flex items-center gap-2 text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md transition-colors"
                            whileHover={{ x: 3 }}
                          >
                            <FaSignOutAlt />
                            <span>Sign Out</span>
                          </motion.button>
                        </div>
                      </motion.div>
                    </div>
                  </div>
                </div>
              ) : (
                <motion.button
                  onClick={() => setOpenDialog(true)}
                  className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-500 text-white rounded-full shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 font-medium relative overflow-hidden"
                  whileHover="hover"
                  whileTap={{ scale: 0.95 }}
                >
                  <FaUserCircle className="w-5 h-5 relative z-10" />
                  <span className="tracking-wide relative z-10">Sign In</span>
                </motion.button>
              )}
            </div>
          </div>

          {/* Mobile Nav Button */}
          <div className="md:hidden flex items-center gap-3">
            {user && (
              <motion.div
                className="w-8 h-8 rounded-full overflow-hidden border-2 border-emerald-400"
                whileTap={{ scale: 0.9 }}
              >
                <img
                  src={user.picture}
                  alt={user.name}
                  className="w-full h-full object-cover"
                />
              </motion.div>
            )}
            <motion.button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-md text-gray-800 hover:bg-emerald-50/80 transition-all backdrop-blur-sm relative overflow-hidden"
              whileTap={{ scale: 0.95 }}
              whileHover="hover"
            >
              <span className="sr-only">Toggle Menu</span>
              <div className="flex flex-col gap-1">
                <span className={`block w-6 h-0.5 bg-gray-800 transition-transform duration-300 ${mobileMenuOpen ? 'rotate-45 translate-y-1.5' : ''}`}></span>
                <span className={`block w-6 h-0.5 bg-gray-800 transition-opacity duration-300 ${mobileMenuOpen ? 'opacity-0' : ''}`}></span>
                <span className={`block w-6 h-0.5 bg-gray-800 transition-transform duration-300 ${mobileMenuOpen ? '-rotate-45 -translate-y-1.5' : ''}`}></span>
              </div>
            </motion.button>
          </div>
        </div>
      </header>

      {/* Mobile Nav - Fixed position overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            className="md:hidden fixed inset-0 top-[60px] z-40 bg-white/95 backdrop-blur-lg shadow-lg border-t border-gray-100 overflow-y-auto"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <div className="px-6 py-6 h-full">
              <nav className="flex flex-col space-y-4">
                {menuItems.map(item => (
                  <Link
                    key={item.name}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-2 text-gray-800 hover:text-emerald-600 font-medium py-3 px-2 border-b border-gray-100/50 relative group ${
                      location.pathname === item.path ? 'text-emerald-700' : ''
                    }`}
                  >
                    {item.icon}
                    <span className="text-lg">{item.name}</span>
                  </Link>
                ))}
                {user && (
                  <Link
                    to="/my-trips"
                    className="text-emerald-600 font-medium py-3 px-2 border-b border-gray-100/50 flex items-center gap-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <FaSuitcaseRolling className="text-lg" />
                    <span className="text-lg">My Trips</span>
                  </Link>
                )}
                <div className="flex justify-center pt-6 mt-4">
                  {user ? (
                    <div className="w-full flex flex-col gap-4 items-center">
                      <div className="flex items-center gap-3 mb-2">
                        <motion.div
                          className="w-12 h-12 rounded-full overflow-hidden border-2 border-emerald-500 shadow-md"
                        >
                          <img
                            src={user.picture}
                            alt={user.name}
                            className="w-full h-full object-cover"
                          />
                        </motion.div>
                        <div>
                          <p className="font-medium text-gray-800">{user.name}</p>
                          <p className="text-xs text-gray-500 truncate">{user.email}</p>
                        </div>
                      </div>
                      <motion.button
                        onClick={() => {
                          handleSignOut();
                          setMobileMenuOpen(false);
                        }}
                        className="w-full px-4 py-3 bg-red-50 text-red-600 rounded-full flex items-center justify-center gap-2 font-medium"
                        whileTap={{ scale: 0.95 }}
                      >
                        <FaSignOutAlt />
                        <span>Sign Out</span>
                      </motion.button>
                    </div>
                  ) : (
                    <motion.button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        setOpenDialog(true);
                      }}
                      className="w-full px-5 py-3 bg-gradient-to-r from-emerald-600 to-teal-500 text-white rounded-full shadow-sm flex items-center justify-center gap-2 font-medium"
                      whileTap={{ scale: 0.95 }}
                    >
                      <FaUserCircle className="text-lg" />
                      <span>Sign In</span>
                    </motion.button>
                  )}
                </div>
              </nav>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sign In Dialog */}
      <AnimatePresence>
        {openDialog && (
          <motion.div
            className="fixed inset-0 flex items-center justify-center z-[100] backdrop-blur-sm bg-black/20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpenDialog(false)}
          >
            <motion.div
              className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full mx-4"
              variants={dialogVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-800">Sign in to Continue</h3>
                <button
                  onClick={() => setOpenDialog(false)}
                  className="text-gray-500 hover:text-gray-700"
                  disabled={isLoading}
                >
                  <MdClose className="text-xl" />
                </button>
              </div>
              <p className="text-gray-600 mb-6">
                Please sign in to access all features and save your trips.
              </p>
              <motion.button
                onClick={handleFirebaseLogin}
                className={`w-full flex items-center justify-center gap-3 bg-white border border-gray-300 rounded-lg py-3 px-4 text-gray-700 hover:bg-gray-50 transition-colors duration-300 shadow-sm ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                whileHover={isLoading ? {} : { scale: 1.02 }}
                whileTap={isLoading ? {} : { scale: 0.98 }}
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <motion.div
                      initial={{ rotate: 0 }}
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    >
                      <svg className="animate-spin h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    </motion.div>
                    <span>Signing in...</span>
                  </div>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18">
                      <path fill="#4285F4" d="M16.51 8H8.98v3h4.3c-.18 1-.74 1.48-1.6 2.04v2.01h2.6a7.8 7.8 0 0 0 2.38-5.88c0-.57-.05-.66-.15-1.18Z" />
                      <path fill="#34A853" d="M8.98 17c2.16 0 3.97-.72 5.3-1.94l-2.6-2a4.8 4.8 0 0 1-7.18-2.54H1.83v2.07A8 8 0 0 0 8.98 17Z" />
                      <path fill="#FBBC05" d="M4.5 10.52a4.8 4.8 0 0 1 0-3.04V5.41H1.83a8 8 0 0 0 0 7.18l2.67-2.07Z" />
                      <path fill="#EA4335" d="M8.98 4.18c1.17 0 2.23.4 3.06 1.2l2.3-2.3A8 8 0 0 0 1.83 5.4L4.5 7.49a4.8 4.8 0 0 1 4.48-3.3Z" />
                    </svg>
                    <span>Sign in with Google</span>
                  </>
                )}
              </motion.button>
              <div className="mt-6 text-center text-sm text-gray-500">
                By signing in, you agree to our terms of service and privacy policy.
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default Header;