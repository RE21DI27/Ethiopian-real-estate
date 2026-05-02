import React, { useState, useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import AdminSidebar from './AdminSidebar'
import DashboardOverview from './DashboardOverview'
import UserManagement from './UserManagement'
import VerificationQueue from './VerificationQueue'
import PaymentApprovals from './PaymentApprovals'
import ReportsAnalytics from './ReportsAnalytics'
import AdminSettings from './AdminSettings'

const AdminDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    // Listen for badge refresh events from VerificationQueue
    const handleRefresh = () => {
      setRefreshKey(prev => prev + 1)
    }
    
    window.addEventListener('refreshVerificationBadge', handleRefresh)
    
    return () => {
      window.removeEventListener('refreshVerificationBadge', handleRefresh)
    }
  }, [])

  return (
    <div className="min-h-screen bg-gray-100">
      <AdminSidebar key={refreshKey} sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      
      <main className={`transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-20'}`}>
        <Routes>
          <Route path="/" element={<DashboardOverview />} />
          <Route path="/users" element={<UserManagement />} />
          <Route path="/verification-queue" element={<VerificationQueue />} />
          <Route path="/payment-approvals" element={<PaymentApprovals />} />
          <Route path="/reports" element={<ReportsAnalytics />} />
          <Route path="/settings" element={<AdminSettings />} />
          <Route path="*" element={<Navigate to="/admin" />} />
        </Routes>
      </main>
    </div>
  )
}

export default AdminDashboard