// import React, { useState, useEffect, use } from 'react';
// import { motion, AnimatePresence } from 'framer-motion';
// import { FaUserCircle } from 'react-icons/fa';
// import { Link } from 'react-router-dom';
// import { json } from 'stream/consumers';

// function Header() {
//   const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
//   const [activeItem, setActiveItem] = useState(null);
  
//   useEffect(() => {
//     const script = document.createElement('script');
//     script.src = 'https://cdn.lordicon.com/lordicon.js';
//     script.defer = true;
//     document.body.appendChild(script);
    
//     return () => {
//       document.body.removeChild(script);
//     };
//   }, []);
//   const user = json.parse(localStorage.getItem('user'));
//   useEffect(() => {
//     console.log("User data from localStorage:", user);
//   }, []);
    
  
//   const menuItems = [
//     { name: 'Home', path: '/' },
   
//     { name: 'Trips', path: '/trips' },
//     { name: 'About Us', path: '/about' },
//   ];

//   const renderNavItem = (item) => {
//     try {
//       return (
//         <div
//           key={item.name}
//           className="relative"
//           onMouseEnter={() => setActiveItem(item.name)}
//           onMouseLeave={() => setActiveItem(null)}
//         >
//           <a 
//             href={item.path} 
//             className="text-gray-800 hover:text-emerald-600 font-medium text-sm transition-colors py-1 px-2 z-10 relative"
//           >
//             {item.name}
//           </a>
//           {activeItem === item.name && (
//             <motion.div
//               layoutId="navHighlight"
//               className={`absolute inset-0 bg-gradient-to-r ${item.hoverColor} opacity-10 rounded-lg -z-10`}
//               initial={{ opacity: 0 }}
//               animate={{ opacity: 1 }}
//               exit={{ opacity: 0 }}
//               transition={{ type: "spring", stiffness: 350, damping: 30 }}
//             />
//           )}
//         </div>
//       );
//     } catch (error) {
     
//       return (
//         <a 
//           key={item.name}
//           href={item.path} 
//           className="text-gray-800 hover:text-emerald-600 font-medium text-sm transition-colors py-1 px-2"
//         >
//           {item.name}
//         </a>
//       );
//     }
//   };


//   const renderMobileNavItem = (item) => {
//     try {
//       return (
//         <a 
//           key={item.name}
//           href={item.path}
//           className="text-gray-800 hover:text-emerald-600 font-medium py-2 px-1 border-b border-gray-100/50 relative group"
//         >
//           <span>{item.name}</span>
//           <motion.span 
//             className={`absolute bottom-0 left-0 h-0.5 bg-gradient-to-r ${item.hoverColor}`}
//             initial={{ width: 0 }}
//             whileHover={{ width: '100%' }}
//             transition={{ type: "tween", duration: 0.3 }}
//           />
//         </a>
//       );
//     } catch (error) {
//       return (
//         <a 
//           key={item.name}
//           href={item.path}
//           className="text-gray-800 hover:text-emerald-600 font-medium py-2 px-1 border-b border-gray-100/50"
//         >
//           {item.name}
//         </a>
//       );
//     }
//   };

//   return (
//     <header className="sticky top-0 z-50 backdrop-blur-md bg-white/70 w-full py-3 px-6 md:px-8 shadow-sm border-b border-gray-100">
//       <div className="max-w-7xl mx-auto flex justify-between items-center">
//         <motion.div 
//           className="flex items-center gap-3"
//           initial={{ opacity: 0, x: -20 }}
//           animate={{ opacity: 1, x: 0 }}
//           transition={{ duration: 0.5 }}
//           whileHover={{ scale: 1.02 }}
//         >
        
