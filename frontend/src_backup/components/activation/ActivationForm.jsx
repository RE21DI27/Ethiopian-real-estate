import React, { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  User, Mail, Phone, MapPin, Building2, Upload, X, CheckCircle,
  ChevronRight, ChevronLeft, FileText, Briefcase, Calendar,
  Loader, AlertCircle, Home, DollarSign, Star, Camera, Image,
  IdCard, FileCheck, Shield
} from 'lucide-react'
import toast from 'react-hot-toast'

const API_URL = 'http://localhost:8000'

const ActivationForm = ({ onSuccess }) => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [uploadingDocs, setUploadingDocs] = useState(false)
  const [existingRequest, setExistingRequest] = useState(null)
  const ownershipDocInputRef = useRef(null)
  const licenseInputRef = useRef(null)
  const governmentIdInputRef = useRef(null)
  const photosInputRef = useRef(null)
  
  const [formData, setFormData] = useState({
    full_name: user?.full_name || '',
    email: user?.email || '',
    phone_number: user?.phone || '',
    property_address: '',
    property_type: 'house',
    business_name: '',
    tax_id: '',
    experience_years: '',
    previous_listings_count: '',
    reason_for_activation: ''
  })
  
  const [uploadedDocuments, setUploadedDocuments] = useState({
    ownership_document: null,
    ownership_document_url: null,
    business_license: null,
    business_license_url: null,
    government_id: null,
    government_id_url: null,
    property_photos: [],
    property_photos_urls: []
  })

  const propertyTypes = [
    { value: 'house', label: 'House' },
    { value: 'apartment', label: 'Apartment' },
    { value: 'villa', label: 'Villa' },
    { value: 'condo', label: 'Condo' },
    { value: 'commercial', label: 'Commercial' },
    { value: 'land', label: 'Land' }
  ]

  useEffect(() => {
    checkExistingRequest()
  }, [])

  const checkExistingRequest = async () => {
    try {
      const token = localStorage.getItem('access_token')
      const response = await fetch(`${API_URL}/api/activation/my-request`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      
      if (response.ok) {
        const data = await response.json()
        setExistingRequest(data)
        if (data.status === 'pending') {
          toast.success('You already have a pending request')
        }
      }
    } catch (error) {
      console.error('Error checking request:', error)
    }
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const uploadFile = async (file, type) => {
    const token = localStorage.getItem('access_token')
    const formDataFile = new FormData()
    formDataFile.append('file', file)
    
    const response = await fetch(`${API_URL}/api/activation/upload-document`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: formDataFile
    })
    
    const data = await response.json()
    if (data.success) {
      return data.url
    }
    throw new Error('Upload failed')
  }

  const handleOwnershipDocUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    
    if (!file.type.startsWith('image/') && file.type !== 'application/pdf') {
      toast.error('Please upload an image or PDF file')
      return
    }
    
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File too large. Max 10MB')
      return
    }
    
    setUploadingDocs(true)
    try {
      const url = await uploadFile(file, 'ownership')
      setUploadedDocuments(prev => ({ 
        ...prev, 
        ownership_document: file, 
        ownership_document_url: url 
      }))
      toast.success('Ownership document uploaded successfully')
    } catch (error) {
      toast.error('Failed to upload document')
    } finally {
      setUploadingDocs(false)
    }
  }

  const handleBusinessLicenseUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    
    if (!file.type.startsWith('image/') && file.type !== 'application/pdf') {
      toast.error('Please upload an image or PDF file')
      return
    }
    
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File too large. Max 10MB')
      return
    }
    
    setUploadingDocs(true)
    try {
      const url = await uploadFile(file, 'license')
      setUploadedDocuments(prev => ({ 
        ...prev, 
        business_license: file, 
        business_license_url: url 
      }))
      toast.success('Business license uploaded successfully')
    } catch (error) {
      toast.error('Failed to upload document')
    } finally {
      setUploadingDocs(false)
    }
  }

  const handleGovernmentIdUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    
    if (!file.type.startsWith('image/') && file.type !== 'application/pdf') {
      toast.error('Please upload an image or PDF file')
      return
    }
    
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File too large. Max 10MB')
      return
    }
    
    setUploadingDocs(true)
    try {
      const url = await uploadFile(file, 'government_id')
      setUploadedDocuments(prev => ({ 
        ...prev, 
        government_id: file, 
        government_id_url: url 
      }))
      toast.success('Government ID uploaded successfully')
    } catch (error) {
      toast.error('Failed to upload document')
    } finally {
      setUploadingDocs(false)
    }
  }

  const handlePropertyPhotosUpload = async (e) => {
    const files = Array.from(e.target.files)
    if (uploadedDocuments.property_photos.length + files.length > 10) {
      toast.error('Maximum 10 photos allowed')
      return
    }
    
    setUploadingDocs(true)
    
    for (const file of files) {
      if (!file.type.startsWith('image/')) {
        toast.error(`${file.name} is not an image`)
        continue
      }
      if (file.size > 10 * 1024 * 1024) {
        toast.error(`${file.name} is too large. Max 10MB`)
        continue
      }
      
      try {
        const url = await uploadFile(file, 'photo')
        const previewUrl = URL.createObjectURL(file)
        setUploadedDocuments(prev => ({
          ...prev,
          property_photos: [...prev.property_photos, { file, preview: previewUrl }],
          property_photos_urls: [...prev.property_photos_urls, url]
        }))
      } catch (error) {
        console.error('Upload error:', error)
      }
    }
    
    setUploadingDocs(false)
    e.target.value = ''
    toast.success(`${files.length} photo(s) uploaded`)
  }

  const removePhoto = (index) => {
    setUploadedDocuments(prev => ({
      ...prev,
      property_photos: prev.property_photos.filter((_, i) => i !== index),
      property_photos_urls: prev.property_photos_urls.filter((_, i) => i !== index)
    }))
  }

  const handleSubmit = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('access_token')
      
      const requestData = {
        full_name: formData.full_name,
        email: formData.email,
        phone_number: formData.phone_number,
        property_address: formData.property_address,
        property_type: formData.property_type,
        business_name: formData.business_name || "",
        tax_id: formData.tax_id || "",
        experience_years: parseInt(formData.experience_years) || 0,
        previous_listings_count: parseInt(formData.previous_listings_count) || 0,
        reason_for_activation: formData.reason_for_activation || "",
        ownership_document: uploadedDocuments.ownership_document_url || null,
        business_license: uploadedDocuments.business_license_url || null,
        government_id: uploadedDocuments.government_id_url || null,
        property_photos: JSON.stringify(uploadedDocuments.property_photos_urls || [])
      }
      
      const response = await fetch(`${API_URL}/api/activation/submit-request`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestData)
      })
      
      const data = await response.json()
      
      if (response.ok && data.success) {
        toast.success('Activation request submitted successfully!')
        if (onSuccess) onSuccess()
        navigate('/dashboard')
      } else {
        toast.error(data.detail || 'Failed to submit request')
      }
    } catch (error) {
      console.error('Submit error:', error)
      toast.error('Failed to submit activation request')
    } finally {
      setLoading(false)
    }
  }

  const nextStep = () => {
    if (step === 1 && !formData.full_name) {
      toast.error('Please enter your full name')
      return
    }
    if (step === 1 && !formData.phone_number) {
      toast.error('Please enter your phone number')
      return
    }
    if (step === 2 && !formData.property_address) {
      toast.error('Please enter your property address')
      return
    }
    setStep(step + 1)
    window.scrollTo(0, 0)
  }

  const prevStep = () => {
    setStep(step - 1)
    window.scrollTo(0, 0)
  }

  const progress = ((step - 1) / 3) * 100

  if (existingRequest?.status === 'pending') {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg border p-8 text-center">
          <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Loader className="w-10 h-10 text-yellow-600 animate-spin" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Activation Request Pending</h2>
          <p className="text-gray-600 mb-4">Your activation request is being reviewed.</p>
          <button onClick={() => navigate('/dashboard')} className="mt-6 px-6 py-3 bg-blue-600 text-white rounded-xl">Go to Dashboard</button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-900">Activate Your Account</h1>
        <p className="text-gray-500 mt-2">Please provide the following information</p>
      </div>

      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <p className="text-sm font-semibold text-blue-600">{Math.round(progress)}% Complete</p>
          <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-blue-600 to-purple-600 rounded-full transition-all" style={{ width: `${progress}%` }} />
          </div>
        </div>
        
        <div className="flex gap-2">
          {['Personal Info', 'Property Info', 'Business Info'].map((label, idx) => (
            <div key={idx} className="flex-1">
              <div className={`h-1 rounded-full ${step > idx ? 'bg-blue-600' : 'bg-gray-200'}`} />
              <div className="flex items-center gap-2 mt-2">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${step > idx ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'}`}>{idx + 1}</div>
                <p className={`text-xs font-medium ${step > idx ? 'text-blue-600' : 'text-gray-400'}`}>{label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="bg-white rounded-2xl shadow-lg border p-8">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2"><User className="w-5 h-5 text-blue-600" />Personal Information</h2>
            <div className="space-y-6">
              <div><label className="block text-sm font-medium mb-2">Full Name *</label><input name="full_name" value={formData.full_name} onChange={handleChange} className="w-full p-4 border rounded-xl" placeholder="Enter your full name" /></div>
              <div className="grid grid-cols-2 gap-6">
                <div><label className="block text-sm font-medium mb-2">Email Address</label><input name="email" value={formData.email} className="w-full p-4 border rounded-xl bg-gray-50" disabled /></div>
                <div><label className="block text-sm font-medium mb-2">Phone Number *</label><input name="phone_number" value={formData.phone_number} onChange={handleChange} className="w-full p-4 border rounded-xl" placeholder="+251 911 111 111" /></div>
              </div>
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="bg-white rounded-2xl shadow-lg border p-8">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2"><Home className="w-5 h-5 text-blue-600" />Property Information</h2>
            <div className="space-y-6">
              <div><label className="block text-sm font-medium mb-2">Property Address *</label><input name="property_address" value={formData.property_address} onChange={handleChange} className="w-full p-4 border rounded-xl" placeholder="Enter property address" /></div>
              <div className="grid grid-cols-2 gap-6">
                <div><label className="block text-sm font-medium mb-2">Property Type *</label><select name="property_type" value={formData.property_type} onChange={handleChange} className="w-full p-4 border rounded-xl">{propertyTypes.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}</select></div>
                <div><label className="block text-sm font-medium mb-2">Previous Listings Count</label><input name="previous_listings_count" type="number" value={formData.previous_listings_count} onChange={handleChange} className="w-full p-4 border rounded-xl" placeholder="Number of previous listings" /></div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Ownership Document</label>
                <div onClick={() => ownershipDocInputRef.current?.click()} className="border-2 border-dashed rounded-xl p-6 text-center cursor-pointer hover:border-blue-500">
                  <Upload className="w-10 h-10 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-600">Upload property ownership document</p>
                  <p className="text-xs text-gray-400 mt-1">PDF or Image (Max 10MB)</p>
                  <input ref={ownershipDocInputRef} type="file" accept="image/*,application/pdf" onChange={handleOwnershipDocUpload} className="hidden" />
                </div>
                {uploadedDocuments.ownership_document_url && <div className="mt-3 flex items-center gap-2 text-green-600"><CheckCircle className="w-4 h-4" /><span className="text-sm">Document uploaded</span></div>}
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Property Photos</label>
                <div onClick={() => photosInputRef.current?.click()} className="border-2 border-dashed rounded-xl p-6 text-center cursor-pointer hover:border-blue-500">
                  <Camera className="w-10 h-10 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-600">Upload property photos</p>
                  <p className="text-xs text-gray-400 mt-1">Max 10 photos</p>
                  <input ref={photosInputRef} type="file" multiple accept="image/*" onChange={handlePropertyPhotosUpload} className="hidden" />
                </div>
                {uploadedDocuments.property_photos.length > 0 && (
                  <div className="grid grid-cols-4 gap-3 mt-4">
                    {uploadedDocuments.property_photos.map((photo, idx) => (
                      <div key={idx} className="relative group">
                        <img src={photo.preview} className="w-full h-20 object-cover rounded-lg" />
                        <button onClick={() => removePhoto(idx)} className="absolute top-1 right-1 p-1 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100"><X className="w-3 h-3" /></button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="bg-white rounded-2xl shadow-lg border p-8">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2"><Briefcase className="w-5 h-5 text-blue-600" />Business & Identity Information</h2>
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div><label className="block text-sm font-medium mb-2">Business Name</label><input name="business_name" value={formData.business_name} onChange={handleChange} className="w-full p-4 border rounded-xl" placeholder="Your business name" /></div>
                <div><label className="block text-sm font-medium mb-2">Tax ID / TIN</label><input name="tax_id" value={formData.tax_id} onChange={handleChange} className="w-full p-4 border rounded-xl" placeholder="Tax identification number" /></div>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div><label className="block text-sm font-medium mb-2">Years of Experience</label><input name="experience_years" type="number" value={formData.experience_years} onChange={handleChange} className="w-full p-4 border rounded-xl" placeholder="Years in real estate" /></div>
                <div>
                  <label className="block text-sm font-medium mb-2">Business License</label>
                  <div onClick={() => licenseInputRef.current?.click()} className="border-2 border-dashed rounded-xl p-4 text-center cursor-pointer hover:border-blue-500">
                    <Upload className="w-6 h-6 text-gray-400 mx-auto mb-1" />
                    <p className="text-xs text-gray-600">Upload license</p>
                    <input ref={licenseInputRef} type="file" accept="image/*,application/pdf" onChange={handleBusinessLicenseUpload} className="hidden" />
                  </div>
                  {uploadedDocuments.business_license_url && <div className="mt-2 flex items-center gap-2 text-green-600 text-sm"><CheckCircle className="w-3 h-3" /> License uploaded</div>}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Government ID</label>
                <div onClick={() => governmentIdInputRef.current?.click()} className="border-2 border-dashed rounded-xl p-6 text-center cursor-pointer hover:border-blue-500">
                  <IdCard className="w-10 h-10 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-600">Upload Government ID (Passport, Driver's License, etc.)</p>
                  <p className="text-xs text-gray-400 mt-1">PDF or Image (Max 10MB)</p>
                  <input ref={governmentIdInputRef} type="file" accept="image/*,application/pdf" onChange={handleGovernmentIdUpload} className="hidden" />
                </div>
                {uploadedDocuments.government_id_url && <div className="mt-3 flex items-center gap-2 text-green-600"><CheckCircle className="w-4 h-4" /><span className="text-sm">Government ID uploaded</span></div>}
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Reason for Activation</label>
                <textarea name="reason_for_activation" rows="4" value={formData.reason_for_activation} onChange={handleChange} className="w-full p-4 border rounded-xl" placeholder="Why do you want to list properties on our platform?" />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex justify-between mt-8">
        {step > 1 && <button onClick={prevStep} className="px-6 py-3 border-2 rounded-xl font-semibold flex items-center gap-2"><ChevronLeft className="w-4 h-4" />Back</button>}
        <div className="flex gap-3 ml-auto">
          {step < 3 ? <button onClick={nextStep} className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold flex items-center gap-2">Continue <ChevronRight className="w-4 h-4" /></button>
          : <button onClick={handleSubmit} disabled={loading} className="px-6 py-3 bg-green-600 text-white rounded-xl font-semibold flex items-center gap-2">{loading ? <Loader className="w-5 h-5 animate-spin" /> : <CheckCircle className="w-5 h-5" />}Submit Request</button>}
        </div>
      </div>
    </div>
  )
}

export default ActivationForm