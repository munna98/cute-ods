import { prisma } from './prisma'
import { Role, LeadSource, ItemStatus, AttachmentKind } from '@prisma/client'

export interface LeadItem {
  id: string
  customerName: string
  contact: string
  source: LeadSource
  salespersonId: string
  salespersonName?: string
  convertedOrderId?: string | null
  createdAt: Date
}

export interface ProductItem {
  id: string
  name: string
}

export interface InventoryItem {
  id: string
  name: string
  color: string | null
  size: string | null
  stockQty: number
}

export interface AttachmentItem {
  id: string
  orderItemId: string
  kind: AttachmentKind
  fileUrl: string
  uploadedById: string
  uploadedByName?: string
  createdAt: Date
}

export interface ConsumedMaterialDetail {
  id: string
  inventoryId: string
  inventoryName: string
  inventoryColor: string | null
  inventorySize: string | null
  qty: number
}

export interface OrderItemDetail {
  id: string
  orderId: string
  productId: string
  productName: string
  materials: ConsumedMaterialDetail[]
  qty: number
  status: ItemStatus
  attachments: AttachmentItem[]
  updatedAt: Date
}

export interface OrderDetail {
  id: string
  leadId: string
  customerName: string
  contact: string
  salespersonId: string
  salespersonName: string
  deliveryDate: Date | null
  deliveryAddress: string | null
  items: OrderItemDetail[]
  createdAt: Date
  isCompleted: boolean
}

// In-Memory store for instant preview & fallback
let memoryLeads: LeadItem[] = [
  {
    id: 'lead_1',
    customerName: 'Emma Watson',
    contact: '+1 555-0192 (Instagram @emma_baby)',
    source: LeadSource.INSTAGRAM,
    salespersonId: 'usr_sales_1',
    salespersonName: 'Sarah Salesperson',
    convertedOrderId: 'order_1',
    createdAt: new Date(Date.now() - 86400000 * 2),
  },
  {
    id: 'lead_2',
    customerName: 'Liam Hemsworth',
    contact: 'whatsapp:+15550184',
    source: LeadSource.WHATSAPP,
    salespersonId: 'usr_sales_1',
    salespersonName: 'Sarah Salesperson',
    convertedOrderId: null,
    createdAt: new Date(Date.now() - 86400000),
  },
]

let memoryProducts: ProductItem[] = [
  { id: 'prod_1', name: 'Kids Half Set' },
  { id: 'prod_2', name: 'Romper Suit' },
  { id: 'prod_3', name: 'Party Frock' },
]

let memoryInventory: InventoryItem[] = [
  { id: 'inv_bow_pink_large', name: 'Bow', color: 'Pink', size: 'Large', stockQty: 25 },
  { id: 'inv_bow_red_small', name: 'Bow', color: 'Red', size: 'Small', stockQty: 12 },
  { id: 'inv_bow_gold_med', name: 'Bow', color: 'Gold', size: 'Medium', stockQty: 0 },
  { id: 'inv_ribbon_white', name: 'Silk Ribbon', color: 'White', size: '2m', stockQty: 30 },
  { id: 'inv_patch_bear', name: 'Embroidered Bear Patch', color: 'Brown', size: 'One-Size', stockQty: 15 },
  { id: 'inv_flower_gold', name: 'Satin Flower Accent', color: 'Gold', size: 'Medium', stockQty: 8 },
]

let memoryOrders: OrderDetail[] = [
  {
    id: 'order_1',
    leadId: 'lead_1',
    customerName: 'Emma Watson',
    contact: '+1 555-0192 (Instagram @emma_baby)',
    salespersonId: 'usr_sales_1',
    salespersonName: 'Sarah Salesperson',
    deliveryDate: new Date(Date.now() + 86400000 * 5),
    deliveryAddress: '742 Evergreen Terrace, Springfield',
    createdAt: new Date(Date.now() - 86400000 * 2),
    isCompleted: false,
    items: [
      {
        id: 'item_1',
        orderId: 'order_1',
        productId: 'prod_1',
        productName: 'Kids Half Set',
        qty: 1,
        materials: [
          {
            id: 'mat_1',
            inventoryId: 'inv_bow_pink_large',
            inventoryName: 'Bow',
            inventoryColor: 'Pink',
            inventorySize: 'Large',
            qty: 1,
          },
          {
            id: 'mat_2',
            inventoryId: 'inv_ribbon_white',
            inventoryName: 'Silk Ribbon',
            inventoryColor: 'White',
            inventorySize: '2m',
            qty: 2,
          },
        ],
        status: ItemStatus.PENDING_DESIGN,
        attachments: [
          {
            id: 'att_1',
            orderItemId: 'item_1',
            kind: AttachmentKind.REFERENCE,
            fileUrl: 'https://images.unsplash.com/photo-1519689680058-324335c77eba?w=600',
            uploadedById: 'usr_sales_1',
            uploadedByName: 'Sarah Salesperson',
            createdAt: new Date(Date.now() - 86400000 * 2),
          },
        ],
        updatedAt: new Date(Date.now() - 86400000 * 2),
      },
    ],
  },
]

