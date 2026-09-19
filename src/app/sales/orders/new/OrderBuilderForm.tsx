'use client'

import React, { useState, useTransition } from 'react'
import { LeadItem, ProductItem, InventoryItem } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { 
  ShoppingBag, 
  CheckCircle2, 
  AlertCircle, 
  Calendar, 
  MapPin, 
  PackageCheck,
  ImageIcon,
  Sparkles,
  Package,
  Plus,
  Trash2
} from 'lucide-react'

interface OrderBuilderFormProps {
  leads: LeadItem[]
  products: ProductItem[]
  inventoryMaterials: InventoryItem[]
  preselectedLeadId?: string
  onSubmitAction: (formData: FormData) => Promise<void>
}

interface MaterialRow {
  id: string
  inventoryId: string
  qty: number
}

export function OrderBuilderForm({
  leads,
  products,
  inventoryMaterials,
  preselectedLeadId,
  onSubmitAction,
}: OrderBuilderFormProps) {
  const [isPending, startTransition] = useTransition()
  const [selectedLeadId, setSelectedLeadId] = useState(
    preselectedLeadId || (leads.length > 0 ? leads[0].id : '')
  )
  const [selectedProductId, setSelectedProductId] = useState(
    products.length > 0 ? products[0].id : ''
  )
  
  // State for multiple consumed material rows
  const [materialRows, setMaterialRows] = useState<MaterialRow[]>([
    { id: 'row_1', inventoryId: '', qty: 1 }
  ])

  const [referenceUrl, setReferenceUrl] = useState('')
  const [errorMsg, setErrorMsg] = useState('')

  const inStockMaterials = inventoryMaterials.filter((i) => i.stockQty > 0)

  const leadOptions = leads.map((l) => ({
    value: l.id,
    label: l.customerName,
    description: `Contact: ${l.contact} ${l.convertedOrderId ? '• [Already Converted]' : ''}`,
    disabled: !!l.convertedOrderId,
  }))

  const productOptions = products.map((p) => ({
    value: p.id,
    label: p.name,
    description: "Made-to-Order Outfit",
    icon: <Sparkles className="w-4 h-4 text-primary" />,
  }))

  const getColorSwatchClass = (colorName?: string | null) => {
    const c = (colorName || '').toLowerCase()
    if (c.includes('pink') || c.includes('rose')) return 'bg-pink-400'
    if (c.includes('white') || c.includes('ivory')) return 'bg-slate-200 border-slate-300'
    if (c.includes('gold') || c.includes('yellow')) return 'bg-amber-400'
    if (c.includes('blue') || c.includes('navy')) return 'bg-blue-500'
    if (c.includes('red')) return 'bg-red-500'
    if (c.includes('green')) return 'bg-emerald-500'
    if (c.includes('purple')) return 'bg-purple-500'
    return 'bg-primary'
  }

  // Prevent duplicate material selection across rows
  const getMaterialOptionsForRow = (currentRowId: string) => {
    const selectedInOtherRows = materialRows
      .filter((r) => r.id !== currentRowId && r.inventoryId)
      .map((r) => r.inventoryId)

    return inStockMaterials.map((m) => {
      const isAlreadySelected = selectedInOtherRows.includes(m.id)
      return {
        value: m.id,
        label: `${m.name} (${m.color || 'Standard'}) ${isAlreadySelected ? '[Already Selected]' : ''}`,
        description: `Size: ${m.size || 'N/A'} ${isAlreadySelected ? '• Selected in another row' : ''}`,
        disabled: isAlreadySelected,
        icon: (
          <div className={`w-3.5 h-3.5 rounded-full ${getColorSwatchClass(m.color)} border border-border shadow-2xs shrink-0 ${isAlreadySelected ? 'opacity-40' : ''}`} />
        ),
        badge: (
          <Badge variant={isAlreadySelected ? "outline" : m.stockQty > 5 ? "success" : "warning"} className="text-[10px] font-mono px-2 py-0.5 flex items-center gap-1">
            <Package className="w-3 h-3" /> {isAlreadySelected ? 'Selected' : m.stockQty}
          </Badge>
        ),
      }
    })
  }

  // Dynamic Row Handlers
  const addMaterialRow = () => {
    if (materialRows.length < inStockMaterials.length) {
      setMaterialRows([
        ...materialRows,
        { id: `row_${Date.now()}`, inventoryId: '', qty: 1 }
      ])
    }
  }

  const removeMaterialRow = (rowId: string) => {
    if (materialRows.length > 1) {
      setMaterialRows(materialRows.filter((r) => r.id !== rowId))
    }
  }

  const updateMaterialRow = (rowId: string, field: 'inventoryId' | 'qty', val: any) => {
    setMaterialRows(
      materialRows.map((r) => (r.id === rowId ? { ...r, [field]: val } : r))
    )
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setErrorMsg('')

    if (!selectedLeadId) {
      setErrorMsg('Please select a customer lead.')
      return
    }

    if (!selectedProductId) {
      setErrorMsg('Please select a product.')
      return
    }

    // Validate material rows
    const validRows = materialRows.filter((r) => r.inventoryId && r.qty > 0)
    if (validRows.length === 0) {
      setErrorMsg('Please select at least one consumed material.')
      return
    }

    // Ensure no duplicate inventoryIds exist in submitted payload
    const submittedMaterialIds = validRows.map((r) => r.inventoryId)
    const hasDuplicates = new Set(submittedMaterialIds).size !== submittedMaterialIds.length
    if (hasDuplicates) {
      setErrorMsg('Duplicate material selections detected! Each material can only be selected once.')
      return
    }

    for (const r of validRows) {
      const mat = inventoryMaterials.find((i) => i.id === r.inventoryId)
      if (!mat) {
        setErrorMsg('Invalid material selected.')
        return
      }
      if (r.qty > mat.stockQty) {
        setErrorMsg(`Cannot consume ${r.qty} units of ${mat.name} (${mat.color}/${mat.size}). Only ${mat.stockQty} available!`)
        return
      }
    }

    const formData = new FormData(e.currentTarget)
    formData.set('itemsPayload', JSON.stringify(validRows))

    startTransition(async () => {
      try {
        await onSubmitAction(formData)
      } catch (err: any) {
        setErrorMsg(err.message || 'Failed to create order.')
      }
    })
  }

  const canAddMoreRows = materialRows.length < inStockMaterials.length

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      
      {errorMsg && (
        <div className="p-4 rounded-2xl bg-destructive/10 border border-destructive/30 text-destructive text-sm font-medium flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 text-destructive" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Step 1: Customer Lead */}
      <div className="space-y-2">
        <label className="block text-xs font-bold text-foreground uppercase tracking-wider">
          1. Select Customer Lead *
        </label>
        <Select
          name="leadId"
          value={selectedLeadId}
          onChange={(val) => setSelectedLeadId(val)}
          options={leadOptions}
          placeholder="-- Choose a Customer Lead --"
          required
        />
      </div>

      {/* Step 2: Delivery Details */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-foreground uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-primary" /> Target Delivery Date
          </label>
          <Input
            type="date"
            name="deliveryDate"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-foreground uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-primary" /> Delivery Address
          </label>
          <Input
            type="text"
            name="deliveryAddress"
            placeholder="City / Shipping Address"
          />
        </div>
      </div>

      {/* Step 3: Product & Consumed Materials Selection */}
      <div className="p-5 rounded-3xl bg-muted/60 border border-border space-y-4">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-primary uppercase tracking-wider flex items-center gap-2">
            <PackageCheck className="w-4 h-4" /> 2. Product &amp; Consumed Materials Selection
          </label>
          <Badge variant="success" className="flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> Filtering Material stockQty &gt; 0
          </Badge>
        </div>

        {/* Product Selector */}
        <div>
          <label className="block text-xs font-bold text-foreground mb-1">
            Select Product *
          </label>
          <Select
            name="productId"
            value={selectedProductId}
            onChange={(val) => setSelectedProductId(val)}
            options={productOptions}
            placeholder="-- Select Product --"
            required
          />
        </div>

        {/* Dynamic Multiple Consumed Materials Section */}
        <div className="space-y-3 pt-3 border-t border-border">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-bold text-foreground uppercase tracking-wider">
              Select Consumed Material(s) *
            </label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={!canAddMoreRows}
              onClick={addMaterialRow}
              className="text-xs flex items-center gap-1.5 h-8"
            >
              <Plus className="w-3.5 h-3.5 text-primary" />
              <span>{canAddMoreRows ? 'Add Another Material' : 'All Materials Selected'}</span>
            </Button>
          </div>

          <div className="space-y-3">
            {materialRows.map((row, index) => {
              const selectedMat = inventoryMaterials.find((i) => i.id === row.inventoryId)
              const rowOptions = getMaterialOptionsForRow(row.id)

              return (
                <div
                  key={row.id}
                  className="p-4 rounded-2xl bg-card border border-border space-y-3 shadow-2xs"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-bold text-muted-foreground uppercase font-mono">
                      Consumed Material #{index + 1}
                    </span>

                    {materialRows.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeMaterialRow(row.id)}
                        className="h-7 w-7 p-0 text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                    <div className="sm:col-span-8">
                      <Select
                        value={row.inventoryId}
                        onChange={(val) => updateMaterialRow(row.id, 'inventoryId', val)}
                        options={rowOptions}
                        placeholder="-- Select Consumed Material --"
                        required
                      />
                    </div>

                    <div className="sm:col-span-4 flex items-center gap-2">
                      <label className="text-xs font-bold text-foreground uppercase shrink-0">Qty:</label>
                      <Input
                        type="number"
                        min={1}
                        max={selectedMat ? selectedMat.stockQty : 99}
                        value={row.qty}
                        onChange={(e) =>
                          updateMaterialRow(row.id, 'qty', parseInt(e.target.value || '1', 10))
                        }
                        className="text-center font-bold"
                      />
                    </div>
                  </div>

                  {selectedMat && (
                    <div className="pt-1 flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Available Stock:</span>
                      <Badge variant="success" className="font-mono text-[10px] flex items-center gap-1">
                        <Package className="w-3 h-3" /> {selectedMat.name} ({selectedMat.color}/{selectedMat.size}): {selectedMat.stockQty} available
                      </Badge>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

      </div>

      {/* Step 4: Reference Image Upload */}
      <div className="space-y-2">
        <label className="block text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
          <ImageIcon className="w-4 h-4 text-primary" /> 3. Upload Customer Reference Image *
        </label>

        <div className="p-4 rounded-3xl bg-muted/60 border border-border space-y-3">
          <Input
            type="url"
            name="referenceFileUrl"
            value={referenceUrl}
            onChange={(e) => setReferenceUrl(e.target.value)}
            placeholder="Paste reference image URL (or use default baby sample below)"
          />

          <div className="flex flex-wrap gap-2 pt-1">
            <span className="text-xs text-muted-foreground self-center font-medium">Quick Samples:</span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                setReferenceUrl('https://images.unsplash.com/photo-1519689680058-324335c77eba?w=600')
              }
            >
              Sample Floral Outfit
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                setReferenceUrl('https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=600')
              }
            >
              Sample Knit Outfit
            </Button>
          </div>

          {referenceUrl && (
            <div className="mt-3 relative w-32 h-32 rounded-2xl overflow-hidden border border-border bg-card shadow-2xs">
              {/* eslint-disable-next-html-element-suppression */}
              <img
                src={referenceUrl}
                alt="Reference preview"
                className="w-full h-full object-cover"
              />
              <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded-md bg-card/90 text-[10px] text-primary font-mono font-bold border border-border">
                Reference
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        disabled={isPending}
        size="lg"
        className="w-full"
      >
        {isPending ? (
          <span className="flex items-center gap-2">
            <div className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
            Locking Material Stock &amp; Creating Order...
          </span>
        ) : (
          <>
            <ShoppingBag className="w-5 h-5 mr-2" />
            <span>Confirm Order &amp; Lock All Consumed Materials</span>
          </>
        )}
      </Button>

    </form>
  )
}
