import React from 'react'
import { getCurrentUser } from '@/lib/auth'
import { getLeads, getProducts, getInventoryMaterials, createOrderWithStockDeduction } from '@/lib/store'
import { Header } from '@/components/Header'
import { OrderBuilderForm } from './OrderBuilderForm'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { ShoppingBag, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

interface PageProps {
  searchParams: Promise<{ leadId?: string }>
}

export default async function NewOrderPage({ searchParams }: PageProps) {
  const currentUser = await getCurrentUser()
  const resolvedSearchParams = await searchParams
  const preselectedLeadId = resolvedSearchParams.leadId

  const leads = await getLeads()
  const products = await getProducts()
  const inventoryMaterials = await getInventoryMaterials()

  // Server Action for atomic order creation with single product and multiple consumed materials
  async function handleCreateOrder(formData: FormData) {
    'use server'
    const leadId = formData.get('leadId') as string
    const productId = formData.get('productId') as string
    const deliveryDate = formData.get('deliveryDate') as string
    const deliveryAddress = formData.get('deliveryAddress') as string
    const referenceFileUrl = formData.get('referenceFileUrl') as string
    const itemsPayloadRaw = formData.get('itemsPayload') as string

    if (!leadId || !productId) {
      throw new Error('Please select customer lead and product.')
    }

    let materials: Array<{ inventoryId: string; qty: number }> = []

    if (itemsPayloadRaw) {
      try {
        const parsed: Array<{ inventoryId: string; qty: number }> = JSON.parse(itemsPayloadRaw)
        materials = parsed.filter(m => m.inventoryId && m.qty > 0)
      } catch {
        // fallback
      }
    }

    if (materials.length === 0) {
      const inventoryId = formData.get('inventoryId') as string
      const qty = parseInt((formData.get('qty') as string) || '1', 10)
      if (inventoryId && qty) {
        materials.push({ inventoryId, qty })
      }
    }

    if (materials.length === 0) {
      throw new Error('Please add at least one consumed material accent for the outfit product.')
    }

    const user = await getCurrentUser()

    await createOrderWithStockDeduction({
      leadId,
      salespersonId: user.id,
      deliveryDate,
      deliveryAddress,
      productId,
      materials,
      referenceFileUrl: referenceFileUrl || 'https://images.unsplash.com/photo-1519689680058-324335c77eba?w=600',
    })

    revalidatePath('/sales/orders')
    revalidatePath('/sales/leads')
    redirect('/sales/orders')
  }

  return (
    <div className="min-h-screen pb-16 bg-background">
      <Header currentUser={currentUser} />

      <main className="max-w-4xl mx-auto px-4 lg:px-8 pt-8">
        
        {/* Navigation Back Link */}
        <Link
          href="/sales/leads"
          className="inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-primary transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Customer Leads
        </Link>

        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-primary text-sm font-semibold mb-1">
            <ShoppingBag className="w-4 h-4" /> Sales Pipeline — Stage 2
          </div>
          <h1 className="text-3xl font-extrabold text-foreground tracking-tight">
            Order Builder &amp; Material Stock Locking
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Select the outfit product and assign one or more consumed materials (Bows, Ribbons, Patches). Material stock will be locked atomically for the outfit product.
          </p>
        </div>

        {/* Interactive Form Component */}
        <div className="glass-card p-6 sm:p-8 rounded-3xl border border-border shadow-xl bg-card">
          <OrderBuilderForm
            leads={leads}
            products={products}
            inventoryMaterials={inventoryMaterials}
            preselectedLeadId={preselectedLeadId}
            onSubmitAction={handleCreateOrder}
          />
        </div>

      </main>
    </div>
  )
}