// --- API Functions ---

export async function getLeads(): Promise<LeadItem[]> {
  try {
    const leads = await prisma.lead.findMany({
      include: { salesperson: true, order: true },
      orderBy: { createdAt: 'desc' },
    })
    if (leads.length > 0) {
      return leads.map(l => ({
        id: l.id,
        customerName: l.customerName,
        contact: l.contact,
        source: l.source,
        salespersonId: l.salespersonId,
        salespersonName: l.salesperson.name,
        convertedOrderId: l.order?.id || null,
        createdAt: l.createdAt,
      }))
    }
  } catch {
    // fallback
  }
  return memoryLeads
}

export async function createLead(data: {
  customerName: string
  contact: string
  source: LeadSource
  salespersonId: string
}): Promise<LeadItem> {
  try {
    const newLead = await prisma.lead.create({
      data: {
        customerName: data.customerName,
        contact: data.contact,
        source: data.source,
        salespersonId: data.salespersonId,
      },
      include: { salesperson: true },
    })
    return {
      id: newLead.id,
      customerName: newLead.customerName,
      contact: newLead.contact,
      source: newLead.source,
      salespersonId: newLead.salespersonId,
      salespersonName: newLead.salesperson.name,
      convertedOrderId: null,
      createdAt: newLead.createdAt,
    }
  } catch {
    const newLead: LeadItem = {
      id: `lead_${Date.now()}`,
      customerName: data.customerName,
      contact: data.contact,
      source: data.source,
      salespersonId: data.salespersonId,
      salespersonName: 'Salesperson',
      convertedOrderId: null,
      createdAt: new Date(),
    }
    memoryLeads.unshift(newLead)
    return newLead
  }
}

export async function getProducts(): Promise<ProductItem[]> {
  try {
    const products = await prisma.product.findMany()
    if (products.length > 0) return products
  } catch {
    // fallback
  }
  return memoryProducts
}

export async function getInventoryMaterials(): Promise<InventoryItem[]> {
  try {
    const items = await prisma.inventory.findMany({
      orderBy: { name: 'asc' },
    })
    if (items.length > 0) {
      return items.map(i => ({
        id: i.id,
        name: i.name,
        color: i.color,
        size: i.size,
        stockQty: i.stockQty,
      }))
    }
  } catch {
    // fallback
  }
  return memoryInventory
}

/**
 * Atomic Order Creation with Stock Deduction for 1 Product Outfit consuming Multiple Materials
 */
