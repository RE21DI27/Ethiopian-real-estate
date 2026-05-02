import React, { createContext, useState, useContext, useEffect } from 'react'
import { authApi } from '../services/api/authApi'

const AuthContext = createContext()

export const useAuth = () => useContext(AuthContext)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('access_token')
    const storedUser = localStorage.getItem('user')
    
    console.log('AuthContext: Token exists?', !!token)
    
    if (token && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser)
        setUser(parsedUser)
        console.log('AuthContext: User loaded from storage', parsedUser)
        setLoading(false)
        // Refresh user data in background
        loadUser()
      } catch (error) {
        console.error('AuthContext: Failed to parse stored user', error)
        loadUser()
      }
    } else if (token) {
      loadUser()
    } else {
      setLoading(false)
    }
  }, [])

  const loadUser = async () => {
    try {
      const userData = await authApi.getCurrentUser()
      console.log('AuthContext: User loaded successfully', userData)
      setUser(userData)
      localStorage.setItem('user', JSON.stringify(userData))
    } catch (error) {
      console.error('AuthContext: Failed to load user', error)
      localStorage.removeItem('access_token')
      localStorage.removeItem('user')
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  const login = async (username, password) => {
    try {
      const response = await authApi.login(username, password)
      const { access_token } = response.data
      
      localStorage.setItem('access_token', access_token)
      
      const userData = await authApi.getCurrentUser()
      setUser(userData)
      localStorage.setItem('user', JSON.stringify(userData))
      console.log('AuthContext: Login successful, user status:', userData.status)
      
      return userData
    } catch (error) {
      console.error('Login error:', error)
      throw error
    }
  }

  const register = async (userData) => {
    try {
      console.log('Calling register API with:', userData)
      const response = await authApi.register(userData)
      console.log('Register API response:', response)
      return response.data
    } catch (error) {
      console.error('Registration error:', error)
      throw error
    }
  }

  const logout = () => {
    authApi.logout()
    setUser(null)
  }

  const updateUser = (updatedUser) => {
    setUser(updatedUser)
    localStorage.setItem('user', JSON.stringify(updatedUser))
  }

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      isAuthenticated: !!localStorage.getItem('access_token'), 
      login, 
      logout, 
      register,
      updateUser
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export default AuthProvider