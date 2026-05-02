import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useLanguage } from '../../context/LanguageContext'
import Header from '../../components/layout/Header'
import { 
  Building2, Home, Search, MapPin, Heart, Shield, 
  Award, TrendingUp, Users, Phone, Mail,
  ChevronDown, Star, CheckCircle, ArrowRight, 
  Clock, DollarSign, Briefcase, Filter,
  Bed, Bath, Square, X, Eye, Zap,
  Grid3x3, List, FilterX, ChevronRight
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'

const API_URL = 'http://localhost:8000'

const HomePage = () => {
  const { t, language } = useLanguage()
  const navigate = useNavigate()
  
  // State for properties and UI
  const [allProperties, setAllProperties] = useState([])
  const [filteredProperties, setFilteredProperties] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('all') // 'all', 'sale', 'rent'
  const [viewMode, setViewMode] = useState('grid') // 'grid' or 'list'
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [priceRange, setPriceRange] = useState('all')
  const [bedrooms, setBedrooms] = useState('any')
  const [bathrooms, setBathrooms] = useState('any')
  const [sortBy, setSortBy] = useState('latest') // 'latest', 'oldest', 'price_low', 'price_high'
  
  // Tooltip states
  const [showGridTooltip, setShowGridTooltip] = useState(false)
  const [showListTooltip, setShowListTooltip] = useState(false)
  
  // Get unique locations for filter
  const [locations, setLocations] = useState([])
  const [selectedLocation, setSelectedLocation] = useState('all')

  useEffect(() => {
    fetchProperties()
  }, [])

  useEffect(() => {
    applyFiltersAndSort()
  }, [allProperties, activeTab, searchTerm, priceRange, bedrooms, bathrooms, sortBy, selectedLocation])

  const fetchProperties = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('access_token')
      const response = await fetch(`${API_URL}/api/listings/`, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      })
      const data = await response.json()
      
      const properties = Array.isArray(data) && data.length > 0 ? data.map(prop => ({
        id: prop.id,
        title: prop.title,
        location: prop.address || prop.city || 'Addis Ababa',
        price: prop.price,
        type: prop.listing_type || 'sale',
        image: prop.images && prop.images.length > 0 
          ? `${API_URL}${prop.images[0]}`
          : getDefaultImage(prop.listing_type),
        beds: prop.bedrooms || 0,
        baths: prop.bathrooms || 0,
        sqft: prop.sqft || 0,
        year: prop.year_built || 2024,
        featured: prop.featured || false,
        description: prop.description,
        region: prop.region || 'Addis Ababa',
        created_at: prop.created_at || new Date().toISOString()
      })) : getDemoProperties()
      
      setAllProperties(properties)
      
      // Extract unique locations
      const uniqueLocations = [...new Set(properties.map(p => p.location))].filter(Boolean)
      setLocations(uniqueLocations)
      
    } catch (error) {
      console.error('Error fetching properties:', error)
      const demoProps = getDemoProperties()
      setAllProperties(demoProps)
      const uniqueLocations = [...new Set(demoProps.map(p => p.location))].filter(Boolean)
      setLocations(uniqueLocations)
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

  const getDemoProperties = () => {
    return [
      {
        id: 1,
        title: 'Luxury Apartment',
        location: 'Bole, Addis Ababa',
        price: 15000000,
        type: 'sale',
        image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=500',
        beds: 3,
        baths: 2,
        sqft: 2200,
        featured: true,
        description: 'Beautiful luxury apartment in the heart of Bole with stunning city views',
        created_at: '2024-03-15'
      },
      {
        id: 2,
        title: 'Modern Villa',
        location: 'Summit, Addis Ababa',
        price: 45000,
        type: 'rent',
        image: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=500',
        beds: 4,
        baths: 3,
        sqft: 3500,
        featured: true,
        description: 'Stunning modern villa with garden view and private parking',
        created_at: '2024-02-10'
      },
      {
        id: 3,
        title: 'Commercial Space',
        location: 'Kazanchis, Addis Ababa',
        price: 25000000,
        type: 'sale',
        image: 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=500',
        beds: 0,
        baths: 2,
        sqft: 5000,
        featured: false,
        description: 'Prime commercial space in the business district',
        created_at: '2024-01-20'
      },
      {
        id: 4,
        title: 'Cozy Studio',
        location: 'Mexico, Addis Ababa',
        price: 12000,
        type: 'rent',
        image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=500',
        beds: 1,
        baths: 1,
        sqft: 450,
        featured: false,
        description: 'Perfect studio apartment for singles or couples',
        created_at: '2024-03-01'
      },
      {
        id: 5,
        title: 'Family House',
        location: 'CMC, Addis Ababa',
        price: 18000000,
        type: 'sale',
        image: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=500',
        beds: 5,
        baths: 4,
        sqft: 4200,
        featured: true,
        description: 'Spacious family home with large garden and modern amenities',
        created_at: '2023-12-05'
      },
      {
        id: 6,
        title: 'Executive Apartment',
        location: 'Bole, Addis Ababa',
        price: 35000,
        type: 'rent',
        image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=500',
        beds: 3,
        baths: 2,
        sqft: 2800,
        featured: false,
        description: 'Executive apartment with panoramic city views',
        created_at: '2024-03-10'
      }
    ]
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
    } else if (sortBy === 'oldest') {
      filtered.sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
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
    if (type === 'rent') {
      return `ETB ${price.toLocaleString()}/month`
    }
    return `ETB ${price.toLocaleString()}`
  }

  const tabs = [
    { id: 'all', label: 'All Properties', icon: Building2, count: allProperties.length },
    { id: 'sale', label: 'For Sale', icon: Briefcase, count: allProperties.filter(p => p.type === 'sale').length },
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100">
      <Header />

      {/* Hero Section */}
      <section className="relative pt-24 pb-16 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative z-10 container mx-auto px-4 text-center text-white">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-bold mb-4"
          >
            Find Your Dream Property
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg md:text-xl text-blue-100 mb-8 max-w-2xl mx-auto"
          >
            Discover the best real estate opportunities in Ethiopia
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
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
                transition={{ duration: 0.3 }}
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
                      className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="latest">Latest</option>
                      <option value="oldest">Oldest</option>
                      <option value="price_low">Price: Low to High</option>
                      <option value="price_high">Price: High to Low</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Price Range</label>
                    <select
                      value={priceRange}
                      onChange={(e) => setPriceRange(e.target.value)}
                      className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-500"
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
                      className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="any">Any</option>
                      <option value="1">1+ Bedroom</option>
                      <option value="2">2+ Bedrooms</option>
                      <option value="3">3+ Bedrooms</option>
                      <option value="4">4+ Bedrooms</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Bathrooms</label>
                    <select
                      value={bathrooms}
                      onChange={(e) => setBathrooms(e.target.value)}
                      className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="any">Any</option>
                      <option value="1">1+ Bathroom</option>
                      <option value="2">2+ Bathrooms</option>
                      <option value="3">3+ Bathrooms</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                    <select
                      value={selectedLocation}
                      onChange={(e) => setSelectedLocation(e.target.value)}
                      className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-500"
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
            
            {/* View Mode Buttons with Tooltips */}
            <div className="flex gap-2 mt-4 md:mt-0">
              <div className="relative">
                <button
                  onMouseEnter={() => setShowGridTooltip(true)}
                  onMouseLeave={() => setShowGridTooltip(false)}
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition ${viewMode === 'grid' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-100'}`}
                >
                  <Grid3x3 className="w-5 h-5" />
                </button>
                {showGridTooltip && (
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded whitespace-nowrap z-50">
                    Grid View
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-900"></div>
                  </div>
                )}
              </div>
              <div className="relative">
                <button
                  onMouseEnter={() => setShowListTooltip(true)}
                  onMouseLeave={() => setShowListTooltip(false)}
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg transition ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-100'}`}
                >
                  <List className="w-5 h-5" />
                </button>
                {showListTooltip && (
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded whitespace-nowrap z-50">
                    List View
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-900"></div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="mb-6">
            <p className="text-gray-600">
              Showing <span className="font-semibold text-blue-600">{Math.min(6, filteredProperties.length)}</span> of{' '}
              <span className="font-semibold">{filteredProperties.length}</span> properties
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : filteredProperties.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl shadow-sm">
              <Home className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No properties found matching your criteria</p>
              <button onClick={resetFilters} className="mt-4 text-blue-600 hover:underline">
                Clear all filters
              </button>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProperties.slice(0, 6).map((property, idx) => (
                <motion.div
                  key={property.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition group cursor-pointer"
                  onClick={() => handleViewDetails(property.id)}
                >
                  <div className="relative h-56 overflow-hidden">
                    <img 
                      src={property.image} 
                      alt={property.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
                    />
                    <div className="absolute top-4 right-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                      {property.type === 'sale' ? 'For Sale' : 'For Rent'}
                    </div>
                    {property.featured && (
                      <div className="absolute top-4 left-4 bg-yellow-500 text-white px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1">
                        <Star className="w-3 h-3" /> Featured
                      </div>
                    )}
                  </div>
                  <div className="p-5">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{property.title}</h3>
                    <div className="flex items-center gap-1 text-gray-500 mb-3">
                      <MapPin className="w-4 h-4" />
                      <span className="text-sm">{property.location}</span>
                    </div>
                    <div className="flex items-center gap-4 mb-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Bed className="w-4 h-4" /> {property.beds} beds
                      </div>
                      <div className="flex items-center gap-1">
                        <Bath className="w-4 h-4" /> {property.baths} baths
                      </div>
                      <div className="flex items-center gap-1">
                        <Square className="w-4 h-4" /> {property.sqft} sqft
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="text-xl font-bold text-blue-600">
                          {formatPrice(property.price, property.type)}
                        </span>
                      </div>
                      <button 
                        className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition flex items-center gap-2"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleViewDetails(property.id)
                        }}
                      >
                        View Details <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredProperties.slice(0, 6).map((property) => (
                <motion.div
                  key={property.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition group cursor-pointer flex"
                  onClick={() => handleViewDetails(property.id)}
                >
                  <div className="w-48 h-48 overflow-hidden flex-shrink-0">
                    <img 
                      src={property.image} 
                      alt={property.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
                    />
                  </div>
                  <div className="flex-1 p-5">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            property.type === 'sale' 
                              ? 'bg-blue-100 text-blue-700' 
                              : 'bg-green-100 text-green-700'
                          }`}>
                            {property.type === 'sale' ? 'For Sale' : 'For Rent'}
                          </span>
                          {property.featured && (
                            <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-semibold flex items-center gap-1">
                              <Star className="w-3 h-3" /> Featured
                            </span>
                          )}
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">{property.title}</h3>
                        <div className="flex items-center gap-1 text-gray-500 mb-2">
                          <MapPin className="w-4 h-4" />
                          <span className="text-sm">{property.location}</span>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <Bed className="w-4 h-4" /> {property.beds} beds
                          </div>
                          <div className="flex items-center gap-1">
                            <Bath className="w-4 h-4" /> {property.baths} baths
                          </div>
                          <div className="flex items-center gap-1">
                            <Square className="w-4 h-4" /> {property.sqft} sqft
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-blue-600">
                          {formatPrice(property.price, property.type)}
                        </p>
                        <button className="mt-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition flex items-center gap-2">
                          View Details <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          <div className="text-center mt-12">
            <button
              onClick={handleSeeMore}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all group"
            >
              See More Properties
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition" />
            </button>
          </div>
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
                <li><Link to="/properties" className="hover:text-white transition">Properties</Link></li>
                <li><Link to="/about" className="hover:text-white transition">About Us</Link></li>
                <li><Link to="/contact" className="hover:text-white transition">Contact</Link></li>
                <li><Link to="/pricing" className="hover:text-white transition">Pricing</Link></li>
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