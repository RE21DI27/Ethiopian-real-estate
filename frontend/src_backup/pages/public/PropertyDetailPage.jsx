import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Header from '../../components/layout/Header'
import { 
  MapPin, Bed, Bath, Square, Calendar, Eye, 
  Heart, Share2, MessageCircle, Phone, Mail,
  Shield, Home, ArrowLeft, Loader,
  Star, Camera, Building2, ThumbsUp, Award, 
  X, UserPlus, LogIn, AlertCircle, ImageOff, Wifi, Car, Wind, Coffee, Dumbbell, Tv, TreePine
} from 'lucide-react'
import toast from 'react-hot-toast'

const API_URL = 'http://localhost:8000'

// Fallback demo data in case API fails
const getDemoProperty = (id) => {
  const demoProperties = {
    1: {
      id: 1,
      title: 'Luxury Apartment in Bole',
      description: 'Beautiful luxury apartment in the heart of Bole with stunning city views. This modern apartment features high-end finishes, spacious rooms, and premium amenities.',
      price: 15000000,
      listing_type: 'sale',
      property_type: 'apartment',
      bedrooms: 3,
      bathrooms: 2,
      sqft: 2200,
      year_built: 2022,
      address: 'Bole Road',
      city: 'Addis Ababa',
      region: 'Addis Ababa',
      images: ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800'],
      phone_number: '+251 911 111 111',
      email: 'owner@example.com',
      views_count: 150,
      owner_name: 'John Smith',
      featured: true,
      amenities: ['WiFi', 'Parking', 'Air Conditioning', 'Elevator', 'Security', 'Gym']
    },
    2: {
      id: 2,
      title: 'Modern Villa with Garden',
      description: 'Stunning modern villa with garden view and private parking. Perfect for families looking for space and comfort.',
      price: 45000,
      listing_type: 'rent',
      property_type: 'villa',
      bedrooms: 4,
      bathrooms: 3,
      sqft: 3500,
      year_built: 2021,
      address: 'Summit',
      city: 'Addis Ababa',
      region: 'Addis Ababa',
      images: ['https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800'],
      phone_number: '+251 922 222 222',
      email: 'owner2@example.com',
      views_count: 89,
      owner_name: 'Sarah Williams',
      featured: true,
      amenities: ['Garden', 'Parking', 'Security', 'Water Heater', 'Balcony']
    }
  }
  return demoProperties[id] || demoProperties[1]
}

const PropertyDetailPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [property, setProperty] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedImage, setSelectedImage] = useState(0)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [usingDemoData, setUsingDemoData] = useState(false)

  useEffect(() => {
    // Check for return after login/registration
    const justLoggedIn = localStorage.getItem('just_logged_in') === 'true'
    const propertyId = localStorage.getItem('contact_property_id')
    
    if (justLoggedIn && propertyId === id) {
      localStorage.removeItem('just_logged_in')
      localStorage.removeItem('contact_property_id')
      toast.success('You can now contact the owner!')
    }
    
    fetchProperty()
    window.scrollTo(0, 0)
  }, [id])

  const fetchProperty = async () => {
    setLoading(true)
    setError(null)
    
    try {
      // Try to get from cache first
      const cached = sessionStorage.getItem(`property_${id}`)
      if (cached) {
        const cachedData = JSON.parse(cached)
        setProperty(cachedData)
        setLoading(false)
        // Still fetch fresh data in background
        fetchFreshData()
        return
      }
      
      // Fetch from API with timeout
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 5000)
      
      const response = await fetch(`${API_URL}/api/buyer/properties/${id}`, {
        signal: controller.signal,
        headers: {
          'Cache-Control': 'no-cache'
        }
      })
      
      clearTimeout(timeoutId)
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Property not found')
        }
        throw new Error(`HTTP ${response.status}`)
      }
      
      const data = await response.json()
      setProperty(data)
      setLoading(false)
      setUsingDemoData(false)
      
      // Cache the data
      sessionStorage.setItem(`property_${id}`, JSON.stringify(data))
      
    } catch (err) {
      console.error('Fetch error:', err)
      
      // Try to use demo data as fallback
      const demoData = getDemoProperty(parseInt(id))
      if (demoData) {
        setProperty(demoData)
        setUsingDemoData(true)
        setLoading(false)
        toast.error('Using demo data. Real data unavailable.')
      } else {
        setError(err.message === 'Property not found' ? 'Property not found' : 'Failed to load property details')
        setLoading(false)
      }
    }
  }

  const fetchFreshData = async () => {
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 5000)
      
      const response = await fetch(`${API_URL}/api/buyer/properties/${id}`, {
        signal: controller.signal
      })
      
      clearTimeout(timeoutId)
      
      if (response.ok) {
        const data = await response.json()
        setProperty(data)
        sessionStorage.setItem(`property_${id}`, JSON.stringify(data))
        if (usingDemoData) {
          setUsingDemoData(false)
          toast.success('Live data loaded!')
        }
      }
    } catch (err) {
      console.log('Background refresh failed, using cached data')
    }
  }

  const handleContactClick = () => {
    const token = localStorage.getItem('access_token')
    const user = localStorage.getItem('user')
    
    if (!token || !user) {
      localStorage.setItem('contact_property_id', id)
      setShowAuthModal(true)
      return
    }
    
    toast.success('You are logged in!')
    navigate('/dashboard/buyer')
  }

  const handleAuthChoice = (action) => {
    setShowAuthModal(false)
    if (action === 'register') {
      navigate('/buyer/register', { state: { returnTo: id } })
    } else {
      navigate('/buyer/login', { state: { returnTo: id } })
    }
  }

  const formatPrice = (price, type) => {
    if (!price) return 'ETB 0'
    if (type === 'rent') return `ETB ${price.toLocaleString()}/month`
    if (price >= 10000000) return `ETB ${(price / 10000000).toFixed(1)} Cr`
    if (price >= 1000000) return `ETB ${(price / 1000000).toFixed(1)} M`
    return `ETB ${price.toLocaleString()}`
  }

  const AuthModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900">Contact Property Owner</h2>
          <button onClick={() => setShowAuthModal(false)} className="p-1 hover:bg-gray-100 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>
        <p className="text-gray-600 mb-6 text-center">
          Please create a buyer account to contact the owner
        </p>
        <div className="space-y-3">
          <button
            onClick={() => handleAuthChoice('register')}
            className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transition flex items-center justify-center gap-2"
          >
            <UserPlus className="w-5 h-5" />
            Create Buyer Account
          </button>
          <button
            onClick={() => handleAuthChoice('login')}
            className="w-full py-3 border-2 border-blue-600 text-blue-600 rounded-xl font-semibold hover:bg-blue-50 transition flex items-center justify-center gap-2"
          >
            <LogIn className="w-5 h-5" />
            Login to Buyer Account
          </button>
        </div>
        <p className="text-xs text-gray-400 text-center mt-4">
          By continuing, you agree to our Terms of Service
        </p>
      </div>
    </div>
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex flex-col items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-500">Loading property details...</p>
        </div>
      </div>
    )
  }

  if (error && !property) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex flex-col items-center justify-center h-96">
          <AlertCircle className="w-16 h-16 text-red-400 mb-4" />
          <h2 className="text-xl font-semibold text-gray-700 mb-2">{error}</h2>
          <p className="text-gray-500 mb-6">The property you're looking for doesn't exist or has been removed.</p>
          <button 
            onClick={() => navigate('/properties')}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Back to Properties
          </button>
        </div>
      </div>
    )
  }

  if (!property) return null

  const images = property.images || []
  const mainImage = images[selectedImage] || property.cover_image

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Header />
      {showAuthModal && <AuthModal />}
      {usingDemoData && (
        <div className="bg-yellow-500 text-white text-center py-2 text-sm">
          ⚡ Using demo data. Live data is currently unavailable.
        </div>
      )}

      <div className="container mx-auto px-4 pt-24">
        <button 
          onClick={() => navigate(-1)} 
          className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition mb-4"
        >
          <ArrowLeft className="w-5 h-5" /> Back
        </button>
      </div>

      {/* Hero Image */}
      <div className="relative h-[50vh] min-h-[400px] max-h-[500px] bg-black mx-4 rounded-2xl overflow-hidden">
        {mainImage ? (
          <>
            <img 
              src={mainImage.startsWith('http') ? mainImage : `${API_URL}${mainImage}`} 
              alt={property.title} 
              className="w-full h-full object-cover"
              onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800' }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          </>
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex flex-col items-center justify-center">
            <Building2 className="w-24 h-24 text-gray-600" />
            <p className="text-gray-500 mt-2">No Image Available</p>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 relative z-10">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="p-6 border-b">
            <div className="flex flex-wrap justify-between items-start gap-4">
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <span className={`inline-flex items-center gap-1 px-3 py-1 text-xs font-medium rounded-full ${property.listing_type === 'sale' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                    {property.listing_type === 'sale' ? 'For Sale' : 'For Rent'}
                  </span>
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full capitalize">
                    {property.property_type || 'Property'}
                  </span>
                  {property.featured && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-yellow-100 text-yellow-700 text-xs font-medium rounded-full">
                      <Star className="w-3 h-3" /> Featured
                    </span>
                  )}
                </div>
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">{property.title}</h1>
                <div className="flex items-center gap-2 text-gray-500">
                  <MapPin className="w-4 h-4 text-red-500" />
                  <span>{property.address}, {property.city}</span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-3xl md:text-4xl font-bold text-blue-600">{formatPrice(property.price, property.listing_type)}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 p-6 bg-gradient-to-r from-blue-50 to-purple-50 border-b">
            <div className="text-center"><Bed className="w-6 h-6 text-blue-600 mx-auto mb-1" /><p className="text-xl font-bold">{property.bedrooms || 0}</p><p className="text-xs text-gray-500">Bedrooms</p></div>
            <div className="text-center"><Bath className="w-6 h-6 text-blue-600 mx-auto mb-1" /><p className="text-xl font-bold">{property.bathrooms || 0}</p><p className="text-xs text-gray-500">Bathrooms</p></div>
            <div className="text-center"><Square className="w-6 h-6 text-blue-600 mx-auto mb-1" /><p className="text-xl font-bold">{property.sqft?.toLocaleString() || 0}</p><p className="text-xs text-gray-500">Sq Ft</p></div>
            {property.year_built && <div className="text-center"><Calendar className="w-6 h-6 text-blue-600 mx-auto mb-1" /><p className="text-xl font-bold">{property.year_built}</p><p className="text-xs text-gray-500">Year Built</p></div>}
            <div className="text-center"><Eye className="w-6 h-6 text-blue-600 mx-auto mb-1" /><p className="text-xl font-bold">{property.views_count || 0}</p><p className="text-xs text-gray-500">Views</p></div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-6">
            <div className="lg:col-span-2">
              <h2 className="text-xl font-bold mb-4">Description</h2>
              <p className="text-gray-600 leading-relaxed">{property.description || 'No description available for this property.'}</p>
              
              {property.amenities && property.amenities.length > 0 && (
                <div className="mt-6">
                  <h2 className="text-xl font-bold mb-4">Amenities</h2>
                  <div className="flex flex-wrap gap-2">
                    {property.amenities.map((amenity, idx) => (
                      <span key={idx} className="px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-700">{amenity}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-6">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6 text-white">
                <h3 className="text-xl font-bold mb-4">Interested in this property?</h3>
                <p className="text-blue-100 text-sm mb-6">Contact the owner today to schedule a viewing or ask questions.</p>
                <button 
                  onClick={handleContactClick} 
                  className="w-full py-3 bg-white text-blue-600 rounded-xl font-semibold hover:shadow-lg transition flex items-center justify-center gap-2"
                >
                  <MessageCircle className="w-5 h-5" /> Contact Owner
                </button>
              </div>

              {(property.phone_number || property.email) && (
                <div className="bg-white rounded-xl border p-5">
                  <h3 className="font-semibold mb-3">Contact Information</h3>
                  {property.phone_number && (
                    <a href={`tel:${property.phone_number}`} className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg border">
                      <Phone className="w-5 h-5 text-green-600" />
                      <div><p className="text-xs text-gray-500">Call</p><p className="text-sm font-medium">{property.phone_number}</p></div>
                    </a>
                  )}
                  {property.email && (
                    <a href={`mailto:${property.email}`} className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg border mt-2">
                      <Mail className="w-5 h-5 text-blue-600" />
                      <div><p className="text-xs text-gray-500">Email</p><p className="text-sm font-medium truncate">{property.email}</p></div>
                    </a>
                  )}
                </div>
              )}

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
    </div>
  )
}

export default PropertyDetailPage