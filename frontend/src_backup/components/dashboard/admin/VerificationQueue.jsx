import React, { useState, useEffect } from 'react'
import { 
  CheckCircle, XCircle, Clock, Eye, RefreshCw, UserCheck, 
  Mail, Phone, Building2, Briefcase, FileText, Image, 
  Download, X, AlertCircle, Calendar, User, Home, 
  CreditCard, Shield, Award, ThumbsUp, Star, Zap,
  ChevronLeft, ChevronRight, Search, Filter, Users,
  Loader
} from 'lucide-react'
import toast from 'react-hot-toast'

const API_URL = 'http://localhost:8000'

const VerificationQueue = () => {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('pending')
  const [selectedRequest, setSelectedRequest] = useState(null)
  const [rejectionReason, setRejectionReason] = useState('')
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [showDocumentModal, setShowDocumentModal] = useState(false)
  const [selectedDocument, setSelectedDocument] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    fetchRequests()
  }, [activeTab])

  const fetchRequests = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('access_token')
      
      let endpoint
      if (activeTab === 'pending') {
        endpoint = `${API_URL}/api/activation/admin/pending-requests`
      } else {
        endpoint = `${API_URL}/api/activation/admin/all-requests`
      }
      
      console.log('Fetching from:', endpoint)
      
      const response = await fetch(endpoint, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      
      const data = await response.json()
      console.log('Fetched data:', data)
      
      let filteredData = Array.isArray(data) ? data : []
      
      // Filter by status for approved/rejected tabs
      if (activeTab === 'approved') {
        filteredData = filteredData.filter(req => req.status === 'approved')
      } else if (activeTab === 'rejected') {
        filteredData = filteredData.filter(req => req.status === 'rejected')
      }
      
      setRequests(filteredData)
    } catch (error) {
      console.error('Error fetching requests:', error)
      toast.error('Failed to load verification requests: ' + error.message)
      setRequests([])
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchRequests()
    toast.success('Requests refreshed')
  }

  const handleApprove = async (requestId) => {
    try {
      const token = localStorage.getItem('access_token')
      const response = await fetch(`${API_URL}/api/activation/admin/approve/${requestId}`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      const data = await response.json()
      
      if (response.ok && data.success) {
        toast.success('✅ Activation request approved successfully!')
        fetchRequests()
        setSelectedRequest(null)
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
        toast.success('❌ Activation request rejected')
        fetchRequests()
        setShowRejectModal(false)
        setRejectionReason('')
        setSelectedRequest(null)
      } else {
        toast.error(data.detail || 'Failed to reject request')
      }
    } catch (error) {
      console.error('Error rejecting:', error)
      toast.error('Failed to reject request')
    }
  }

  const handleViewDocument = (docUrl, docType) => {
    if (!docUrl) {
      toast.error('No document available')
      return
    }
    const fullUrl = docUrl.startsWith('http') ? docUrl : `${API_URL}${docUrl}`
    setSelectedDocument({ url: fullUrl, type: docType })
    setShowDocumentModal(true)
  }

  const getStatusBadge = (status) => {
    switch(status) {
      case 'pending':
        return <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs"><Clock className="w-3 h-3" />Pending</span>
      case 'approved':
        return <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs"><CheckCircle className="w-3 h-3" />Approved</span>
      case 'rejected':
        return <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs"><XCircle className="w-3 h-3" />Rejected</span>
      default:
        return <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">{status}</span>
    }
  }

  const getStatusCounts = () => {
    // We need to fetch all counts, but for now use current requests
    return {
      pending: requests.filter(r => r.status === 'pending').length,
      approved: requests.filter(r => r.status === 'approved').length,
      rejected: requests.filter(r => r.status === 'rejected').length,
      all: requests.length
    }
  }

  const counts = getStatusCounts()
  const tabs = [
    { id: 'pending', label: 'Pending', count: counts.pending, icon: Clock },
    { id: 'approved', label: 'Approved', count: counts.approved, icon: CheckCircle },
    { id: 'rejected', label: 'Rejected', count: counts.rejected, icon: XCircle },
    { id: 'all', label: 'All', count: counts.all, icon: Users },
  ]

  const filteredRequests = requests.filter(req => 
    req.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    req.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    req.phone_number?.includes(searchTerm) ||
    req.user_name?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const DocumentModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600" />
            {selectedDocument?.type}
          </h3>
          <button onClick={() => setShowDocumentModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-6 bg-gray-100 flex items-center justify-center">
          {selectedDocument?.url?.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
            <img src={selectedDocument.url} alt="Document" className="max-w-full max-h-[70vh] object-contain rounded-lg shadow-lg" />
          ) : (
            <div className="text-center">
              <FileText className="w-20 h-20 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Document preview not available</p>
              <a href={selectedDocument?.url} target="_blank" rel="noopener noreferrer" className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white rounded-lg">
                Download Document
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  )

  const RequestDetailModal = ({ request, onClose }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-blue-600" />
            Activation Request Details
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6 space-y-6">
          {/* Personal Information */}
          <div className="border-b pb-4">
            <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
              <User className="w-4 h-4 text-blue-600" />
              Personal Information
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Full Name</p>
                <p className="font-medium">{request.full_name || request.user_name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium">{request.email || request.user_email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Phone</p>
                <p className="font-medium">{request.phone_number}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Submitted</p>
                <p className="font-medium">{request.created_at ? new Date(request.created_at).toLocaleDateString() : 'N/A'}</p>
              </div>
            </div>
          </div>
          
          {/* Property Information */}
          <div className="border-b pb-4">
            <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
              <Home className="w-4 h-4 text-blue-600" />
              Property Information
            </h3>
            <div className="space-y-2">
              <div>
                <p className="text-sm text-gray-500">Property Address</p>
                <p className="font-medium">{request.property_address}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Property Type</p>
                <p className="font-medium capitalize">{request.property_type}</p>
              </div>
              {request.previous_listings_count > 0 && (
                <div>
                  <p className="text-sm text-gray-500">Previous Listings</p>
                  <p className="font-medium">{request.previous_listings_count}</p>
                </div>
              )}
            </div>
          </div>
          
          {/* Business Information */}
          {(request.business_name || request.experience_years > 0 || request.reason_for_activation) && (
            <div className="border-b pb-4">
              <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-blue-600" />
                Business Information
              </h3>
              <div className="space-y-2">
                {request.business_name && (
                  <div>
                    <p className="text-sm text-gray-500">Business Name</p>
                    <p className="font-medium">{request.business_name}</p>
                  </div>
                )}
                {request.experience_years > 0 && (
                  <div>
                    <p className="text-sm text-gray-500">Years of Experience</p>
                    <p className="font-medium">{request.experience_years} years</p>
                  </div>
                )}
                {request.reason_for_activation && (
                  <div>
                    <p className="text-sm text-gray-500">Reason for Activation</p>
                    <p className="font-medium">{request.reason_for_activation}</p>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* Documents */}
          {(request.ownership_document || request.business_license) && (
            <div className="border-b pb-4">
              <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-600" />
                Uploaded Documents
              </h3>
              <div className="grid grid-cols-1 gap-3">
                {request.ownership_document && (
                  <button
                    onClick={() => handleViewDocument(request.ownership_document, 'Ownership Document')}
                    className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 transition group"
                  >
                    <FileText className="w-5 h-5 text-blue-600" />
                    <span className="flex-1 text-left">Ownership Document</span>
                    <Eye className="w-4 h-4 text-gray-400 group-hover:text-blue-600" />
                  </button>
                )}
                {request.business_license && (
                  <button
                    onClick={() => handleViewDocument(request.business_license, 'Business License')}
                    className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 transition group"
                  >
                    <FileText className="w-5 h-5 text-green-600" />
                    <span className="flex-1 text-left">Business License</span>
                    <Eye className="w-4 h-4 text-gray-400 group-hover:text-green-600" />
                  </button>
                )}
              </div>
            </div>
          )}
          
          {/* Property Photos */}
          {request.property_photos && request.property_photos.length > 0 && (
            <div className="border-b pb-4">
              <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                <Image className="w-4 h-4 text-blue-600" />
                Property Photos
              </h3>
              <div className="grid grid-cols-3 gap-2">
                {request.property_photos.map((photo, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleViewDocument(photo, `Property Photo ${idx + 1}`)}
                    className="relative group overflow-hidden rounded-lg"
                  >
                    <img src={`${API_URL}${photo}`} alt={`Property ${idx + 1}`} className="w-full h-24 object-cover" />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition flex items-center justify-center">
                      <Eye className="w-5 h-5 text-white opacity-0 group-hover:opacity-100" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
          
          {/* Status */}
          <div>
            <h3 className="font-semibold text-lg mb-3">Status</h3>
            <div className="flex items-center gap-2 mb-4">{getStatusBadge(request.status)}</div>
            {request.rejection_reason && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm text-red-700"><strong>Rejection Reason:</strong> {request.rejection_reason}</p>
              </div>
            )}
          </div>
          
          {/* Action Buttons */}
          {request.status === 'pending' && (
            <div className="flex gap-3 pt-4 border-t">
              <button
                onClick={() => handleApprove(request.id)}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 flex items-center justify-center gap-2"
              >
                <CheckCircle className="w-4 h-4" /> Approve Request
              </button>
              <button
                onClick={() => {
                  setSelectedRequest(request)
                  setShowRejectModal(true)
                  onClose()
                }}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 flex items-center justify-center gap-2"
              >
                <XCircle className="w-4 h-4" /> Reject Request
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

  if (loading && !refreshing) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="p-6">
      {showDocumentModal && <DocumentModal />}
      {selectedRequest && !showRejectModal && <RequestDetailModal request={selectedRequest} onClose={() => setSelectedRequest(null)} />}
      {showRejectModal && <RejectModal />}

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Verification Queue</h1>
        <p className="text-gray-500">Review and manage activation requests from users</p>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search by name, email, or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-lg p-1 mb-6 w-fit">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          const count = tab.count
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition ${
                isActive
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
              {count > 0 && (
                <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                  isActive ? 'bg-blue-100 text-blue-600' : 'bg-gray-200 text-gray-600'
                }`}>
                  {count}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Refresh Button */}
      <div className="flex justify-end mb-4">
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="px-3 py-2 text-sm border rounded-lg hover:bg-gray-50 flex items-center gap-2 disabled:opacity-50"
        >
          {refreshing ? <Loader className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
          Refresh
        </button>
      </div>

      {/* Requests List */}
      {filteredRequests.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border p-12 text-center">
          {activeTab === 'pending' ? (
            <Clock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          ) : activeTab === 'approved' ? (
            <CheckCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          ) : activeTab === 'rejected' ? (
            <XCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          ) : (
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          )}
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No {activeTab} verification requests</h3>
          <p className="text-gray-500">All caught up!</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
          <div className="divide-y">
            {filteredRequests.map((req) => (
              <div key={req.id} className="p-6 hover:bg-gray-50 transition">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-lg">{req.full_name || req.user_name}</h3>
                      {getStatusBadge(req.status)}
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm mb-3">
                      <div>
                        <p className="text-gray-500">Email</p>
                        <p className="font-medium">{req.email || req.user_email}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Phone</p>
                        <p className="font-medium">{req.phone_number}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Property Type</p>
                        <p className="font-medium capitalize">{req.property_type}</p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600">{req.property_address}</p>
                    {req.rejection_reason && (
                      <p className="text-sm text-red-600 mt-2">Reason: {req.rejection_reason}</p>
                    )}
                    {/* Document indicators */}
                    {(req.ownership_document || req.business_license) && (
                      <div className="flex gap-2 mt-3">
                        {req.ownership_document && (
                          <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full flex items-center gap-1">
                            <FileText className="w-3 h-3" /> Ownership Doc
                          </span>
                        )}
                        {req.business_license && (
                          <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full flex items-center gap-1">
                            <FileText className="w-3 h-3" /> Business License
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setSelectedRequest(req)}
                      className="px-4 py-2 border rounded-lg text-sm font-medium hover:bg-gray-50 flex items-center gap-1"
                    >
                      <Eye className="w-4 h-4" /> View Details
                    </button>
                    {req.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleApprove(req.id)}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 flex items-center gap-1"
                        >
                          <CheckCircle className="w-4 h-4" /> Approve
                        </button>
                        <button
                          onClick={() => {
                            setSelectedRequest(req)
                            setShowRejectModal(true)
                          }}
                          className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 flex items-center gap-1"
                        >
                          <XCircle className="w-4 h-4" /> Reject
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default VerificationQueue