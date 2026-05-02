import React, { useState, useEffect } from 'react'
import { Users, Home, DollarSign, TrendingUp, Calendar } from 'lucide-react'
import toast from 'react-hot-toast'

const API_URL = 'http://localhost:8000'

const ReportsAnalytics = () => {
  const [reports, setReports] = useState({
    user_registrations: [],
    property_stats: {},
    revenue_stats: {}
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchReports()
  }, [])

  const fetchReports = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('access_token')
      const response = await fetch(`${API_URL}/api/admin/reports`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      
      if (!response.ok) throw new Error('Failed to fetch reports')
      
      const data = await response.json()
      setReports(data)
    } catch (error) {
      console.error('Error fetching reports:', error)
      toast.error('Failed to load reports')
    } finally {
      setLoading(false)
    }
  }

  const statsCards = [
    { title: 'Total Users', value: reports.property_stats?.total || 0, icon: Users, color: 'bg-blue-500' },
    { title: 'Total Properties', value: reports.property_stats?.total || 0, icon: Home, color: 'bg-purple-500' },
    { title: 'Est. Revenue', value: reports.revenue_stats?.total?.toLocaleString() || '0', icon: DollarSign, color: 'bg-yellow-500' },
  ]

  const propertyDistribution = [
    { label: 'Properties for Sale', value: reports.property_stats?.for_sale || 0 },
    { label: 'Properties for Rent', value: reports.property_stats?.for_rent || 0 },
    { label: 'Active Properties', value: reports.property_stats?.active || 0 },
    { label: 'Pending Properties', value: reports.property_stats?.pending || 0 },
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
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
        <p className="text-gray-500">Platform performance overview</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {statsCards.map((stat, index) => {
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

      {/* User Registrations Chart */}
      <div className="bg-white rounded-2xl shadow-sm border p-6 mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Monthly User Registrations</h2>
        <div className="h-64 flex items-end gap-4">
          {reports.user_registrations && reports.user_registrations.length > 0 ? (
            reports.user_registrations.map((item, idx) => {
              const maxCount = Math.max(...reports.user_registrations.map(r => r.registrations), 1)
              return (
                <div key={idx} className="flex-1 flex flex-col items-center">
                  <div 
                    className="w-full bg-blue-500 rounded-t-lg transition-all duration-500 hover:bg-blue-600"
                    style={{ height: `${(item.registrations / maxCount) * 200}px` }}
                  />
                  <p className="text-xs text-gray-500 mt-2">{item.month}</p>
                  <p className="text-xs font-semibold">{item.registrations}</p>
                </div>
              )
            })
          ) : (
            <div className="w-full text-center text-gray-500">No data available</div>
          )}
        </div>
      </div>

      {/* Property Distribution and User Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-sm border p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Property Distribution</h2>
          <div className="space-y-4">
            {propertyDistribution.map((item, idx) => {
              const total = reports.property_stats?.total || 1
              const percentage = total > 0 ? (item.value / total) * 100 : 0
              return (
                <div key={idx}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">{item.label}</span>
                    <span className="font-semibold">{item.value}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 rounded-full h-2 transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Platform Overview</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center py-3 border-b">
              <span className="text-gray-600">Total Users</span>
              <span className="font-semibold text-blue-600 text-lg">{reports.property_stats?.total || 0}</span>
            </div>
            <div className="flex justify-between items-center py-3 border-b">
              <span className="text-gray-600">Properties for Sale</span>
              <span className="font-semibold text-green-600 text-lg">{reports.property_stats?.for_sale || 0}</span>
            </div>
            <div className="flex justify-between items-center py-3 border-b">
              <span className="text-gray-600">Properties for Rent</span>
              <span className="font-semibold text-purple-600 text-lg">{reports.property_stats?.for_rent || 0}</span>
            </div>
            <div className="flex justify-between items-center py-3 border-b">
              <span className="text-gray-600">Active Properties</span>
              <span className="font-semibold text-orange-600 text-lg">{reports.property_stats?.active || 0}</span>
            </div>
            <div className="flex justify-between items-center py-3 border-b">
              <span className="text-gray-600">Pending Properties</span>
              <span className="font-semibold text-yellow-600 text-lg">{reports.property_stats?.pending || 0}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ReportsAnalytics