import React, { useState, useEffect, useCallback, memo } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { 
  Building2, MessageSquare, Settings, LogOut,
  PlusCircle, List, Shield, CreditCard, Menu, X,
  Home, LayoutDashboard, Users
} from 'lucide-react'

const AppSidebar = memo(({ sidebarOpen, setSidebarOpen }) => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const handleLogout = useCallback(() => {
    logout()
    navigate('/login')
  }, [logout, navigate])

  const handleNavigation = useCallback((path) => {
    // Immediate navigation without delay
    if (location.pathname !== path) {
      navigate(path)
    }
  }, [navigate, location.pathname])

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { id: 'create-listing', label: 'Create Listing', icon: PlusCircle, path: '/create-listing' },
    { id: 'my-listings', label: 'My Listings', icon: List, path: '/my-listings' },
    { id: 'activation', label: 'Activation', icon: Shield, path: '/activation' },
    { id: 'messages', label: 'Messages', icon: MessageSquare, path: '/messages' },
    { id: 'subscription', label: 'Subscription', icon: CreditCard, path: '/subscription' },
    { id: 'settings', label: 'Settings', icon: Settings, path: '/settings' }
  ]

  const adminItems = [
    { id: 'admin-dashboard', label: 'Admin Dashboard', icon: Shield, path: '/admin' },
    { id: 'verification-queue', label: 'Verification Queue', icon: Users, path: '/admin/verification-queue' },
  ]

  const userRole = user?.role_type || user?.role || 'user'
  const isAdmin = userRole === 'admin'
  const finalMenuItems = isAdmin ? [...menuItems, ...adminItems] : menuItems

  const getUserStatusDisplay = useCallback(() => {
    const userStatus = user?.status || 'pending'
    const isTestUser = user?.email === 'dani@gmail.com'
    
    if (isTestUser) {
      return { text: 'Active', color: 'text-green-400', dotColor: 'bg-green-500' }
    }
    
    switch(userStatus) {
      case 'active': return { text: 'Active', color: 'text-green-400', dotColor: 'bg-green-500' }
      case 'pending': return { text: 'Pending', color: 'text-yellow-400', dotColor: 'bg-yellow-500' }
      case 'suspended': return { text: 'Suspended', color: 'text-red-400', dotColor: 'bg-red-500' }
      default: return { text: 'Pending', color: 'text-yellow-400', dotColor: 'bg-yellow-500' }
    }
  }, [user])

  const statusDisplay = getUserStatusDisplay()

  return (
    <>
      {isMobile && sidebarOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-20" onClick={() => setSidebarOpen(false)} />
      )}
      
      <aside className={`fixed top-0 left-0 z-40 h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white transition-all duration-300 ${sidebarOpen ? 'w-64' : 'w-20'} ${isMobile && !sidebarOpen ? '-translate-x-full' : 'translate-x-0'}`}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-5 border-b border-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 cursor-pointer" onClick={() => handleNavigation('/dashboard')}>
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Building2 className="w-5 h-5 text-white" />
                </div>
                {sidebarOpen && (
                  <div>
                    <span className="text-xl font-bold tracking-tight">EstateHub</span>
                    <p className="text-xs text-gray-400">Real Estate Pro</p>
                  </div>
                )}
              </div>
              <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 rounded-lg hover:bg-gray-700 transition-all hidden md:block">
                {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Navigation Menu - Simplified for speed */}
          <nav className="flex-1 overflow-y-auto p-3 space-y-1">
            {finalMenuItems.map((item) => {
              const Icon = item.icon
              const isActive = location.pathname === item.path
              return (
                <div
                  key={item.id}
                  onClick={() => handleNavigation(item.path)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150 cursor-pointer ${
                    isActive 
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white' 
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  }`}
                  role="button"
                  tabIndex={0}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  {sidebarOpen && (
                    <span className="flex-1 text-left text-sm font-medium">{item.label}</span>
                  )}
                </div>
              )
            })}
          </nav>

          {/* Logout Button */}
          <div className="p-4 border-t border-gray-700">
            <div
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer text-gray-300 hover:bg-red-600 hover:text-white transition-all"
            >
              <LogOut className="w-5 h-5 flex-shrink-0" />
              {sidebarOpen && <span className="text-sm font-medium">Logout</span>}
            </div>
          </div>

          {/* User Info */}
          <div className="p-4 pt-0 pb-5">
            <div className="flex items-center gap-3 px-3 py-3 rounded-xl bg-gray-800/50">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-md flex-shrink-0">
                <span className="text-white font-bold text-sm">
                  {user?.full_name?.charAt(0) || user?.username?.charAt(0) || 'U'}
                </span>
              </div>
              {sidebarOpen && (
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm truncate">{user?.full_name || user?.username || 'User'}</p>
                  <p className="text-xs text-gray-400 truncate capitalize">{user?.role_type || 'User'}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <div className={`w-2 h-2 ${statusDisplay.dotColor} rounded-full animate-pulse`}></div>
                    <span className={`text-xs ${statusDisplay.color}`}>{statusDisplay.text}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </aside>
    </>
  )
})

AppSidebar.displayName = 'AppSidebar'

export default AppSidebar