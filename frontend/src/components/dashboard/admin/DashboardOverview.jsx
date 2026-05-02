import React, { useState, useEffect } from 'react'
import { Users, Home, DollarSign, Clock, TrendingUp, UserCheck, CreditCard } from 'lucide-react'
import toast from 'react-hot-toast'

const API_URL = 'http://localhost:8000'

const DashboardOverview = () => {
  const [stats, setStats] = useState({
    total_users: 0,
    verified_users: 0,
    total_properties: 0,
    active_properties: 0,
    total_revenue: 0,
    pending_activations: 0,
    pending_payments: 0,
    user_growth: []
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('access_token')
      const response = await fetch(`${API_URL}/api/admin/dashboard-stats`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      
      if (!response.ok) throw new Error('Failed to fetch stats')
      
      const data = await response.json()
      setStats(data)
    } catch (error) {
      console.error('Error fetching stats:', error)
      toast.error('Failed to load dashboard stats')
    } finally {
      setLoading(false)
    }
  }

  const statCards = [
    { title: 'Total Users', value: stats.total_users, icon: Users, color: 'bg-blue-500' },
    { title: 'Active Properties', value: stats.active_properties, icon: Home, color: 'bg-green-500' },
    { title: 'Revenue (ETB)', value: stats.total_revenue?.toLocaleString() || '0', icon: DollarSign, color: 'bg-yellow-500' },
    { title: 'Pending Approvals', value: (stats.pending_activations || 0) + (stats.pending_payments || 0), icon: Clock, color: 'bg-orange-500' },
  ]

  const approvalStats = [
    { title: 'Payment approvals', value: stats.pending_payments || 0, description: 'Pending payment reviews waiting for action.', icon: CreditCard },
    { title: 'Verification queue', value: stats.pending_activations || 0, description: 'Identity checks that still need review.', icon: UserCheck },
  ]

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
        <p className="text-gray-500">Welcome back, {stats.full_name || 'Admin'}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat, index) => {
          const Icon = stat.icon
          return (
            <div key={index} className="bg-white rounded-2xl shadow-sm border p-6">
              <div className={`p-3 rounded-xl ${stat.color} bg-opacity-10 w-fit mb-4`}>
                <Icon className={`w-6 h-6 ${stat.color.replace('bg-', 'text-')}`} />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">{stat.value}</h3>
              <p className="text-sm text-gray-500 mt-1">{stat.title}</p>
            </div>
          )
        })}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border p-6 mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Approval Notifications</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {approvalStats.map((item, index) => {
            const Icon = item.icon
            return (
              <div key={index} className="text-center p-4 bg-gray-50 rounded-xl">
                <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Icon className="w-6 h-6 text-gray-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">{item.value}</h3>
                <p className="text-sm text-gray-600 mt-1">{item.title}</p>
                <p className="text-xs text-gray-400 mt-2">{item.description}</p>
              </div>
            )
          })}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">User Growth</h2>
        <p className="text-sm text-gray-500 mb-4">Registered users per month</p>
        <div className="h-64 flex items-end gap-2">
          {stats.user_growth && stats.user_growth.length > 0 ? (
            stats.user_growth.map((item, idx) => {
              const maxCount = Math.max(...stats.user_growth.map(g => g.count), 1)
              return (
                <div key={idx} className="flex-1 flex flex-col items-center">
                  <div 
                    className="w-full bg-blue-500 rounded-t-lg transition-all duration-500 hover:bg-blue-600"
                    style={{ height: `${(item.count / maxCount) * 200}px` }}
                  />
                  <p className="text-xs text-gray-500 mt-2">{item.month}</p>
                  <p className="text-xs font-semibold">{item.count}</p>
                </div>
              )
            })
          ) : (
            <div className="w-full text-center text-gray-500">No data available</div>
          )}
        </div>
      </div>
    </div>
  )
}

export default DashboardOverview