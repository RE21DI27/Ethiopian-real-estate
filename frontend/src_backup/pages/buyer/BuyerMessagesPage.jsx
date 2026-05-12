import React, { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Send, MessageCircle, ArrowLeft, CheckCheck, User } from 'lucide-react'
import toast from 'react-hot-toast'

const API_URL = 'http://localhost:8000'

const BuyerMessagesPage = () => {
  const { conversationId } = useParams()
  const navigate = useNavigate()
  const [conversations, setConversations] = useState([])
  const [activeConversation, setActiveConversation] = useState(null)
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef(null)

  useEffect(() => {
    fetchConversations()
    const interval = setInterval(() => {
      if (activeConversation) {
        fetchMessages(activeConversation.id)
      }
      fetchConversations()
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (conversationId && conversations.length > 0) {
      const conv = conversations.find(c => c.id === parseInt(conversationId))
      if (conv) {
        setActiveConversation(conv)
        fetchMessages(conv.id)
      }
    }
  }, [conversationId, conversations])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const fetchConversations = async () => {
    try {
      const response = await fetch(`${API_URL}/api/buyer/conversations`)
      const data = await response.json()
      setConversations(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Error fetching conversations:', error)
      setConversations([])
    } finally {
      setLoading(false)
    }
  }

  const fetchMessages = async (convId) => {
    try {
      const response = await fetch(`${API_URL}/api/buyer/conversations/${convId}/messages`)
      const data = await response.json()
      setMessages(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Error fetching messages:', error)
      setMessages([])
    }
  }

  const sendMessage = async () => {
    if (!newMessage.trim()) return
    
    setSending(true)
    try {
      const response = await fetch(`${API_URL}/api/buyer/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversation_id: activeConversation.id,
          message: newMessage
        })
      })
      
      if (response.ok) {
        setNewMessage('')
        await fetchMessages(activeConversation.id)
        await fetchConversations()
      } else {
        toast.error('Failed to send message')
      }
    } catch (error) {
      console.error('Error sending message:', error)
      toast.error('Failed to send message')
    } finally {
      setSending(false)
    }
  }

  const formatTime = (timeStr) => {
    if (!timeStr) return ''
    const date = new Date(timeStr)
    const now = new Date()
    const diff = now - date
    
    if (diff < 24 * 60 * 60 * 1000) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    } else if (diff < 7 * 24 * 60 * 60 * 1000) {
      return date.toLocaleDateString([], { weekday: 'short' })
    } else {
      return date.toLocaleDateString()
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-white border-b px-6 py-4 sticky top-0 z-10 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate('/dashboard/buyer')} 
              className="p-2 hover:bg-gray-100 rounded-lg transition"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
              <p className="text-sm text-gray-500">Chat with property owners</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex h-[calc(100vh-80px)]">
        {/* Conversations List */}
        <div className="w-80 bg-white border-r flex flex-col">
          <div className="p-4 border-b">
            <h2 className="font-semibold text-gray-900">Conversations</h2>
            <p className="text-xs text-gray-500">{conversations.length} chats</p>
          </div>
          <div className="flex-1 overflow-y-auto">
            {conversations.length === 0 ? (
              <div className="p-8 text-center">
                <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No conversations yet</p>
                <button 
                  onClick={() => navigate('/properties')} 
                  className="mt-4 text-blue-600 hover:underline text-sm"
                >
                  Browse Properties
                </button>
              </div>
            ) : (
              conversations.map((conv) => (
                <div
                  key={conv.id}
                  onClick={() => {
                    setActiveConversation(conv)
                    navigate(`/dashboard/buyer/messages/${conv.id}`, { replace: true })
                    fetchMessages(conv.id)
                  }}
                  className={`p-4 border-b hover:bg-gray-50 cursor-pointer transition ${
                    activeConversation?.id === conv.id ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                          {conv.other_user_name?.charAt(0) || 'U'}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 text-sm">{conv.other_user_name || 'User'}</p>
                          <p className="text-xs text-gray-500 truncate w-40">{conv.property_title || 'Property'}</p>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mt-2 truncate">{conv.last_message || 'Start conversation'}</p>
                    </div>
                    <div className="text-right flex-shrink-0 ml-2">
                      <p className="text-xs text-gray-400">{formatTime(conv.last_message_time)}</p>
                      {conv.unread_count > 0 && (
                        <span className="inline-block mt-1 px-2 py-0.5 bg-blue-600 text-white text-xs rounded-full">
                          {conv.unread_count}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
        
        {/* Chat Area */}
        {activeConversation ? (
          <div className="flex-1 flex flex-col bg-gray-50">
            <div className="bg-white border-b px-6 py-4 flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                {activeConversation.other_user_name?.charAt(0) || 'U'}
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">{activeConversation.other_user_name || 'User'}</h3>
                <p className="text-xs text-gray-500">{activeConversation.property_title || 'Property'}</p>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.length === 0 ? (
                <div className="text-center text-gray-500 mt-20">
                  <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p>No messages yet. Start the conversation!</p>
                </div>
              ) : (
                messages.map((msg) => (
                  <div key={msg.id} className={`flex ${msg.is_mine ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                      msg.is_mine
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-gray-900 shadow-sm'
                    }`}>
                      <p className="text-sm">{msg.message}</p>
                      <div className={`flex items-center gap-1 mt-1 text-xs ${
                        msg.is_mine ? 'text-blue-200' : 'text-gray-400'
                      }`}>
                        <span>{msg.time || formatTime(msg.created_at)}</span>
                        {msg.is_mine && msg.is_read && <CheckCheck className="w-3 h-3" />}
                      </div>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>
            
            <div className="bg-white border-t p-4">
              <div className="flex gap-3">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  placeholder="Type your message..."
                  className="flex-1 px-4 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={sendMessage}
                  disabled={sending || !newMessage.trim()}
                  className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition disabled:opacity-50"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Select a conversation to start chatting</p>
              <button 
                onClick={() => navigate('/properties')}
                className="mt-4 text-blue-600 hover:underline"
              >
                Browse Properties
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default BuyerMessagesPage