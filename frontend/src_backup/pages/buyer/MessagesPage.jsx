import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  Send, MessageCircle, ArrowLeft, CheckCheck, User, 
  Phone, Mail, MapPin, Bed, Bath, Square, Download,
  FileText, Image, Paperclip, Star, Heart, Share2,
  Building2, Home, Search, Filter, X, Menu
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'

const API_URL = 'http://localhost:8000'

const BuyerMessagesPage = () => {
  const navigate = useNavigate()
  const [conversations, setConversations] = useState([])
  const [activeConversation, setActiveConversation] = useState(null)
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [showSidebar, setShowSidebar] = useState(true)
  const messagesEndRef = useRef(null)

  // AI Assistant conversation data
  const aiConversation = {
    id: 1,
    name: "Ethio AI Assistant",
    avatar: "AI",
    role: "Assistant",
    status: "online",
    lastMessage: "Here are some documents for this property.",
    lastMessageTime: "10:36 AM",
    unread: 0,
    messages: [
      {
        id: 1,
        text: "Hi Selam! 👋 Welcome to Ethio Real Estate. How can I help you today?",
        sender: "ai",
        time: "10:30 AM",
        isMine: false
      },
      {
        id: 2,
        text: "I'm looking for a 3 bedroom apartment in Bole, Addis Ababa under ETB 6,000,000",
        sender: "user",
        time: "10:31 AM",
        isMine: true
      },
      {
        id: 3,
        text: "Great choice! Here are some excellent 3 bedroom apartments in Bole that match your budget.",
        sender: "ai",
        time: "10:32 AM",
        isMine: false
      },
      {
        id: 4,
        text: "🏠 Luxury Apartment in Bole\n📍 Bole, Addis Ababa\n🛏️ 3 Beds | 🛁 3 Baths\n💰 ETB 5,800,000",
        sender: "ai",
        time: "10:32 AM",
        isMine: false,
        isProperty: true,
        propertyId: 1,
        propertyTitle: "Luxury Apartment in Bole"
      },
      {
        id: 5,
        text: "🏠 Modern Apartment in Bole\n📍 Bole, Addis Ababa\n🛏️ 3 Beds | 🛁 2 Baths\n💰 ETB 5,500,000",
        sender: "ai",
        time: "10:32 AM",
        isMine: false,
        isProperty: true,
        propertyId: 2,
        propertyTitle: "Modern Apartment in Bole"
      },
      {
        id: 6,
        text: "🏠 Premium Apartment in Bole\n📍 Bole, Addis Ababa\n🛏️ 3 Beds | 🛁 3 Baths\n💰 ETB 5,900,000",
        sender: "ai",
        time: "10:32 AM",
        isMine: false,
        isProperty: true,
        propertyId: 3,
        propertyTitle: "Premium Apartment in Bole"
      },
      {
        id: 7,
        text: "Show details of the first one",
        sender: "user",
        time: "10:33 AM",
        isMine: true
      },
      {
        id: 8,
        text: "✨ Luxury Apartment in Bole ✨\n\n📍 Location: Bole, Addis Ababa\n🛏️ 3 Bedrooms | 🛁 3 Bathrooms\n💰 Price: ETB 5,800,000\n📐 Size: 2,200 sqft\n\nSpacious 3 bedroom luxury apartment located in the heart of Bole. Modern design, fully furnished kitchen, 24/7 security, elevator and parking.\n\nAmenities:\n✅ Fully Furnished\n✅ Balcony\n✅ Elevator\n✅ Parking\n✅ 24/7 Security",
        sender: "ai",
        time: "10:33 AM",
        isMine: false,
        isPropertyDetail: true,
        propertyId: 1,
        property: {
          id: 1,
          title: "Luxury Apartment in Bole",
          location: "Bole, Addis Ababa",
          price: 5800000,
          bedrooms: 3,
          bathrooms: 3,
          sqft: 2200,
          description: "Spacious 3 bedroom luxury apartment located in the heart of Bole. Modern design, fully furnished kitchen, 24/7 security, elevator and parking.",
          amenities: ["Fully Furnished", "Balcony", "Elevator", "Parking", "24/7 Security"],
          images: ["https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=500"]
        }
      },
      {
        id: 9,
        text: "Here are some documents for this property.",
        sender: "ai",
        time: "10:35 AM",
        isMine: false,
        hasDocuments: true,
        documents: [
          { name: "Brochure.pdf", size: "2.4 MB", icon: FileText },
          { name: "Price List.xlsx", size: "450 KB", icon: FileText },
          { name: "Floor Plan.docx", size: "1.2 MB", icon: FileText },
          { name: "Presentation.pptx", size: "3.5 MB", icon: FileText }
        ]
      },
      {
        id: 10,
        text: "Wow! That looks perfect 😍 Show me similar ones",
        sender: "user",
        time: "10:36 AM",
        isMine: true
      }
    ]
  }

  // Initialize with AI conversation
  useEffect(() => {
    setConversations([aiConversation])
    setActiveConversation(aiConversation)
    setMessages(aiConversation.messages)
    setLoading(false)
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async () => {
    if (!newMessage.trim()) return
    
    setSending(true)
    
    // Add user message
    const userMessage = {
      id: messages.length + 1,
      text: newMessage,
      sender: "user",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isMine: true
    }
    
    setMessages(prev => [...prev, userMessage])
    setNewMessage('')
    
    // Simulate AI response
    setTimeout(() => {
      let aiResponse = {
        id: messages.length + 2,
        text: "Thank you for your interest! I'll help you find similar properties. What specific features are you looking for?",
        sender: "ai",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isMine: false
      }
      
      // Check if message asks for similar properties
      if (newMessage.toLowerCase().includes('similar') || newMessage.toLowerCase().includes('more')) {
        aiResponse = {
          id: messages.length + 2,
          text: "🏠 Here are some similar properties you might like:\n\n✨ Premium Apartment in Bole\n📍 Location: Bole, Addis Ababa\n🛏️ 3 Beds | 🛁 3 Baths\n💰 ETB 5,900,000\n\n✨ Modern Villa with Garden\n📍 Summit, Addis Ababa\n🛏️ 4 Beds | 🛁 3 Baths\n💰 ETB 45,000/month\n\n✨ Executive Apartment\n📍 Bole, Addis Ababa\n🛏️ 3 Beds | 🛁 2 Baths\n💰 ETB 35,000/month\n\nWould you like more details about any of these? 😊",
          sender: "ai",
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isMine: false,
          isProperties: true
        }
      }
      
      setMessages(prev => [...prev, aiResponse])
      toast.success("AI Assistant responded")
    }, 1000)
    
    setSending(false)
  }

  const formatTime = (timeStr) => {
    return timeStr
  }

  const handlePropertyClick = (property) => {
    toast.success(`Viewing ${property.title}`)
    // Navigate to property detail
    // navigate(`/properties/${property.id}`)
  }

  const downloadDocument = (doc) => {
    toast.success(`Downloading ${doc.name}`)
  }

  const PropertyCard = ({ property }) => (
    <div 
      onClick={() => handlePropertyClick(property)}
      className="bg-gray-50 rounded-xl p-3 mb-2 cursor-pointer hover:bg-gray-100 transition"
    >
      <div className="flex gap-3">
        <img src={property.images?.[0] || "https://via.placeholder.com/60"} alt={property.title} className="w-16 h-16 rounded-lg object-cover" />
        <div className="flex-1">
          <h4 className="font-semibold text-gray-900">{property.title}</h4>
          <div className="flex items-center gap-1 text-gray-500 text-xs">
            <MapPin className="w-3 h-3" /> {property.location}
          </div>
          <div className="flex gap-2 mt-1 text-xs text-gray-500">
            <span><Bed className="w-3 h-3 inline" /> {property.bedrooms}</span>
            <span><Bath className="w-3 h-3 inline" /> {property.bathrooms}</span>
            <span><Square className="w-3 h-3 inline" /> {property.sqft} sqft</span>
          </div>
          <p className="text-sm font-bold text-blue-600 mt-1">ETB {property.price.toLocaleString()}</p>
        </div>
      </div>
    </div>
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white sticky top-0 z-20 shadow-lg">
        <div className="px-4 py-4">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => navigate('/dashboard/buyer')} 
              className="p-2 hover:bg-white/20 rounded-lg transition"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-xl font-bold">Messages</h1>
              <p className="text-xs text-blue-100">Chat with AI Assistant</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex h-[calc(100vh-70px)]">
        {/* Conversations Sidebar */}
        <div className={`${showSidebar ? 'w-80' : 'w-0'} bg-white border-r transition-all duration-300 overflow-hidden flex flex-col`}>
          <div className="p-4 border-b">
            <div className="flex justify-between items-center">
              <h2 className="font-semibold text-gray-900">Conversations</h2>
              <button onClick={() => setShowSidebar(false)} className="p-1 hover:bg-gray-100 rounded lg:hidden">
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">{conversations.length} active chat{conversations.length !== 1 && 's'}</p>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {conversations.map((conv) => (
              <div
                key={conv.id}
                onClick={() => {
                  setActiveConversation(conv)
                  setMessages(conv.messages)
                }}
                className={`p-4 border-b hover:bg-gray-50 cursor-pointer transition ${
                  activeConversation?.id === conv.id ? 'bg-blue-50 border-l-4 border-l-blue-600' : ''
                }`}
              >
                <div className="flex gap-3">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold ${
                    conv.name === 'Ethio AI Assistant' 
                      ? 'bg-gradient-to-r from-green-500 to-teal-500'
                      : 'bg-gradient-to-r from-blue-500 to-purple-500'
                  }`}>
                    {conv.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <p className="font-semibold text-gray-900">{conv.name}</p>
                      <span className="text-xs text-gray-400">{conv.lastMessageTime}</span>
                    </div>
                    <p className="text-xs text-gray-500">{conv.role}</p>
                    <p className="text-sm text-gray-600 truncate mt-1">{conv.lastMessage}</p>
                  </div>
                  {conv.unread > 0 && (
                    <span className="bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full">
                      {conv.unread}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col bg-gray-50">
          {/* Chat Header */}
          {activeConversation && (
            <div className="bg-white border-b px-4 py-3 flex items-center justify-between sticky top-0 z-10">
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setShowSidebar(true)} 
                  className="p-2 hover:bg-gray-100 rounded-lg lg:hidden"
                >
                  <Menu className="w-5 h-5" />
                </button>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${
                  activeConversation.name === 'Ethio AI Assistant' 
                    ? 'bg-gradient-to-r from-green-500 to-teal-500'
                    : 'bg-gradient-to-r from-blue-500 to-purple-500'
                }`}>
                  {activeConversation.avatar}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{activeConversation.name}</h3>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <p className="text-xs text-gray-500">Online</p>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <button className="p-2 hover:bg-gray-100 rounded-lg">
                  <Phone className="w-4 h-4 text-gray-600" />
                </button>
                <button className="p-2 hover:bg-gray-100 rounded-lg">
                  <Mail className="w-4 h-4 text-gray-600" />
                </button>
              </div>
            </div>
          )}

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.isMine ? 'justify-end' : 'justify-start'}`}>
                {!msg.isMine && (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-green-500 to-teal-500 flex items-center justify-center text-white text-xs font-bold mr-2 flex-shrink-0">
                    AI
                  </div>
                )}
                <div className={`max-w-[85%] ${msg.isMine 
                  ? 'bg-blue-600 text-white rounded-2xl rounded-br-md' 
                  : 'bg-white text-gray-900 rounded-2xl rounded-bl-md shadow-sm'
                } p-3`}>
                  {msg.isProperty ? (
                    <div 
                      onClick={() => {
                        const prop = {
                          id: msg.propertyId,
                          title: msg.propertyTitle,
                          location: "Bole, Addis Ababa",
                          price: msg.text.match(/ETB [\d,]+/)?.[0] || "ETB 5,800,000",
                          bedrooms: 3,
                          bathrooms: 3,
                          sqft: 2200,
                          images: ["https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=500"]
                        }
                        handlePropertyClick(prop)
                      }}
                      className="cursor-pointer"
                    >
                      <p className="whitespace-pre-wrap text-sm font-semibold">{msg.text.split('\n')[0]}</p>
                      <p className="whitespace-pre-wrap text-sm mt-1">{msg.text.split('\n').slice(1).join('\n')}</p>
                      <button className="mt-2 text-blue-600 hover:text-blue-700 text-sm font-semibold">
                        View More Properties →
                      </button>
                    </div>
                  ) : msg.isPropertyDetail ? (
                    <div>
                      <p className="whitespace-pre-wrap text-sm font-semibold">{msg.text.split('\n')[0]}</p>
                      <p className="whitespace-pre-wrap text-sm mt-1">{msg.text.split('\n').slice(1, 5).join('\n')}</p>
                      <div className="flex flex-wrap gap-2 mt-3">
                        {msg.property?.amenities?.map((amenity, i) => (
                          <span key={i} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                            {amenity}
                          </span>
                        ))}
                      </div>
                      <div className="flex gap-2 mt-3">
                        <button className="px-3 py-1 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700">
                          Contact Agent
                        </button>
                        <button className="px-3 py-1 border border-gray-300 text-gray-700 text-xs rounded-lg hover:bg-gray-50">
                          <Heart className="w-3 h-3 inline" /> Save
                        </button>
                        <button className="px-3 py-1 border border-gray-300 text-gray-700 text-xs rounded-lg hover:bg-gray-50">
                          <Share2 className="w-3 h-3 inline" /> Share
                        </button>
                      </div>
                    </div>
                  ) : msg.hasDocuments ? (
                    <div>
                      <p className="text-sm mb-2">{msg.text}</p>
                      <div className="space-y-2">
                        {msg.documents?.map((doc, i) => {
                          const Icon = doc.icon || FileText
                          return (
                            <div 
                              key={i} 
                              onClick={() => downloadDocument(doc)}
                              className="flex items-center justify-between p-2 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100"
                            >
                              <div className="flex items-center gap-2">
                                <Icon className="w-4 h-4 text-gray-500" />
                                <span className="text-sm">{doc.name}</span>
                                <span className="text-xs text-gray-400">{doc.size}</span>
                              </div>
                              <Download className="w-4 h-4 text-blue-600" />
                            </div>
                          )
                        })}
                        <button className="text-blue-600 text-sm mt-1 hover:underline">
                          +2 More Files
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                  )}
                  <p className={`text-xs mt-1 ${msg.isMine ? 'text-blue-200' : 'text-gray-400'}`}>
                    {msg.time}
                  </p>
                </div>
                {msg.isMine && (
                  <div className="ml-2 flex items-end">
                    <CheckCheck className="w-4 h-4 text-gray-400" />
                  </div>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          <div className="bg-white border-t p-4">
            <div className="flex gap-3">
              <button className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100">
                <Paperclip className="w-5 h-5" />
              </button>
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
            <p className="text-xs text-gray-400 text-center mt-2">
              Ethio AI Assistant is online • Usually replies instantly
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BuyerMessagesPage
