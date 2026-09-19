import React from 'react'
import { getCurrentUser } from '@/lib/auth'
import { getOrders, updateDesignAttachment } from '@/lib/store'
import { Header } from '@/components/Header'
import { DesignItemCard } from './DesignItemCard'
import { revalidatePath } from 'next/cache'
import { ItemStatus } from '@prisma/client'
import { Palette, Sparkles, CheckCircle2, Clock } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function DesignQueuePage() {
  const currentUser = await getCurrentUser()
  const orders = await getOrders()

  const allDesignItems = orders.flatMap(o =>
    o.items.map(i => ({
      ...i,
      customerName: o.customerName,
      contact: o.contact,
      deliveryDate: o.deliveryDate,
    }))
  )

  const pendingDesignItems = allDesignItems.filter(i => i.status === ItemStatus.PENDING_DESIGN)
  const completedDesignItems = allDesignItems.filter(i => i.status === ItemStatus.DESIGN_COMPLETE || i.status === ItemStatus.COMPLETED)

  async function handleUploadDesign(formData: FormData) {
    'use server'
    const orderItemId = formData.get('orderItemId') as string
    const designFileUrl = formData.get('designFileUrl') as string

    if (!orderItemId || !designFileUrl) {
      throw new Error('Missing item or design file URL')
    }

    const user = await getCurrentUser()
    await updateDesignAttachment({
      orderItemId,
      designFileUrl,
      designerId: user.id,
    })

    revalidatePath('/design/queue')
    revalidatePath('/sales/orders')
    revalidatePath('/production/queue')
  }

  return (
    <div className="min-h-screen pb-16 bg-slate-50/50">
      <Header currentUser={currentUser} />

      <main className="max-w-7xl mx-auto px-4 lg:px-8 pt-8">
        
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 text-rose-600 text-sm font-bold mb-1">
              <Palette className="w-4 h-4 text-rose-500" /> Design Queue — Stage 3
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Design Queue Workflow
            </h1>
            <p className="text-slate-500 text-sm mt-1 font-medium">
              Review reference photos provided by Sales and upload final digital design artwork files.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="px-3.5 py-1.5 rounded-full text-xs font-mono font-bold bg-rose-50 text-rose-700 border border-rose-200">
              {pendingDesignItems.length} items awaiting design
            </span>
          </div>
        </div>

        {/* Pending Queue Section */}
        <section className="mb-12 space-y-4">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Clock className="w-5 h-5 text-rose-500" />
            <span>Pending Design Work ({pendingDesignItems.length})</span>
          </h2>

          {pendingDesignItems.length === 0 ? (
            <div className="glass-card p-12 text-center text-slate-400 rounded-3xl">
              <Sparkles className="w-12 h-12 mx-auto text-rose-400 mb-3" />
              <p className="font-bold text-slate-800">Design Queue is clean!</p>
              <p className="text-xs text-slate-500 mt-1">No items currently waiting for design artwork.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pendingDesignItems.map((item) => (
                <DesignItemCard
                  key={item.id}
                  item={item}
                  onUploadAction={handleUploadDesign}
                />
              ))}
            </div>
          )}
        </section>

        {/* Recently Completed Designs Section */}
        {completedDesignItems.length > 0 && (
          <section className="space-y-4 pt-6 border-t border-slate-200">
            <h2 className="text-lg font-bold text-slate-700 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <span>Completed Designs Sent to Production ({completedDesignItems.length})</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {completedDesignItems.map((item) => (
                <DesignItemCard
                  key={item.id}
                  item={item}
                  onUploadAction={handleUploadDesign}
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
