import React, { useState } from 'react'
import { CreditCard, CheckCircle, Shield, Crown } from 'lucide-react'
import PaymentModal from '../../payment/PaymentModal'
import toast from 'react-hot-toast'

const SubscriptionManager = ({ user, onSubscriptionUpdated }) => {
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState(null)

  const handleSubscribe = (planType) => { setSelectedPlan(planType); setShowPaymentModal(true) }
  const handlePaymentSuccess = async () => { setShowPaymentModal(false); if (onSubscriptionUpdated) await onSubscriptionUpdated(); toast.success('Subscription activated!') }

  const plans = [
    { id: 'seller', name: 'Seller Plan', price: 149, description: 'Perfect for selling properties', features: ['Up to 10 active listings', 'Professional property photos', 'Virtual tour integration', 'Priority customer support'], color: 'blue', isActive: user?.seller_paid || false },
    { id: 'landlord', name: 'Landlord Plan', price: 199, description: 'Ideal for rental properties', features: ['Up to 20 rental listings', 'Tenant management system', 'Rent collection tools', '24/7 priority support'], color: 'green', isActive: user?.landlord_paid || false },
    { id: 'dual', name: 'Dual Plan', price: 298, description: 'Complete solution', features: ['Unlimited listings', 'Advanced analytics', 'Dedicated account manager', 'API access'], color: 'purple', isActive: user?.seller_paid && user?.landlord_paid || false }
  ]

  const getColorClass = (color) => ({ blue: 'from-blue-600 to-blue-700', green: 'from-green-600 to-green-700', purple: 'from-purple-600 to-purple-700' }[color])

  return (
    <div className="bg-white rounded-2xl shadow-sm border p-6">
      <div className="text-center mb-8"><h2 className="text-2xl font-bold">Subscription Plans</h2><p className="text-gray-500">Choose the perfect plan for your real estate needs</p></div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map(plan => {
          const isActive = plan.isActive
          return (<div key={plan.id} className={`relative rounded-xl border overflow-hidden transition-all ${isActive ? 'ring-2 ring-green-500 shadow-lg' : 'hover:shadow-lg'}`}>
            {isActive && <div className="absolute top-0 right-0 bg-green-500 text-white px-3 py-1 text-xs font-semibold rounded-bl-lg"><CheckCircle className="w-3 h-3 inline mr-1" />Active</div>}
            <div className={`bg-gradient-to-r ${getColorClass(plan.color)} p-6 text-white`}><h3 className="text-xl font-bold">{plan.name}</h3><p className="text-3xl font-bold mt-2">${plan.price}<span className="text-sm">/month</span></p><p className="text-sm opacity-80 mt-1">{plan.description}</p></div>
            <div className="p-6"><ul className="space-y-2 mb-6">{plan.features.map((f, i) => (<li key={i} className="flex items-center gap-2 text-sm text-gray-600"><CheckCircle className="w-4 h-4 text-green-500" />{f}</li>))}</ul>
            {!isActive ? (<button onClick={() => handleSubscribe(plan.id)} className="w-full py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold">Subscribe Now</button>) : (<button disabled className="w-full py-2 bg-gray-100 text-gray-500 rounded-lg cursor-not-allowed">Current Plan</button>)}
          </div></div>)
        })}
      </div>
      {showPaymentModal && (<PaymentModal planType={selectedPlan} amount={selectedPlan === 'seller' ? 149 : selectedPlan === 'landlord' ? 199 : 298} onClose={() => setShowPaymentModal(false)} onSuccess={handlePaymentSuccess} />)}
    </div>
  )
}

export default SubscriptionManager