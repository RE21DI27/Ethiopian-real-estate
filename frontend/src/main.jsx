from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import PrivateRoute from './PrivateRoute'
import AdminRoute from './AdminRoute'
import { Loader } from 'lucide-react'



// In your routes file, update the buyer messages route
import BuyerMessagesPage from '../pages/buyer/MessagesPage'


// Lazy load components for better performance
const HomePage = lazy(() => import('../pages/public/HomePage'))
const PropertiesPage = lazy(() => import('../pages/public/PropertiesPage'))
const PropertyDetailPage = lazy(() => import('../pages/public/PropertyDetailPage'))
const AboutPage = lazy(() => import('../pages/public/AboutPage'))
const ContactPage = lazy(() => import('../pages/public/ContactPage'))
const PricingPage = lazy(() => import('../pages/public/PricingPage'))
const FAQPage = lazy(() => import('../pages/public/FAQPage'))
const LoginPage = lazy(() => import('../pages/auth/LoginPage'))
const RegisterPage = lazy(() => import('../pages/auth/RegisterPage'))
const ForgotPasswordPage = lazy(() => import('../pages/auth/ForgotPasswordPage'))
const ResetPasswordPage = lazy(() => import('../pages/auth/ResetPasswordPage'))
const BuyerRegisterPage = lazy(() => import('../pages/buyer/BuyerRegisterPage'))
const BuyerLoginPage = lazy(() => import('../pages/buyer/BuyerLoginPage'))
const UnifiedDashboard = lazy(() => import('../components/dashboard/user/UnifiedDashboard'))
const AdminDashboard = lazy(() => import('../components/dashboard/admin/AdminDashboard'))
const CreateListingPage = lazy(() => import('../pages/CreateListingPage'))
const LandlordAddProperty = lazy(() => import('../pages/LandlordAddProperty'))
const Notifications = lazy(() => import('../pages/Notifications'))
const Settings = lazy(() => import('../pages/Settings'))
const SubscriptionPage = lazy(() => import('../pages/SubscriptionPage'))
const ActivationPage = lazy(() => import('../pages/ActivationPage'))
const PaymentSuccessPage = lazy(() => import('../pages/PaymentSuccessPage'))
const MyListingsPage = lazy(() => import('../pages/MyListingsPage'))
const EditListingPage = lazy(() => import('../pages/EditListingPage'))
const BuyerDashboard = lazy(() => import('../pages/buyer/BuyerDashboard'))

// New messaging component - Real-time chat
const MessagesPage = lazy(() => import('../components/messages/MessagesPage'))

// Messages Wrapper for seller/landlord dashboard (keeps sidebar visible)
const MessagesWrapper = lazy(() => import('../pages/MessagesWrapper'))

const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center">
    <Loader className="w-8 h-8 animate-spin text-blue-600" />
  </div>
)
[5/12/26 1:27 PM] Melkamu: const AppRoutes = () => {
  return (
    <Suspense fallback={<PageLoader />}>
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
        
        {/* Buyer Auth */}
        <Route path="/buyer/register" element={<BuyerRegisterPage />} />
        <Route path="/buyer/login" element={<BuyerLoginPage />} />
        
        {/* Activation & Subscription */}
        <Route path="/activation" element={<PrivateRoute><ActivationPage /></PrivateRoute>} />
        <Route path="/subscription" element={<PrivateRoute><SubscriptionPage /></PrivateRoute>} />
        <Route path="/payment/success" element={<PaymentSuccessPage />} />
        
        {/* Unified Dashboard - For sellers, landlords, dual, and regular users */}
        <Route path="/dashboard" element={
          <PrivateRoute>
            <UnifiedDashboard />
          </PrivateRoute>
        } />
        
        {/* Seller/Landlord Messages - Keeps sidebar visible */}
        <Route path="/dashboard/messages" element={
          <PrivateRoute>
            <MessagesWrapper />
          </PrivateRoute>
        } />
        <Route path="/dashboard/messages/:conversationId" element={
          <PrivateRoute>
            <MessagesWrapper />
          </PrivateRoute>
        } />
        
        {/* Buyer Dashboard - All buyer routes go here */}
        <Route path="/dashboard/buyer" element={
          <PrivateRoute>
            <BuyerDashboard />
          </PrivateRoute>
        } />
        <Route path="/dashboard/buyer/messages" element={
          <PrivateRoute>
            <BuyerDashboard />
          </PrivateRoute>
        } />
        <Route path="/dashboard/buyer/messages/:conversationId" element={
          <PrivateRoute>
            <BuyerDashboard />
          </PrivateRoute>
        } />
        <Route path="/dashboard/buyer/saved" element={
          <PrivateRoute>
            <BuyerDashboard />
          </PrivateRoute>
        } />
        <Route path="/dashboard/buyer/bookmarks" element={
          <PrivateRoute>
            <BuyerDashboard />
          </PrivateRoute>
        } />
        <Route path="/dashboard/buyer/settings" element={
          <PrivateRoute>
            <BuyerDashboard />
          </PrivateRoute>
        } />
        
        {/* Listing Management */}
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
        <Route path="/my-listings" element={
          <PrivateRoute>
            <MyListingsPage />
          </PrivateRoute>
        } />
        <Route path="/edit-listing/:id" element={
          <PrivateRoute>
            <EditListingPage />
          </PrivateRoute>
        } />
        
        {/* Communication - Standalone messaging (for backward compatibility) */}
        <Route path="/messages" element={
          <PrivateRoute>
            <MessagesPage />
          </PrivateRoute>
        } />
        <Route path="/messages/:userId" element={
          <PrivateRoute>
            <MessagesPage />
          </PrivateRoute>
        } />
        <Route path="/notifications" element={
          <PrivateRoute>
            <Notifications />
          </PrivateRoute>
        } />
[5/12/26 1:27 PM] Melkamu: {/* Admin messaging routes */}
        <Route path="/admin/messages" element={
          <AdminRoute>
            <MessagesPage />
          </AdminRoute>
        } />
        <Route path="/admin/messages/:userId" element={
          <AdminRoute>
            <MessagesPage />
          </AdminRoute>
        } />
        
        {/* Settings */}
        <Route path="/settings" element={
          <PrivateRoute>
            <Settings />
          </PrivateRoute>
        } />
        
        {/* Admin Routes - MUST have trailing /* */}
        <Route path="/admin/*" element={
          <AdminRoute>
            <AdminDashboard />
          </AdminRoute>
        } />
        
        {/* Catch All - Redirect to home */}
        <Route path="*" element={<Navigate to="/" replace />} />

        // Then use it in your routes:
       <Route path="/dashboard/buyer/messages/:conversationId?" element={<BuyerMessagesPage />} />

      </Routes>
    </Suspense>
  )
}

export default AppRoutes
[5/12/26 1:30 PM] Melkamu: import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)