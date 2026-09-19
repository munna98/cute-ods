'use client'

import React, { useTransition } from 'react'
import { OrderItemDetail } from '@/lib/store'
import { AttachmentKind, ItemStatus } from '@prisma/client'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ImageLightbox } from '@/components/ui/image-lightbox'
import { 
  CheckCircle2, 
  Calendar, 
  MapPin,
  Package,
  Sparkles
} from 'lucide-react'

interface ProductionItemCardProps {
  item: OrderItemDetail & {
    customerName: string
    contact: string
    deliveryDate: Date | null
    deliveryAddress: string | null
  }
  onMarkCompleteAction: (formData: FormData) => Promise<void>
  readOnly?: boolean
}

export function ProductionItemCard({
  item,
  onMarkCompleteAction,
  readOnly,
}: ProductionItemCardProps) {
  const [isPending, startTransition] = useTransition()

  const refAttachment = item.attachments.find((a) => a.kind === AttachmentKind.REFERENCE)
  const designAttachment = item.attachments.find((a) => a.kind === AttachmentKind.DESIGN)

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    startTransition(async () => {
      await onMarkCompleteAction(formData)
    })
  }

  const isCompleted = item.status === ItemStatus.COMPLETED

  return (
    <Card className="p-5 flex flex-col justify-between shadow-xs hover:shadow-md transition-all">
      <div className="space-y-4">
        
        {/* Customer Header */}
        <div className="flex items-center justify-between pb-3 border-b border-border">
          <div>
            <div className="font-bold text-base text-foreground">{item.customerName}</div>
            <div className="text-xs text-muted-foreground font-mono">Item #{item.id}</div>
          </div>

          {/* Green success badge with check icon for COMPLETED, warning badge for DESIGN_COMPLETE */}
          <Badge
            variant={isCompleted ? "success" : "warning"}
            className="flex items-center gap-1.5 font-semibold"
          >
            {isCompleted && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
            {item.status}
          </Badge>
        </div>

        {/* Product & Multiple Consumed Materials Specs */}
        <div className="space-y-2 bg-muted/60 p-3 rounded-2xl border border-border">
          <div className="font-bold text-sm text-foreground">Product: {item.productName}</div>
          
          <div className="space-y-1">
            <div className="text-[11px] font-bold text-muted-foreground uppercase font-mono flex items-center gap-1">
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

          <div className="pt-1.5 border-t border-border space-y-1 text-muted-foreground font-medium text-[11px]">
            {item.deliveryDate && (
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-primary" />
                <span>Target Delivery: {new Date(item.deliveryDate).toLocaleDateString()}</span>
              </div>
            )}
            {item.deliveryAddress && (
              <div className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-primary" />
                <span className="truncate">Address: {item.deliveryAddress}</span>
              </div>
            )}
          </div>
        </div>

        {/* Design Artwork File Inspection */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold text-primary uppercase tracking-wider block flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-primary" /> Final Design:
          </label>

          {designAttachment ? (
            <ImageLightbox
              src={designAttachment.fileUrl}
              alt="Final design artwork"
              className="w-full h-44 rounded-2xl"
            />
          ) : (
            <div className="h-28 rounded-2xl bg-muted/60 border border-border flex items-center justify-center text-muted-foreground text-xs">
              No design artwork attached
            </div>
          )}
        </div>

        {/* Reference Image Thumbnail */}
        {refAttachment && (
          <div className="p-2.5 rounded-2xl bg-muted/60 border border-border flex items-center justify-between text-xs text-foreground">
            <div className="flex items-center gap-2.5">
              <ImageLightbox
                src={refAttachment.fileUrl}
                alt="Reference photo"
                className="w-8 h-8 rounded-lg"
              />
              <span className="text-muted-foreground font-semibold text-xs">Customer Reference Photo</span>
            </div>
          </div>
        )}

        {/* Mark Complete Form / Status */}
        {!readOnly ? (
          <form onSubmit={handleSubmit} className="pt-2">
            <input type="hidden" name="orderItemId" value={item.id} />
            <Button
              type="submit"
              disabled={isPending}
              className="w-full"
            >
              {isPending ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                  Updating status...
                </span>
              ) : (
                <>
                  <CheckCircle2 className="w-4.5 h-4.5 mr-2" />
                  <span>Mark Item Manufacturing Complete</span>
                </>
              )}
            </Button>
          </form>
        ) : (
          <Badge variant="success" className="w-full py-2 flex items-center justify-center gap-2">
            <CheckCircle2 className="w-4 h-4" /> Production Completed
          </Badge>
        )}

      </div>
    </Card>
  )
}
