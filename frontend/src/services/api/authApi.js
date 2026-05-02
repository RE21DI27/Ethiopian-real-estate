import axios from 'axios'

const API_URL = 'http://localhost:8000/api'

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

export const authApi = {
  login: async (username, password) => {
    const formData = new URLSearchParams()
    formData.append('username', username)
    formData.append('password', password)
    
    const response = await axios.post(`${API_URL}/auth/login`, formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    })
    return response
  },
  
  register: async (userData) => {
    console.log('Sending registration request to:', `${API_URL}/auth/register`)
    console.log('Request data:', userData)
    
    const response = await api.post('/auth/register', userData)
    console.log('Registration response:', response.data)
    return response
  },
  
  getCurrentUser: async () => {
    const token = localStorage.getItem('access_token')
    if (!token) {
      throw new Error('No token found')
    }
    const response = await api.get('/auth/me')
    return response.data
  },
  
  logout: () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('user')
  },
}

export const adminAPI = {
  getAllUsers: async () => {
    const response = await api.get('/admin/all-users')
    return response.data
  },
  
  approveUser: async (userId) => {
    const response = await api.post(`/admin/approve/${userId}`)
    return response.data
  },
  
  rejectUser: async (userId) => {
    const response = await api.post(`/admin/reject/${userId}`)
    return response.data
  },
  
  suspendUser: async (userId) => {
    const response = await api.post(`/admin/suspend/${userId}`)
    return response.data
  },
  
  activateUser: async (userId) => {
    const response = await api.post(`/admin/activate/${userId}`)
    return response.data
  }
}