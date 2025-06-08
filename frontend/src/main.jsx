import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

import { createBrowserRouter } from 'react-router-dom'
import CreateTrip from './trip-maker/index.jsx'
import { RouterProvider } from 'react-router-dom'

const router = createBrowserRouter([
  {
    path :'/',
    element :<App />
  },{
    path: '/create-trip',
    element :<CreateTrip />
  }
])
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)

