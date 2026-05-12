import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { Building2, Home, Search, Heart, MessageCircle, User, Settings, LogOut, Bell, Menu, X } from 'lucide-react'
import toast from 'react-hot-toast'

const BuyerDashboard = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [activeTab, setActiveTab] = useState('dashboard')

  const handleLogout = () => {
    logout()
    toast.success('Logged out successfully')
    navigate('/buyer/login', { replace: true })
  }

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'properties', label: 'Browse Properties', icon: Search },
    { id: 'saved', label: 'Saved Properties', icon: Heart },
    { id: 'messages', label: 'Messages', icon: MessageCircle },
    { id: 'settings', label: 'Settings', icon: Settings }
  ]

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-72' : 'w-20'} bg-gradient-to-b from-gray-900 to-gray-800 text-white transition-all duration-300 fixed h-full z-20 shadow-xl flex flex-col`}>
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center gap-3">
            <Building2 className="w-8 h-8 text-blue-400" />
            {sidebarOpen && (
              <div>
                <h1 className="font-bold text-lg">Ethio Real Estate</h1>
                <p className="text-xs text-gray-400">Buyer Portal</p>
              </div>
            )}
          </div>
        </div>

        <nav className="flex-1 py-6">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = activeTab === item.id
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-6 py-3 transition-colors ${
                  isActive ? 'bg-blue-600 text-white border-r-4 border-blue-400' : 'text-gray-300 hover:bg-gray-700'
                }`}
              >
                <Icon className="w-5 h-5" />
                {sidebarOpen && <span className="text-sm">{item.label}</span>}
              </button>
            )
          })}
        </nav>

        <div className="p-4 border-t border-gray-700">
          {sidebarOpen && user && (
            <div className="mb-4 p-3 bg-gray-800/50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center font-bold">
                  {user?.full_name?.charAt(0) || user?.username?.charAt(0)}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-sm truncate">{user?.full_name || user?.username}</p>
                  <p className="text-xs text-gray-400">Buyer</p>
                </div>
              </div>
            </div>
          )}
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2 text-gray-300 hover:bg-red-600/20 hover:text-red-400 rounded-lg transition">
            <LogOut className="w-5 h-5" />
            {sidebarOpen && <span className="text-sm">Logout</span>}
          </button>
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="mt-4 w-full flex items-center justify-center gap-2 px-3 py-2 text-gray-400 hover:text-white transition">
            {sidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            {sidebarOpen && <span className="text-xs">Collapse</span>}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className={`${sidebarOpen ? 'ml-72' : 'ml-20'} flex-1 transition-all duration-300`}>
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-6">
          <h1 className="text-2xl font-bold">Welcome, {user?.full_name || user?.username}!</h1>
          <p className="text-blue-100 mt-1">Your buyer dashboard is ready</p>
        </div>

        <div className="p-6">
          {activeTab === 'dashboard' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-xl shadow-sm p-6 text-center">
                <Search className="w-12 h-12 text-blue-600 mx-auto mb-3" />
                <h3 className="font-semibold text-lg">Browse Properties</h3>
                <p className="text-gray-500 text-sm">Find your dream home</p>
              </div>
              <div className="bg-white rounded-xl shadow-sm p-6 text-center">
                <Heart className="w-12 h-12 text-red-500 mx-auto mb-3" />
                <h3 className="font-semibold text-lg">Save Favorites</h3>
                <p className="text-gray-500 text-sm">Keep track of properties</p>
              </div>
              <div className="bg-white rounded-xl shadow-sm p-6 text-center">
                <MessageCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
                <h3 className="font-semibold text-lg">Contact Agents</h3>
                <p className="text-gray-500 text-sm">Chat with experts</p>
              </div>
            </div>
          )}

          {activeTab === 'properties' && (
            <div className="bg-white rounded-xl shadow-sm p-8 text-center">
              <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Browse properties feature coming soon</p>
            </div>
          )}

          {activeTab === 'saved' && (
            <div className="bg-white rounded-xl shadow-sm p-8 text-center">
              <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No saved properties yet</p>
            </div>
          )}

          {activeTab === 'messages' && (
            <div className="bg-white rounded-xl shadow-sm p-8 text-center">
              <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No messages yet</p>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="bg-white rounded-xl shadow-sm p-6 max-w-2xl">
              <h2 className="text-xl font-bold mb-4">Settings</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Email Notifications</label>
                  <select className="w-full p-2 border rounded-lg">
                    <option>All notifications</option>
                    <option>Only important</option>
                    <option>None</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Language</label>
                  <select className="w-full p-2 border rounded-lg">
                    <option>English</option>
                    <option>Amharic</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default BuyerDashboard