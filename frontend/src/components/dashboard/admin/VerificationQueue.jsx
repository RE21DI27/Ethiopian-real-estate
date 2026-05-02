import React, { useState, useEffect } from 'react'
import { CheckCircle, XCircle, Clock, Eye, RefreshCw, UserCheck } from 'lucide-react'
import toast from 'react-hot-toast'

const API_URL = 'http://localhost:8000'

const VerificationQueue = () => {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('pending')
  const [selectedRequest, setSelectedRequest] = useState(null)
  const [rejectionReason, setRejectionReason] = useState('')
  const [showRejectModal, setShowRejectModal] = useState(false)

  useEffect(() => {
    fetchRequests()
  }, [activeTab])

  const fetchRequests = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('access_token')
      const response = await fetch(`${API_URL}/api/admin/verification-queue?status=${activeTab}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      
      if (!response.ok) throw new Error('Failed to fetch requests')
      
      const data = await response.json()
      setRequests(data)
      
      // Refresh sidebar badge
      refreshBadge()
    } catch (error) {
      console.error('Error fetching requests:', error)
      toast.error('Failed to load verification requests')
      setRequests([])
    } finally {
      setLoading(false)
    }
  }

  const refreshBadge = () => {
    // Dispatch event to refresh sidebar badge
    window.dispatchEvent(new CustomEvent('refreshVerificationBadge'))
  }

  const handleApprove = async (requestId) => {
    try {
      const token = localStorage.getItem('access_token')
      const response = await fetch(`${API_URL}/api/activation/admin/approve/${requestId}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      })
      
      const data = await response.json()
      
      if (response.ok && data.success) {
        toast.success('Request approved successfully! The badge count will update.')
        fetchRequests()
        setSelectedRequest(null)
        refreshBadge()
      } else {
        toast.error(data.detail || 'Failed to approve request')
      }
    } catch (error) {
      console.error('Error approving:', error)
      toast.error('Failed to approve request')
    }
  }

  const handleReject = async (requestId) => {
    if (!rejectionReason.trim()) {
      toast.error('Please provide a reason for rejection')
      return
    }
    
    try {
      const token = localStorage.getItem('access_token')
      const response = await fetch(`${API_URL}/api/activation/admin/reject/${requestId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ rejection_reason: rejectionReason })
      })
      
      const data = await response.json()
      
      if (response.ok && data.success) {
        toast.success('Request rejected')
        fetchRequests()
        setShowRejectModal(false)
        setRejectionReason('')
        setSelectedRequest(null)
        refreshBadge()
      } else {
        toast.error(data.detail || 'Failed to reject request')
      }
    } catch (error) {
      console.error('Error rejecting:', error)
      toast.error('Failed to reject request')
    }
  }

  const getStatusCounts = () => {
    return {
      pending: requests.filter(r => r.status === 'pending').length,
      approved: requests.filter(r => r.status === 'approved').length,
      rejected: requests.filter(r => r.status === 'rejected').length,
      all: requests.length
    }
  }

  const counts = getStatusCounts()
  const tabs = [
    { id: 'pending', label: 'Pending', count: counts.pending },
    { id: 'approved', label: 'Approved', count: counts.approved },
    { id: 'rejected', label: 'Rejected', count: counts.rejected },
    { id: 'all', label: 'All', count: counts.all },
  ]

  const getStatusBadge = (status) => {
    switch(status) {
      case 'pending':
        return <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs flex items-center gap-1"><Clock className="w-3 h-3" />Pending</span>
      case 'approved':
        return <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs flex items-center gap-1"><CheckCircle className="w-3 h-3" />Approved</span>
      case 'rejected':
        return <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs flex items-center gap-1"><XCircle className="w-3 h-3" />Rejected</span>
      default:
        return <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">{status}</span>
    }
  }

  const RequestDetailModal = ({ request, onClose }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
          <h2 className="text-xl font-bold flex items-center gap-2"><UserCheck className="w-5 h-5 text-blue-600" />Activation Request Details</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg"><XCircle className="w-5 h-5" /></button>
        </div>
        
        <div className="p-6 space-y-6">
          <div className="border-b pb-4">
            <h3 className="font-semibold text-lg mb-3">Personal Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div><p className="text-sm text-gray-500">Full Name</p><p className="font-medium">{request.full_name || request.user_name}</p></div>
              <div><p className="text-sm text-gray-500">Email</p><p className="font-medium">{request.email || request.user_email}</p></div>
              <div><p className="text-sm text-gray-500">Phone</p><p className="font-medium">{request.phone_number}</p></div>
              <div><p className="text-sm text-gray-500">Submitted</p><p className="font-medium">{request.created_at ? new Date(request.created_at).toLocaleDateString() : 'N/A'}</p></div>
            </div>
          </div>
          
          <div className="border-b pb-4">
            <h3 className="font-semibold text-lg mb-3">Property Information</h3>
            <div className="space-y-2">
              <div><p className="text-sm text-gray-500">Property Address</p><p className="font-medium">{request.property_address}</p></div>
              <div><p className="text-sm text-gray-500">Property Type</p><p className="font-medium">{request.property_type}</p></div>
            </div>
          </div>
          
          {request.business_name && (
            <div className="border-b pb-4">
              <h3 className="font-semibold text-lg mb-3">Business Information</h3>
              <div><p className="text-sm text-gray-500">Business Name</p><p className="font-medium">{request.business_name}</p></div>
            </div>
          )}
          
          <div>
            <h3 className="font-semibold text-lg mb-3">Status</h3>
            <div className="flex items-center gap-2 mb-4">{getStatusBadge(request.status)}</div>
            {request.rejection_reason && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm text-red-700"><strong>Rejection Reason:</strong> {request.rejection_reason}</p>
              </div>
            )}
          </div>
          
          {request.status === 'pending' && (
            <div className="flex gap-3 pt-4 border-t">
              <button onClick={() => handleApprove(request.id)} className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 flex items-center justify-center gap-2">
                <CheckCircle className="w-4 h-4" /> Approve
              </button>
              <button onClick={() => {
                setSelectedRequest(request)
                setShowRejectModal(true)
                onClose()
              }} className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 flex items-center justify-center gap-2">
                <XCircle className="w-4 h-4" /> Reject
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )

  const RejectModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 max-w-md w-full">
        <h3 className="text-xl font-bold mb-4">Reject Activation Request</h3>
        <p className="text-gray-600 mb-4">Please provide a reason for rejection:</p>
        <textarea
          value={rejectionReason}
          onChange={(e) => setRejectionReason(e.target.value)}
          rows="4"
          className="w-full p-3 border rounded-lg mb-4"
          placeholder="Enter rejection reason..."
        />
        <div className="flex gap-3">
          <button onClick={() => setShowRejectModal(false)} className="flex-1 px-4 py-2 border rounded-lg">Cancel</button>
          <button onClick={() => handleReject(selectedRequest?.id)} className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg">Confirm Reject</button>
        </div>
      </div>
    </div>
  )

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
        <h1 className="text-2xl font-bold text-gray-900">Verification Queue</h1>
        <p className="text-gray-500">Review user identity documents</p>
      </div>

      <div className="flex gap-1 bg-gray-100 rounded-lg p-1 mb-6 w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-6 py-2 rounded-lg font-medium transition ${
              activeTab === tab.id
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {tab.label} ({tab.count})
          </button>
        ))}
      </div>

      {requests.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border p-12 text-center">
          <CheckCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No {activeTab} verification requests</h3>
          <p className="text-gray-500">All caught up!</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
          <div className="divide-y">
            {requests.map((req) => (
              <div key={req.id} className="p-6 hover:bg-gray-50 transition">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-lg">{req.full_name || req.user_name}</h3>
                      {getStatusBadge(req.status)}
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm mb-3">
                      <div><p className="text-gray-500">Email</p><p className="font-medium">{req.email || req.user_email}</p></div>
                      <div><p className="text-gray-500">Phone</p><p className="font-medium">{req.phone_number}</p></div>
                      <div><p className="text-gray-500">Property Type</p><p className="font-medium">{req.property_type}</p></div>
                    </div>
                    <p className="text-sm text-gray-600">{req.property_address}</p>
                    {req.rejection_reason && (
                      <p className="text-sm text-red-600 mt-2">Reason: {req.rejection_reason}</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setSelectedRequest(req)}
                      className="px-4 py-2 border rounded-lg text-sm font-medium hover:bg-gray-50 flex items-center gap-1"
                    >
                      <Eye className="w-4 h-4" /> View Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {selectedRequest && !showRejectModal && <RequestDetailModal request={selectedRequest} onClose={() => setSelectedRequest(null)} />}
      {showRejectModal && <RejectModal />}
    </div>
  )
}

export default VerificationQueue