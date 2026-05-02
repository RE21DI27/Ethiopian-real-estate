import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import AppSidebar from '../../components/layout/AppSidebar'
import { 
  MapPin, Bed, Bath, Square, Calendar, Eye, 
  Heart, Share2, MessageCircle, Phone, Mail,
  Wifi, Car, Wind, Coffee, Dumbbell, Tv, Shield, TreePine, 
  Home, ArrowLeft, Loader, Star, Clock, DollarSign, Camera, 
  CheckCircle, Zap, ThumbsUp, Award, Users, TrendingUp, 
  Building2, Waves, FileText, Smartphone, Sun, Lock, X
} from 'lucide-react'
import toast from 'react-hot-toast'

const API_URL = 'http://localhost:8000'

const PropertyDetailPage = () => {
  const { id } = useParams()
  const { user } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [property, setProperty] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState(0)
  const [isSaved, setIsSaved] = useState(false)
  const [showContactForm, setShowContactForm] = useState(false)
  const [contactMessage, setContactMessage] = useState('')

  useEffect(() => {
    fetchProperty()
    window.scrollTo(0, 0)
  }, [id])

  const fetchProperty = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('access_token')
      
      const headers = {}
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }
      
      const response = await fetch(`${API_URL}/api/listings/${id}`, {
        headers: headers
      })
      
      if (!response.ok) {
        if (response.status === 404) {
          toast.error('Property not found')
          return
        }
        throw new Error('Failed to fetch property')
      }
      
      const data = await response.json()
      setProperty(data)
    } catch (error) {
      console.error('Error fetching property:', error)
      toast.error('Failed to load property details')
    } finally {
      setLoading(false)
    }
  }

  const formatPrice = (price) => {
    if (price >= 10000000) return `ETB ${(price / 10000000).toFixed(1)}Cr`
    if (price >= 1000000) return `ETB ${(price / 1000000).toFixed(1)}M`
    if (price >= 1000) return `ETB ${(price / 1000).toFixed(1)}K`
    return `ETB ${price?.toLocaleString() || 0}`
  }

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href)
    toast.success('Link copied to clipboard!')
  }

  const handleSendMessage = () => {
    if (!contactMessage.trim()) {
      toast.error('Please enter a message')
      return
    }
    toast.success('Message sent successfully! The owner will contact you soon.')
    setShowContactForm(false)
    setContactMessage('')
  }

  const getAmenityIcon = (amenity) => {
    const a = amenity.toLowerCase()
    if (a.includes('wifi')) return <Wifi className="w-4 h-4" />
    if (a.includes('parking')) return <Car className="w-4 h-4" />
    if (a.includes('pool')) return <Waves className="w-4 h-4" />
    if (a.includes('gym')) return <Dumbbell className="w-4 h-4" />
    if (a.includes('security')) return <Shield className="w-4 h-4" />
    if (a.includes('garden')) return <TreePine className="w-4 h-4" />
    if (a.includes('ac') || a.includes('air')) return <Wind className="w-4 h-4" />
    if (a.includes('tv')) return <Tv className="w-4 h-4" />
    if (a.includes('coffee')) return <Coffee className="w-4 h-4" />
    return <CheckCircle className="w-4 h-4" />
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <AppSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        <main className={`transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-20'}`}>
          <div className="flex items-center justify-center h-screen">
            <div className="text-center">
              <Loader className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
              <p className="text-gray-500">Loading property details...</p>
            </div>
          </div>
        </main>
      </div>
    )
  }

  if (!property) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <AppSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        <main className={`transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-20'}`}>
          <div className="flex items-center justify-center h-screen">
            <div className="text-center">
              <Home className="w-20 h-20 text-gray-300 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-700">Property Not Found</h2>
              <p className="text-gray-500 mt-2">The property you're looking for doesn't exist.</p>
              <Link to="/my-listings" className="mt-6 inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                Back to My Listings
              </Link>
            </div>
          </div>
        </main>
      </div>
    )
  }

  const allImages = property.images || []
  const mainImage = allImages[selectedImage]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <AppSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      
      <main className={`transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-20'}`}>
        {/* Hero Image Section */}
        <div className="relative h-[60vh] min-h-[400px] max-h-[600px] bg-black">
          {mainImage ? (
            <>
              <img
                src={`${API_URL}${mainImage}`}
                alt={property.title}
                className="w-full h-full object-cover opacity-90"
                onError={(e) => { e.target.src = 'https://placehold.co/1200x600?text=Property+Image' }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            </>
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
              <Building2 className="w-24 h-24 text-gray-600" />
            </div>
          )}
          
          {/* Image Gallery Thumbnails */}
          {allImages.length > 1 && (
            <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex gap-2 z-10 overflow-x-auto max-w-[90%] px-4">
              {allImages.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(idx)}
                  className={`w-16 h-16 rounded-lg overflow-hidden border-2 flex-shrink-0 transition-all ${
                    selectedImage === idx ? 'border-white shadow-lg scale-105' : 'border-white/50 hover:border-white'
                  }`}
                >
                  <img src={`${API_URL}${img}`} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
          
          {/* Image Counter */}
          {allImages.length > 0 && (
            <div className="absolute top-6 right-6 bg-black/60 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-sm flex items-center gap-2 z-10">
              <Camera className="w-4 h-4" />
              {selectedImage + 1} / {allImages.length}
            </div>
          )}
        </div>

        {/* Content Section */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 relative z-10">
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            {/* Header with Actions */}
            <div className="p-6 border-b">
              <div className="flex flex-wrap justify-between items-start gap-4">
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-xs font-medium rounded-full">
                      <Star className="w-3 h-3" /> Featured
                    </span>
                    <span className={`inline-flex items-center gap-1 px-3 py-1 text-xs font-medium rounded-full ${
                      property.listing_type === 'sale' 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-blue-100 text-blue-700'
                    }`}>
                      {property.listing_type === 'sale' ? 'For Sale' : 'For Rent'}
                    </span>
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full capitalize">
                      {property.property_type || 'Property'}
                    </span>
                  </div>
                  <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">{property.title}</h1>
                  <div className="flex items-center gap-2 text-gray-500">
                    <MapPin className="w-4 h-4 text-red-500" />
                    <span>{property.address}, {property.city}, {property.region || 'Ethiopia'}</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-3xl md:text-4xl font-bold text-blue-600">{formatPrice(property.price)}</p>
                  {property.listing_type === 'rent' && <p className="text-sm text-gray-500">per month</p>}
                  <div className="flex gap-2 mt-3 justify-end">
                    <button 
                      onClick={handleCopyLink}
                      className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
                    >
                      <Share2 className="w-5 h-5 text-gray-600" />
                    </button>
                    <button 
                      onClick={() => setIsSaved(!isSaved)}
                      className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
                    >
                      <Heart className={`w-5 h-5 ${isSaved ? 'text-red-500 fill-red-500' : 'text-gray-600'}`} />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Key Stats Bar */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 p-6 bg-gradient-to-r from-blue-50 to-purple-50 border-b">
              {property.bedrooms > 0 && (
                <div className="text-center">
                  <Bed className="w-6 h-6 text-blue-600 mx-auto mb-1" />
                  <p className="text-xl font-bold text-gray-900">{property.bedrooms}</p>
                  <p className="text-xs text-gray-500">Bedrooms</p>
                </div>
              )}
              {property.bathrooms > 0 && (
                <div className="text-center">
                  <Bath className="w-6 h-6 text-blue-600 mx-auto mb-1" />
                  <p className="text-xl font-bold text-gray-900">{property.bathrooms}</p>
                  <p className="text-xs text-gray-500">Bathrooms</p>
                </div>
              )}
              {property.sqft > 0 && (
                <div className="text-center">
                  <Square className="w-6 h-6 text-blue-600 mx-auto mb-1" />
                  <p className="text-xl font-bold text-gray-900">{property.sqft.toLocaleString()}</p>
                  <p className="text-xs text-gray-500">Sq Ft</p>
                </div>
              )}
              {property.year_built && (
                <div className="text-center">
                  <Calendar className="w-6 h-6 text-blue-600 mx-auto mb-1" />
                  <p className="text-xl font-bold text-gray-900">{property.year_built}</p>
                  <p className="text-xs text-gray-500">Year Built</p>
                </div>
              )}
              <div className="text-center">
                <Eye className="w-6 h-6 text-blue-600 mx-auto mb-1" />
                <p className="text-xl font-bold text-gray-900">{property.views_count || 0}</p>
                <p className="text-xs text-gray-500">Views</p>
              </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-6">
              {/* Left Column - Main Content */}
              <div className="lg:col-span-2 space-y-8">
                {/* Description */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      <FileText className="w-4 h-4 text-blue-600" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900">Description</h2>
                  </div>
                  <p className="text-gray-600 leading-relaxed">
                    {property.description || 'No description available for this property.'}
                  </p>
                </div>

                {/* Amenities */}
                {property.amenities && property.amenities.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                        <Zap className="w-4 h-4 text-green-600" />
                      </div>
                      <h2 className="text-xl font-bold text-gray-900">Amenities & Features</h2>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {property.amenities.map((amenity, idx) => (
                        <div key={idx} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                          {getAmenityIcon(amenity)}
                          <span className="text-sm text-gray-700">{amenity}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Location Details */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                      <MapPin className="w-4 h-4 text-orange-600" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900">Location</h2>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                    <div className="flex flex-wrap gap-4 text-sm">
                      <div><span className="text-gray-500">Address:</span> <span className="font-medium">{property.address}</span></div>
                      <div><span className="text-gray-500">City:</span> <span className="font-medium">{property.city}</span></div>
                      {property.sub_city && <div><span className="text-gray-500">Sub City:</span> <span className="font-medium">{property.sub_city}</span></div>}
                      {property.kebele && <div><span className="text-gray-500">Kebele:</span> <span className="font-medium">{property.kebele}</span></div>}
                      {property.region && <div><span className="text-gray-500">Region:</span> <span className="font-medium">{property.region}</span></div>}
                    </div>
                    <div className="h-40 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg flex items-center justify-center mt-3">
                      <MapPin className="w-6 h-6 text-gray-500" />
                      <span className="text-sm text-gray-500 ml-2">Interactive Map</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column - Contact & CTA */}
              <div className="space-y-6">
                {/* Contact Card */}
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6 text-white">
                  <h3 className="text-xl font-bold mb-4">Interested in this property?</h3>
                  <p className="text-blue-100 text-sm mb-6">Contact the owner today to schedule a viewing or ask questions.</p>
                  
                  {!showContactForm ? (
                    <button
                      onClick={() => setShowContactForm(true)}
                      className="w-full py-3 bg-white text-blue-600 rounded-xl font-semibold hover:shadow-lg transition flex items-center justify-center gap-2"
                    >
                      <MessageCircle className="w-5 h-5" />
                      Contact Owner
                    </button>
                  ) : (
                    <div className="space-y-3">
                      <textarea
                        value={contactMessage}
                        onChange={(e) => setContactMessage(e.target.value)}
                        placeholder="I'm interested in this property. Please contact me with more information..."
                        rows="4"
                        className="w-full p-3 rounded-lg text-gray-900 text-sm"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={handleSendMessage}
                          className="flex-1 py-2 bg-white text-blue-600 rounded-lg font-semibold text-sm"
                        >
                          Send
                        </button>
                        <button
                          onClick={() => setShowContactForm(false)}
                          className="flex-1 py-2 bg-white/20 text-white rounded-lg font-semibold text-sm"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Contact Info Card */}
                <div className="bg-white rounded-xl border p-5">
                  <h3 className="font-semibold text-gray-900 mb-3">Contact Information</h3>
                  <div className="space-y-3">
                    {property.phone_number && (
                      <a href={`tel:${property.phone_number}`} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg transition">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                          <Phone className="w-4 h-4 text-green-600" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Phone</p>
                          <p className="text-sm font-medium">{property.phone_number}</p>
                        </div>
                      </a>
                    )}
                    {property.email && (
                      <a href={`mailto:${property.email}`} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg transition">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <Mail className="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Email</p>
                          <p className="text-sm font-medium truncate">{property.email}</p>
                        </div>
                      </a>
                    )}
                  </div>
                </div>

                {/* Property Details Card */}
                <div className="bg-white rounded-xl border p-5">
                  <h3 className="font-semibold text-gray-900 mb-3">Property Details</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between py-1">
                      <span className="text-gray-500">Property ID</span>
                      <span className="font-medium text-gray-900">#{property.id}</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-gray-500">Listing Type</span>
                      <span className="font-medium capitalize">{property.listing_type === 'sale' ? 'For Sale' : 'For Rent'}</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-gray-500">Status</span>
                      <span className={`font-medium capitalize ${property.status === 'active' ? 'text-green-600' : 'text-yellow-600'}`}>
                        {property.is_draft ? 'Draft' : 'Available'}
                      </span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-gray-500">Listed Date</span>
                      <span className="font-medium">{property.created_at ? new Date(property.created_at).toLocaleDateString() : 'N/A'}</span>
                    </div>
                  </div>
                </div>

                {/* Trust Badge */}
                <div className="bg-gray-50 rounded-xl p-4 text-center">
                  <div className="flex justify-center gap-4 mb-3">
                    <Shield className="w-5 h-5 text-green-600" />
                    <ThumbsUp className="w-5 h-5 text-blue-600" />
                    <Award className="w-5 h-5 text-yellow-600" />
                  </div>
                  <p className="text-xs text-gray-500">Verified Property • Trusted Platform • Secure Transaction</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default PropertyDetailPage