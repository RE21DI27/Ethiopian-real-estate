import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import AppSidebar from '../components/layout/AppSidebar'
import CreateListingWizard from '../components/wizard/CreateListingWizard'
import { Shield, CreditCard } from 'lucide-react'

const API_URL = 'http://localhost:8000'

const CreateListingPage = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [status, setStatus] = useState({
    canProceed: false,
    needsActivation: false,
    needsSubscription: false,
    isReady: false
  })

  useEffect(() => {
    checkStatus()
  }, [])

  const checkStatus = async () => {
    try {
      const token = localStorage.getItem('access_token')
      if (!token) {
        navigate('/login')
        return
      }

      // Parallel API calls for faster response
      const [activationRes, paymentRes] = await Promise.all([
        fetch(`${API_URL}/api/activation/status`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`${API_URL}/api/payments/status`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ])

      const activationData = await activationRes.json()
      const paymentData = await paymentRes.json()

      const isActivated = activationData.is_activated || false
      const hasSubscription = paymentData.has_active_subscription || false

      setStatus({
        canProceed: isActivated && hasSubscription,
        needsActivation: !isActivated,
        needsSubscription: isActivated && !hasSubscription,
        isReady: true
      })
    } catch (error) {
      console.error('Error checking status:', error)
      setStatus({
        canProceed: false,
        needsActivation: true,
        needsSubscription: false,
        isReady: true
      })
    }
  }

  // Don't show anything until we have status
  if (!status.isReady) {
    return (
      <div className="min-h-screen bg-gray-100">
        <AppSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        <main className={`transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-20'}`}>
          <div className="p-6">
            {/* Empty content - no spinner */}
          </div>
        </main>
      </div>
    )
  }

  if (status.needsActivation) {
    return (
      <div className="min-h-screen bg-gray-100">
        <AppSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        <main className={`transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-20'}`}>
          <div className="flex items-center justify-center min-h-[80vh] p-6">
            <div className="bg-white rounded-2xl shadow-xl p-8 text-center max-w-md">
              <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-10 h-10 text-yellow-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Account Not Activated</h2>
              <p className="text-gray-600 mb-6">Please activate your account to create listings.</p>
              <button
                onClick={() => navigate('/activation')}
                className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg"
              >
                Activate Account
              </button>
            </div>
          </div>
        </main>
      </div>
    )
  }

  if (status.needsSubscription) {
    return (
      <div className="min-h-screen bg-gray-100">
        <AppSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        <main className={`transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-20'}`}>
          <div className="flex items-center justify-center min-h-[80vh] p-6">
            <div className="bg-white rounded-2xl shadow-xl p-8 text-center max-w-md">
              <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CreditCard className="w-10 h-10 text-purple-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Subscription Required</h2>
              <p className="text-gray-600 mb-6">Subscribe to a plan to start listing properties.</p>
              <button
                onClick={() => navigate('/subscription')}
                className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg"
              >
                Subscribe Now
              </button>
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <AppSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <main className={`transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-20'}`}>
        <div className="p-6">
          <CreateListingWizard />
        </div>
      </main>
    </div>
  )
}

export default CreateListingPage