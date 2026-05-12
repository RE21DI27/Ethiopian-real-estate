import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const LoginPage = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({ username: '', password: '' })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    
    try {
      const response = await fetch('http://localhost:8000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      
      const data = await response.json()
      
      if (data.access_token) {
        localStorage.setItem('access_token', data.access_token)
        localStorage.setItem('user', JSON.stringify(data.user))
        localStorage.setItem('user_role', data.user.role)
        
        if (data.user.role === 'admin') {
          navigate('/admin')
        }
      } else {
        setError(data.detail || 'Invalid credentials')
      }
    } catch (err) {
      setError('Cannot connect to server')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 w-96 border border-white/20">
        <h1 className="text-2xl font-bold text-white text-center mb-6">Admin Login</h1>
        {error && <div className="bg-red-500/20 text-red-200 p-2 rounded mb-4 text-sm">{error}</div>}
        <form onSubmit={handleSubmit}>
          <input 
            type="text" 
            placeholder="Username" 
            className="w-full p-3 bg-white/5 border border-white/10 rounded-lg text-white mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500" 
            onChange={(e) => setFormData({...formData, username: e.target.value})} 
            required 
          />
          <input 
            type="password" 
            placeholder="Password" 
            className="w-full p-3 bg-white/5 border border-white/10 rounded-lg text-white mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500" 
            onChange={(e) => setFormData({...formData, password: e.target.value})} 
            required 
          />
          <button 
            type="submit" 
            disabled={loading} 
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white p-3 rounded-lg font-semibold hover:shadow-lg transition"
          >
            {loading ? 'Loading...' : 'Sign In'}
          </button>
        </form>
        <div className="mt-4 text-center text-xs text-gray-400">
          Demo: redietgebrehiwot@gmail.com / Rediet1212!
        </div>
      </div>
    </div>
  )
}

export default LoginPage