// <motion.div
//   className="relative w-12 h-12 rounded-xl overflow-hidden flex items-center justify-center backdrop-blur-sm"
//   initial={{ opacity: 0, scale: 0.8, rotate: -10 }}
//   animate={{ opacity: 1, scale: 1, rotate: 0 }}
//   transition={{ duration: 0.6, ease: 'easeOut' }}
//   whileHover={{ scale: 1.1, rotate: 5 }}
//   whileTap={{ scale: 0.95 }}
// >
//   <motion.img
//     src="/wired-outline-2026-gdansk-city-hover-pinch.gif"
//     alt="Travella Logo"
//     className="w-10 h-10 object-contain mix-blend-screen"
//     initial={{ scale: 0.8 }}
//     animate={{ scale: 1 }}
//     transition={{ duration: 0.5, ease: 'easeOut' }}
//   />
// </motion.div>
          
//           <div>
//             <motion.span 
//               className="font-extrabold text-xl bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent block tracking-tight"
//             >
//               Travella
//             </motion.span>
//             <motion.span 
//               className="text-xs text-gray-500 font-light tracking-wide"
//               initial={{ opacity: 0 }}
//               animate={{ opacity: 1 }}
//               transition={{ delay: 0.5 }}
//             >
//               Explore the world
//             </motion.span>
//           </div>
//         </motion.div>
        
//         <div className="hidden md:flex items-center gap-8">
//           <nav className="flex items-center gap-6">
//             {menuItems.map(renderNavItem)}
//           </nav>
          
//           <div className="flex items-center gap-4">
//             <motion.button 
//               className="p-2 rounded-full text-emerald-600 hover:bg-emerald-50/80 transition-all backdrop-blur-sm relative overflow-hidden group"
//               whileHover="hover"
//             >
//               <motion.span 
//                 className="absolute inset-0 bg-emerald-50/0 group-hover:bg-emerald-50/80 rounded-full z-0"
//                 initial={{ scale: 0 }}
//                 variants={{
//                   hover: { scale: 1, transition: { type: "spring", stiffness: 400, damping: 20 } }
//                 }}
//               />
//               <span className="relative z-10">
//                 <lord-icon
//                   src="https://cdn.lordicon.com/msoeawqm.json"
//                   trigger="hover"
//                   colors="primary:#059669"
//                   style={{ width: '24px', height: '24px' }}
//                 />
//               </span>
//             </motion.button>
            
//             <motion.button 
//               className="p-2 rounded-full text-emerald-600 relative overflow-hidden group"
//               whileHover="hover"
//             >
//               <motion.span 
//                 className="absolute inset-0 bg-gradient-to-r from-emerald-50/0 to-teal-50/0 group-hover:from-emerald-50/80 group-hover:to-teal-50/80 rounded-full z-0"
//                 initial={{ x: "-100%" }}
//                 variants={{
//                   hover: { x: 0, transition: { type: "tween", duration: 0.3 } }
//                 }}
//               />
//               <span className="relative z-10">
//                 <lord-icon
//                   src="https://cdn.lordicon.com/rjzlnunf.json"
//                   trigger="hover"
//                   colors="primary:#059669"
//                   style={{ width: '24px', height: '24px' }}
//                 />
//               </span>
//             </motion.button>
            
//             <motion.button
//               className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-500 text-white rounded-full shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 font-medium relative overflow-hidden"
//               whileHover="hover"
//               whileTap={{ scale: 0.95 }}
//             >
//               <motion.span 
//                 className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-teal-400 opacity-0 z-0"
//                 variants={{
//                   hover: { 
//                     opacity: 1,
//                     transition: { type: "tween", duration: 0.4 } 
//                   }
//                 }}
//               />
//               <FaUserCircle className="w-5 h-5 relative z-10" />
//               <span className="tracking-wide relative z-10">Sign In</span>
//               <motion.span 
//                 className="absolute bottom-0 left-0 right-0 h-1 bg-white/20"
//                 initial={{ scaleX: 0 }}
//                 variants={{
//                   hover: { 
//                     scaleX: 1, 
//                     transition: { type: "tween", duration: 0.3, delay: 0.1 } 
//                   }
//                 }}
//                 style={{ transformOrigin: "left" }}
//               />
//             </motion.button>
//           </div>
//         </div>
        
