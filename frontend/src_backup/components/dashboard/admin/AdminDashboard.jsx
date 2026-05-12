import React from 'react'
import { useNavigate } from 'react-router-dom'

const AdminDashboard = () => {
  const navigate = useNavigate()
  const user = JSON.parse(localStorage.getItem('user') || '{}')

  const handleLogout = () => {
    localStorage.clear()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Admin Dashboard</h1>
            <p className="text-blue-100">Welcome, {user.full_name || user.username}!</p>
          </div>
          <button 
            onClick={handleLogout} 
            className="bg-white/20 px-4 py-2 rounded-lg hover:bg-white/30 transition"
          >
            Logout
          </button>
        </div>
      </div>
      <div className="p-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-bold mb-4">Dashboard Overview</h2>
          <p>You have successfully logged in as administrator.</p>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard
