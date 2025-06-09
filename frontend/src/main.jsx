import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
    import { GoogleOAuthProvider } from '@react-oauth/google';
import { createBrowserRouter } from 'react-router-dom'
import CreateTrip from './trip-maker/index.jsx'
import { RouterProvider } from 'react-router-dom'
import Header from './components/ui/custom/Header'
import ViewTrip from './show_trip/trip_id';

const router = createBrowserRouter([
  {
    path :'/',
    element :<App />
  },{
    path: '/create-trip',
    element :<CreateTrip />
  },
  {
    path: '/show-trip/:tripId',
    element: <ViewTrip />
  }
])
createRoot(document.getElementById('root')).render(
  <StrictMode>


<GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_AUTH_CLIENT_ID}>
  <Header />
  <RouterProvider router={router} />
</GoogleOAuthProvider>
  </StrictMode>
)