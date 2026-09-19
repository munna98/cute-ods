import React from 'react'
import { getCurrentUser } from '@/lib/auth'
import { getOrders } from '@/lib/store'
import { Header } from '@/components/Header'
import { AdminOrdersClient } from './AdminOrdersClient'
import { ShieldCheck } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function AdminOrdersPage() {
  const currentUser = await getCurrentUser()
  const orders = await getOrders()

  return (
    <div className="min-h-screen pb-16 bg-background">
      <Header currentUser={currentUser} />

      <main className="max-w-7xl mx-auto px-4 lg:px-8 pt-8">
        
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-primary text-sm font-bold mb-1">
            <ShieldCheck className="w-4 h-4 text-primary" /> Admin Dashboard &amp; Oversight
          </div>
          <h1 className="text-3xl font-extrabold text-foreground tracking-tight">
            All Pipeline Orders
          </h1>
          <p className="text-muted-foreground text-sm mt-1 font-medium">
            Executive oversight into customer outfit orders, stage bottlenecks, and team performance. Click any status card below to filter orders by stage.
          </p>
        </div>

        {/* Interactive Client View with Clickable Metric Filtering */}
        <AdminOrdersClient orders={orders} />

      </main>
    </div>
  )
}
