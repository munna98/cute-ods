import React from 'react'
import { getCurrentUser } from '@/lib/auth'
import { getOrders, markItemProductionComplete } from '@/lib/store'
import { Header } from '@/components/Header'
import { ProductionItemCard } from './ProductionItemCard'
import { revalidatePath } from 'next/cache'
import { ItemStatus } from '@prisma/client'
import { Factory, CheckCircle2, Clock, Sparkles } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function ProductionQueuePage() {
  const currentUser = await getCurrentUser()
  const orders = await getOrders()

  const allProdItems = orders.flatMap(o =>
    o.items.map(i => ({
      ...i,
      customerName: o.customerName,
      contact: o.contact,
      deliveryDate: o.deliveryDate,
      deliveryAddress: o.deliveryAddress,
    }))
  )

  const activeProductionItems = allProdItems.filter(i => i.status === ItemStatus.DESIGN_COMPLETE)
  const completedProductionItems = allProdItems.filter(i => i.status === ItemStatus.COMPLETED)

  async function handleMarkComplete(formData: FormData) {
    'use server'
    const orderItemId = formData.get('orderItemId') as string
    if (!orderItemId) return

    await markItemProductionComplete({ orderItemId })

    revalidatePath('/production/queue')
    revalidatePath('/sales/orders')
    revalidatePath('/admin/orders')
  }

  return (
    <div className="min-h-screen pb-16 bg-slate-50/50">
      <Header currentUser={currentUser} />

      <main className="max-w-7xl mx-auto px-4 lg:px-8 pt-8">
        
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 text-amber-700 text-sm font-bold mb-1">
              <Factory className="w-4 h-4 text-amber-600" /> Production Queue — Stage 4
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Production &amp; Manufacturing Queue
            </h1>
            <p className="text-slate-500 text-sm mt-1 font-medium">
              Inspect final artwork designs and manufacture outfits to fulfill customer orders.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="px-3.5 py-1.5 rounded-full text-xs font-mono font-bold bg-amber-50 text-amber-800 border border-amber-200">
              {activeProductionItems.length} items ready for stitching
            </span>
          </div>
        </div>

        {/* Active Production Queue Section */}
        <section className="mb-12 space-y-4">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Clock className="w-5 h-5 text-amber-600" />
            <span>Ready for Production ({activeProductionItems.length})</span>
          </h2>

          {activeProductionItems.length === 0 ? (
            <div className="glass-card p-12 text-center text-slate-400 rounded-3xl">
              <Sparkles className="w-12 h-12 mx-auto text-amber-500 mb-3" />
              <p className="font-bold text-slate-800">Production Queue is up to date!</p>
              <p className="text-xs text-slate-500 mt-1">No items currently waiting for manufacturing.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activeProductionItems.map((item) => (
                <ProductionItemCard
                  key={item.id}
                  item={item}
                  onMarkCompleteAction={handleMarkComplete}
                />
              ))}
            </div>
          )}
        </section>

        {/* Completed Manufacturing History */}
        {completedProductionItems.length > 0 && (
          <section className="space-y-4 pt-6 border-t border-slate-200">
            <h2 className="text-lg font-bold text-slate-700 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <span>Completed Manufacturing History ({completedProductionItems.length})</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {completedProductionItems.map((item) => (
                <ProductionItemCard
                  key={item.id}
                  item={item}
                  onMarkCompleteAction={handleMarkComplete}
                  readOnly
                />
              ))}
            </div>
          </section>
        )}

      </main>
    </div>
  )
}