//         <div className="md:hidden flex items-center">
//           <motion.button 
//             onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
//             className="p-2 rounded-md text-gray-800 hover:bg-emerald-50/80 transition-all backdrop-blur-sm relative overflow-hidden"
//             whileTap={{ scale: 0.95 }}
//             whileHover="hover"
//           >
//             <motion.span 
//               className="absolute inset-0 bg-gradient-to-r from-emerald-50/0 to-teal-50/0 hover:from-emerald-50/80 hover:to-teal-50/80 rounded-md z-0"
//               variants={{
//                 hover: { opacity: 1, transition: { duration: 0.3 } }
//               }}
//             />
//             <span className="relative z-10">
//               <lord-icon
//                 src="https://cdn.lordicon.com/jvucoldz.json"
//                 trigger="click"
//                 colors="primary:#121331"
//                 style={{ width: '28px', height: '28px' }}
//               />
//             </span>
//           </motion.button>
//         </div>
//       </div>
      
//       <AnimatePresence>
//         {mobileMenuOpen && (
//           <motion.div 
//             className="absolute top-full left-0 right-0 backdrop-blur-md bg-white/90 shadow-lg py-4 px-6 border-t border-gray-100"
//             initial={{ opacity: 0, y: -10 }}
//             animate={{ opacity: 1, y: 0 }}
//             exit={{ opacity: 0, y: -10 }}
//             transition={{ duration: 0.2 }}
//           >
//             <nav className="flex flex-col space-y-3">
//               {menuItems.map(renderMobileNavItem)}
//               <div className="flex justify-between pt-2">
//                 <motion.button 
//                   className="p-2 rounded-full text-emerald-600 hover:bg-emerald-50/80 transition-all backdrop-blur-sm"
//                   whileHover={{ scale: 1.05 }}
//                 >
//                   <lord-icon
//                     src="https://cdn.lordicon.com/msoeawqm.json"
//                     trigger="hover"
//                     colors="primary:#059669"
//                     style={{ width: '24px', height: '24px' }}
//                   />
//                 </motion.button>
//                 <motion.button 
//                   className="p-2 rounded-full text-emerald-600 hover:bg-emerald-50/80 transition-all backdrop-blur-sm"
//                   whileHover={{ scale: 1.05 }}
//                 >
//                   <lord-icon
//                     src="https://cdn.lordicon.com/rjzlnunf.json"
//                     trigger="hover"
//                     colors="primary:#059669"
//                     style={{ width: '24px', height: '24px' }}
//                   />
//                 </motion.button>
//                 <motion.button
//                   className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-500 text-white rounded-full shadow-sm flex items-center gap-2 font-medium relative overflow-hidden"
//                   whileTap={{ scale: 0.95 }}
//                   whileHover="hover"
//                 >
//                   <motion.span 
//                     className="absolute inset-0 bg-white/10 z-0"
//                     initial={{ scale: 0, opacity: 0 }}
//                     variants={{
//                       hover: { 
//                         scale: 1.5, 
//                         opacity: 0.2,
//                         transition: { repeat: Infinity, duration: 1 } 
//                       }
//                     }}
//                     style={{ borderRadius: "100%" }}
//                   />
//                   <FaUserCircle className="w-5 h-5 relative z-10" />
//                   <span className="tracking-wide relative z-10">Sign In</span>
//                 </motion.button>
//               </div>
//             </nav>
//           </motion.div>
//         )}
//       </AnimatePresence>
//     </header>
//   );
// }

// export default Header;
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaUserCircle, FaSignOutAlt, FaSuitcaseRolling } from 'react-icons/fa';
import { MdClose } from 'react-icons/md';
import { Link } from 'react-router-dom';
import { useGoogleLogin } from '@react-oauth/google';
import axios from 'axios';

