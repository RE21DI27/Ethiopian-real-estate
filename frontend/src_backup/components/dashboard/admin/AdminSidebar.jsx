import React from 'react'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import { 
  Building2, LayoutDashboard, Users, FileCheck, 
  CreditCard, MessageCircle, Settings, LogOut,
  Menu, X, BarChart3, PlusCircle, List, 
  Bell, Activity, Shield, Award, TrendingUp,
  Home, Key, UserCheck, Wallet, HelpCircle
} from 'lucide-react'
import toast from 'react-hot-toast'

const AdminSidebar = ({ sidebarOpen, setSidebarOpen, unreadCount = 0 }) => {
  const location = useLocation()
  const navigate = useNavigate()
  const [user, setUser] = React.useState(null)

  React.useEffect(() => {
    const userData = localStorage.getItem('user')
    if (userData) {
      setUser(JSON.parse(userData))
    }
  }, [])

  const menuItems = [
    { path: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/admin/users', label: 'User Management', icon: Users },
    { path: '/admin/verification-queue', label: 'Verification Queue', icon: FileCheck },
    { path: '/admin/payment-approvals', label: 'Payment Approvals', icon: CreditCard },
    { path: '/admin/reports', label: 'Reports & Analytics', icon: BarChart3 },
    { path: '/admin/messages', label: 'Messages', icon: MessageCircle, badge: unreadCount },
    { path: '/admin/settings', label: 'Settings', icon: Settings }
  ]

  const handleLogout = () => {
    localStorage.clear()
    toast.success('Logged out successfully')
    navigate('/login')
  }

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-blue-600 text-white rounded-lg shadow-lg"
      >
        {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Sidebar */}
      <div className={`fixed left-0 top-0 h-full bg-gradient-to-b from-gray-900 to-gray-800 text-white transition-all duration-300 z-40 shadow-xl flex flex-col ${sidebarOpen ? 'w-64' : 'w-20'}`}>
        {/* Logo */}
        <div className="p-5 border-b border-gray-700">
          <div className="flex items-center gap-3">
            <Building2 className="w-8 h-8 text-blue-400 flex-shrink-0" />
            {sidebarOpen && (
              <div className="overflow-hidden">
                <h1 className="font-bold text-lg">EstateHub</h1>
                <p className="text-xs text-gray-400">Real Estate Pro</p>
              </div>
            )}
          </div>
        </div>

        {/* User Info */}
        {sidebarOpen && (
          <div className="p-4 border-b border-gray-700">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center font-bold">
                {user?.full_name?.charAt(0) || user?.username?.charAt(0) || 'A'}
              </div>
              <div>
                <p className="font-semibold text-sm">{user?.full_name || 'Admin'}</p>
                <p className="text-xs text-gray-400">Administrator</p>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 py-4 overflow-y-auto">
          <div className="px-3 mb-2">
            {sidebarOpen && <p className="text-xs text-gray-500 uppercase tracking-wider">Main Menu</p>}
          </div>
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = location.pathname === item.path || 
              (item.path !== '/admin' && location.pathname.startsWith(item.path))
            
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-5 py-3 transition-colors ${
                  isActive ? 'bg-blue-600 text-white border-r-4 border-blue-400' : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {sidebarOpen && (
                  <div className="flex-1 flex items-center justify-between">
                    <span className="text-sm">{item.label}</span>
                    {item.badge > 0 && (
                      <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full animate-pulse">
                        {item.badge > 99 ? '99+' : item.badge}
                      </span>
                    )}
                  </div>
                )}
              </NavLink>
            )
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-700">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="w-full flex items-center gap-3 px-3 py-2 text-gray-400 hover:text-white transition rounded-lg mb-2"
          >
            {sidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            {sidebarOpen && <span className="text-sm">Collapse Menu</span>}
          </button>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 text-gray-300 hover:bg-red-600/20 hover:text-red-400 rounded-lg transition"
          >
            <LogOut className="w-5 h-5" />
            {sidebarOpen && <span className="text-sm">Logout</span>}
          </button>
        </div>
      </div>
    </>
  )
}

export default AdminSidebar