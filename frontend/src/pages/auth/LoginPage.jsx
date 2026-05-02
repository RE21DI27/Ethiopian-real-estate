import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useLanguage } from '../../context/LanguageContext'
import { Building2, Mail, Lock, Eye, EyeOff, CheckSquare, Square } from 'lucide-react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'

const LoginPage = () => {
  const { login } = useAuth()
  const { t } = useLanguage()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  })

  // Load saved credentials if "Remember Me" was checked
  useEffect(() => {
    const savedUsername = localStorage.getItem('remembered_username')
    const savedPassword = localStorage.getItem('remembered_password')
    const rememberChecked = localStorage.getItem('remember_me') === 'true'
    
    if (savedUsername && savedPassword && rememberChecked) {
      setFormData({
        username: savedUsername,
        password: savedPassword
      })
      setRememberMe(true)
    }
  }, [])

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
    if (error) setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    
    try {
      const userData = await login(formData.username, formData.password)
      
      // Handle "Remember Me" functionality
      if (rememberMe) {
        localStorage.setItem('remembered_username', formData.username)
        localStorage.setItem('remembered_password', formData.password)
        localStorage.setItem('remember_me', 'true')
      } else {
        localStorage.removeItem('remembered_username')
        localStorage.removeItem('remembered_password')
        localStorage.removeItem('remember_me')
      }
      
      toast.success(`${t('welcomeBack') || 'Welcome back'}, ${userData.full_name || userData.username}!`)
      
      setTimeout(() => {
        if (userData.role_type === 'admin') {
          navigate('/admin')
        } else {
          navigate('/dashboard')
        }
      }, 500)
    } catch (err) {
      let errorMessage = t('signInFailed') || 'Login failed. Please try again.'
      if (err.response?.data?.detail) {
        errorMessage = err.response.data.detail
      }
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-blue-900 via-purple-900 to-pink-900">
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse delay-1000"></div>
      </div>
      
      <div className="relative z-10 flex min-h-screen">
        {/* Left Side - Image/Branding */}
        <div className="hidden lg:flex lg:w-1/2 flex-col justify-center items-center text-white p-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <Building2 className="w-20 h-20 mx-auto mb-6" />
            <h1 className="text-4xl font-bold mb-4">{t('brand') || 'RealEstate Pro'}</h1>
            <p className="text-xl mb-8">{t('heroSubtitle') || 'Find Your Dream Property'}</p>
          </motion.div>
        </div>

        {/* Right Side - Login Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="w-full max-w-md"
          >
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl p-8 border border-white/20">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-white">{t('welcomeBack') || 'Welcome Back'}</h2>
                <p className="text-gray-300 mt-2">{t('signInToAccount') || 'Sign in to your account'}</p>
              </div>

              {error && (
                <div className="mb-6 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200 text-sm">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Email Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-200 mb-2">
                    {t('email') || 'Email'} / {t('username') || 'Username'}
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      name="username"
                      value={formData.username}
                      onChange={handleChange}
                      placeholder={t('email') || 'Enter your email'}
                      className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      required
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-200 mb-2">
                    {t('password') || 'Password'}
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder={t('password') || 'Enter your password'}
                      className="w-full pl-10 pr-10 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5 text-gray-400" /> : <Eye className="w-5 h-5 text-gray-400" />}
                    </button>
                  </div>
                </div>

                {/* Forgot Password Link - NOW BELOW THE PASSWORD FIELD */}
                <div className="text-right">
                  <Link to="/forgot-password" className="text-sm text-blue-400 hover:text-blue-300 transition">
                    Forgot Password?
                  </Link>
                </div>

                {/* Remember Me Checkbox */}
                <div className="flex items-center">
                  <button
                    type="button"
                    onClick={() => setRememberMe(!rememberMe)}
                    className="flex items-center gap-2 text-gray-300 hover:text-white transition"
                  >
                    {rememberMe ? (
                      <CheckSquare className="w-5 h-5 text-blue-500" />
                    ) : (
                      <Square className="w-5 h-5 text-gray-400" />
                    )}
                    <span className="text-sm">Remember Me</span>
                  </button>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (t('loading') || 'Loading...') : (t('signIn') || 'Sign In')}
                </button>
              </form>

              {/* Register Link */}
              <div className="mt-6 text-center">
                <p className="text-sm text-gray-300">
                  {t('dontHaveAccount') || "Don't have an account?"}{' '}
                  <Link to="/register" className="text-blue-400 hover:text-blue-300 font-semibold">
                    {t('signUp') || 'Sign Up'}
                  </Link>
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default LoginPage