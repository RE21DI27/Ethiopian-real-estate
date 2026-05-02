import React, { useState, useEffect } from 'react'
import { useAuth } from '../../../context/AuthContext'
import { userDashboardAPI } from '../../../services/api/userDashboardApi'
import { listingsAPI } from '../../../services/api/listingsApi'
import AppSidebar from '../../layout/AppSidebar'
import StatsCard from './StatsCard'
import RoleSelectionModal from './RoleSelectionModal'
import DocumentVerification from './DocumentVerification'
import SubscriptionManager from './SubscriptionManager'
import CreateListingWizard from '../../wizard/CreateListingWizard'
import AddPropertyWizard from '../../wizard/AddPropertyWizard'
import EditListingWizard from '../../wizard/EditListingWizard'
import PaymentModal from '../../payment/PaymentModal'
import { 
  Loader, Home, TrendingUp, Eye, DollarSign, CreditCard, 
  Calendar, MessageSquare, Bell, Activity, ArrowUp, ArrowDown,
  Users, Building2, Briefcase, Star, Zap, Shield, Clock,
  MapPin, Phone, Mail, Target, Award, CheckCircle, AlertCircle,
  Sparkles, Crown, Gem, Edit, Trash2, PlusCircle, X, Bed, Bath, Square
} from 'lucide-react'
import toast from 'react-hot-toast'

const API_URL = 'http://localhost:8000/api'

