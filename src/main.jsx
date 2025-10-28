import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { RouterProvider, createBrowserRouter } from 'react-router-dom'
import CreateTrip from './create-trip/index.jsx'
import Header from './components/custom/Header.jsx'
import Footer from './components/custom/Footer.jsx'
import { Toaster } from './components/ui/sonner.jsx'
import { GoogleOAuthProvider } from '@react-oauth/google'
import Viewtrip from './view-trip/[tripId]/index.jsx'
import MyTrips from './my-trips/index.jsx'
import { SEOProvider } from './context/SEOContext.jsx'
import { HelmetProvider } from 'react-helmet-async'
import HowItWorks from './components/custom/HowItWorks.jsx'
import ContactUs from './components/custom/ContactUs.jsx'
import UserManual from './components/custom/UserManual.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import { PlacePhotoProvider } from './context/PlacePhotoContext.jsx'
import { Analytics } from "@vercel/analytics/react"
import { SpeedInsights } from "@vercel/speed-insights/react"

const router=createBrowserRouter([
  {
    path:'/',
    element:<App/>
  },
  {
    path:'/create-trip',
    element:<CreateTrip/>
  },
  {
    path:'/view-trip/:tripId',
    element:<Viewtrip/>
  },
  {
    path:'/my-trips',
    element:<MyTrips/>
  },
  {
    path:'/how-it-works',
    element:<HowItWorks/>
  },
  {
    path:'/contact',
    element:<ContactUs/>
  },
  {
    path:'/user-manual',
    element:<UserManual/>
  }
])

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <HelmetProvider>
      <AuthProvider>
        <SEOProvider>
          <PlacePhotoProvider>
            <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
              <Header/>
              <Toaster  />
              <RouterProvider router={router} />
              <Footer />
              <Analytics />
              <SpeedInsights/>
            </GoogleOAuthProvider>
          </PlacePhotoProvider>
        </SEOProvider>
      </AuthProvider>
    </HelmetProvider>
  </React.StrictMode>,
)
