// import { StrictMode } from 'react'
// import { createRoot } from 'react-dom/client'
// import './index.css'
// import App from './App.jsx'
// import { GoogleOAuthProvider } from '@react-oauth/google';
// import { createBrowserRouter, RouterProvider } from 'react-router-dom'
// import CreateTrip from './trip-maker/index.jsx'
// import ViewTrip from './show_trip/trip_id';
// import { Layout } from './components/layout/Layout';

// // Configure the router with a parent layout route
// const router = createBrowserRouter([
//   {
//     path: '/',
//     element: <Layout />,
//     children: [
//       {
//         index: true, // This means it matches the parent path exactly
//         element: <App />
//       },
//       {
//         path: 'create-trip',
//         element: <CreateTrip />
//       },
//       {
//         path: 'show-trip/:tripId',
//         element: <ViewTrip />
//       },
//       // You can add more routes here that will all use the Layout
//       {
//         path: 'trips',
//         element: <div>Your Trips Page</div> // Replace with your actual component
//       },
//       {
//         path: 'about',
//         element: <div>About Us Page</div> // Replace with your actual component
//       },
//       {
//         path: 'my-trips',
//         element: <div>My Trips Page</div> // Replace with your actual component
//       },
//       // Add a catch-all route for 404s
//       {
//         path: '*',
//         element: <div className="p-8 text-center">
//           <h1 className="text-2xl font-bold text-red-500 mb-4">Page Not Found</h1>
//           <p>Sorry, the page you are looking for doesn't exist.</p>
//         </div>
//       }
//     ]
//   }
// ]);

// const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_AUTH_CLIENT_ID;

// // Create root and render
// createRoot(document.getElementById('root')).render(
//   <StrictMode>
//     <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
//       <RouterProvider router={router} />
//     </GoogleOAuthProvider>
//   </StrictMode>
// )
// main.jsx or index.jsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

import { Layout } from './components/layout/Layout';
import App from './App.jsx'; // This is now the Hero page
import CreateTrip from './trip-maker/index.jsx';
import ViewTrip from './show_trip/trip_id';

import About from './pages/About';

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
      { path: 'my-trips', element: <div>My Trips Page</div> },
      {
        path: '*',
        element: (
          <div className="p-8 text-center">
            <h1 className="text-2xl font-bold text-red-500 mb-4">Page Not Found</h1>
            <p>Sorry, the page you are looking for doesn't exist.</p>
          </div>
        )
      }
    ]
  }
]);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <RouterProvider router={router} />
    </GoogleOAuthProvider>
  </StrictMode>
);