const UnifiedDashboard = () => {
  const { user, updateUser } = useAuth()
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const [stats, setStats] = useState({
    total_properties: 0,
    active_listings: 0,
    total_views: 0,
    annual_revenue: 1248500
  })
  const [listings, setListings] = useState([])
  const [properties, setProperties] = useState([])
  const [showCreateListing, setShowCreateListing] = useState(false)
  const [showAddProperty, setShowAddProperty] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingListing, setEditingListing] = useState(null)
  const [showRoleModal, setShowRoleModal] = useState(false)
  const [selectedRoleForAction, setSelectedRoleForAction] = useState(null)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState(null)
  const [showActivationModal, setShowActivationModal] = useState(false)
  const [activationRole, setActivationRole] = useState(null)
  
  const [roleStatus, setRoleStatus] = useState({
    seller: { enabled: false, approved: false, documents_submitted: false, paid: false },
    landlord: { enabled: false, approved: false, documents_submitted: false, paid: false }
  })
  const [isSellerActive, setIsSellerActive] = useState(false)
  const [isLandlordActive, setIsLandlordActive] = useState(false)
  
  const isDaniel = user?.email === 'dani@gmail.com'

  useEffect(() => {
    if (user) {
      loadData()
      loadRoleStatus()
    } else {
      setLoading(false)
    }
  }, [user])

  const loadRoleStatus = async () => {
    if (isDaniel) {
      setRoleStatus({
        seller: { enabled: true, approved: true, documents_submitted: true, documents_approved: true, paid: true, subscription_amount: 149 },
        landlord: { enabled: true, approved: true, documents_submitted: true, documents_approved: true, paid: true, subscription_amount: 199 }
      })
      setIsSellerActive(true)
      setIsLandlordActive(true)
      return
    }
    
    try {
      const token = localStorage.getItem('access_token')
      const response = await fetch(`${API_URL}/users/role-status`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const data = await response.json()
      setRoleStatus(data)
      setIsSellerActive(data.seller?.enabled && data.seller?.paid)
      setIsLandlordActive(data.landlord?.enabled && data.landlord?.paid)
    } catch (error) {
      console.error('Error loading role status:', error)
    }
  }

  const loadData = async () => {
    setLoading(true)
    try {
      // Get all listings (both sale and rent)
      const allListings = await listingsAPI.getMyListings().catch(e => [])
      
      // Separate sale and rent
      const saleListings = allListings.filter(item => item.listing_type === 'sale')
      const rentProperties = allListings.filter(item => item.listing_type === 'rent')
      
      setListings(saleListings)
      setProperties(rentProperties)
      
      setStats({
        total_properties: saleListings.length + rentProperties.length,
        active_listings: saleListings.filter(l => l.status === 'active').length + rentProperties.filter(p => p.status === 'active').length,
        total_views: [...saleListings, ...rentProperties].reduce((sum, item) => sum + (item.views_count || 0), 0),
        annual_revenue: 1248500
      })
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const refreshListings = () => {
    loadData()
  }

  const handleRoleSelection = (role) => {
    setSelectedRoleForAction(role)
    setActiveTab('documents')
    setShowRoleModal(false)
    toast(`Please upload documents for ${role} verification`)
  }

  const handleCreateListingClick = () => {
    if (isSellerActive) {
      setShowCreateListing(true)
    } else {
      setActivationRole('seller')
      setShowActivationModal(true)
    }
  }

  const handleAddPropertyClick = () => {
    if (isLandlordActive) {
      setShowAddProperty(true)
    } else {
      setActivationRole('landlord')
      setShowActivationModal(true)
    }
  }

  const handleSubscribeClick = (planType) => {
    setSelectedPlan(planType)
    setShowPaymentModal(true)
  }

  const handlePaymentSuccess = async () => {
    setShowPaymentModal(false)
    const token = localStorage.getItem('access_token')
    const response = await fetch('http://localhost:8000/api/auth/me', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    if (response.ok) {
      const userData = await response.json()
      localStorage.setItem('user', JSON.stringify(userData))
      if (updateUser) updateUser(userData)
      await loadRoleStatus()
    }
    toast.success('Subscription activated successfully!')
  }

  const handleCreateListingSuccess = () => {
    setShowCreateListing(false)
    refreshListings()
    toast.success('Listing created successfully! It will appear after admin approval.')
  }

  const handleAddPropertySuccess = () => {
    setShowAddProperty(false)
    refreshListings()
    toast.success('Property added successfully!')
  }

  const handleEditListing = (listing) => {
    setEditingListing(listing)
    setShowEditModal(true)
  }

  const handleEditSuccess = () => {
    setShowEditModal(false)
    setEditingListing(null)
    refreshListings()
    toast.success('Listing updated successfully!')
  }

  const handleDelete = async (id, type) => {
    if (window.confirm(`Are you sure you want to delete this ${type}?`)) {
      try {
        await listingsAPI.deleteListing(id)
        toast.success(`${type} deleted successfully!`)
        refreshListings()
      } catch (error) {
        console.error('Delete error:', error)
        toast.error('Failed to delete')
      }
    }
  }

  const handleActivationComplete = () => {
    const storedUser = localStorage.getItem('user')
    if (storedUser) updateUser(JSON.parse(storedUser))
    setShowActivationModal(false)
    loadRoleStatus()
    refreshListings()
    toast.success('Account activated!')
  }

  const renderContent = () => {
    switch(activeTab) {
      case 'overview':
        return (
          <div className="space-y-6">
            {/* Welcome Banner */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6 text-white">
              <h1 className="text-2xl font-bold mb-2">Welcome back, {user?.full_name?.split(' ')[0] || user?.username || 'User'}!</h1>
              <p className="text-blue-100">Your portfolio is currently generating a 4.21% yield this quarter.</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatsCard title="Annual Revenue" value={`$${stats.annual_revenue.toLocaleString()}`} icon={DollarSign} color="blue" />
              <StatsCard title="Total Properties" value={`${stats.total_properties} Units`} icon={Home} color="green" />
              <StatsCard title="Total Views" value={stats.total_views.toLocaleString()} icon={Eye} color="purple" />
              <StatsCard title="Active Listings" value={stats.active_listings} icon={TrendingUp} color="orange" />
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-2xl shadow-sm border p-6">
              <h3 className="text-lg font-semibold mb-4">Quick Start</h3>
              <div className="flex gap-4 flex-wrap">
                <button onClick={handleAddPropertyClick} className="px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700">Add Rental Property</button>
                <button onClick={handleCreateListingClick} className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700">List Property for Sale</button>
              </div>
            </div>
          </div>
        )
      
      case 'my-listings':
        return (
          <div className="bg-white rounded-2xl shadow-sm border p-6">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold">My Listings</h2>
                <p className="text-sm text-gray-500 mt-1">Manage your properties for sale</p>
                <p className="text-xs text-blue-600 mt-1">Total: {listings.length} listings</p>
              </div>
              <button onClick={handleCreateListingClick} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">
                <PlusCircle className="w-4 h-4" /> Create New Listing
              </button>
            </div>
            
            {!isSellerActive && !isDaniel ? (
              <div className="text-center py-12">
                <CreditCard className="w-16 h-16 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 text-lg">Seller Account Not Active</p>
                <p className="text-sm text-gray-400 mb-4">Please activate your seller account to create listings</p>
                <button onClick={() => handleSubscribeClick('seller')} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Activate Seller Account - $149/month</button>
              </div>
            ) : listings.length === 0 ? (
              <div className="text-center py-12">
                <Home className="w-16 h-16 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No listings yet</p>
                <button onClick={handleCreateListingClick} className="mt-4 text-blue-600 hover:text-blue-700">Create your first listing →</button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {listings.map((listing) => (
                  <div key={listing.id} className="border rounded-lg overflow-hidden hover:shadow-lg transition">
                    <div className="relative h-48 bg-gray-200">
                      {listing.images && listing.images.length > 0 ? (
                        <img src={`http://localhost:8000${listing.images[0]}`} alt={listing.title} className="w-full h-48 object-cover" />
                      ) : (
                        <div className="w-full h-48 flex items-center justify-center"><Home className="w-12 h-12 text-gray-400" /></div>
                      )}
                      <div className="absolute top-2 right-2 bg-blue-600 text-white px-2 py-1 rounded-full text-xs">For Sale</div>
                      {listing.status === 'pending' && <div className="absolute top-2 left-2 bg-yellow-500 text-white px-2 py-1 rounded-full text-xs">Pending</div>}
                      {listing.status === 'active' && <div className="absolute top-2 left-2 bg-green-500 text-white px-2 py-1 rounded-full text-xs">Active</div>}
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-lg truncate">{listing.title}</h3>
                      <div className="flex items-center gap-1 text-sm text-gray-500 mt-1"><MapPin className="w-3 h-3" /><span>{listing.city || 'Addis Ababa'}</span></div>
                      <div className="flex gap-3 mt-3 text-sm text-gray-500">
                        <div className="flex items-center gap-1"><Bed className="w-4 h-4" /> {listing.bedrooms || 0}</div>
                        <div className="flex items-center gap-1"><Bath className="w-4 h-4" /> {listing.bathrooms || 0}</div>
                        <div className="flex items-center gap-1"><Square className="w-4 h-4" /> {listing.sqft || 0}</div>
                      </div>
                      <div className="mt-3 pt-3 border-t"><p className="text-2xl font-bold text-blue-600">ETB {listing.price?.toLocaleString()}</p></div>
                      <div className="mt-3 flex gap-2">
                        <button onClick={() => handleEditListing(listing)} className="flex-1 px-3 py-2 text-sm bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 flex items-center justify-center gap-1"><Edit className="w-4 h-4" /> Edit</button>
                        <button onClick={() => handleDelete(listing.id, 'listing')} className="flex-1 px-3 py-2 text-sm bg-red-50 text-red-600 rounded-lg hover:bg-red-100 flex items-center justify-center gap-1"><Trash2 className="w-4 h-4" /> Delete</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )
      
      case 'my-properties':
        return (
          <div className="bg-white rounded-2xl shadow-sm border p-6">
            <div className="flex justify-between items-center mb-6">
              <div><h2 className="text-2xl font-bold">My Properties</h2><p className="text-sm text-gray-500 mt-1">Manage your rental properties</p></div>
              <button onClick={handleAddPropertyClick} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"><PlusCircle className="w-4 h-4" /> Add Property</button>
            </div>
            {!isLandlordActive && !isDaniel ? (
              <div className="text-center py-12"><CreditCard className="w-16 h-16 text-gray-300 mx-auto mb-3" /><p className="text-gray-500 text-lg">Landlord Account Not Active</p><button onClick={() => handleSubscribeClick('landlord')} className="px-6 py-2 bg-green-600 text-white rounded-lg">Activate Landlord Account - $199/month</button></div>
            ) : properties.length === 0 ? (
              <div className="text-center py-12"><Home className="w-16 h-16 text-gray-300 mx-auto mb-3" /><p className="text-gray-500">No rental properties yet</p><button onClick={handleAddPropertyClick} className="mt-4 text-green-600 hover:text-green-700">Add your first property →</button></div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {properties.map((property) => (
                  <div key={property.id} className="border rounded-lg overflow-hidden hover:shadow-lg transition">
                    <div className="relative h-48 bg-gray-200">
                      {property.images && property.images.length > 0 ? <img src={`http://localhost:8000${property.images[0]}`} alt={property.title} className="w-full h-48 object-cover" /> : <div className="w-full h-48 flex items-center justify-center"><Home className="w-12 h-12 text-gray-400" /></div>}
                      <div className="absolute top-2 right-2 bg-green-600 text-white px-2 py-1 rounded-full text-xs">For Rent</div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-lg truncate">{property.title}</h3>
                      <div className="flex items-center gap-1 text-sm text-gray-500 mt-1"><MapPin className="w-3 h-3" /><span>{property.city || 'Addis Ababa'}</span></div>
                      <div className="flex gap-3 mt-3 text-sm text-gray-500">
                        <div className="flex items-center gap-1"><Bed className="w-4 h-4" /> {property.bedrooms || 0}</div>
                        <div className="flex items-center gap-1"><Bath className="w-4 h-4" /> {property.bathrooms || 0}</div>
                        <div className="flex items-center gap-1"><Square className="w-4 h-4" /> {property.sqft || 0}</div>
                      </div>
                      <div className="mt-3 pt-3 border-t"><p className="text-2xl font-bold text-green-600">ETB {property.price?.toLocaleString()}<span className="text-sm">/month</span></p></div>
                      <div className="mt-3 flex gap-2">
                        <button onClick={() => handleEditListing(property)} className="flex-1 px-3 py-2 text-sm bg-green-50 text-green-600 rounded-lg hover:bg-green-100 flex items-center justify-center gap-1"><Edit className="w-4 h-4" /> Edit</button>
                        <button onClick={() => handleDelete(property.id, 'property')} className="flex-1 px-3 py-2 text-sm bg-red-50 text-red-600 rounded-lg hover:bg-red-100 flex items-center justify-center gap-1"><Trash2 className="w-4 h-4" /> Delete</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )
      
      case 'documents':
        return <DocumentVerification user={user} onDocumentsUpdated={loadRoleStatus} />
      
      case 'subscription':
        return <SubscriptionManager user={user} onSubscriptionUpdated={loadRoleStatus} />
      
      default:
        return <div className="bg-white rounded-2xl shadow-sm border p-12 text-center"><p className="text-gray-500">Select an option from the sidebar</p></div>
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100">
        <AppSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        <main className={`transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-20'}`}>
          <div className="flex justify-center items-center h-96"><Loader className="w-12 h-12 text-blue-600 animate-spin" /></div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <AppSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <main className={`transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-20'}`}>
        <div className="p-6">{renderContent()}</div>
      </main>

      {showCreateListing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
              <h2 className="text-xl font-bold">Create Listing for Sale</h2>
              <button onClick={() => setShowCreateListing(false)} className="p-2 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6"><CreateListingWizard onSuccess={handleCreateListingSuccess} /></div>
          </div>
        </div>
      )}

      {showAddProperty && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
              <h2 className="text-xl font-bold">Add Rental Property</h2>
              <button onClick={() => setShowAddProperty(false)} className="p-2 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6"><AddPropertyWizard onSuccess={handleAddPropertySuccess} /></div>
          </div>
        </div>
      )}

      {showEditModal && editingListing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
              <h2 className="text-xl font-bold">Edit Listing</h2>
              <button onClick={() => setShowEditModal(false)} className="p-2 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6"><EditListingWizard listing={editingListing} onSuccess={handleEditSuccess} onClose={() => setShowEditModal(false)} /></div>
          </div>
        </div>
      )}

      {showPaymentModal && <PaymentModal planType={selectedPlan} amount={selectedPlan === 'seller' ? 149 : selectedPlan === 'landlord' ? 199 : 298} onClose={() => setShowPaymentModal(false)} onSuccess={handlePaymentSuccess} />}
      {showRoleModal && <RoleSelectionModal onClose={() => setShowRoleModal(false)} onSelectRole={handleRoleSelection} />}
      {showActivationModal && <ActivationCard role={activationRole} onClose={() => setShowActivationModal(false)} onActivate={handleActivationComplete} />}
    </div>
  )
}

export default UnifiedDashboard