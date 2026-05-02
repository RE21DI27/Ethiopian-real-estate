import axios from 'axios'

const API_URL = 'http://localhost:8000/api'

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`)
  return config
})

export const listingsAPI = {
  // Get all listings (public)
  getAllListings: async (params = {}) => {
    const response = await api.get('/listings/', { params })
    return response.data
  },

  // Get single listing
  getListing: async (id) => {
    const response = await api.get(`/listings/${id}`)
    return response.data
  },

  // Get ONLY SALE listings for the current user (My Listings)
  getMyListings: async () => {
    try {
      const response = await api.get('/listings/my-listings')
      console.log('✅ My Listings (Sale only):', response.data.length, 'properties')
      return response.data
    } catch (error) {
      console.error('❌ Error fetching my listings:', error.message)
      return []
    }
  },

  // Get ONLY RENTAL properties for the current user (My Properties)
  getMyProperties: async () => {
    try {
      const response = await api.get('/listings/my-properties')
      console.log('✅ My Properties (Rent only):', response.data.length, 'properties')
      console.log('📋 First rental property:', response.data[0])
      return response.data
    } catch (error) {
      console.error('❌ Error fetching my properties:', error.message)
      return []
    }
  },

  // Create new listing
  createListing: async (listingData) => {
    console.log('📝 Creating listing with type:', listingData.listing_type)
    const response = await api.post('/listings/create', listingData)
    console.log('✅ Create response:', response.data)
    return response.data
  },

  // Update listing
  updateListing: async (id, listingData) => {
    const response = await api.put(`/listings/${id}`, listingData)
    return response.data
  },

  // Delete listing
  deleteListing: async (id) => {
    const response = await api.delete(`/listings/${id}`)
    return response.data
  },

  // Upload image
  uploadImage: async (file) => {
    const formData = new FormData()
    formData.append('file', file)
    const response = await api.post('/listings/upload-image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    return response.data
  }
}