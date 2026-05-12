import React, { useState, useEffect, useCallback, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Header from '../../components/layout/Header'
import { 
  Building2, Home, Search, MapPin, Heart, Shield, 
  Award, Phone, Mail, Star, ArrowRight, 
  Bed, Bath, Square, Filter,
  Grid, List, FilterX, ChevronRight, AlertCircle, ImageOff
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'

const API_URL = 'http://localhost:8000'

// Loading Skeleton Component
const LoadingSkeleton = () => (
  <div className="min-h-screen bg-gray-50">
    <Header />
    <div className="pt-24 pb-16 bg-gradient-to-r from-blue-600 to-purple-600">
      <div className="container mx-auto px-4">
        <div className="animate-pulse">
          <div className="h-12 bg-white/20 rounded w-96 mx-auto mb-4"></div>
          <div className="h-6 bg-white/20 rounded w-64 mx-auto mb-8"></div>
          <div className="h-16 bg-white/20 rounded-xl max-w-3xl mx-auto"></div>
        </div>
      </div>
    </div>
    <div className="container mx-auto px-4 py-16">
      <div className="animate-pulse">
        <div className="flex justify-between mb-8">
          <div className="h-10 bg-gray-200 rounded-full w-64"></div>
          <div className="h-10 bg-gray-200 rounded-lg w-24"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1,2,3,4,5,6].map(i => (
            <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-sm">
              <div className="h-56 bg-gray-200"></div>
              <div className="p-5">
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-3"></div>
                <div className="flex gap-4 mb-4">
                  <div className="h-4 bg-gray-200 rounded w-16"></div>
                  <div className="h-4 bg-gray-200 rounded w-16"></div>
                  <div className="h-4 bg-gray-200 rounded w-16"></div>
                </div>
                <div className="flex justify-between">
                  <div className="h-6 bg-gray-200 rounded w-24"></div>
                  <div className="h-8 bg-gray-200 rounded w-24"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
)

// Demo properties for instant display
const DEMO_PROPERTIES = [
  {
    id: 1,
    title: 'Luxury Apartment in Bole',
    location: 'Bole, Addis Ababa',
    price: 15000000,
    type: 'sale',
    image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=500',
    beds: 3,
    baths: 2,
    sqft: 2200,
    featured: true,
    created_at: '2024-03-15'
  },
  {
    id: 2,
    title: 'Modern Villa with Garden',
    location: 'Summit, Addis Ababa',
    price: 45000,
    type: 'rent',
    image: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=500',
    beds: 4,
    baths: 3,
    sqft: 3500,
    featured: true,
    created_at: '2024-02-10'
  },
  {
    id: 3,
    title: 'Commercial Space Kazanchis',
    location: 'Kazanchis, Addis Ababa',
    price: 25000000,
    type: 'sale',
    image: 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=500',
    beds: 0,
    baths: 2,
    sqft: 5000,
    featured: false,
    created_at: '2024-01-20'
  },
  {
    id: 4,
    title: 'Cozy Studio Apartment',
    location: 'Mexico, Addis Ababa',
    price: 12000,
    type: 'rent',
    image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=500',
    beds: 1,
    baths: 1,
    sqft: 450,
    featured: false,
    created_at: '2024-03-01'
  },
  {
    id: 5,
    title: 'Spacious Family House',
    location: 'CMC, Addis Ababa',
    price: 18000000,
    type: 'sale',
    image: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=500',
    beds: 5,
    baths: 4,
    sqft: 4200,
    featured: true,
    created_at: '2023-12-05'
  },
  {
    id: 6,
    title: 'Executive Apartment Bole',
    location: 'Bole, Addis Ababa',
    price: 35000,
    type: 'rent',
    image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=500',
    beds: 3,
    baths: 2,
    sqft: 2800,
    featured: false,
    created_at: '2024-03-10'
  }
]

const HomePage = () => {
  const navigate = useNavigate()
  const [allProperties, setAllProperties] = useState([])
  const [filteredProperties, setFilteredProperties] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState('all')
  const [viewMode, setViewMode] = useState('grid')
  const [searchTerm, setSearchTerm] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [priceRange, setPriceRange] = useState('all')
  const [bedrooms, setBedrooms] = useState('any')
  const [bathrooms, setBathrooms] = useState('any')
  const [sortBy, setSortBy] = useState('latest')
  const [locations, setLocations] = useState([])
  const [selectedLocation, setSelectedLocation] = useState('all')
  const [imageErrors, setImageErrors] = useState({})
  const dataFetched = useRef(false)

  // Load cached properties immediately
  useEffect(() => {
    // Try to load from cache first
    const cachedData = sessionStorage.getItem('home_properties')
    if (cachedData) {
      try {
        const { data, timestamp } = JSON.parse(cachedData)
        // Use cache if less than 10 minutes old
        if (Date.now() - timestamp < 10 * 60 * 1000 && data.length > 0) {
          setAllProperties(data)
          const uniqueLocations = [...new Set(data.map(p => p.location))].filter(Boolean)
          setLocations(uniqueLocations)
          setLoading(false)
        }
      } catch (e) {
        console.error('Error parsing cache:', e)
      }
    }
    
    // Fetch fresh data in background
    if (!dataFetched.current) {
      dataFetched.current = true
      fetchProperties()
    }
  }, [])

  useEffect(() => {
    if (allProperties.length > 0) {
      applyFiltersAndSort()
    }
  }, [allProperties, activeTab, searchTerm, priceRange, bedrooms, bathrooms, sortBy, selectedLocation])

  const getImageUrl = (imagePath) => {
    if (!imagePath) return null
    if (imagePath.startsWith('http')) return imagePath
    if (imagePath.startsWith('/uploads')) return `${API_URL}${imagePath}`
    return `${API_URL}/uploads/${imagePath}`
  }

  const handleImageError = (propertyId) => {
    setImageErrors(prev => ({ ...prev, [propertyId]: true }))
  }

  const fetchProperties = async () => {
    try {
      // Try multiple endpoints
      let response = await fetch(`${API_URL}/api/buyer/properties?limit=20`)
      
      if (!response.ok) {
        response = await fetch(`${API_URL}/api/listings/my-listings?include_drafts=true`)
      }
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      
      let properties = []
      
      if (data.properties && Array.isArray(data.properties) && data.properties.length > 0) {
        properties = data.properties
      } else if (Array.isArray(data) && data.length > 0) {
        properties = data
      } else if (data.listings && Array.isArray(data.listings) && data.listings.length > 0) {
        properties = data.listings
      }
      
      if (properties.length > 0) {
        const formattedProperties = properties.map(prop => ({
          id: prop.id,
          title: prop.title || 'Property',
          location: prop.city || prop.address || 'Addis Ababa',
          price: prop.price || 0,
          type: prop.listing_type || 'sale',
          image: prop.images && prop.images.length > 0 
            ? getImageUrl(prop.images[0])
            : (prop.image || getDefaultImage(prop.listing_type)),
          beds: prop.bedrooms || 0,
          baths: prop.bathrooms || 0,
          sqft: prop.sqft || 0,
          featured: prop.featured || false,
          description: prop.description || '',
          created_at: prop.created_at || new Date().toISOString()
        }))
        
        setAllProperties(formattedProperties)
        
        // Cache the data
        sessionStorage.setItem('home_properties', JSON.stringify({
          data: formattedProperties,
          timestamp: Date.now()
        }))
        
        const uniqueLocations = [...new Set(formattedProperties.map(p => p.location))].filter(Boolean)
        setLocations(uniqueLocations)
      } else {
        // Use demo data if no real data
        setAllProperties(DEMO_PROPERTIES)
        const uniqueLocations = [...new Set(DEMO_PROPERTIES.map(p => p.location))].filter(Boolean)
        setLocations(uniqueLocations)
      }
      
      setError(null)
    } catch (error) {
      console.error('Error fetching properties:', error)
      // Use demo data as fallback
      setAllProperties(DEMO_PROPERTIES)
      const uniqueLocations = [...new Set(DEMO_PROPERTIES.map(p => p.location))].filter(Boolean)
      setLocations(uniqueLocations)
      setError('Using demo data. Real data unavailable.')
      toast.error('Using demo data for preview')
    } finally {
      setLoading(false)
    }
  }

  const getDefaultImage = (type) => {
    if (type === 'sale') {
      return 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=500'
    }
    return 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=500'
  }

  const applyFiltersAndSort = () => {
    let filtered = [...allProperties]

    if (activeTab !== 'all') {
      filtered = filtered.filter(prop => prop.type === activeTab)
    }

    if (searchTerm) {
      filtered = filtered.filter(prop =>
        prop.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        prop.location.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (priceRange !== 'all') {
      if (activeTab === 'rent') {
        if (priceRange === 'under-20k') {
          filtered = filtered.filter(prop => prop.price < 20000)
        } else if (priceRange === '20k-50k') {
          filtered = filtered.filter(prop => prop.price >= 20000 && prop.price <= 50000)
        } else if (priceRange === 'above-50k') {
          filtered = filtered.filter(prop => prop.price > 50000)
        }
      } else {
        if (priceRange === 'under-5m') {
          filtered = filtered.filter(prop => prop.price < 5000000)
        } else if (priceRange === '5m-15m') {
          filtered = filtered.filter(prop => prop.price >= 5000000 && prop.price <= 15000000)
        } else if (priceRange === 'above-15m') {
          filtered = filtered.filter(prop => prop.price > 15000000)
        }
      }
    }

    if (bedrooms !== 'any') {
      filtered = filtered.filter(prop => prop.beds >= parseInt(bedrooms))
    }

    if (bathrooms !== 'any') {
      filtered = filtered.filter(prop => prop.baths >= parseInt(bathrooms))
    }

    if (selectedLocation !== 'all') {
      filtered = filtered.filter(prop => prop.location === selectedLocation)
    }

    if (sortBy === 'price_low') {
      filtered.sort((a, b) => a.price - b.price)
    } else if (sortBy === 'price_high') {
      filtered.sort((a, b) => b.price - a.price)
    } else if (sortBy === 'latest') {
      filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    }

    setFilteredProperties(filtered)
  }

  const resetFilters = () => {
    setSearchTerm('')
    setPriceRange('all')
    setBedrooms('any')
    setBathrooms('any')
    setSortBy('latest')
    setSelectedLocation('all')
    setShowFilters(false)
    toast.success('All filters reset')
  }

  const handleViewDetails = (propertyId) => {
    // Pre-cache the property data
    const property = allProperties.find(p => p.id === propertyId)
    if (property) {
      sessionStorage.setItem(`property_${propertyId}`, JSON.stringify(property))
    }
    navigate(`/properties/${propertyId}`)
  }

  const handleSeeMore = () => {
    navigate('/properties')
  }

  const handleSearch = () => {
    applyFiltersAndSort()
    toast.success(`Found ${filteredProperties.length} properties`)
  }

  const formatPrice = (price, type) => {
    if (!price) return 'ETB 0'
    if (type === 'rent') {
      return `ETB ${price.toLocaleString()}/month`
    }
    if (price >= 10000000) {
      return `ETB ${(price / 10000000).toFixed(1)} Cr`
    }
    if (price >= 1000000) {
      return `ETB ${(price / 1000000).toFixed(1)} M`
    }
    return `ETB ${price.toLocaleString()}`
  }

  const tabs = [
    { id: 'all', label: 'All Properties', icon: Building2, count: allProperties.length },
    { id: 'sale', label: 'For Sale', icon: Home, count: allProperties.filter(p => p.type === 'sale').length },
    { id: 'rent', label: 'For Rent', icon: Home, count: allProperties.filter(p => p.type === 'rent').length }
  ]

  const getPriceOptions = () => {
    if (activeTab === 'rent') {
      return [
        { value: 'all', label: 'Any Price' },
        { value: 'under-20k', label: 'Under ETB 20,000' },
        { value: '20k-50k', label: 'ETB 20,000 - 50,000' },
        { value: 'above-50k', label: 'Above ETB 50,000' }
      ]
    }
    return [
      { value: 'all', label: 'Any Price' },
      { value: 'under-5m', label: 'Under ETB 5M' },
      { value: '5m-15m', label: 'ETB 5M - 15M' },
      { value: 'above-15m', label: 'Above ETB 15M' }
    ]
  }

  // Show loading skeleton only on first load with no data
  if (loading && allProperties.length === 0) {
    return <LoadingSkeleton />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100">
      <Header />

      {/* Demo data warning */}
      {error && (
        <div className="bg-yellow-500 text-white text-center py-2 text-sm">
          ⚡ {error}
        </div>
      )}

      {/* Hero Section */}
      <section className="relative pt-24 pb-16 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative z-10 container mx-auto px-4 text-center text-white">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="text-4xl md:text-6xl font-bold mb-4"
          >
            Find Your Dream Property
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.3 }}
            className="text-lg md:text-xl text-blue-100 mb-8 max-w-2xl mx-auto"
          >
            Discover the best real estate opportunities in Ethiopia
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.3 }}
            className="bg-white rounded-2xl shadow-2xl p-2 max-w-3xl mx-auto"
          >
            <div className="flex flex-col md:flex-row gap-2">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input 
                  type="text" 
                  placeholder="Search by city, region, or property type..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="w-full pl-12 pr-4 py-4 rounded-xl text-gray-900 focus:outline-none"
                />
              </div>
              <button 
                onClick={() => setShowFilters(!showFilters)}
                className={`px-6 py-4 rounded-xl transition flex items-center gap-2 ${
                  showFilters 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Filter className="w-5 h-5" />
                Filters
              </button>
              <button 
                onClick={handleSearch}
                className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transition flex items-center justify-center gap-2"
              >
                <Search className="w-5 h-5" />
                Search
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Properties Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0, y: -20 }}
                animate={{ opacity: 1, height: 'auto', y: 0 }}
                exit={{ opacity: 0, height: 0, y: -20 }}
                transition={{ duration: 0.2 }}
                className="bg-white rounded-2xl shadow-lg p-6 mb-8"
              >
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                    <Filter className="w-5 h-5" />
                    Filter Properties
                  </h3>
                  <button onClick={resetFilters} className="text-sm text-red-600 hover:text-red-700 flex items-center gap-1">
                    <FilterX className="w-4 h-4" />
                    Reset All
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="w-full p-3 border rounded-xl"
                    >
                      <option value="latest">Latest</option>
                      <option value="price_low">Price: Low to High</option>
                      <option value="price_high">Price: High to Low</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Price Range</label>
                    <select
                      value={priceRange}
                      onChange={(e) => setPriceRange(e.target.value)}
                      className="w-full p-3 border rounded-xl"
                    >
                      {getPriceOptions().map(option => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Bedrooms</label>
                    <select
                      value={bedrooms}
                      onChange={(e) => setBedrooms(e.target.value)}
                      className="w-full p-3 border rounded-xl"
                    >
                      <option value="any">Any</option>
                      <option value="1">1+</option>
                      <option value="2">2+</option>
                      <option value="3">3+</option>
                      <option value="4">4+</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Bathrooms</label>
                    <select
                      value={bathrooms}
                      onChange={(e) => setBathrooms(e.target.value)}
                      className="w-full p-3 border rounded-xl"
                    >
                      <option value="any">Any</option>
                      <option value="1">1+</option>
                      <option value="2">2+</option>
                      <option value="3">3+</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                    <select
                      value={selectedLocation}
                      onChange={(e) => setSelectedLocation(e.target.value)}
                      className="w-full p-3 border rounded-xl"
                    >
                      <option value="all">All Locations</option>
                      {locations.map(loc => (
                        <option key={loc} value={loc}>{loc}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex flex-wrap justify-between items-center mb-8">
            <div className="flex flex-wrap gap-2 bg-white rounded-full p-1 shadow-sm">
              {tabs.map((tab) => {
                const Icon = tab.icon
                const isActive = activeTab === tab.id
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-6 py-2 rounded-full font-semibold transition ${
                      isActive
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                    <span className={`text-xs ${isActive ? 'text-white/80' : 'text-gray-400'}`}>
                      ({tab.count})
                    </span>
                  </button>
                )
              })}
            </div>
            
            <div className="flex gap-2 mt-4 md:mt-0">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition ${viewMode === 'grid' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600'}`}
              >
                <Grid className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600'}`}
              >
                <List className="w-5 h-5" />
              </button>
            </div>
          </div>

          {filteredProperties.length === 0 && !loading ? (
            <div className="text-center py-12 bg-white rounded-2xl shadow-sm">
              <Home className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No properties found</p>
              <button onClick={resetFilters} className="mt-4 text-blue-600 hover:underline">
                Clear filters
              </button>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProperties.slice(0, 6).map((property) => {
                const hasError = imageErrors[property.id]
                const imageUrl = property.image
                
                return (
                  <div
                    key={property.id}
                    onClick={() => handleViewDetails(property.id)}
                    className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition cursor-pointer group"
                  >
                    <div className="relative h-56 overflow-hidden bg-gray-200">
                      {!hasError && imageUrl ? (
                        <img 
                          src={imageUrl} 
                          alt={property.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
                          loading="lazy"
                          onError={() => handleImageError(property.id)}
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                          <ImageOff className="w-8 h-8 mb-1" />
                          <p className="text-xs">No Image</p>
                        </div>
                      )}
                      <div className="absolute top-4 right-4 px-3 py-1 rounded-full text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-purple-600">
                        {property.type === 'sale' ? 'For Sale' : 'For Rent'}
                      </div>
                      {property.featured && (
                        <div className="absolute top-4 left-4 bg-yellow-500 text-white px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1">
                          <Star className="w-3 h-3" /> Featured
                        </div>
                      )}
                    </div>
                    <div className="p-5">
                      <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-1">{property.title}</h3>
                      <div className="flex items-center gap-1 text-gray-500 mb-3">
                        <MapPin className="w-4 h-4" />
                        <span className="text-sm line-clamp-1">{property.location}</span>
                      </div>
                      <div className="flex gap-4 mb-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1"><Bed className="w-4 h-4" /> {property.beds}</div>
                        <div className="flex items-center gap-1"><Bath className="w-4 h-4" /> {property.baths}</div>
                        <div className="flex items-center gap-1"><Square className="w-4 h-4" /> {property.sqft}</div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xl font-bold text-blue-600">
                          {formatPrice(property.price, property.type)}
                        </span>
                        <button className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition">
                          View Details <ArrowRight className="w-4 h-4 inline" />
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredProperties.slice(0, 6).map((property) => {
                const hasError = imageErrors[property.id]
                const imageUrl = property.image
                
                return (
                  <div
                    key={property.id}
                    onClick={() => handleViewDetails(property.id)}
                    className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition cursor-pointer flex"
                  >
                    <div className="w-48 h-48 overflow-hidden bg-gray-200 flex-shrink-0">
                      {!hasError && imageUrl ? (
                        <img 
                          src={imageUrl} 
                          alt={property.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
                          loading="lazy"
                          onError={() => handleImageError(property.id)}
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                          <ImageOff className="w-6 h-6 mb-1" />
                          <p className="text-xs">No Image</p>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 p-5">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold mb-2 ${property.type === 'sale' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>
                            {property.type === 'sale' ? 'For Sale' : 'For Rent'}
                          </span>
                          <h3 className="text-xl font-bold text-gray-900 mb-1">{property.title}</h3>
                          <div className="flex items-center gap-1 text-gray-500 mb-2">
                            <MapPin className="w-4 h-4" />
                            <span className="text-sm">{property.location}</span>
                          </div>
                          <div className="flex gap-4 text-sm text-gray-500">
                            <span className="flex items-center gap-1"><Bed className="w-4 h-4" /> {property.beds} beds</span>
                            <span className="flex items-center gap-1"><Bath className="w-4 h-4" /> {property.baths} baths</span>
                            <span className="flex items-center gap-1"><Square className="w-4 h-4" /> {property.sqft} sqft</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-blue-600">{formatPrice(property.price, property.type)}</p>
                          <button className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                            View Details
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {filteredProperties.length > 6 && (
            <div className="text-center mt-12">
              <button
                onClick={handleSeeMore}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transition"
              >
                See More Properties <ChevronRight className="w-4 h-4 inline" />
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12 px-4">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Building2 className="w-8 h-8 text-blue-500" />
                <span className="text-xl font-bold text-white">RealEstate Pro</span>
              </div>
              <p className="text-sm">Your trusted partner in real estate</p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/properties" className="hover:text-white">Properties</Link></li>
                <li><Link to="/about" className="hover:text-white">About Us</Link></li>
                <li><Link to="/contact" className="hover:text-white">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Contact Us</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2"><Phone className="w-4 h-4" /> +251 11 123 4567</li>
                <li className="flex items-center gap-2"><Mail className="w-4 h-4" /> info@realestatepro.com</li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Newsletter</h4>
              <p className="text-sm mb-3">Subscribe for updates</p>
              <div className="flex">
                <input type="email" placeholder="Your email" className="flex-1 px-3 py-2 rounded-l-lg text-gray-900" />
                <button className="px-4 py-2 bg-blue-600 text-white rounded-r-lg hover:bg-blue-700">Subscribe</button>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm">
            <p>&copy; 2024 RealEstate Pro. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default HomePage