import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import PrivateRoute from './PrivateRoute'
import AdminRoute from './AdminRoute'

// Public Pages
import HomePage from '../pages/public/HomePage'
import PropertiesPage from '../pages/public/PropertiesPage'
import PropertyDetailPage from '../pages/public/PropertyDetailPage'
import AboutPage from '../pages/public/AboutPage'
import ContactPage from '../pages/public/ContactPage'
import PricingPage from '../pages/public/PricingPage'
import FAQPage from '../pages/public/FAQPage'

// Auth Pages
import LoginPage from '../pages/auth/LoginPage'
import RegisterPage from '../pages/auth/RegisterPage'
import ForgotPasswordPage from '../pages/auth/ForgotPasswordPage'
import ResetPasswordPage from '../pages/auth/ResetPasswordPage'

// Dashboard Pages
import UnifiedDashboard from '../components/dashboard/unified/UnifiedDashboard'

// Admin Pages
import AdminDashboard from '../components/dashboard/admin/AdminDashboard'

// Other Pages
import CreateListingPage from '../pages/CreateListingPage'
import LandlordAddProperty from '../pages/LandlordAddProperty'
import Messages from '../pages/Messages'
import Notifications from '../pages/Notifications'
import Settings from '../pages/Settings'
import SubscriptionPage from '../pages/SubscriptionPage'
import ActivationPage from '../pages/ActivationPage'
import PaymentSuccessPage from '../pages/PaymentSuccessPage'
import MyListingsPage from '../pages/MyListingsPage'
import EditListingPage from '../pages/EditListingPage'

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<HomePage />} />
      <Route path="/properties" element={<PropertiesPage />} />
      <Route path="/properties/:id" element={<PropertyDetailPage />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/contact" element={<ContactPage />} />
      <Route path="/pricing" element={<PricingPage />} />
      <Route path="/faq" element={<FAQPage />} />
      
      {/* Auth Routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      
      {/* Activation Route */}
      <Route path="/activation" element={
        <PrivateRoute>
          <ActivationPage />
        </PrivateRoute>
      } />
      
      {/* Subscription Route */}
      <Route path="/subscription" element={
        <PrivateRoute>
          <SubscriptionPage />
        </PrivateRoute>
      } />
      
      {/* Payment Success Route */}
      <Route path="/payment/success" element={<PaymentSuccessPage />} />
      
      {/* User Dashboard */}
      <Route path="/dashboard" element={
        <PrivateRoute>
          <UnifiedDashboard />
        </PrivateRoute>
      } />
      
      {/* Create Listing Routes */}
      <Route path="/create-listing" element={
        <PrivateRoute>
          <CreateListingPage />
        </PrivateRoute>
      } />
      
      <Route path="/add-property" element={
        <PrivateRoute>
          <LandlordAddProperty />
        </PrivateRoute>
      } />
      
      {/* My Listings Route */}
      <Route path="/my-listings" element={
        <PrivateRoute>
          <MyListingsPage />
        </PrivateRoute>
      } />
      
      {/* Edit Listing Route */}
      <Route path="/edit-listing/:id" element={
        <PrivateRoute>
          <EditListingPage />
        </PrivateRoute>
      } />
      
      {/* Messages Route */}
      <Route path="/messages" element={
        <PrivateRoute>
          <Messages />
        </PrivateRoute>
      } />
      
      {/* Notifications Route */}
      <Route path="/notifications" element={
        <PrivateRoute>
          <Notifications />
        </PrivateRoute>
      } />
      
      {/* Settings Route */}
      <Route path="/settings" element={
        <PrivateRoute>
          <Settings />
        </PrivateRoute>
      } />
      
      {/* Admin Routes - MUST BE BEFORE CATCH ALL */}
      <Route path="/admin/*" element={
        <AdminRoute>
          <AdminDashboard />
        </AdminRoute>
      } />
      
      {/* Catch all redirect - MUST BE LAST */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default AppRoutes