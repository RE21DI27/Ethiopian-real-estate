import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import AppSidebar from '../components/layout/AppSidebar'
import { 
  Search, Send, User, Users, MessageSquare, 
  ArrowLeft, Loader, Phone, Video, Paperclip,
  CheckCircle, Clock, MoreVertical
} from 'lucide-react'
import toast from 'react-hot-toast'

const API_URL = 'http://localhost:8000'

const Messages = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [loading, setLoading] = useState(true)
  const [conversations, setConversations] = useState([])
  const [allUsers, setAllUsers] = useState([])
  const [selectedUser, setSelectedUser] = useState(null)
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [showUserList, setShowUserList] = useState(true)
  const [sending, setSending] = useState(false)
  const [activeTab, setActiveTab] = useState('conversations')
  const messagesEndRef = useRef(null)

  useEffect(() => {
    loadConversations()
    loadAllUsers()
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const getToken = () => localStorage.getItem('access_token')

  const loadConversations = async () => {
    try {
      const token = getToken()
      const response = await fetch(`${API_URL}/api/messages/conversations`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const data = await response.json()
      setConversations(data)
    } catch (error) {
      console.error('Error loading conversations:', error)
    }
  }

  const loadAllUsers = async () => {
    try {
      const token = getToken()
      const response = await fetch(`${API_URL}/api/messages/users`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const data = await response.json()
      setAllUsers(data)
    } catch (error) {
      console.error('Error loading users:', error)
    } finally {
      setLoading(false)
    }
  }

  const searchUsers = async () => {
    if (!searchTerm) {
      loadAllUsers()
      return
    }
    try {
      const token = getToken()
      const response = await fetch(`${API_URL}/api/messages/users?search=${encodeURIComponent(searchTerm)}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const data = await response.json()
      setAllUsers(data)
    } catch (error) {
      console.error('Error searching users:', error)
    }
  }

  const selectUser = async (selectedUserData) => {
    setLoading(true)
    setSelectedUser(selectedUserData)
    setShowUserList(false)
    
    try {
      const token = getToken()
      const response = await fetch(`${API_URL}/api/messages/conversation/${selectedUserData.id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const data = await response.json()
      setMessages(data.messages || [])
      loadConversations()
    } catch (error) {
      console.error('Error loading conversation:', error)
      toast.error('Failed to load conversation')
    } finally {
      setLoading(false)
    }
  }

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedUser) return
    
    setSending(true)
    try {
      const token = getToken()
      const response = await fetch(`${API_URL}/api/messages/send`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          receiver_id: selectedUser.id,
          content: newMessage.trim()
        })
      })
      
      const data = await response.json()
      
      if (data.success) {
        const newMsg = {
          id: data.message_id,
          sender_id: user.id,
          receiver_id: selectedUser.id,
          content: newMessage.trim(),
          is_sent_by_me: true,
          created_at: new Date().toISOString()
        }
        setMessages(prev => [...prev, newMsg])
        setNewMessage('')
        loadConversations()
        scrollToBottom()
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

  const formatTime = (dateString) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    const now = new Date()
    const diff = now - date
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    
    if (days === 0) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    } else if (days === 1) {
      return 'Yesterday'
    } else if (days < 7) {
      return date.toLocaleDateString([], { weekday: 'short' })
    } else {
      return date.toLocaleDateString()
    }
  }

  const getInitials = (name) => {
    if (!name) return 'U'
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  const getRoleColor = (role) => {
    switch(role) {
      case 'admin': return 'bg-purple-500'
      case 'seller': return 'bg-blue-500'
      case 'landlord': return 'bg-green-500'
      default: return 'bg-gray-500'
    }
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <AppSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      
      <main className={`transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-20'}`}>
        <div className="bg-white border-b px-6 py-4">
          <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
          <p className="text-sm text-gray-500">Communicate with other users and admins</p>
        </div>

        <div className="p-6">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Left Sidebar */}
            <div className="w-full lg:w-96 bg-white rounded-2xl shadow-sm border overflow-hidden">
              <div className="flex border-b">
                <button onClick={() => setActiveTab('conversations')} className={`flex-1 px-4 py-3 text-sm font-medium transition ${activeTab === 'conversations' ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/30' : 'text-gray-500 hover:text-gray-700'}`}>
                  <MessageSquare className="w-4 h-4 inline mr-2" /> Conversations ({conversations.length})
                </button>
                <button onClick={() => setActiveTab('users')} className={`flex-1 px-4 py-3 text-sm font-medium transition ${activeTab === 'users' ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/30' : 'text-gray-500 hover:text-gray-700'}`}>
                  <Users className="w-4 h-4 inline mr-2" /> All Users ({allUsers.length})
                </button>
              </div>

              <div className="p-4 border-b">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input type="text" placeholder="Search users..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && searchUsers()} className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>

              <div className="h-[500px] overflow-y-auto">
                {activeTab === 'conversations' && (
                  <>
                    {conversations.length === 0 ? (
                      <div className="text-center py-12"><MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" /><p className="text-gray-500">No conversations yet</p></div>
                    ) : (
                      conversations.map((conv) => (
                        <button key={conv.id} onClick={() => selectUser({ id: conv.user_id, name: conv.name, email: conv.email, role: conv.role_type })} className={`w-full p-4 hover:bg-gray-50 transition border-b text-left ${selectedUser?.id === conv.user_id ? 'bg-blue-50' : ''}`}>
                          <div className="flex items-center gap-3">
                            <div className="relative">
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white ${getRoleColor(conv.role_type)}`}>{getInitials(conv.name)}</div>
                              {conv.unread_count > 0 && (<div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">{conv.unread_count}</div>)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex justify-between items-baseline"><p className="font-semibold text-gray-900 truncate">{conv.name}</p><span className="text-xs text-gray-400 ml-2">{formatTime(conv.last_message_time)}</span></div>
                              <p className="text-sm text-gray-500 truncate">{conv.last_message}</p>
                              <p className="text-xs text-gray-400 capitalize mt-0.5">{conv.role_type}</p>
                            </div>
                          </div>
                        </button>
                      ))
                    )}
                  </>
                )}

                {activeTab === 'users' && (
                  <>
                    {allUsers.length === 0 ? (
                      <div className="text-center py-12"><Users className="w-12 h-12 text-gray-300 mx-auto mb-3" /><p className="text-gray-500">No users found</p></div>
                    ) : (
                      allUsers.map((u) => (
                        <button key={u.id} onClick={() => selectUser(u)} className={`w-full p-4 hover:bg-gray-50 transition border-b text-left ${selectedUser?.id === u.id ? 'bg-blue-50' : ''}`}>
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white ${getRoleColor(u.role_type)}`}>{getInitials(u.name)}</div>
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-gray-900">{u.name}</p>
                              <p className="text-xs text-gray-500 truncate">{u.email}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 capitalize">{u.role_type}</span>
                                <span className={`text-xs px-2 py-0.5 rounded-full ${u.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{u.status}</span>
                              </div>
                            </div>
                          </div>
                        </button>
                      ))
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 bg-white rounded-2xl shadow-sm border overflow-hidden flex flex-col">
              {selectedUser ? (
                <>
                  <div className="bg-white border-b px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <button onClick={() => setShowUserList(true)} className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"><ArrowLeft className="w-5 h-5" /></button>
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white ${getRoleColor(selectedUser.role)}`}>{getInitials(selectedUser.name)}</div>
                      <div><h2 className="font-semibold text-gray-900">{selectedUser.name}</h2><p className="text-xs text-gray-500">{selectedUser.email}</p><p className="text-xs text-gray-400 capitalize">{selectedUser.role}</p></div>
                    </div>
                    <div className="flex gap-2"><button className="p-2 hover:bg-gray-100 rounded-lg"><Phone className="w-5 h-5 text-gray-500" /></button><button className="p-2 hover:bg-gray-100 rounded-lg"><Video className="w-5 h-5 text-gray-500" /></button></div>
                  </div>

                  <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50">
                    {loading ? (<div className="flex justify-center items-center h-full"><Loader className="w-8 h-8 animate-spin text-blue-600" /></div>
                    ) : messages.length === 0 ? (
                      <div className="text-center py-12"><MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" /><p className="text-gray-500">No messages yet</p></div>
                    ) : (
                      messages.map((msg) => (
                        <div key={msg.id} className={`flex ${msg.is_sent_by_me ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[75%] rounded-2xl px-4 py-2 ${msg.is_sent_by_me ? 'bg-blue-600 text-white rounded-br-none' : 'bg-white text-gray-900 border rounded-bl-none shadow-sm'}`}>
                            <p className="text-sm break-words">{msg.content}</p>
                            <div className={`flex items-center gap-1 mt-1 ${msg.is_sent_by_me ? 'justify-end' : 'justify-start'}`}>
                              <span className={`text-xs ${msg.is_sent_by_me ? 'text-blue-200' : 'text-gray-400'}`}>{formatTime(msg.created_at)}</span>
                              {msg.is_sent_by_me && <CheckCircle className="w-3 h-3 text-blue-300" />}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  <div className="bg-white border-t p-4">
                    <div className="flex gap-3">
                      <button className="p-2 hover:bg-gray-100 rounded-lg"><Paperclip className="w-5 h-5 text-gray-500" /></button>
                      <input type="text" value={newMessage} onChange={(e) => setNewMessage(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && sendMessage()} placeholder={`Message ${selectedUser.name}...`} className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                      <button onClick={sendMessage} disabled={sending || !newMessage.trim()} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 flex items-center gap-2">
                        {sending ? <Loader className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />} Send
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center"><MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" /><h2 className="text-xl font-semibold text-gray-700">No Conversation Selected</h2><p className="text-gray-500 mt-2">Select a user from the sidebar to start messaging</p></div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default Messages