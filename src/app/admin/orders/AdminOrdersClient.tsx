'use client'

import React, { useState } from 'react'
import { OrderDetail } from '@/lib/store'
import { ItemStatus } from '@prisma/client'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  ShoppingBag, 
  Palette, 
  Factory, 
  CheckCircle2, 
  Package,
  Clock,
  X
} from 'lucide-react'

type FilterStatus = 'ALL' | 'PENDING_DESIGN' | 'IN_PRODUCTION' | 'COMPLETED'

interface AdminOrdersClientProps {
  orders: OrderDetail[]
}

export function AdminOrdersClient({ orders }: AdminOrdersClientProps) {
  const [activeFilter, setActiveFilter] = useState<FilterStatus>('ALL')

  const totalOrders = orders.length
  const allItems = orders.flatMap((o) => o.items)
  const pendingDesignCount = allItems.filter((i) => i.status === ItemStatus.PENDING_DESIGN).length
  const inProdCount = allItems.filter((i) => i.status === ItemStatus.DESIGN_COMPLETE).length
  const completedCount = orders.filter((o) => o.isCompleted).length

  // Filter orders based on active metric card selection
  const filteredOrders = orders.filter((order) => {
    if (activeFilter === 'ALL') return true
    if (activeFilter === 'COMPLETED') return order.isCompleted
    if (activeFilter === 'PENDING_DESIGN') {
      return order.items.some((i) => i.status === ItemStatus.PENDING_DESIGN)
    }
    if (activeFilter === 'IN_PRODUCTION') {
      return order.items.some((i) => i.status === ItemStatus.DESIGN_COMPLETE)
    }
    return true
  })

  const getOrderStageBadge = (order: OrderDetail) => {
    if (order.isCompleted) {
      return (
        <Badge variant="success" className="flex items-center gap-1.5 py-1 px-3 font-semibold">
          <CheckCircle2 className="w-3.5 h-3.5" /> Completed
        </Badge>
      )
    }

    const hasPendingDesign = order.items.some((i) => i.status === ItemStatus.PENDING_DESIGN)
    if (hasPendingDesign) {
      return (
        <Badge variant="accent" className="flex items-center gap-1.5 py-1 px-3 font-semibold">
          <Clock className="w-3.5 h-3.5 text-primary" /> Pending Design
        </Badge>
      )
    }

    const hasInProd = order.items.some((i) => i.status === ItemStatus.DESIGN_COMPLETE)
    if (hasInProd) {
      return (
        <Badge variant="warning" className="flex items-center gap-1.5 py-1 px-3 font-semibold">
          <Factory className="w-3.5 h-3.5 text-amber-600" /> In Production
        </Badge>
      )
    }

    return (
      <Badge variant="outline" className="flex items-center gap-1.5 py-1 px-3 font-semibold">
        In Pipeline
      </Badge>
    )
  }

  const getFilterTitle = () => {
    switch (activeFilter) {
      case 'PENDING_DESIGN':
        return 'Pending Design Orders'
      case 'IN_PRODUCTION':
        return 'In Production Orders'
      case 'COMPLETED':
        return 'Completed Orders'
      default:
        return 'All Pipeline Orders'
    }
  }

  return (
    <div className="space-y-8">
      
      {/* Clickable Metric Filter Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Total Orders */}
        <Card
          onClick={() => setActiveFilter('ALL')}
          className={`p-5 flex items-center justify-between transition-all cursor-pointer hover:shadow-md ${
            activeFilter === 'ALL'
              ? 'ring-2 ring-primary border-primary bg-accent/40 shadow-xs'
              : 'hover:bg-muted/40'
          }`}
        >
          <div>
            <div className="text-xs font-bold text-muted-foreground uppercase">Total Orders</div>
            <div className="text-2xl font-extrabold text-foreground mt-1">{totalOrders}</div>
          </div>
          <div className="p-3 rounded-2xl bg-accent border border-border text-accent-foreground">
            <ShoppingBag className="w-6 h-6" />
          </div>
        </Card>

        {/* Card 2: Pending Design */}
        <Card
          onClick={() => setActiveFilter('PENDING_DESIGN')}
          className={`p-5 flex items-center justify-between transition-all cursor-pointer hover:shadow-md ${
            activeFilter === 'PENDING_DESIGN'
              ? 'ring-2 ring-primary border-primary bg-accent/40 shadow-xs'
              : 'hover:bg-muted/40'
          }`}
        >
          <div>
            <div className="text-xs font-bold text-muted-foreground uppercase">Pending Design</div>
            <div className="text-2xl font-extrabold text-primary mt-1">{pendingDesignCount}</div>
          </div>
          <div className="p-3 rounded-2xl bg-accent border border-border text-accent-foreground">
            <Palette className="w-6 h-6" />
          </div>
        </Card>

        {/* Card 3: In Production */}
        <Card
          onClick={() => setActiveFilter('IN_PRODUCTION')}
          className={`p-5 flex items-center justify-between transition-all cursor-pointer hover:shadow-md ${
            activeFilter === 'IN_PRODUCTION'
              ? 'ring-2 ring-primary border-primary bg-accent/40 shadow-xs'
              : 'hover:bg-muted/40'
          }`}
        >
          <div>
            <div className="text-xs font-bold text-muted-foreground uppercase">In Production</div>
            <div className="text-2xl font-extrabold text-amber-600 mt-1">{inProdCount}</div>
          </div>
          <div className="p-3 rounded-2xl bg-accent border border-border text-accent-foreground">
            <Factory className="w-6 h-6" />
          </div>
        </Card>

        {/* Card 4: Completed */}
        <Card
          onClick={() => setActiveFilter('COMPLETED')}
          className={`p-5 flex items-center justify-between transition-all cursor-pointer hover:shadow-md ${
            activeFilter === 'COMPLETED'
              ? 'ring-2 ring-primary border-primary bg-accent/40 shadow-xs'
              : 'hover:bg-muted/40'
          }`}
        >
          <div>
            <div className="text-xs font-bold text-muted-foreground uppercase">Completed</div>
            <div className="text-2xl font-extrabold text-emerald-600 mt-1">{completedCount}</div>
          </div>
          <div className="p-3 rounded-2xl bg-accent border border-border text-accent-foreground">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </Card>

      </div>

      {/* Orders Directory Table */}
      <Card className="overflow-hidden shadow-xs">
        <div className="p-5 border-b border-border flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-foreground">
              {getFilterTitle()}
            </h2>
            <Badge variant="secondary" className="font-mono">
              {filteredOrders.length} {filteredOrders.length === 1 ? 'order' : 'orders'}
            </Badge>
          </div>

          {activeFilter !== 'ALL' && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setActiveFilter('ALL')}
              className="text-xs flex items-center gap-1.5 h-8"
            >
              <X className="w-3.5 h-3.5" /> Clear Filter
            </Button>
          )}
        </div>

        <div className="divide-y divide-border">
          {filteredOrders.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground">
              <ShoppingBag className="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
              <p>No orders match the selected <strong>{getFilterTitle()}</strong> filter.</p>
              {activeFilter !== 'ALL' && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setActiveFilter('ALL')}
                  className="mt-3"
                >
                  View All Orders
                </Button>
              )}
            </div>
          ) : (
            filteredOrders.map((order) => (
              <div key={order.id} className="p-5 hover:bg-muted/50 transition-colors space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="font-bold text-base text-foreground flex items-center gap-2">
                      <span>{order.customerName}</span>
                      <span className="text-xs font-mono text-muted-foreground">({order.id})</span>
                    </div>
                    <div className="text-xs text-muted-foreground font-mono">
                      Contact: {order.contact} • Sales Rep: {order.salespersonName}
                    </div>
                  </div>

                  <div>
                    {getOrderStageBadge(order)}
                  </div>
                </div>

                {/* Outfit Items Breakdown */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {order.items.map((item) => (
                    <div key={item.id} className="p-3.5 rounded-2xl bg-muted/60 border border-border text-xs space-y-2">
                      <div className="font-bold text-foreground">Product: {item.productName}</div>
                      
                      <div className="space-y-1">
                        <div className="text-[10px] font-bold text-muted-foreground uppercase font-mono flex items-center gap-1">
                          <Package className="w-3 h-3 text-primary" /> Consumed Materials ({item.materials.length}):
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {item.materials.map((m) => (
                            <Badge key={m.id} variant="secondary" className="text-[10px] font-mono bg-card border border-border">
                              {m.inventoryName} ({m.inventoryColor || 'Standard'}/{m.inventorySize || 'N/A'}) × {m.qty}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div className="pt-1 flex items-center justify-between">
                        <Badge variant="outline" className="text-[10px]">
                          {item.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </Card>

    </div>
  )
}
