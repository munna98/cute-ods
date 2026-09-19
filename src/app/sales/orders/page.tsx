import React from 'react'
import { getCurrentUser } from '@/lib/auth'
import { getOrders, OrderDetail } from '@/lib/store'
import { Header } from '@/components/Header'
import Link from 'next/link'
import { ItemStatus, AttachmentKind } from '@prisma/client'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ImageLightbox } from '@/components/ui/image-lightbox'
import { 
  ShoppingBag, 
  Plus, 
  Calendar, 
  MapPin, 
  CheckCircle2, 
  Clock, 
  Palette, 
  ExternalLink,
  Tag,
  Package,
  Factory
} from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function SalesOrdersPage() {
  const currentUser = await getCurrentUser()
  const orders = await getOrders()

  const getItemStatusBadge = (status: ItemStatus) => {
    switch (status) {
      case ItemStatus.PENDING_DESIGN:
        return (
          <Badge variant="accent" className="flex items-center gap-1.5 font-semibold">
            <Clock className="w-3.5 h-3.5" /> Pending Design
          </Badge>
        )
      case ItemStatus.DESIGN_COMPLETE:
        return (
          <Badge variant="warning" className="flex items-center gap-1.5 font-semibold">
            <Palette className="w-3.5 h-3.5" /> Design Ready → In Prod
          </Badge>
        )
      case ItemStatus.COMPLETED:
        return (
          <Badge variant="success" className="flex items-center gap-1.5 font-semibold">
            <CheckCircle2 className="w-3.5 h-3.5" /> Completed
          </Badge>
        )
    }
  }

  const getOrderStageBadge = (order: OrderDetail) => {
    if (order.isCompleted) {
      return (
        <Badge variant="success" className="py-1.5 px-3 flex items-center gap-1.5 font-semibold">
          <CheckCircle2 className="w-4 h-4" /> Completed
        </Badge>
      )
    }

    const hasPendingDesign = order.items.some((i) => i.status === ItemStatus.PENDING_DESIGN)
    if (hasPendingDesign) {
      return (
        <Badge variant="accent" className="py-1.5 px-3 flex items-center gap-1.5 font-semibold">
          <Clock className="w-4 h-4 text-primary" /> Pending Design
        </Badge>
      )
    }

    const hasInProd = order.items.some((i) => i.status === ItemStatus.DESIGN_COMPLETE)
    if (hasInProd) {
      return (
        <Badge variant="warning" className="py-1.5 px-3 flex items-center gap-1.5 font-semibold">
          <Factory className="w-4 h-4 text-amber-600" /> In Production
        </Badge>
      )
    }

    return (
      <Badge variant="outline" className="py-1.5 px-3 flex items-center gap-1.5 font-semibold">
        In Pipeline
      </Badge>
    )
  }

  return (
    <div className="min-h-screen pb-16 bg-background">
      <Header currentUser={currentUser} />

      <main className="max-w-7xl mx-auto px-4 lg:px-8 pt-8">
        
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 text-primary text-sm font-bold mb-1">
              <ShoppingBag className="w-4 h-4" /> Sales Queue — Order Pipeline
            </div>
            <h1 className="text-3xl font-extrabold text-foreground tracking-tight">
              My Sales Orders
            </h1>
            <p className="text-muted-foreground text-sm mt-1 font-medium">
              Track live progress of your outfit orders across design and production teams.
            </p>
          </div>

          <Link href="/sales/orders/new">
            <Button className="flex items-center gap-2">
              <Plus className="w-4 h-4" /> Create New Order
            </Button>
          </Link>
        </div>

        {/* Orders List */}
        <div className="space-y-6">
          {orders.length === 0 ? (
            <Card className="p-12 text-center text-muted-foreground">
              <ShoppingBag className="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
              <p>No orders created yet. Convert a lead to place your first outfit order!</p>
            </Card>
          ) : (
            orders.map((order) => (
              <Card
                key={order.id}
                className="p-6 hover:shadow-md transition-all"
              >
                {/* Top Row: Order ID & Derived Actual Stage */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-border">
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <span className="font-extrabold text-lg text-foreground">
                        {order.customerName}
                      </span>
                      <span className="text-xs font-mono text-muted-foreground">
                        (Order #{order.id})
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground font-mono">
                      Contact: {order.contact}
                    </p>
                  </div>

                  {/* Actual Stage Badge */}
                  <div className="flex items-center gap-3">
                    {getOrderStageBadge(order)}
                  </div>
                </div>

                {/* Logistics Info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-3 text-xs text-muted-foreground border-b border-border font-medium">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-primary" />
                    <span>Delivery Date: </span>
                    <span className="font-semibold text-foreground">
                      {order.deliveryDate
                        ? new Date(order.deliveryDate).toLocaleDateString(undefined, {
                            dateStyle: 'medium',
                          })
                        : 'Not specified'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-primary" />
                    <span>Address: </span>
                    <span className="font-semibold text-foreground">
                      {order.deliveryAddress || 'Pick-up / Direct'}
                    </span>
                  </div>
                </div>

                {/* Items Breakdown */}
                <div className="pt-4 space-y-3">
                  <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    Outfit Products ({order.items.length})
                  </h4>

                  <div className="space-y-3">
                    {order.items.map((item) => {
                      const refAttachment = item.attachments.find(
                        (a) => a.kind === AttachmentKind.REFERENCE
                      )
                      const designAttachment = item.attachments.find(
                        (a) => a.kind === AttachmentKind.DESIGN
                      )

                      return (
                        <div
                          key={item.id}
                          className="p-4 rounded-2xl bg-muted/60 border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                        >
                          <div className="flex items-start gap-3.5">
                            {refAttachment ? (
                              <ImageLightbox
                                src={refAttachment.fileUrl}
                                alt="Reference photo"
                                className="w-14 h-14 rounded-xl"
                              />
                            ) : (
                              <div className="w-14 h-14 rounded-xl bg-card border border-border flex items-center justify-center text-muted-foreground shrink-0">
                                <Tag className="w-6 h-6" />
                              </div>
                            )}

                            <div className="space-y-1">
                              <div className="font-bold text-sm text-foreground">
                                Product: {item.productName}
                              </div>

                              {/* Consumed Materials List */}
                              <div className="space-y-1">
                                <div className="text-[11px] font-bold text-muted-foreground font-mono flex items-center gap-1">
                                  <Package className="w-3 h-3 text-primary" /> Consumed Materials ({item.materials.length}):
                                </div>
                                <div className="flex flex-wrap gap-1.5 pt-0.5">
                                  {item.materials.map((m) => (
                                    <Badge key={m.id} variant="secondary" className="text-[11px] font-mono font-semibold bg-card border border-border">
                                      {m.inventoryName} ({m.inventoryColor || 'Standard'}/{m.inventorySize || 'N/A'}) × {m.qty}
                                    </Badge>
                                  ))}
                                </div>
                              </div>

                              {/* Final Design Attachment Link */}
                              {designAttachment && (
                                <div className="pt-1 text-[11px]">
                                  <a
                                    href={designAttachment.fileUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-emerald-700 hover:underline flex items-center gap-1 font-bold"
                                  >
                                    <ExternalLink className="w-3 h-3" /> Final Design File
                                  </a>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Per-Item Status */}
                          <div className="self-end sm:self-center">
                            {getItemStatusBadge(item.status)}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

              </Card>
            ))
          )}
        </div>

      </main>
    </div>
  )
}
