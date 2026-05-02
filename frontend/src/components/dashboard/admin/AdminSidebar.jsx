import React, { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../../context/AuthContext'
import { 
  LayoutDashboard, Users, UserCheck, CreditCard, 
  BarChart3, Settings, LogOut, Menu, X, Shield,
  ChevronLeft, ChevronRight
} from 'lucide-react'

const API_URL = 'http://localhost:8000'

const AdminSidebar = ({ sidebarOpen, setSidebarOpen }) => {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const [isMobile, setIsMobile] = useState(false)
  const [pendingCount, setPendingCount] = useState(0)

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    fetchPendingCount()
    
    // Poll for pending count every 10 seconds
    const interval = setInterval(fetchPendingCount, 10000)
    return () => clearInterval(interval)
  }, [])

  const fetchPendingCount = async () => {
    try {
      const token = localStorage.getItem('access_token')
      if (!token) return
      
      const response = await fetch(`${API_URL}/api/activation/pending-count`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      
      if (response.ok) {
        const data = await response.json()
        setPendingCount(data.count || 0)
      }
    } catch (error) {
      console.error('Error fetching pending count:', error)
    }
  }

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  // Menu items - NO HIGHLIGHT styling, all items have same style
  const menuItems = [
    { path: '/admin', label: 'Dashboard', icon: LayoutDashboard, badge: null },
    { path: '/admin/users', label: 'User Management', icon: Users, badge: null },
    { path: '/admin/verification-queue', label: 'Verification Queue', icon: UserCheck, badge: pendingCount },
    { path: '/admin/payment-approvals', label: 'Payment Approvals', icon: CreditCard, badge: null },
    { path: '/admin/reports', label: 'Reports & Analytics', icon: BarChart3, badge: null },
    { path: '/admin/settings', label: 'Admin Settings', icon: Settings, badge: null },
  ]

  return (
    <>
      {isMobile && sidebarOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-20" onClick={() => setSidebarOpen(false)} />
      )}
      
      <aside className={`fixed left-0 top-0 h-full bg-gradient-to-b from-gray-900 to-gray-800 text-white transition-all duration-300 z-30 flex flex-col shadow-xl ${
        sidebarOpen ? 'w-64' : 'w-20'
      } ${isMobile && !sidebarOpen ? '-translate-x-full' : 'translate-x-0'}`}>
        
        {/* Logo Section */}
        <div className={`flex items-center justify-between p-4 border-b border-gray-700 ${!sidebarOpen && 'justify-center'}`}>
          {sidebarOpen ? (
            <Link to="/admin" className="flex items-center gap-2">
              <Shield className="w-8 h-8 text-blue-400" />
              <div>
                <span className="font-bold text-lg">Ethio Real Estate</span>
                <p className="text-xs text-blue-400">Admin Panel</p>
              </div>
            </Link>
          ) : (
            <Shield className="w-8 h-8 text-blue-400 mx-auto" />
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1 rounded-lg hover:bg-gray-700 transition hidden md:block"
          >
            {sidebarOpen ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
          </button>
        </div>

        {/* Navigation Menu - ALL ITEMS SAME STYLE, NO HIGHLIGHT */}
        <nav className="flex-1 overflow-y-auto py-4">
          <div className="px-2 space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-gray-300 hover:bg-gray-700 hover:text-white ${
                    !sidebarOpen && 'justify-center'
                  }`}
                  title={!sidebarOpen ? item.label : ''}
                >
                  <div className="relative">
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    {/* Badge only on Verification Queue */}
                    {item.badge !== null && item.badge > 0 && (
                      <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 animate-pulse">
                        {item.badge > 99 ? '99+' : item.badge}
                      </span>
                    )}
                  </div>
                  {sidebarOpen && (
                    <div className="flex-1 flex justify-between items-center">
                      <span className="text-sm">{item.label}</span>
                      {/* Badge text next to label when sidebar expanded */}
                      {item.badge !== null && item.badge > 0 && (
                        <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full ml-2">
                          {item.badge}
                        </span>
                      )}
                    </div>
                  )}
                </Link>
              )
            })}
          </div>
        </nav>

        {/* Admin Info & Logout */}
        <div className={`p-4 border-t border-gray-700 ${!sidebarOpen && 'text-center'}`}>
          <div className={`flex ${sidebarOpen ? 'items-center gap-3 mb-3' : 'flex-col items-center mb-3'}`}>
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">
                {user?.full_name?.charAt(0) || user?.username?.charAt(0) || 'M'}
              </span>
            </div>
            {sidebarOpen && (
              <div className="flex-1">
                <p className="font-semibold text-sm truncate">{user?.full_name || user?.username || 'Melkamu Admin'}</p>
                <p className="text-xs text-gray-400">Super Admin</p>
              </div>
            )}
            {!sidebarOpen && (
              <div className="mt-1 text-center">
                <p className="text-xs font-semibold">{user?.full_name?.split(' ')[0] || 'Admin'}</p>
              </div>
            )}
          </div>
          
          <button
            onClick={handleLogout}
            className={`flex items-center gap-3 px-3 py-2.5 w-full rounded-lg transition-all text-gray-300 hover:bg-red-600 hover:text-white ${
              !sidebarOpen && 'justify-center'
            }`}
            title={!sidebarOpen ? 'Logout' : ''}
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {sidebarOpen && <span className="text-sm">Logout</span>}
          </button>
        </div>
      </aside>
    </>
  )
}

export default AdminSidebar