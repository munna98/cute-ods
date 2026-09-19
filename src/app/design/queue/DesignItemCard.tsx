'use client'

import React, { useState, useTransition } from 'react'
import { OrderItemDetail } from '@/lib/store'
import { AttachmentKind } from '@prisma/client'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ImageLightbox } from '@/components/ui/image-lightbox'
import { 
  UploadCloud, 
  Calendar, 
  AlertCircle,
  ImageIcon,
  Sparkles,
  Package
} from 'lucide-react'

interface DesignItemCardProps {
  item: OrderItemDetail & {
    customerName: string
    contact: string
    deliveryDate: Date | null
  }
  onUploadAction: (formData: FormData) => Promise<void>
  readOnly?: boolean
}

export function DesignItemCard({ item, onUploadAction, readOnly }: DesignItemCardProps) {
  const [isPending, startTransition] = useTransition()
  const [designUrl, setDesignUrl] = useState('')
  const [errorMsg, setErrorMsg] = useState('')

  const refAttachment = item.attachments.find((a) => a.kind === AttachmentKind.REFERENCE)
  const designAttachment = item.attachments.find((a) => a.kind === AttachmentKind.DESIGN)

  const handleUploadSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!designUrl) {
      setErrorMsg('Please enter or upload a design artwork URL.')
      return
    }

    const formData = new FormData(e.currentTarget)
    startTransition(async () => {
      try {
        await onUploadAction(formData)
        setDesignUrl('')
      } catch (err: any) {
        setErrorMsg(err.message || 'Failed to upload design artwork.')
      }
    })
  }

  return (
    <Card className="p-5 flex flex-col justify-between shadow-xs hover:shadow-md transition-all">
      <div className="space-y-4">
        
        {/* Customer Header */}
        <div className="flex items-center justify-between pb-3 border-b border-border">
          <div>
            <div className="font-bold text-base text-foreground">{item.customerName}</div>
            <div className="text-xs text-muted-foreground font-mono">Item #{item.id}</div>
          </div>
          <Badge variant={designAttachment ? "success" : "accent"}>
            {item.status}
          </Badge>
        </div>

        {/* Single Product & Consumed Materials Badges */}
        <div className="space-y-2 bg-muted/60 p-3 rounded-2xl border border-border">
          <div className="font-bold text-sm text-primary">Product: {item.productName}</div>
          
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

          {item.deliveryDate && (
            <div className="text-muted-foreground flex items-center gap-1 pt-1 font-medium text-[11px] border-t border-border">
              <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
              <span>Target Delivery: {new Date(item.deliveryDate).toLocaleDateString()}</span>
            </div>
          )}
        </div>

        {/* COMPLETED DESIGN ITEM MODE: Final Design Artwork as MAIN image */}
        {designAttachment ? (
          <div className="space-y-3">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-primary uppercase tracking-wider block flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-primary" /> Final Design:
              </label>

              <ImageLightbox
                src={designAttachment.fileUrl}
                alt="Final Design Artwork"
                className="w-full h-48 rounded-2xl"
              />
            </div>

            {refAttachment && (
              <div className="p-3 rounded-2xl bg-muted/60 border border-border flex items-center justify-between text-xs text-foreground">
                <div className="flex items-center gap-2.5">
                  <ImageLightbox
                    src={refAttachment.fileUrl}
                    alt="Customer Reference Photo"
                    className="w-9 h-9 rounded-lg"
                  />
                  <span className="text-muted-foreground font-semibold">Customer Reference Photo</span>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* PENDING DESIGN ITEM MODE: Customer Reference Photo */
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5 text-primary" /> Customer Reference Photo:
              </label>

              {refAttachment ? (
                <ImageLightbox
                  src={refAttachment.fileUrl}
                  alt="Customer reference photo"
                  className="w-full h-44 rounded-2xl"
                />
              ) : (
                <div className="h-28 rounded-2xl bg-muted/60 border border-border flex items-center justify-center text-muted-foreground text-xs">
                  No reference photo provided
                </div>
              )}
            </div>

            {!readOnly && (
              <form onSubmit={handleUploadSubmit} className="space-y-3 pt-2 border-t border-border">
                <input type="hidden" name="orderItemId" value={item.id} />

                {errorMsg && (
                  <div className="text-xs text-destructive flex items-center gap-1 font-medium">
                    <AlertCircle className="w-3.5 h-3.5" /> {errorMsg}
                  </div>
                )}

                <div>
                  <label className="text-[11px] font-bold text-primary uppercase tracking-wider block mb-1">
                    Upload Final Design File *
                  </label>
                  <Input
                    type="url"
                    name="designFileUrl"
                    value={designUrl}
                    onChange={(e) => setDesignUrl(e.target.value)}
                    required
                    placeholder="Paste final design SVG / PNG file URL"
                  />
                </div>

                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="text-[10px]"
                    onClick={() =>
                      setDesignUrl('https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=600')
                    }
                  >
                    Sample Design Mock
                  </Button>
                </div>

                <Button
                  type="submit"
                  disabled={isPending}
                  className="w-full"
                >
                  {isPending ? (
                    <span className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                      Uploading design...
                    </span>
                  ) : (
                    <>
                      <UploadCloud className="w-4 h-4 mr-2" />
                      <span>Upload &amp; Send to Production Queue</span>
                    </>
                  )}
                </Button>
              </form>
            )}
          </div>
        )}

      </div>
    </Card>
  )
}
