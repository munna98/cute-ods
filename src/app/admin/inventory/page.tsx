import React from 'react'
import { getCurrentUser } from '@/lib/auth'
import { getInventoryMaterials } from '@/lib/store'
import { Header } from '@/components/Header'
import { 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  Package,
  TrendingDown
} from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function AdminInventoryPage() {
  const currentUser = await getCurrentUser()
  const materials = await getInventoryMaterials()

  const materialGroups = new Map<string, typeof materials>()
  materials.forEach((m) => {
    const list = materialGroups.get(m.name) || []
    list.push(m)
    materialGroups.set(m.name, list)
  })

  return (
    <div className="min-h-screen pb-16 bg-slate-50/50">
      <Header currentUser={currentUser} />

      <main className="max-w-7xl mx-auto px-4 lg:px-8 pt-8">
        
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 text-purple-700 text-sm font-bold mb-1">
              <ShieldCheck className="w-4 h-4 text-purple-600" /> Admin Inventory Control
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Raw Materials &amp; Accents Inventory
            </h1>
            <p className="text-slate-500 text-sm mt-1 font-medium">
              Live material inventory tracking (Bows, Ribbons, Patches, Flowers). Stock automatically deducts upon order locking.
            </p>
          </div>
        </div>

        {/* Material Groups */}
        <div className="space-y-8">
          {Array.from(materialGroups.entries()).map(([materialName, materialVariants]) => (
            <div key={materialName} className="glass-card rounded-3xl overflow-hidden shadow-xs">
              <div className="p-5 border-b border-slate-100 bg-slate-50/70 flex items-center justify-between">
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Package className="w-5 h-5 text-purple-600" />
                  <span>{materialName} Material</span>
                </h2>
                <span className="text-xs font-mono text-slate-500 font-semibold">
                  {materialVariants.length} color/size variants
                </span>
              </div>

              <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {materialVariants.map((m) => {
                  const isOutOfStock = m.stockQty <= 0
                  const isLowStock = m.stockQty > 0 && m.stockQty <= 10

                  return (
                    <div
                      key={m.id}
                      className={`p-4 rounded-2xl border transition-all ${
                        isOutOfStock
                          ? 'bg-rose-50 border-rose-200 text-rose-900'
                          : isLowStock
                          ? 'bg-amber-50 border-amber-200 text-amber-900'
                          : 'bg-white border-slate-200 text-slate-800 shadow-2xs'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-bold text-sm text-slate-900">
                          Color: {m.color || 'Standard'}
                        </span>
                        <span className="text-xs font-mono px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-bold">
                          Size: {m.size || 'N/A'}
                        </span>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                        <span className="text-xs text-slate-500 font-medium">Material Stock:</span>
                        <div className="flex items-center gap-1.5">
                          {isOutOfStock ? (
                            <span className="px-2.5 py-1 rounded-full text-xs font-mono font-extrabold bg-rose-100 text-rose-800 border border-rose-300 flex items-center gap-1">
                              <AlertTriangle className="w-3.5 h-3.5" /> Out of Stock (0)
                            </span>
                          ) : isLowStock ? (
                            <span className="px-2.5 py-1 rounded-full text-xs font-mono font-extrabold bg-amber-100 text-amber-800 border border-amber-300 flex items-center gap-1">
                              <TrendingDown className="w-3.5 h-3.5" /> Low Stock ({m.stockQty})
                            </span>
                          ) : (
                            <span className="px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> {m.stockQty} units
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>

      </main>
    </div>
  )
}
