import React from 'react'
import { getCurrentUser } from '@/lib/auth'
import { getLeads, createLead } from '@/lib/store'
import { Header } from '@/components/Header'
import Link from 'next/link'
import { LeadSource } from '@prisma/client'
import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { 
  Users, 
  Plus, 
  Camera, 
  MessageSquare, 
  Share2, 
  Globe, 
  ArrowRight, 
  CheckCircle2, 
  Calendar
} from 'lucide-react'
import { revalidatePath } from 'next/cache'

export const dynamic = 'force-dynamic'

export default async function LeadsPage() {
  const currentUser = await getCurrentUser()
  const leads = await getLeads()

  async function handleCreateLead(formData: FormData) {
    'use server'
    const customerName = formData.get('customerName') as string
    const contact = formData.get('contact') as string
    const source = formData.get('source') as LeadSource

    if (customerName && contact && source) {
      const user = await getCurrentUser()
      await createLead({
        customerName,
        contact,
        source,
        salespersonId: user.id,
      })
      revalidatePath('/sales/leads')
    }
  }

  const getSourceBadge = (source: LeadSource) => {
    switch (source) {
      case LeadSource.INSTAGRAM:
        return (
          <Badge variant="accent" className="flex items-center gap-1.5 font-semibold">
            <Camera className="w-3.5 h-3.5 text-rose-500" /> Instagram
          </Badge>
        )
      case LeadSource.WHATSAPP:
        return (
          <Badge variant="success" className="flex items-center gap-1.5 font-semibold">
            <MessageSquare className="w-3.5 h-3.5 text-emerald-600" /> WhatsApp
          </Badge>
        )
      case LeadSource.REFERRAL:
        return (
          <Badge variant="default" className="flex items-center gap-1.5 font-semibold">
            <Share2 className="w-3.5 h-3.5" /> Referral
          </Badge>
        )
      default:
        return (
          <Badge variant="outline" className="flex items-center gap-1.5 font-semibold">
            <Globe className="w-3.5 h-3.5 text-slate-500" /> Other
          </Badge>
        )
    }
  }

  const sourceOptions = [
    { 
      value: LeadSource.INSTAGRAM, 
      label: 'Instagram', 
      icon: <Camera className="w-4 h-4 text-rose-500" /> 
    },
    { 
      value: LeadSource.WHATSAPP, 
      label: 'WhatsApp', 
      icon: <MessageSquare className="w-4 h-4 text-emerald-600" /> 
    },
    { 
      value: LeadSource.REFERRAL, 
      label: 'Referral', 
      icon: <Share2 className="w-4 h-4 text-purple-600" /> 
    },
    { 
      value: LeadSource.OTHER, 
      label: 'Other', 
      icon: <Globe className="w-4 h-4 text-slate-500" /> 
    },
  ]

  return (
    <div className="min-h-screen pb-16 bg-background">
      <Header currentUser={currentUser} />

      <main className="max-w-7xl mx-auto px-4 lg:px-8 pt-8">
        
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 text-primary text-sm font-bold mb-1">
              <Users className="w-4 h-4" /> Sales Pipeline — Stage 1
            </div>
            <h1 className="text-3xl font-extrabold text-foreground tracking-tight">
              Customer Leads Capture
            </h1>
            <p className="text-muted-foreground text-sm mt-1 font-medium">
              Log incoming inquiries from social media and convert qualified leads into outfit orders.
            </p>
          </div>
        </div>

        {/* Layout Grid: Create Lead Form + Leads List */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Create Lead Sidebar Card */}
          <div className="lg:col-span-4">
            <Card className="p-6 sticky top-24">
              <div className="flex items-center gap-2 text-lg font-bold text-foreground mb-4 pb-3 border-b border-border">
                <Plus className="w-5 h-5 text-primary" /> Log New Lead
              </div>

              <form action={handleCreateLead} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-foreground uppercase tracking-wider mb-1.5">
                    Customer Name *
                  </label>
                  <Input
                    type="text"
                    name="customerName"
                    required
                    placeholder="e.g. Maria Sharapova"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-foreground uppercase tracking-wider mb-1.5">
                    Contact Info / Handle *
                  </label>
                  <Input
                    type="text"
                    name="contact"
                    required
                    placeholder="e.g. Instagram @maria_baby or WhatsApp +123456"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-foreground uppercase tracking-wider mb-1.5">
                    Lead Source *
                  </label>
                  <Select
                    name="source"
                    options={sourceOptions}
                    placeholder="Select lead source..."
                    required
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full mt-2"
                >
                  <Plus className="w-4 h-4 mr-2" /> Save Customer Lead
                </Button>
              </form>
            </Card>
          </div>

          {/* Leads List Table */}
          <div className="lg:col-span-8">
            <Card className="overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <span>Recent Pipeline Leads</span>
                  <Badge variant="secondary">
                    {leads.length} total
                  </Badge>
                </CardTitle>
              </CardHeader>

              <div className="divide-y divide-border">
                {leads.length === 0 ? (
                  <div className="p-12 text-center text-muted-foreground">
                    <Users className="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
                    <p>No customer leads logged yet. Use the form on the left to capture your first lead!</p>
                  </div>
                ) : (
                  leads.map((lead) => (
                    <div
                      key={lead.id}
                      className="p-5 hover:bg-muted/50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-3">
                          <span className="font-bold text-base text-foreground">
                            {lead.customerName}
                          </span>
                          {getSourceBadge(lead.source)}
                        </div>
                        <p className="text-xs text-muted-foreground font-mono">
                          {lead.contact}
                        </p>
                        <div className="flex items-center gap-3 text-[11px] text-muted-foreground pt-1 font-medium">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-muted-foreground" />
                            {new Date(lead.createdAt).toLocaleDateString(undefined, {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                          <span>•</span>
                          <span>Logged by {lead.salespersonName || 'Sales'}</span>
                        </div>
                      </div>

                      {/* Convert Button or Converted Badge */}
                      <div className="flex items-center gap-2">
                        {lead.convertedOrderId ? (
                          <Badge variant="success" className="py-1.5 px-3 flex items-center gap-1.5">
                            <CheckCircle2 className="w-4 h-4" /> Converted to Order
                          </Badge>
                        ) : (
                          <Link href={`/sales/orders/new?leadId=${lead.id}`}>
                            <Button size="sm" className="flex items-center gap-2">
                              <span>Convert to Order</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </Button>
                          </Link>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>

            </Card>
          </div>

        </div>

      </main>
    </div>
  )
}