export async function createOrderWithStockDeduction(params: {
  leadId: string
  salespersonId: string
  deliveryDate?: string
  deliveryAddress?: string
  productId: string
  materials: Array<{ inventoryId: string; qty: number }>
  referenceFileUrl?: string
}): Promise<OrderDetail> {
  // Stock pre-check for each consumed material
  for (const mat of params.materials) {
    let stock = 0
    try {
      const inv = await prisma.inventory.findUnique({ where: { id: mat.inventoryId } })
      stock = inv?.stockQty ?? 0
    } catch {
      const minv = memoryInventory.find(i => i.id === mat.inventoryId)
      stock = minv?.stockQty ?? 0
    }

    if (stock < mat.qty) {
      throw new Error(`Insufficient stock available for material! Requested: ${mat.qty}, Available: ${stock}`)
    }
  }

  // Execute DB transaction
  try {
    const result = await prisma.$transaction(async (tx) => {
      // 1. Create Order
      const order = await tx.order.create({
        data: {
          leadId: params.leadId,
          salespersonId: params.salespersonId,
          deliveryDate: params.deliveryDate ? new Date(params.deliveryDate) : null,
          deliveryAddress: params.deliveryAddress || null,
        },
        include: { lead: true, salesperson: true },
      })

      // 2. Create single OrderItem for the Product Outfit
      const product = await tx.product.findUnique({ where: { id: params.productId } })
      const orderItem = await tx.orderItem.create({
        data: {
          orderId: order.id,
          productId: params.productId,
          qty: 1,
          status: ItemStatus.PENDING_DESIGN,
        },
      })

      // 3. Process each Consumed Material & deduct stock
      const createdMaterials: ConsumedMaterialDetail[] = []
      for (const mat of params.materials) {
        const updatedInv = await tx.inventory.update({
          where: { id: mat.inventoryId },
          data: { stockQty: { decrement: mat.qty } },
        })

        const itemMat = await tx.orderItemMaterial.create({
          data: {
            orderItemId: orderItem.id,
            inventoryId: mat.inventoryId,
            qty: mat.qty,
          },
        })

        createdMaterials.push({
          id: itemMat.id,
          inventoryId: updatedInv.id,
          inventoryName: updatedInv.name,
          inventoryColor: updatedInv.color,
          inventorySize: updatedInv.size,
          qty: mat.qty,
        })
      }

      // 4. Attach Reference Photo
      const attachments: AttachmentItem[] = []
      if (params.referenceFileUrl) {
        const att = await tx.attachment.create({
          data: {
            orderItemId: orderItem.id,
            kind: AttachmentKind.REFERENCE,
            fileUrl: params.referenceFileUrl,
            uploadedById: params.salespersonId,
          },
        })
        attachments.push({
          id: att.id,
          orderItemId: att.orderItemId,
          kind: att.kind,
          fileUrl: att.fileUrl,
          uploadedById: att.uploadedById,
          createdAt: att.createdAt,
        })
      }

      const itemDetail: OrderItemDetail = {
        id: orderItem.id,
        orderId: order.id,
        productId: params.productId,
        productName: product?.name || 'Made-to-Order Outfit',
        materials: createdMaterials,
        qty: orderItem.qty,
        status: orderItem.status,
        attachments,
        updatedAt: orderItem.updatedAt,
      }

      return {
        id: order.id,
        leadId: order.leadId,
        customerName: order.lead.customerName,
        contact: order.lead.contact,
        salespersonId: order.salespersonId,
        salespersonName: order.salesperson.name,
        deliveryDate: order.deliveryDate,
        deliveryAddress: order.deliveryAddress,
        items: [itemDetail],
        createdAt: order.createdAt,
        isCompleted: false,
      }
    })
    return result
  } catch (err: any) {
    if (err.message && err.message.includes('Insufficient stock')) {
      throw err
    }

    // Fallback in-memory simulation
    const orderId = `order_${Date.now()}`
    const lead = memoryLeads.find(l => l.id === params.leadId)
    if (lead) lead.convertedOrderId = orderId

    const itemId = `item_${Date.now()}`
    const prod = memoryProducts.find(p => p.id === params.productId)

    const createdMaterials: ConsumedMaterialDetail[] = []
    for (const mat of params.materials) {
      const inv = memoryInventory.find(i => i.id === mat.inventoryId)
      if (inv) inv.stockQty = Math.max(0, inv.stockQty - mat.qty)

      createdMaterials.push({
        id: `mat_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
        inventoryId: mat.inventoryId,
        inventoryName: inv?.name || 'Material Accent',
        inventoryColor: inv?.color || null,
        inventorySize: inv?.size || null,
        qty: mat.qty,
      })
    }

    const attachments: AttachmentItem[] = []
    if (params.referenceFileUrl) {
      attachments.push({
        id: `att_${Date.now()}`,
        orderItemId: itemId,
        kind: AttachmentKind.REFERENCE,
        fileUrl: params.referenceFileUrl,
        uploadedById: params.salespersonId,
        createdAt: new Date(),
      })
    }

    const newOrderItem: OrderItemDetail = {
      id: itemId,
      orderId,
      productId: params.productId,
      productName: prod ? prod.name : 'Made-to-Order Outfit',
      materials: createdMaterials,
      qty: 1,
      status: ItemStatus.PENDING_DESIGN,
      attachments,
      updatedAt: new Date(),
    }

    const newOrder: OrderDetail = {
      id: orderId,
      leadId: params.leadId,
      customerName: lead?.customerName || 'Customer',
      contact: lead?.contact || '',
      salespersonId: params.salespersonId,
      salespersonName: 'Salesperson',
      deliveryDate: params.deliveryDate ? new Date(params.deliveryDate) : null,
      deliveryAddress: params.deliveryAddress || null,
      items: [newOrderItem],
      createdAt: new Date(),
      isCompleted: false,
    }
    memoryOrders.unshift(newOrder)
    return newOrder
  }
}

export async function getOrders(): Promise<OrderDetail[]> {
  try {
    const orders = await prisma.order.findMany({
      include: {
        lead: true,
        salesperson: true,
        items: {
          include: {
            product: true,
            materials: {
              include: { inventory: true },
            },
            attachments: {
              include: { uploadedBy: true },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    if (orders.length > 0) {
      return orders.map(o => {
        const items: OrderItemDetail[] = o.items.map(i => ({
          id: i.id,
          orderId: i.orderId,
          productId: i.productId,
          productName: i.product.name,
          materials: i.materials.map(m => ({
            id: m.id,
            inventoryId: m.inventoryId,
            inventoryName: m.inventory.name,
            inventoryColor: m.inventory.color,
            inventorySize: m.inventory.size,
            qty: m.qty,
          })),
          qty: i.qty,
          status: i.status,
          attachments: i.attachments.map(a => ({
            id: a.id,
            orderItemId: a.orderItemId,
            kind: a.kind,
            fileUrl: a.fileUrl,
            uploadedById: a.uploadedById,
            uploadedByName: a.uploadedBy?.name,
            createdAt: a.createdAt,
          })),
          updatedAt: i.updatedAt,
        }))

        const isCompleted = items.length > 0 && items.every(i => i.status === ItemStatus.COMPLETED)

        return {
          id: o.id,
          leadId: o.leadId,
          customerName: o.lead.customerName,
          contact: o.lead.contact,
          salespersonId: o.salespersonId,
          salespersonName: o.salesperson.name,
          deliveryDate: o.deliveryDate,
          deliveryAddress: o.deliveryAddress,
          items,
          createdAt: o.createdAt,
          isCompleted,
        }
      })
    }
  } catch {
    // fallback
  }

  return memoryOrders.map(o => ({
    ...o,
    isCompleted: o.items.length > 0 && o.items.every(i => i.status === ItemStatus.COMPLETED),
  }))
}

export async function updateDesignAttachment(params: {
  orderItemId: string
  designFileUrl: string
  designerId: string
}): Promise<void> {
  try {
    await prisma.$transaction([
      prisma.orderItem.update({
        where: { id: params.orderItemId },
        data: { status: ItemStatus.DESIGN_COMPLETE },
      }),
      prisma.attachment.create({
        data: {
          orderItemId: params.orderItemId,
          kind: AttachmentKind.DESIGN,
          fileUrl: params.designFileUrl,
          uploadedById: params.designerId,
        },
      }),
    ])
    return
  } catch {
    for (const order of memoryOrders) {
      const item = order.items.find(i => i.id === params.orderItemId)
      if (item) {
        item.status = ItemStatus.DESIGN_COMPLETE
        item.updatedAt = new Date()
        item.attachments.push({
          id: `att_${Date.now()}`,
          orderItemId: params.orderItemId,
          kind: AttachmentKind.DESIGN,
          fileUrl: params.designFileUrl,
          uploadedById: params.designerId,
          uploadedByName: 'Designer',
          createdAt: new Date(),
        })
        break
      }
    }
  }
}

export async function markItemProductionComplete(params: {
  orderItemId: string
}): Promise<void> {
  try {
    await prisma.orderItem.update({
      where: { id: params.orderItemId },
      data: { status: ItemStatus.COMPLETED },
    })
    return
  } catch {
    for (const order of memoryOrders) {
      const item = order.items.find(i => i.id === params.orderItemId)
      if (item) {
        item.status = ItemStatus.COMPLETED
        item.updatedAt = new Date()
        break
      }
    }
  }
}
