import axios from 'axios'

const API_URL = 'http://localhost:8000/api'

const getToken = () => localStorage.getItem('access_token')

export const listingsAPI = {
  // Get my listings (for current user)
  async getMyListings(includeDrafts = true) {
    try {
      const token = getToken()
      console.log(`API Request: GET /listings/my-listings?include_drafts=${includeDrafts}`)
      
      const response = await axios.get(
        `${API_URL}/listings/my-listings?include_drafts=${includeDrafts}`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      )
      
      console.log(`✅ My Listings response:`, response.data)
      
      // Handle both array and object responses
      if (Array.isArray(response.data)) {
        return response.data
      } else if (response.data && response.data.listings) {
        return response.data.listings
      } else if (response.data && Array.isArray(response.data.data)) {
        return response.data.data
      }
      return []
      
    } catch (error) {
      console.error('❌ Error fetching my listings:', error)
      if (error.response?.status === 404) {
        console.warn('⚠️ Endpoint not found - check if backend is running and router is registered')
      }
      return []
    }
  },

  // Create a new listing
  async createListing(listingData) {
    try {
      const token = getToken()
      const response = await axios.post(
        `${API_URL}/listings/create`,
        listingData,
        { headers: { 'Authorization': `Bearer ${token}` } }
      )
      return response.data
    } catch (error) {
      console.error('❌ Error creating listing:', error)
      throw error
    }
  },

  // Get listing by ID
  async getListing(id) {
    try {
      const token = getToken()
      const response = await axios.get(
        `${API_URL}/listings/${id}`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      )
      return response.data
    } catch (error) {
      console.error('❌ Error fetching listing:', error)
      throw error
    }
  },

  // Update listing
  async updateListing(id, listingData) {
    try {
      const token = getToken()
      const response = await axios.put(
        `${API_URL}/listings/${id}`,
        listingData,
        { headers: { 'Authorization': `Bearer ${token}` } }
      )
      return response.data
    } catch (error) {
      console.error('❌ Error updating listing:', error)
      throw error
    }
  },

  // Delete listing
  async deleteListing(id) {
    try {
      const token = getToken()
      const response = await axios.delete(
        `${API_URL}/listings/${id}`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      )
      return response.data
    } catch (error) {
      console.error('❌ Error deleting listing:', error)
      throw error
    }
  },

  // Publish draft listing
  async publishListing(id) {
    try {
      const token = getToken()
      const response = await axios.post(
        `${API_URL}/listings/publish/${id}`,
        {},
        { headers: { 'Authorization': `Bearer ${token}` } }
      )
      return response.data
    } catch (error) {
      console.error('❌ Error publishing listing:', error)
      throw error
    }
  },

  // Upload an image
  async uploadImage(file) {
    try {
      const token = getToken()
      const formData = new FormData()
      formData.append('file', file)
      
      const response = await axios.post(
        `${API_URL}/listings/upload-image`,
        formData,
        {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      )
      return response.data
    } catch (error) {
      console.error('❌ Error uploading image:', error)
      throw error
    }
  },

  // Get all public listings (for public view)
  async getPublicListings(listingType = null, limit = 50, offset = 0) {
    try {
      let url = `${API_URL}/listings/?limit=${limit}&offset=${offset}`
      if (listingType) {
        url += `&listing_type=${listingType}`
      }
      const response = await axios.get(url)
      return response.data
    } catch (error) {
      console.error('❌ Error fetching public listings:', error)
      return []
    }
  }
}

export default listingsAPI