function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeItem, setActiveItem] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://cdn.lordicon.com/lordicon.js';
    script.defer = true;
    document.body.appendChild(script);
    
    return () => {
      document.body.removeChild(script);
    };
  }, []);
  
  // Load user profile from localStorage on component mount
  useEffect(() => {
    const userProfileString = localStorage.getItem('userProfile');
    if (userProfileString) {
      try {
        const profile = JSON.parse(userProfileString);
        setUserProfile(profile);
        console.log("User profile loaded from localStorage:", profile);
      } catch (error) {
        console.error("Error parsing user profile:", error);
      }
    }
  }, []);
  
  const login = useGoogleLogin({
    onSuccess: (response) => {
      console.log("Login successful:", response);
      localStorage.setItem('user', JSON.stringify(response));
      setOpenDialog(false);
      setIsLoading(true);
      
      GetUserProfile(response);
    },
    onError: (error) => {
      console.error("Login failed:", error);
      setIsLoading(false);
    }
  });
  
  const GetUserProfile = async (tokenInfo) => {
    if (!tokenInfo?.access_token) {
      setIsLoading(false);
      return;
    }
    
    try {
      const response = await axios.get(`https://www.googleapis.com/oauth2/v2/userinfo`, {
        headers: {
          Authorization: `Bearer ${tokenInfo.access_token}`,
          Accept: 'application/json'
        }
      });
      
      console.log("User profile data:", response.data);
      localStorage.setItem('userProfile', JSON.stringify(response.data));
      setUserProfile(response.data);
    } catch (error) {
      console.error("Error fetching user profile:", error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSignOut = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('userProfile');
    setUserProfile(null);
  };
  
  const menuItems = [
    { name: 'Home', path: '/' },

    { name: 'About Us', path: '/about' },
  ];

  const renderNavItem = (item) => {
    try {
      return (
        <div
          key={item.name}
          className="relative"
          onMouseEnter={() => setActiveItem(item.name)}
          onMouseLeave={() => setActiveItem(null)}
        >
          <Link 
            to={item.path} 
            className="text-gray-800 hover:text-emerald-600 font-medium text-sm transition-colors py-1 px-2 z-10 relative"
          >
            {item.name}
          </Link>
          {activeItem === item.name && (
            <motion.div
              layoutId="navHighlight"
              className="absolute inset-0 bg-gradient-to-r from-emerald-100 to-teal-100 opacity-10 rounded-lg -z-10"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ type: "spring", stiffness: 350, damping: 30 }}
            />
          )}
        </div>
      );
    } catch (error) {
      return (
        <Link 
          key={item.name}
          to={item.path} 
          className="text-gray-800 hover:text-emerald-600 font-medium text-sm transition-colors py-1 px-2"
        >
          {item.name}
        </Link>
      );
    }
  };

  const renderMobileNavItem = (item) => {
    try {
      return (
        <Link 
          key={item.name}
          to={item.path}
          className="text-gray-800 hover:text-emerald-600 font-medium py-2 px-1 border-b border-gray-100/50 relative group"
        >
          <span>{item.name}</span>
          <motion.span 
            className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-emerald-500 to-teal-400"
            initial={{ width: 0 }}
            whileHover={{ width: '100%' }}
            transition={{ type: "tween", duration: 0.3 }}
          />
        </Link>
      );
    } catch (error) {
      return (
        <Link 
          key={item.name}
          to={item.path}
          className="text-gray-800 hover:text-emerald-600 font-medium py-2 px-1 border-b border-gray-100/50"
        >
          {item.name}
        </Link>
      );
    }
  };

  // Dialog animation variants
  const dialogVariants = {
    hidden: { opacity: 0, scale: 0.9, y: 20 },
    visible: { 
      opacity: 1, 
      scale: 1, 
      y: 0,
      transition: { type: "spring", stiffness: 300, damping: 30 }
    },
    exit: { opacity: 0, scale: 0.9, y: 20, transition: { duration: 0.2 } }
  };

  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-white/70 w-full py-3 px-6 md:px-8 shadow-sm border-b border-gray-100">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <motion.div 
          className="flex items-center gap-3"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          whileHover={{ scale: 1.02 }}
        >
          <motion.div
            className="relative w-12 h-12 rounded-xl overflow-hidden flex items-center justify-center backdrop-blur-sm"
            initial={{ opacity: 0, scale: 0.8, rotate: -10 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            whileHover={{ scale: 1.1, rotate: 5 }}
            whileTap={{ scale: 0.95 }}
          >
            <motion.img
              src="/wired-outline-2026-gdansk-city-hover-pinch.gif"
              alt="Travella Logo"
              className="w-10 h-10 object-contain mix-blend-screen"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            />
          </motion.div>
          
          <div>
            <motion.span 
              className="font-extrabold text-xl bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent block tracking-tight"
            >
              Travella
            </motion.span>
            <motion.span 
              className="text-xs text-gray-500 font-light tracking-wide"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              Explore the world
            </motion.span>
          </div>
        </motion.div>
        
        <div className="hidden md:flex items-center gap-8">
          <nav className="flex items-center gap-6">
            {menuItems.map(renderNavItem)}
          </nav>
          
          <div className="flex items-center gap-4">
            <motion.button 
              className="p-2 rounded-full text-emerald-600 hover:bg-emerald-50/80 transition-all backdrop-blur-sm relative overflow-hidden group"
              whileHover="hover"
            >
              <motion.span 
                className="absolute inset-0 bg-emerald-50/0 group-hover:bg-emerald-50/80 rounded-full z-0"
                initial={{ scale: 0 }}
                variants={{
                  hover: { scale: 1, transition: { type: "spring", stiffness: 400, damping: 20 } }
                }}
              />
              <span className="relative z-10">
                <lord-icon
                  src="https://cdn.lordicon.com/msoeawqm.json"
                  trigger="hover"
                  colors="primary:#059669"
                  style={{ width: '24px', height: '24px' }}
                />
              </span>
            </motion.button>
            
            <motion.button 
              className="p-2 rounded-full text-emerald-600 relative overflow-hidden group"
              whileHover="hover"
            >
              <motion.span 
                className="absolute inset-0 bg-gradient-to-r from-emerald-50/0 to-teal-50/0 group-hover:from-emerald-50/80 group-hover:to-teal-50/80 rounded-full z-0"
                initial={{ x: "-100%" }}
                variants={{
                  hover: { x: 0, transition: { type: "tween", duration: 0.3 } }
                }}
              />
              <span className="relative z-10">
                <lord-icon
                  src="https://cdn.lordicon.com/rjzlnunf.json"
                  trigger="hover"
                  colors="primary:#059669"
                  style={{ width: '24px', height: '24px' }}
                />
              </span>
            </motion.button>
            
            {userProfile ? (
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
                      src={userProfile.picture} 
                      alt={userProfile.name}
                      className="w-full h-full object-cover" 
                    />
                  </motion.div>
                  
                  <div className="absolute right-0 top-full mt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 pt-2">
                    <motion.div 
                      className="bg-white shadow-lg rounded-lg overflow-hidden w-48 border border-gray-100"
                      initial={{ y: 10, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="p-3 border-b border-gray-100">
                        <p className="font-medium text-sm text-gray-800">{userProfile.name}</p>
                        <p className="text-xs text-gray-500 truncate">{userProfile.email}</p>
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
                <motion.span 
                  className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-teal-400 opacity-0 z-0"
                  variants={{
                    hover: { 
                      opacity: 1,
                      transition: { type: "tween", duration: 0.4 } 
                    }
                  }}
                />
                <FaUserCircle className="w-5 h-5 relative z-10" />
                <span className="tracking-wide relative z-10">Sign In</span>
                <motion.span 
                  className="absolute bottom-0 left-0 right-0 h-1 bg-white/20"
                  initial={{ scaleX: 0 }}
                  variants={{
                    hover: { 
                      scaleX: 1, 
                      transition: { type: "tween", duration: 0.3, delay: 0.1 } 
                    }
                  }}
                  style={{ transformOrigin: "left" }}
                />
              </motion.button>
            )}
          </div>
        </div>
        
        <div className="md:hidden flex items-center gap-3">
          {userProfile && (
            <motion.div 
              className="w-8 h-8 rounded-full overflow-hidden border-2 border-emerald-400"
              whileTap={{ scale: 0.9 }}
            >
              <img 
                src={userProfile.picture} 
                alt={userProfile.name}
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
            <motion.span 
              className="absolute inset-0 bg-gradient-to-r from-emerald-50/0 to-teal-50/0 hover:from-emerald-50/80 hover:to-teal-50/80 rounded-md z-0"
              variants={{
                hover: { opacity: 1, transition: { duration: 0.3 } }
              }}
            />
            <span className="relative z-10">
              <lord-icon
                src="https://cdn.lordicon.com/jvucoldz.json"
                trigger="click"
                colors="primary:#121331"
                style={{ width: '28px', height: '28px' }}
              />
            </span>
          </motion.button>
        </div>
      </div>
      
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            className="absolute top-full left-0 right-0 backdrop-blur-md bg-white/90 shadow-lg py-4 px-6 border-t border-gray-100"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <nav className="flex flex-col space-y-3">
              {menuItems.map(renderMobileNavItem)}
              
              {userProfile && (
                <Link 
                  to="/my-trips"
                  className="text-emerald-600 font-medium py-2 px-1 border-b border-gray-100/50 flex items-center gap-2"
                >
                  <FaSuitcaseRolling />
                  <span>My Trips</span>
                </Link>
              )}
              
              <div className="flex justify-between pt-2">
                <motion.button 
                  className="p-2 rounded-full text-emerald-600 hover:bg-emerald-50/80 transition-all backdrop-blur-sm"
                  whileHover={{ scale: 1.05 }}
                >
                  <lord-icon
                    src="https://cdn.lordicon.com/msoeawqm.json"
                    trigger="hover"
                    colors="primary:#059669"
                    style={{ width: '24px', height: '24px' }}
                  />
                </motion.button>
                <motion.button 
                  className="p-2 rounded-full text-emerald-600 hover:bg-emerald-50/80 transition-all backdrop-blur-sm"
                  whileHover={{ scale: 1.05 }}
                >
                  <lord-icon
                    src="https://cdn.lordicon.com/rjzlnunf.json"
                    trigger="hover"
                    colors="primary:#059669"
                    style={{ width: '24px', height: '24px' }}
                  />
                </motion.button>
                
                {userProfile ? (
                  <motion.button
                    onClick={handleSignOut}
                    className="px-4 py-2 bg-red-50 text-red-600 rounded-full flex items-center gap-2 font-medium"
                    whileTap={{ scale: 0.95 }}
                  >
                    <FaSignOutAlt className="text-sm" />
                    <span className="text-sm">Sign Out</span>
                  </motion.button>
                ) : (
                  <motion.button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      setOpenDialog(true);
                    }}
                    className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-500 text-white rounded-full shadow-sm flex items-center gap-2 font-medium relative overflow-hidden"
                    whileTap={{ scale: 0.95 }}
                    whileHover="hover"
                  >
                    <motion.span 
                      className="absolute inset-0 bg-white/10 z-0"
                      initial={{ scale: 0, opacity: 0 }}
                      variants={{
                        hover: { 
                          scale: 1.5, 
                          opacity: 0.2,
                          transition: { repeat: Infinity, duration: 1 } 
                        }
                      }}
                      style={{ borderRadius: "100%" }}
                    />
                    <FaUserCircle className="w-5 h-5 relative z-10" />
                    <span className="tracking-wide relative z-10">Sign In</span>
                  </motion.button>
                )}
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Sign In Dialog */}
 <AnimatePresence>
  {openDialog && (
    <motion.div 
      className="fixed inset-0 bg-black/60   mt-60  flex items-center justify-center z-[100] backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={() => setOpenDialog(false)}
    >
      <motion.div 
        className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full"
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
                       onClick={login}
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
    </header>
  );
}

export default Header;