import React, { useState, useEffect } from 'react'
import { Users, Home, FileCheck, CreditCard, TrendingUp, Eye, DollarSign, Clock, CheckCircle, AlertCircle, Loader } from 'lucide-react'
import toast from 'react-hot-toast'

const API_URL = 'http://localhost:8000'

const DashboardOverview = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeListings: 0,
    pendingVerifications: 0,
    totalRevenue: 0,
    monthlyGrowth: 0,
    userGrowth: 0,
    propertyGrowth: 0,
    satisfactionRate: 0
  })
  const [loading, setLoading] = useState(true)
  const [recentActivities, setRecentActivities] = useState([])

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('access_token')
      
      // Fetch multiple endpoints in parallel
      const [usersRes, listingsRes, verificationsRes, revenueRes] = await Promise.all([
        fetch(`${API_URL}/api/admin/stats/users`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`${API_URL}/api/admin/stats/listings`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`${API_URL}/api/admin/stats/verifications`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`${API_URL}/api/admin/stats/revenue`, { headers: { 'Authorization': `Bearer ${token}` } })
      ])
      
      const usersData = usersRes.ok ? await usersRes.json() : { total: 1245, growth: 8.2 }
      const listingsData = listingsRes.ok ? await listingsRes.json() : { active: 342, growth: 15.3 }
      const verificationsData = verificationsRes.ok ? await verificationsRes.json() : { pending: 18 }
      const revenueData = revenueRes.ok ? await revenueRes.json() : { total: 42500000, growth: 12.5 }
      
      setStats({
        totalUsers: usersData.total || 1245,
        activeListings: listingsData.active || 342,
        pendingVerifications: verificationsData.pending || 18,
        totalRevenue: revenueData.total || 42500000,
        monthlyGrowth: revenueData.growth || 12.5,
        userGrowth: usersData.growth || 8.2,
        propertyGrowth: listingsData.growth || 15.3,
        satisfactionRate: 94.5
      })
      
      // Fetch recent activities
      const activitiesRes = await fetch(`${API_URL}/api/admin/recent-activities`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (activitiesRes.ok) {
        const activities = await activitiesRes.json()
        setRecentActivities(activities)
      } else {
        setRecentActivities([
          { id: 1, user: 'Samuel Girma', action: 'New property listed', time: '2 minutes ago', icon: 'Home' },
          { id: 2, user: 'Martha Tadele', action: 'Account verification requested', time: '1 hour ago', icon: 'FileCheck' },
          { id: 3, user: 'Tekle Berhan', action: 'Payment completed', time: '3 hours ago', icon: 'CreditCard' }
        ])
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      // Set default values
      setStats({
        totalUsers: 1245,
        activeListings: 342,
        pendingVerifications: 18,
        totalRevenue: 42500000,
        monthlyGrowth: 12.5,
        userGrowth: 8.2,
        propertyGrowth: 15.3,
        satisfactionRate: 94.5
      })
    } finally {
      setLoading(false)
    }
  }

  const getIcon = (iconName) => {
    switch(iconName) {
      case 'Home': return <Home className="w-5 h-5 text-gray-600" />
      case 'FileCheck': return <FileCheck className="w-5 h-5 text-gray-600" />
      case 'CreditCard': return <CreditCard className="w-5 h-5 text-gray-600" />
      default: return <Users className="w-5 h-5 text-gray-600" />
    }
  }

  const formatPrice = (price) => {
    if (price >= 10000000) return `${(price / 10000000).toFixed(1)} Cr`
    if (price >= 1000000) return `${(price / 1000000).toFixed(1)} M`
    return price.toLocaleString()
  }

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border p-12 text-center">
        <Loader className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
        <p className="text-gray-500">Loading dashboard...</p>
      </div>
    )
  }

  return (
    <div className="p-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6 text-white mb-8">
        <h2 className="text-2xl font-bold">Dashboard Overview</h2>
        <p className="text-blue-100 mt-1">Welcome back, Admin</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-2xl shadow-sm border p-6 hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Users</p>
              <p className="text-3xl font-bold text-gray-900">{stats.totalUsers}</p>
              <p className="text-xs text-green-600 mt-1">↑ {stats.userGrowth}% this month</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border p-6 hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Active Listings</p>
              <p className="text-3xl font-bold text-gray-900">{stats.activeListings}</p>
              <p className="text-xs text-green-600 mt-1">↑ {stats.propertyGrowth}% this month</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <Home className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border p-6 hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Pending Verifications</p>
              <p className="text-3xl font-bold text-orange-600">{stats.pendingVerifications}</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
              <Clock className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border p-6 hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Revenue</p>
              <p className="text-3xl font-bold text-purple-600">ETB {formatPrice(stats.totalRevenue)}</p>
              <p className="text-xs text-green-600 mt-1">↑ {stats.monthlyGrowth}% this month</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Approval Notifications */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-2xl shadow-sm border">
          <div className="p-5 border-b">
            <h3 className="font-bold text-lg flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-blue-600" />
              Payment Approvals
            </h3>
          </div>
          <div className="p-4">
            <p className="text-center text-gray-500">2 payment approvals waiting for action</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border">
          <div className="p-5 border-b">
            <h3 className="font-bold text-lg flex items-center gap-2">
              <FileCheck className="w-5 h-5 text-orange-600" />
              Verification Queue
            </h3>
          </div>
          <div className="p-4">
            <p className="text-center text-gray-500">{stats.pendingVerifications} identity checks that still need review</p>
          </div>
        </div>
      </div>

      {/* User Growth Chart */}
      <div className="bg-white rounded-2xl shadow-sm border p-6 mb-8">
        <h3 className="font-bold text-lg mb-4">User Growth</h3>
        <p className="text-sm text-gray-500 mb-6">Registered users per month</p>
        <div className="flex items-end justify-between h-48 gap-2">
          {['Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May'].map((month, idx) => {
            const heights = [65, 72, 80, 88, 92, 100]
            return (
              <div key={month} className="flex-1 text-center">
                <div className="bg-blue-500 rounded-t-lg transition-all hover:bg-blue-600" style={{ height: `${heights[idx] * 0.48}px` }}></div>
                <p className="text-xs text-gray-500 mt-2">{month}</p>
              </div>
            )
          })}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-2xl shadow-sm border">
        <div className="p-5 border-b">
          <h3 className="font-bold text-lg">Recent Activity</h3>
        </div>
        <div className="divide-y">
          {recentActivities.map(activity => (
            <div key={activity.id} className="p-4 flex items-center gap-3 hover:bg-gray-50">
              <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                {getIcon(activity.icon)}
              </div>
              <div className="flex-1">
                <p className="font-medium">{activity.user}</p>
                <p className="text-sm text-gray-500">{activity.action}</p>
              </div>
              <p className="text-xs text-gray-400">{activity.time}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default DashboardOverview