import React from 'react'
import SubscriptionManager from '../components/dashboard/unified/SubscriptionManager'
import AppLayout from '../components/layout/AppLayout'
import { useAuth } from '../context/AuthContext'

const SubscriptionPage = () => {
  const { user } = useAuth()
  
  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto py-8">
        <SubscriptionManager user={user} onSubscriptionUpdated={() => {}} />
      </div>
    </AppLayout>
  )
}

export default SubscriptionPage