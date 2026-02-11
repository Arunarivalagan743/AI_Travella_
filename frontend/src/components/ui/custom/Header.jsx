
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaUserCircle, FaSignOutAlt, FaSuitcaseRolling, FaHome, FaInfoCircle, FaGlobe, FaUserPlus, FaUser, FaComment, FaSearch } from 'react-icons/fa';
import { MdClose } from 'react-icons/md';
import { Link, useLocation } from 'react-router-dom';
import { useGoogleLogin } from '@react-oauth/google';
import axios from 'axios';
import { useAuth } from '../../../context/AuthContext';

const menuItems = [
  { name: 'EXPLORE', path: '/explore' },
  { name: 'MY TRIPS', path: '/my-trips', requiresAuth: true },
  { name: 'PLAN TRIP', path: '/create-trip' },
  { name: 'ABOUT', path: '/about' },
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
      {/* Top accent line */}
      <div className="w-full h-1 bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-600" />
      
      <header className="sticky top-0 z-50 w-full bg-[#1a1a2e] text-white">
        <div className="max-w-[1400px] mx-auto px-6 md:px-8 flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <motion.div
              className="relative w-9 h-9 rounded-lg overflow-hidden flex items-center justify-center"
              whileHover={{ scale: 1.05 }}
            >
              <img
                src="/wired-outline-2026-gdansk-city-hover-pinch.gif"
                alt="Travella Logo"
                className="w-8 h-8 object-contain brightness-200"
              />
            </motion.div>
            <span className="font-bold text-lg tracking-wider text-white uppercase" style={{ fontFamily: "'Inter', sans-serif", letterSpacing: '0.15em' }}>
              Travella
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            <nav className="flex items-center gap-0">
              {menuItems.filter(item => !item.requiresAuth || user).map(item => (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`px-4 py-2 text-[13px] font-semibold tracking-[0.12em] transition-colors hover:text-emerald-400 ${
                    location.pathname === item.path ? 'text-emerald-400' : 'text-gray-300'
                  }`}
                  style={{ fontFamily: "'Inter', sans-serif" }}
                >
                  {item.name}
                </Link>
              ))}
            </nav>

            <button className="p-2 ml-2 text-gray-300 hover:text-white transition-colors">
              <FaSearch className="text-sm" />
            </button>

            <div className="w-px h-6 bg-gray-600 mx-3" />

            {user ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 group relative cursor-pointer">
                  <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-emerald-500/50 hover:border-emerald-400 transition-colors">
                    <img
                      src={user.picture}
                      alt={user.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  {/* Dropdown */}
                  <div className="absolute right-0 top-full mt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 pt-2">
                    <div className="bg-white shadow-2xl rounded-xl overflow-hidden w-56 border border-gray-100">
                      <div className="p-4 bg-gradient-to-r from-emerald-50 to-teal-50 border-b border-gray-100">
                        <p className="font-semibold text-sm text-gray-800">{user.name}</p>
                        <p className="text-xs text-gray-500 truncate mt-0.5">{user.email}</p>
                      </div>
                      <div className="p-2">
                        <Link to={`/user/${user.email}`}>
                          <button className="w-full flex items-center gap-3 text-left px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                            <FaUser className="text-emerald-600" />
                            <span>My Profile</span>
                          </button>
                        </Link>
                        <Link to="/my-trips">
                          <button className="w-full flex items-center gap-3 text-left px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                            <FaSuitcaseRolling className="text-emerald-600" />
                            <span>My Trips</span>
                          </button>
                        </Link>
                        <Link to="/follower-requests">
                          <button className="w-full flex items-center gap-3 text-left px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                            <FaUserPlus className="text-blue-600" />
                            <span>Follower Requests</span>
                          </button>
                        </Link>
                        <Link to="/chat">
                          <button className="w-full flex items-center gap-3 text-left px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                            <FaComment className="text-emerald-600" />
                            <span>Messages</span>
                          </button>
                        </Link>
                      </div>
                      <div className="p-2 border-t border-gray-100">
                        <button
                          onClick={handleSignOut}
                          className="w-full flex items-center gap-3 text-left px-3 py-2.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <FaSignOutAlt />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <motion.button
                onClick={() => setOpenDialog(true)}
                className="px-5 py-2 bg-white text-[#1a1a2e] text-[13px] font-bold tracking-[0.1em] uppercase hover:bg-gray-100 transition-colors"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                style={{ fontFamily: "'Inter', sans-serif" }}
              >
                SIGN IN
              </motion.button>
            )}
          </div>

          {/* Mobile Nav Button */}
          <div className="md:hidden flex items-center gap-3">
            {user && (
              <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-emerald-400/50">
                <img
                  src={user.picture}
                  alt={user.name}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-white"
            >
              <div className="flex flex-col gap-1.5">
                <span className={`block w-6 h-0.5 bg-white transition-transform duration-300 ${mobileMenuOpen ? 'rotate-45 translate-y-2' : ''}`} />
                <span className={`block w-6 h-0.5 bg-white transition-opacity duration-300 ${mobileMenuOpen ? 'opacity-0' : ''}`} />
                <span className={`block w-6 h-0.5 bg-white transition-transform duration-300 ${mobileMenuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
              </div>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Nav */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            className="md:hidden fixed inset-0 top-[68px] z-40 bg-[#1a1a2e] overflow-y-auto"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <div className="px-6 py-8">
              <nav className="flex flex-col space-y-1">
                {menuItems.filter(item => !item.requiresAuth || user).map(item => (
                  <Link
                    key={item.name}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`text-[15px] font-semibold tracking-[0.15em] py-4 border-b border-gray-700/50 transition-colors ${
                      location.pathname === item.path ? 'text-emerald-400' : 'text-gray-300 hover:text-white'
                    }`}
                    style={{ fontFamily: "'Inter', sans-serif" }}
                  >
                    {item.name}
                  </Link>
                ))}
                {user && (
                  <>
                    <Link
                      to="/chat"
                      className="text-[15px] font-semibold tracking-[0.15em] text-gray-300 hover:text-white py-4 border-b border-gray-700/50"
                      onClick={() => setMobileMenuOpen(false)}
                      style={{ fontFamily: "'Inter', sans-serif" }}
                    >
                      MESSAGES
                    </Link>
                    <Link
                      to="/follower-requests"
                      className="text-[15px] font-semibold tracking-[0.15em] text-gray-300 hover:text-white py-4 border-b border-gray-700/50"
                      onClick={() => setMobileMenuOpen(false)}
                      style={{ fontFamily: "'Inter', sans-serif" }}
                    >
                      FOLLOWER REQUESTS
                    </Link>
                  </>
                )}
              </nav>
              <div className="mt-8">
                {user ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 pb-4 border-b border-gray-700/50">
                      <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-emerald-500/50">
                        <img src={user.picture} alt={user.name} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <p className="font-semibold text-white">{user.name}</p>
                        <p className="text-xs text-gray-400 truncate">{user.email}</p>
                      </div>
                    </div>
                    <Link to={`/user/${user.email}`} className="w-full" onClick={() => setMobileMenuOpen(false)}>
                      <button className="w-full py-3 bg-emerald-600 text-white font-semibold tracking-wider text-sm uppercase rounded-sm mb-3">
                        MY PROFILE
                      </button>
                    </Link>
                    <button
                      onClick={() => { handleSignOut(); setMobileMenuOpen(false); }}
                      className="w-full py-3 bg-transparent border border-gray-600 text-gray-300 font-semibold tracking-wider text-sm uppercase rounded-sm hover:bg-gray-800 transition-colors"
                    >
                      SIGN OUT
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => { setMobileMenuOpen(false); setOpenDialog(true); }}
                    className="w-full py-3 bg-white text-[#1a1a2e] font-bold tracking-[0.15em] text-sm uppercase"
                  >
                    SIGN IN
                  </button>
                )}
              </div>
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