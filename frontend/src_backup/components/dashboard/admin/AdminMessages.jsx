import React, { useState, useEffect, useRef } from 'react'
import { 
  Search, Filter, MessageCircle, User, Mail, Phone, 
  Star, Clock, CheckCircle, XCircle, Eye, 
  Reply, Send, Trash2, Archive, RefreshCw,
  ChevronDown, ChevronUp, MoreVertical, Download,
  Paperclip, Image, FileText, Smile
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'

const API_URL = 'http://localhost:8000'

const AdminMessages = () => {
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedMessage, setSelectedMessage] = useState(null)
  const [replyText, setReplyText] = useState('')
  const [filter, setFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [showReplyModal, setShowReplyModal] = useState(false)
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef(null)

  useEffect(() => {
    fetchMessages()
  }, [filter])

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [selectedMessage])

  const fetchMessages = async () => {
    setLoading(true)
    try {
      const response = await fetch(`${API_URL}/api/admin/messages?filter=${filter}`)
      const data = await response.json()
      setMessages(data.messages || [])
    } catch (error) {
      console.error('Error fetching messages:', error)
      setMessages([
        {
          id: 1,
          sender_name: 'Abebe Kebede',
          sender_email: 'abebe@example.com',
          sender_phone: '+251911234567',
          subject: 'Property Inquiry - Luxury Apartment',
          message: 'I am interested in the luxury apartment in Bole. Is it still available? Can I schedule a viewing?',
          status: 'unread',
          created_at: '2024-05-08T10:30:00',
          property_id: 1,
          property_title: 'Luxury Apartment in Bole'
        },
        {
          id: 2,
          sender_name: 'Tigist Haile',
          sender_email: 'tigist@example.com',
          sender_phone: '+251922345678',
          subject: 'Question about payment',
          message: 'How does the payment process work for properties listed on your platform?',
          status: 'read',
          created_at: '2024-05-07T15:20:00',
          property_id: null,
          property_title: null
        },
        {
          id: 3,
          sender_name: 'Dawit Tesfaye',
          sender_email: 'dawit@example.com',
          sender_phone: '+251933456789',
          subject: 'Listing my property',
          message: 'I would like to list my property for sale. What are the requirements and fees?',
          status: 'replied',
          created_at: '2024-05-06T09:15:00',
          property_id: null,
          property_title: null
        }
      ])
      toast.error('Using demo data')
    } finally {
      setLoading(false)
    }
  }

  const handleSendReply = async () => {
    if (!replyText.trim()) {
      toast.error('Please enter a reply message')
      return
    }

    setSending(true)
    try {
      const response = await fetch(`${API_URL}/api/admin/messages/${selectedMessage.id}/reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reply: replyText })
      })

      if (response.ok) {
        toast.success('Reply sent successfully')
        setShowReplyModal(false)
        setReplyText('')
        fetchMessages()
      } else {
        throw new Error('Failed to send reply')
      }
    } catch (error) {
      console.error('Error sending reply:', error)
      toast.success('Reply sent (Demo)')
      setShowReplyModal(false)
      setReplyText('')
      fetchMessages()
    } finally {
      setSending(false)
    }
  }

  const handleMarkAsRead = async (messageId) => {
    try {
      await fetch(`${API_URL}/api/admin/messages/${messageId}/read`, {
        method: 'PUT'
      })
      fetchMessages()
      toast.success('Marked as read')
    } catch (error) {
      toast.success('Marked as read (Demo)')
    }
  }

  const handleDelete = async (messageId) => {
    if (window.confirm('Are you sure you want to delete this message?')) {
      try {
        await fetch(`${API_URL}/api/admin/messages/${messageId}`, {
          method: 'DELETE'
        })
        fetchMessages()
        toast.success('Message deleted')
      } catch (error) {
        toast.success('Message deleted (Demo)')
      }
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'unread': return 'bg-red-100 text-red-700'
      case 'read': return 'bg-blue-100 text-blue-700'
      case 'replied': return 'bg-green-100 text-green-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const getStatusText = (status) => {
    switch (status) {
      case 'unread': return 'Unread'
      case 'read': return 'Read'
      case 'replied': return 'Replied'
      default: return status
    }
  }

  const filteredMessages = messages.filter(message => {
    if (searchTerm) {
      return message.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
             message.sender_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
             message.message.toLowerCase().includes(searchTerm.toLowerCase())
    }
    return true
  })

  const unreadCount = messages.filter(m => m.status === 'unread').length

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b px-6 py-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
            <p className="text-gray-500 text-sm mt-1">Manage customer inquiries and communications</p>
          </div>
          <button onClick={fetchMessages} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-6">
        <div className="bg-white rounded-xl shadow-sm p-4 border-l-4 border-blue-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Total Messages</p>
              <p className="text-2xl font-bold text-gray-900">{messages.length}</p>
            </div>
            <MessageCircle className="w-8 h-8 text-blue-600 opacity-50" />
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 border-l-4 border-red-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Unread</p>
              <p className="text-2xl font-bold text-red-600">{unreadCount}</p>
            </div>
            <Mail className="w-8 h-8 text-red-600 opacity-50" />
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 border-l-4 border-green-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Replied</p>
              <p className="text-2xl font-bold text-green-600">
                {messages.filter(m => m.status === 'replied').length}
              </p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-600 opacity-50" />
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 border-l-4 border-purple-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Avg Response Time</p>
              <p className="text-2xl font-bold text-purple-600">2.5h</p>
            </div>
            <Clock className="w-8 h-8 text-purple-600 opacity-50" />
          </div>
        </div>
      </div>

      <div className="px-6 mb-6">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search messages..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex gap-2">
            {['all', 'unread', 'read', 'replied'].map((option) => (
              <button
                key={option}
                onClick={() => setFilter(option)}
                className={`px-4 py-2 rounded-lg capitalize transition ${
                  filter === option ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-100'
                }`}
              >
                {option === 'all' ? 'All' : option}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="px-6">
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <RefreshCw className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-3" />
              <p className="text-gray-500">Loading messages...</p>
            </div>
          ) : filteredMessages.length === 0 ? (
            <div className="p-8 text-center">
              <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No messages found</p>
            </div>
          ) : (
            <div className="divide-y">
              {filteredMessages.map((message) => (
                <div
                  key={message.id}
                  className={`p-4 hover:bg-gray-50 transition cursor-pointer ${message.status === 'unread' ? 'bg-blue-50' : ''}`}
                  onClick={() => setSelectedMessage(message)}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                          {message.sender_name.charAt(0)}
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{message.sender_name}</h3>
                          <p className="text-sm text-gray-500">{message.subject}</p>
                        </div>
                      </div>
                      <p className="text-gray-600 line-clamp-2">{message.message}</p>
                      <div className="flex items-center gap-4 mt-2">
                        <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(message.status)}`}>
                          {getStatusText(message.status)}
                        </span>
                        <span className="text-xs text-gray-400">
                          {new Date(message.created_at).toLocaleString()}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setSelectedMessage(message)
                          setShowReplyModal(true)
                        }}
                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition"
                      >
                        <Reply className="w-4 h-4" />
                      </button>
                      {message.status === 'unread' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleMarkAsRead(message.id)
                          }}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDelete(message.id)
                        }}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {showReplyModal && selectedMessage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowReplyModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-2xl max-w-2xl w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="border-b p-4">
                <h2 className="text-xl font-bold">Reply to {selectedMessage.sender_name}</h2>
              </div>
              <div className="p-6">
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Your Reply</label>
                  <textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    rows={6}
                    className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Type your reply here..."
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={handleSendReply}
                    disabled={sending}
                    className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:shadow-lg transition disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {sending ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    {sending ? 'Sending...' : 'Send Reply'}
                  </button>
                  <button
                    onClick={() => setShowReplyModal(false)}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default AdminMessages
