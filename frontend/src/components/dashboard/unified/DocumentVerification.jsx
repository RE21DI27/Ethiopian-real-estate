import React, { useState, useEffect, useCallback } from 'react'
import { Upload, FileText, CheckCircle, XCircle, Clock, AlertCircle, X, Loader } from 'lucide-react'
import toast from 'react-hot-toast'

const API_URL = 'http://localhost:8000/api'

const DocumentVerification = ({ user, onDocumentsUpdated }) => {
  const [documents, setDocuments] = useState([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [selectedRole, setSelectedRole] = useState('seller')
  const [selectedDocumentType, setSelectedDocumentType] = useState('ownership_deed')
  const [selectedFile, setSelectedFile] = useState(null)

  const getToken = () => localStorage.getItem('access_token')

  const fetchDocuments = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/users/documents`, {
        headers: { 'Authorization': `Bearer ${getToken()}` }
      })
      const data = await response.json()
      setDocuments(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Error fetching documents:', error)
      setDocuments([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchDocuments()
  }, [fetchDocuments])

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error('File too large. Max 10MB')
        return
      }
      setSelectedFile(file)
    }
  }

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error('Please select a file')
      return
    }

    setUploading(true)
    const formData = new FormData()
    formData.append('role_type', selectedRole)
    formData.append('document_type', selectedDocumentType)
    formData.append('file', selectedFile)

    try {
      const response = await fetch(`${API_URL}/users/upload-documents`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${getToken()}` },
        body: formData
      })
      
      const data = await response.json()
      
      if (response.ok && data.success) {
        toast.success('Document uploaded successfully')
        setSelectedFile(null)
        fetchDocuments()
        if (onDocumentsUpdated) onDocumentsUpdated()
      } else {
        toast.error(data.detail || 'Upload failed')
      }
    } catch (error) {
      console.error('Upload error:', error)
      toast.error('Upload failed')
    } finally {
      setUploading(false)
    }
  }

  const getStatusBadge = (status) => {
    switch(status) {
      case 'approved': return <span className="flex items-center gap-1 text-green-600"><CheckCircle className="w-4 h-4" /> Approved</span>
      case 'pending': return <span className="flex items-center gap-1 text-yellow-600"><Clock className="w-4 h-4" /> Pending</span>
      case 'rejected': return <span className="flex items-center gap-1 text-red-600"><XCircle className="w-4 h-4" /> Rejected</span>
      default: return <span className="flex items-center gap-1 text-gray-500"><AlertCircle className="w-4 h-4" /> {status}</span>
    }
  }

  const sellerDocuments = documents.filter(d => d.role_type === 'seller')
  const landlordDocuments = documents.filter(d => d.role_type === 'landlord')

  if (loading) {
    return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-sm border p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2"><FileText className="w-5 h-5 text-blue-600" /> Document Verification</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="border rounded-xl p-4"><h4 className="font-semibold mb-3">Seller Documents</h4>{sellerDocuments.length === 0 ? <p className="text-gray-500 text-sm">No seller documents uploaded</p> : sellerDocuments.map(doc => (<div key={doc.id} className="flex items-center justify-between p-2 border-b"><span className="text-sm">{doc.document_name}</span>{getStatusBadge(doc.status)}</div>))}</div>
          <div className="border rounded-xl p-4"><h4 className="font-semibold mb-3">Landlord Documents</h4>{landlordDocuments.length === 0 ? <p className="text-gray-500 text-sm">No landlord documents uploaded</p> : landlordDocuments.map(doc => (<div key={doc.id} className="flex items-center justify-between p-2 border-b"><span className="text-sm">{doc.document_name}</span>{getStatusBadge(doc.status)}</div>))}</div>
        </div>

        <div className="mt-6 pt-4 border-t">
          <h4 className="font-semibold mb-3">Upload New Document</h4>
          <div className="flex gap-4 flex-wrap">
            <select value={selectedRole} onChange={(e) => setSelectedRole(e.target.value)} className="px-3 py-2 border rounded-lg"><option value="seller">Seller</option><option value="landlord">Landlord</option></select>
            <select value={selectedDocumentType} onChange={(e) => setSelectedDocumentType(e.target.value)} className="px-3 py-2 border rounded-lg"><option value="ownership_deed">Ownership Deed</option><option value="tax_clearance">Tax Clearance</option><option value="government_id">Government ID</option></select>
            <label className="px-4 py-2 bg-blue-600 text-white rounded-lg cursor-pointer hover:bg-blue-700">Select File<input type="file" className="hidden" onChange={handleFileChange} accept=".pdf,.jpg,.png" /></label>
            {selectedFile && (<button onClick={handleUpload} disabled={uploading} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">{uploading ? <Loader className="w-4 h-4 animate-spin" /> : 'Upload'}</button>)}
          </div>
          {selectedFile && <p className="text-sm text-gray-600 mt-2">Selected: {selectedFile.name}</p>}
        </div>
      </div>
    </div>
  )
}

export default DocumentVerification