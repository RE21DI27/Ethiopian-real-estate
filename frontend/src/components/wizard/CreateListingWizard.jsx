import React, { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'  // Only declare this once at the top
import { useAuth } from '../../context/AuthContext'
import { listingsAPI } from '../../services/api/listingsApi'
import { 
  Home, MapPin, DollarSign, Bed, Bath, Square, Camera, Upload, 
  ChevronRight, ChevronLeft, Sparkles, Eye, X, CheckCircle,
  Wifi, Wind, Thermometer, Coffee, Dumbbell, Tv, 
  Microwave, Refrigerator, Car, Activity, Lock, 
  TreePine, Heart, Zap, Sofa, Loader, Droplet, Save,
  Star, Building2, Calendar, Tag, Phone, Mail
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'

const API_URL = 'http://localhost:8000'

const CreateListingWizard = ({ onSuccess }) => {
  const navigate = useNavigate()  // This is fine, only once
  const { user } = useAuth()
  const [step, setStep] = useState(1)
  const [listingType, setListingType] = useState(null)
  const [loading, setLoading] = useState(false)
  const [uploadingImages, setUploadingImages] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const fileInputRef = useRef(null)
  
  // Add activation check effect
  const [checkingActivation, setCheckingActivation] = useState(true)
  const [isActivated, setIsActivated] = useState(false)

  useEffect(() => {
    checkActivationStatus()
  }, [])

  const checkActivationStatus = async () => {
    try {
      const token = localStorage.getItem('access_token')
      const response = await fetch(`${API_URL}/api/activation/status`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const data = await response.json()
      
      if (!data.is_activated) {
        toast.error('Your account is not activated. Please activate your account first.')
        navigate('/activation')
        return false
      }
      setIsActivated(true)
      return true
    } catch (error) {
      console.error('Error checking activation:', error)
      navigate('/activation')
      return false
    } finally {
      setCheckingActivation(false)
    }
  }

  // Rest of your component code...
  const [formData, setFormData] = useState({
    title: '',
    property_type: 'house',
    price: '',
    bedrooms: '',
    bathrooms: '',
    sqft: '',
    year_built: '',
    address: '',
    city: '',
    region: '',
    sub_city: '',
    kebele: '',
    description: '',
    amenities: [],
    phone_number: user?.phone || '',
    email: user?.email || ''
  })
  
  const [uploadedImages, setUploadedImages] = useState([])
  const [coverImageIndex, setCoverImageIndex] = useState(0)

  // If still checking activation, show loader
  if (checkingActivation) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    )
  }

  // If not activated, don't show the form
  if (!isActivated) {
    return null
  }

  // If no listing type selected, show selection screen
  if (!listingType) {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg border p-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Create New Listing</h1>
          <p className="text-gray-500 mb-8">Choose what type of listing you want to create</p>
          
          <div className="grid grid-cols-2 gap-6">
            <button
              onClick={() => setListingType('sale')}
              className="p-8 border-2 rounded-2xl hover:border-green-500 hover:bg-green-50 transition-all group"
            >
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-green-200 transition">
                <DollarSign className="w-10 h-10 text-green-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">For Sale</h2>
              <p className="text-gray-500">Sell your property to potential buyers</p>
            </button>
            
            <button
              onClick={() => setListingType('rent')}
              className="p-8 border-2 rounded-2xl hover:border-blue-500 hover:bg-blue-50 transition-all group"
            >
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-200 transition">
                <Calendar className="w-10 h-10 text-blue-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">For Rent</h2>
              <p className="text-gray-500">Find tenants for your property</p>
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Rest of your component continues here...
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleAmenityToggle = (amenity) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity]
    }))
  }

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files)
    if (uploadedImages.length + files.length > 20) {
      toast.error('Maximum 20 photos allowed')
      return
    }
    
    setUploadingImages(true)
    
    for (const file of files) {
      if (!file.type.startsWith('image/')) {
        toast.error(`${file.name} is not an image`)
        continue
      }
      if (file.size > 10 * 1024 * 1024) {
        toast.error(`${file.name} is too large. Max 10MB`)
        continue
      }
      
      const previewUrl = URL.createObjectURL(file)
      setUploadedImages(prev => [...prev, { 
        id: Date.now() + Math.random(), 
        preview: previewUrl, 
        file,
        url: null 
      }])
    }
    
    setUploadingImages(false)
    e.target.value = ''
    if (files.length > 0) {
      toast.success(`${files.length} image(s) added`)
    }
  }

  const removeImage = (id) => {
    setUploadedImages(prev => prev.filter(p => p.id !== id))
    if (coverImageIndex >= uploadedImages.length - 1 && uploadedImages.length > 1) {
      setCoverImageIndex(Math.max(0, uploadedImages.length - 2))
    }
  }

  const setAsCover = (index) => {
    setCoverImageIndex(index)
    toast.success('Cover photo selected!')
  }

  const uploadImagesToServer = async () => {
    const token = localStorage.getItem('access_token')
    const uploadedImageUrls = []
    
    for (const img of uploadedImages) {
      if (img.file) {
        const formDataImg = new FormData()
        formDataImg.append('file', img.file)
        
        try {
          const uploadResponse = await fetch(`${API_URL}/api/listings/upload-image`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` },
            body: formDataImg
          })
          
          const uploadData = await uploadResponse.json()
          if (uploadData.success) {
            uploadedImageUrls.push(uploadData.url)
          }
        } catch (err) {
          console.error('Upload error:', err)
        }
      } else if (img.url) {
        uploadedImageUrls.push(img.url)
      }
    }
    
    return uploadedImageUrls
  }

  const handleSaveAsDraft = async () => {
    if (!formData.title) {
      toast.error('Please enter a title')
      return
    }
    
    setLoading(true)
    try {
      const token = localStorage.getItem('access_token')
      const uploadedImageUrls = await uploadImagesToServer()
      
      const listingData = {
        title: formData.title,
        property_type: formData.property_type,
        price: parseFloat(formData.price) || 0,
        listing_type: listingType,
        bedrooms: parseInt(formData.bedrooms) || 0,
        bathrooms: parseInt(formData.bathrooms) || 0,
        sqft: parseFloat(formData.sqft) || 0,
        year_built: formData.year_built ? parseInt(formData.year_built) : null,
        address: formData.address || '',
        city: formData.city || '',
        region: formData.region || '',
        sub_city: formData.sub_city || '',
        kebele: formData.kebele || '',
        description: formData.description || '',
        images: uploadedImageUrls,
        cover_image: uploadedImageUrls[coverImageIndex] || (uploadedImageUrls[0] || null),
        amenities: formData.amenities,
        phone_number: formData.phone_number,
        email: formData.email,
        is_draft: true,
        status: 'draft'
      }
      
      const response = await fetch(`${API_URL}/api/listings/create`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(listingData)
      })
      
      const data = await response.json()
      
      if (response.ok && data.success) {
        toast.success('Listing saved as draft!')
        navigate('/my-listings')
      } else {
        toast.error(data.detail || 'Failed to save draft')
      }
    } catch (error) {
      console.error('Save draft error:', error)
      toast.error('Failed to save draft')
    } finally {
      setLoading(false)
    }
  }

  const handlePublish = async () => {
    if (!formData.title) {
      toast.error('Please enter a title')
      return
    }
    if (!formData.price) {
      toast.error('Please enter a price')
      return
    }
    if (!formData.address) {
      toast.error('Please enter an address')
      return
    }
    if (!formData.city) {
      toast.error('Please enter a city')
      return
    }
    if (uploadedImages.length === 0) {
      toast.error('Please upload at least one photo')
      return
    }
    
    setLoading(true)
    try {
      const token = localStorage.getItem('access_token')
      const uploadedImageUrls = await uploadImagesToServer()
      
      const listingData = {
        title: formData.title,
        property_type: formData.property_type,
        price: parseFloat(formData.price),
        listing_type: listingType,
        bedrooms: parseInt(formData.bedrooms) || 0,
        bathrooms: parseInt(formData.bathrooms) || 0,
        sqft: parseFloat(formData.sqft) || 0,
        year_built: formData.year_built ? parseInt(formData.year_built) : null,
        address: formData.address,
        city: formData.city,
        region: formData.region || '',
        sub_city: formData.sub_city || '',
        kebele: formData.kebele || '',
        description: formData.description,
        images: uploadedImageUrls,
        cover_image: uploadedImageUrls[coverImageIndex] || (uploadedImageUrls[0] || null),
        amenities: formData.amenities,
        phone_number: formData.phone_number,
        email: formData.email,
        is_draft: false,
        status: 'active'
      }
      
      const response = await fetch(`${API_URL}/api/listings/create`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(listingData)
      })
      
      const data = await response.json()
      
      if (response.ok && data.success) {
        toast.success('Listing published successfully!')
        navigate('/my-listings')
      } else {
        toast.error(data.detail || 'Failed to publish listing')
      }
    } catch (error) {
      console.error('Publish error:', error)
      toast.error('Failed to publish listing')
    } finally {
      setLoading(false)
    }
  }

  const nextStep = () => {
    if (step === 1 && !formData.title) {
      toast.error('Please enter a title')
      return
    }
    if (step === 1 && !formData.price) {
      toast.error('Please enter a price')
      return
    }
    if (step === 2 && !formData.address) {
      toast.error('Please enter an address')
      return
    }
    if (step === 2 && !formData.city) {
      toast.error('Please enter a city')
      return
    }
    if (step === 5 && uploadedImages.length === 0) {
      toast.error('Please upload at least one photo')
      return
    }
    if (step === 5 && !formData.description) {
      toast.error('Please enter a description')
      return
    }
    setStep(step + 1)
    window.scrollTo(0, 0)
  }

  const prevStep = () => {
    setStep(step - 1)
    window.scrollTo(0, 0)
  }

  const progress = ((step - 1) / 4) * 100

  const propertyTypes = [
    { value: 'house', label: 'House' },
    { value: 'apartment', label: 'Apartment' },
    { value: 'villa', label: 'Villa' },
    { value: 'condo', label: 'Condo' },
    { value: 'townhouse', label: 'Townhouse' },
    { value: 'commercial', label: 'Commercial' }
  ]

  const amenitiesList = [
    { icon: Wifi, name: 'WiFi' },
    { icon: Wind, name: 'Air Conditioning' },
    { icon: Thermometer, name: 'Heating' },
    { icon: Tv, name: 'Cable TV' },
    { icon: Refrigerator, name: 'Refrigerator' },
    { icon: Microwave, name: 'Microwave' },
    { icon: Droplet, name: 'Washing Machine' },
    { icon: Coffee, name: 'Coffee Maker' },
    { icon: Car, name: 'Parking' },
    { icon: Activity, name: 'Swimming Pool' },
    { icon: Dumbbell, name: 'Gym' },
    { icon: Lock, name: 'Security System' },
    { icon: TreePine, name: 'Garden' },
    { icon: Heart, name: 'Pet Friendly' },
    { icon: Sofa, name: 'Furnished' },
    { icon: Zap, name: 'Backup Power' }
  ]

  const PreviewModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4" onClick={() => setShowPreview(false)}>
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
          <h2 className="text-xl font-bold">Preview Listing</h2>
          <button onClick={() => setShowPreview(false)} className="p-2 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-6">
          <div className="relative h-64 bg-gray-200 rounded-xl mb-4">
            {uploadedImages[coverImageIndex] && (
              <img src={uploadedImages[coverImageIndex].preview} className="w-full h-full object-cover rounded-xl" />
            )}
          </div>
          <h2 className="text-2xl font-bold">{formData.title}</h2>
          <p className="text-2xl text-blue-600">ETB {formData.price}</p>
          <p className="text-gray-500 mt-2">{formData.address}, {formData.city}</p>
          <p className="mt-4">{formData.description}</p>
        </div>
      </div>
    </div>
  )

  return (
    <div className="max-w-5xl mx-auto">
      {showPreview && <PreviewModal />}

      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {listingType === 'sale' ? 'List Property for Sale' : 'List Property for Rent'}
            </h1>
          </div>
          <div className="text-right">
            <p className="text-sm font-semibold text-blue-600">{Math.round(progress)}% Complete</p>
            <div className="w-32 h-2 bg-gray-200 rounded-full mt-1 overflow-hidden">
              <div className="h-full bg-gradient-to-r from-blue-600 to-purple-600 rounded-full transition-all" style={{ width: `${progress}%` }} />
            </div>
          </div>
        </div>
        
        <div className="flex gap-2 mt-6">
          {['Basic Info', 'Location', 'Address Details', 'Amenities', 'Photos & Contact'].map((label, idx) => (
            <div key={idx} className="flex-1">
              <div className={`h-1 rounded-full ${step > idx ? 'bg-blue-600' : 'bg-gray-200'}`} />
              <div className="flex items-center gap-2 mt-2">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                  step > idx ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'
                }`}>
                  {idx + 1}
                </div>
                <p className={`text-xs font-medium ${step > idx ? 'text-blue-600' : 'text-gray-400'}`}>{label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="bg-white rounded-2xl shadow-lg border p-8">
            <h2 className="text-xl font-bold mb-6">Basic Information</h2>
            <div className="space-y-6">
              <div><label className="block text-sm font-medium mb-2">Title *</label><input name="title" value={formData.title} onChange={handleChange} className="w-full p-4 border rounded-xl" /></div>
              <div className="grid grid-cols-2 gap-6">
                <div><label className="block text-sm font-medium mb-2">Property Type</label><select name="property_type" value={formData.property_type} onChange={handleChange} className="w-full p-4 border rounded-xl">{propertyTypes.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}</select></div>
                <div><label className="block text-sm font-medium mb-2">{listingType === 'sale' ? 'Price (ETB)' : 'Rent (ETB/mo)'} *</label><input name="price" type="number" value={formData.price} onChange={handleChange} className="w-full p-4 border rounded-xl" /></div>
              </div>
              <div className="grid grid-cols-3 gap-6">
                <div><label className="block text-sm font-medium mb-2">Bedrooms</label><input name="bedrooms" type="number" value={formData.bedrooms} onChange={handleChange} className="w-full p-4 border rounded-xl" /></div>
                <div><label className="block text-sm font-medium mb-2">Bathrooms</label><input name="bathrooms" type="number" value={formData.bathrooms} onChange={handleChange} className="w-full p-4 border rounded-xl" /></div>
                <div><label className="block text-sm font-medium mb-2">Square Feet</label><input name="sqft" type="number" value={formData.sqft} onChange={handleChange} className="w-full p-4 border rounded-xl" /></div>
              </div>
              <div><label className="block text-sm font-medium mb-2">Year Built</label><input name="year_built" type="number" value={formData.year_built} onChange={handleChange} className="w-full p-4 border rounded-xl" placeholder="e.g., 2020" /></div>
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="bg-white rounded-2xl shadow-lg border p-8">
            <h2 className="text-xl font-bold mb-6">Location</h2>
            <div className="space-y-6">
              <div><label className="block text-sm font-medium mb-2">Address *</label><input name="address" value={formData.address} onChange={handleChange} className="w-full p-4 border rounded-xl" /></div>
              <div className="grid grid-cols-2 gap-6">
                <div><label className="block text-sm font-medium mb-2">City *</label><input name="city" value={formData.city} onChange={handleChange} className="w-full p-4 border rounded-xl" /></div>
                <div><label className="block text-sm font-medium mb-2">Region</label><input name="region" value={formData.region} onChange={handleChange} className="w-full p-4 border rounded-xl" /></div>
              </div>
            </div>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="bg-white rounded-2xl shadow-lg border p-8">
            <h2 className="text-xl font-bold mb-6">Address Details</h2>
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div><label className="block text-sm font-medium mb-2">Sub City</label><input name="sub_city" value={formData.sub_city} onChange={handleChange} className="w-full p-4 border rounded-xl" placeholder="e.g., Bole, Kirkos" /></div>
                <div><label className="block text-sm font-medium mb-2">Kebele</label><input name="kebele" value={formData.kebele} onChange={handleChange} className="w-full p-4 border rounded-xl" placeholder="e.g., Kebele 03" /></div>
              </div>
              <div className="bg-blue-50 rounded-xl p-6">
                <p className="text-sm text-blue-700">Complete Address: {formData.address}, {formData.sub_city && `${formData.sub_city}, `}{formData.kebele && `Kebele ${formData.kebele}, `}{formData.city}, {formData.region}</p>
              </div>
            </div>
          </motion.div>
        )}

        {step === 4 && (
          <motion.div key="step4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="bg-white rounded-2xl shadow-lg border p-8">
            <h2 className="text-xl font-bold mb-6">Amenities</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {amenitiesList.map(a => {
                const Icon = a.icon
                const isSelected = formData.amenities.includes(a.name)
                return (
                  <button key={a.name} type="button" onClick={() => handleAmenityToggle(a.name)} className={`p-3 border-2 rounded-xl flex items-center gap-2 transition-all ${isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}>
                    <Icon className={`w-4 h-4 ${isSelected ? 'text-blue-600' : 'text-gray-400'}`} />
                    <span className="text-sm">{a.name}</span>
                  </button>
                )
              })}
            </div>
          </motion.div>
        )}

        {step === 5 && (
          <motion.div key="step5" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="bg-white rounded-2xl shadow-lg border p-8">
            <h2 className="text-xl font-bold mb-6">Photos & Contact</h2>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">Photos *</label>
                <div onClick={() => fileInputRef.current?.click()} className="border-2 border-dashed rounded-xl p-8 text-center cursor-pointer hover:border-blue-500">
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600">Click to upload photos</p>
                  <input ref={fileInputRef} type="file" multiple accept="image/*" onChange={handleImageUpload} className="hidden" />
                </div>
                {uploadedImages.length > 0 && (
                  <div className="grid grid-cols-4 gap-3 mt-4">
                    {uploadedImages.map((img, idx) => (
                      <div key={img.id} className="relative group">
                        <img src={img.preview} className="w-full h-24 object-cover rounded-lg" />
                        <button onClick={() => removeImage(img.id)} className="absolute top-1 right-1 p-1 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100"><X className="w-3 h-3" /></button>
                        <button onClick={() => setAsCover(idx)} className={`absolute bottom-1 left-1 p-1 rounded-full ${coverImageIndex === idx ? 'bg-yellow-500' : 'bg-black bg-opacity-50'}`}><Star className="w-3 h-3 text-white" /></button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div><label className="block text-sm font-medium mb-2">Description *</label><textarea name="description" rows="4" value={formData.description} onChange={handleChange} className="w-full p-4 border rounded-xl" /></div>
              <div className="grid grid-cols-2 gap-6">
                <div><label className="block text-sm font-medium mb-2">Phone Number</label><input name="phone_number" value={formData.phone_number} onChange={handleChange} className="w-full p-4 border rounded-xl" placeholder="+251 911 111 111" /></div>
                <div><label className="block text-sm font-medium mb-2">Email</label><input name="email" type="email" value={formData.email} onChange={handleChange} className="w-full p-4 border rounded-xl" placeholder="contact@property.com" /></div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex justify-between mt-8">
        {step > 1 && <button onClick={prevStep} className="px-6 py-3 border-2 rounded-xl font-semibold flex items-center gap-2"><ChevronLeft className="w-4 h-4" />Back</button>}
        <div className="flex gap-3 ml-auto">
          {step === 5 && <button onClick={() => setShowPreview(true)} className="px-6 py-3 border-2 rounded-xl font-semibold flex items-center gap-2"><Eye className="w-4 h-4" />Preview</button>}
          {step === 5 && <button onClick={handleSaveAsDraft} disabled={loading} className="px-6 py-3 border-2 rounded-xl font-semibold flex items-center gap-2">{loading ? <Loader className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}Save Draft</button>}
          {step < 5 ? <button onClick={nextStep} className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold flex items-center gap-2">Continue <ChevronRight className="w-4 h-4" /></button> : <button onClick={handlePublish} disabled={loading} className="px-6 py-3 bg-green-600 text-white rounded-xl font-semibold flex items-center gap-2">{loading ? <Loader className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}Publish</button>}
        </div>
      </div>
    </div>
  )
}

export default CreateListingWizard