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

// Auth Pages (Unified - Seller/Landlord)
import LoginPage from '../pages/auth/LoginPage'
import RegisterPage from '../pages/auth/RegisterPage'
import ForgotPasswordPage from '../pages/auth/ForgotPasswordPage'
import ResetPasswordPage from '../pages/auth/ResetPasswordPage'

// Buyer Auth Pages
import BuyerRegisterPage from '../pages/buyer/BuyerRegisterPage'
import BuyerLoginPage from '../pages/buyer/BuyerLoginPage'

// Dashboard Pages
import UnifiedDashboard from '../components/dashboard/user/UnifiedDashboard'
import BuyerDashboard from '../pages/buyer/BuyerDashboard'
import BuyerMessagesPage from '../pages/buyer/MessagesPage'

// Admin Pages
import AdminDashboard from '../components/dashboard/admin/AdminDashboard'

// Listing Management Pages
import CreateListingPage from '../pages/CreateListingPage'
import LandlordAddProperty from '../pages/LandlordAddProperty'
import MyListingsPage from '../pages/MyListingsPage'
import EditListingPage from '../pages/EditListingPage'

// Communication Pages
import Messages from '../pages/Messages'
import Notifications from '../pages/Notifications'

// Settings & Subscription
import Settings from '../pages/Settings'
import SubscriptionPage from '../pages/SubscriptionPage'
import ActivationPage from '../pages/ActivationPage'
import PaymentSuccessPage from '../pages/PaymentSuccessPage'

const AppRoutes = () => {
  return (
    <Routes>
      {/* ============ PUBLIC ROUTES ============ */}
      <Route path="/" element={<HomePage />} />
      <Route path="/properties" element={<PropertiesPage />} />
      <Route path="/properties/:id" element={<PropertyDetailPage />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/contact" element={<ContactPage />} />
      <Route path="/pricing" element={<PricingPage />} />
      <Route path="/faq" element={<FAQPage />} />
      
      {/* ============ UNIFIED AUTH ROUTES (Seller/Landlord) ============ */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      
      {/* ============ BUYER AUTH ROUTES ============ */}
      <Route path="/buyer/register" element={<BuyerRegisterPage />} />
      <Route path="/buyer/login" element={<BuyerLoginPage />} />
      
      {/* ============ ACTIVATION & SUBSCRIPTION ============ */}
      <Route 
        path="/activation" 
        element={
          <PrivateRoute>
            <ActivationPage />
          </PrivateRoute>
        } 
      />
      
      <Route 
        path="/subscription" 
        element={
          <PrivateRoute>
            <SubscriptionPage />
          </PrivateRoute>
        } 
      />
      
      <Route path="/payment/success" element={<PaymentSuccessPage />} />
      
      {/* ============ UNIFIED DASHBOARD (Sellers/Landlords) ============ */}
      <Route 
        path="/dashboard" 
        element={
          <PrivateRoute>
            <UnifiedDashboard />
          </PrivateRoute>
        } 
      />
      
      {/* ============ BUYER DASHBOARD ============ */}
      <Route 
        path="/dashboard/buyer" 
        element={
          <PrivateRoute>
            <BuyerDashboard />
          </PrivateRoute>
        } 
      />
      
      {/* ============ BUYER MESSAGES ============ */}
      <Route 
        path="/dashboard/buyer/messages" 
        element={
          <PrivateRoute>
            <BuyerMessagesPage />
          </PrivateRoute>
        } 
      />
      
      <Route 
        path="/dashboard/buyer/messages/:conversationId" 
        element={
          <PrivateRoute>
            <BuyerMessagesPage />
          </PrivateRoute>
        } 
      />
      
      {/* ============ LISTING MANAGEMENT ============ */}
      <Route 
        path="/create-listing" 
        element={
          <PrivateRoute>
            <CreateListingPage />
          </PrivateRoute>
        } 
      />
      
      <Route 
        path="/add-property" 
        element={
          <PrivateRoute>
            <LandlordAddProperty />
          </PrivateRoute>
        } 
      />
      
      <Route 
        path="/my-listings" 
        element={
          <PrivateRoute>
            <MyListingsPage />
          </PrivateRoute>
        } 
      />
      
      <Route 
        path="/edit-listing/:id" 
        element={
          <PrivateRoute>
            <EditListingPage />
          </PrivateRoute>
        } 
      />
      
      {/* ============ COMMUNICATION ============ */}
      <Route 
        path="/messages" 
        element={
          <PrivateRoute>
            <Messages />
          </PrivateRoute>
        } 
      />
      
      <Route 
        path="/notifications" 
        element={
          <PrivateRoute>
            <Notifications />
          </PrivateRoute>
        } 
      />
      
      {/* ============ SETTINGS ============ */}
      <Route 
        path="/settings" 
        element={
          <PrivateRoute>
            <Settings />
          </PrivateRoute>
        } 
      />
      
      {/* ============ ADMIN ROUTES ============ */}
      <Route 
        path="/admin" 
        element={
          <AdminRoute>
            <AdminDashboard />
          </AdminRoute>
        } 
      />
      
      <Route 
        path="/admin/*" 
        element={
          <AdminRoute>
            <AdminDashboard />
          </AdminRoute>
        } 
      />
      
      {/* ============ VERIFICATION QUEUE ROUTE ============ */}
      <Route 
        path="/admin/verification-queue" 
        element={
          <AdminRoute>
            <AdminDashboard />
          </AdminRoute>
        } 
      />
      
      {/* ============ PAYMENT APPROVALS ROUTE ============ */}
      <Route 
        path="/admin/payment-approvals" 
        element={
          <AdminRoute>
            <AdminDashboard />
          </AdminRoute>
        } 
      />
      
      {/* ============ CATCH ALL - REDIRECT TO HOME ============ */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default AppRoutes