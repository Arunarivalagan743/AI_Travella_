import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Layout } from './components/layout/Layout';
import App from './App.jsx'; // This is now the Hero page
import CreateTrip from './trip-maker/index.jsx';
import ViewTrip from './show_trip/trip_id';   

import About from './pages/About';
import MyTrips from './pages/MyTrips';
import { AuthProvider } from './context/AuthContext';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_AUTH_CLIENT_ID;

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <App /> },
      { path: 'create-trip', element: <CreateTrip /> },
      { path: 'show-trip/:tripId', element: <ViewTrip /> },
      { path: 'about', element: <About /> },
      { path: 'my-trips', element: <MyTrips /> },
      
      // 404 Page - Styled to match your emerald/teal palette with animation
      {
        path: '*',
        element: (
          <div className="min-h-[70vh] flex flex-col items-center justify-center p-8">
            <div className="bg-white bg-opacity-95 backdrop-blur-sm rounded-xl shadow-lg p-10 max-w-lg w-full">
              <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-center"
              >
                <motion.div
                  animate={{ 
                    scale: [1, 1.05, 1],
                    rotate: [0, 2, 0, -2, 0] 
                  }}
                  transition={{ 
                    duration: 5,
                    repeat: Infinity,
                    repeatType: "reverse"
                  }}
                  className="mb-6 text-6xl"
                >
                  ✈️
                </motion.div>
                
                <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent mb-4">
                  Page Not Found
                </h1>
                
                <p className="text-gray-700 mb-8">
                  Sorry, the destination you're looking for is off our travel map.
                </p>
                
                <motion.a
                  href="/"
                  className="inline-block px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-lg shadow-md"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Return to Home
                </motion.a>
              </motion.div>
            </div>
          </div>
        )
      }
    ]
  }
]);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </GoogleOAuthProvider>
  </StrictMode>
);
