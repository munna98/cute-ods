'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { DEMO_USERS, getRoleDefaultPath, Role } from '@/lib/auth-constants'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Baby, 
  Users, 
  Palette, 
  Factory, 
  ShieldCheck, 
  ArrowRight, 
  Sparkles,
  Lock
} from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [selectedUser, setSelectedUser] = useState(DEMO_USERS[0])
  const [loading, setLoading] = useState(false)

  const handleLogin = (userToLogin = selectedUser) => {
    setLoading(true)
    document.cookie = `ods_user_id=${userToLogin.id}; path=/`
    document.cookie = `ods_user_role=${userToLogin.role}; path=/`

    setTimeout(() => {
      const redirectPath = getRoleDefaultPath(userToLogin.role)
      router.push(redirectPath)
      router.refresh()
    }, 400)
  }

  const getRoleIcon = (role: Role) => {
    switch (role) {
      case Role.SALES:
        return <Users className="w-5 h-5 text-primary" />
      case Role.DESIGN:
        return <Palette className="w-5 h-5 text-primary" />
      case Role.PRODUCTION:
        return <Factory className="w-5 h-5 text-primary" />
      case Role.ADMIN:
        return <ShieldCheck className="w-5 h-5 text-primary" />
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-background">
      <div className="w-full max-w-xl">
        
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-primary p-0.5 shadow-md mb-4">
            <div className="w-full h-full bg-card rounded-[22px] flex items-center justify-center">
              <Baby className="w-8 h-8 text-primary" />
            </div>
          </div>
          <h1 className="text-3xl font-extrabold text-foreground tracking-tight">
            Baby Outfit <span className="gradient-text">ODS</span>
          </h1>
          <p className="text-sm text-muted-foreground mt-2 max-w-md mx-auto font-medium">
            Internal Order Pipeline Management System — Sales, Design &amp; Production Coordination
          </p>
        </div>

        {/* Card */}
        <Card className="shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none">
            <Sparkles className="w-32 h-32 text-primary" />
          </div>

          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <Lock className="w-4 h-4 text-primary" /> Select Internal Team Profile
              </CardTitle>
              <CardDescription>
                Role permissions are enforced via Supabase Postgres RLS
              </CardDescription>
            </div>
            <Badge variant="outline">
              Supabase Auth RLS
            </Badge>
          </CardHeader>

          <CardContent className="pt-6">
            {/* Role Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mb-8">
              {DEMO_USERS.map((user) => {
                const isSelected = selectedUser.id === user.id
                return (
                  <button
                    key={user.id}
                    type="button"
                    onClick={() => {
                      setSelectedUser(user)
                      handleLogin(user)
                    }}
                    className={`flex items-start gap-3.5 p-4 rounded-2xl border text-left transition-all duration-200 group relative ${
                      isSelected
                        ? 'ring-2 ring-primary border-primary bg-accent text-accent-foreground shadow-xs'
                        : 'border-border bg-card text-card-foreground hover:bg-muted'
                    }`}
                  >
                    <div className="p-2.5 rounded-xl bg-card border border-border shadow-2xs">
                      {getRoleIcon(user.role)}
                    </div>
                    <div>
                      <div className="font-bold text-sm text-foreground group-hover:text-primary transition-colors">
                        {user.name}
                      </div>
                      <div className="text-xs text-muted-foreground font-mono font-semibold mt-0.5">
                        {user.role} TEAM
                      </div>
                    </div>
                    <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <ArrowRight className="w-4 h-4 text-muted-foreground" />
                    </div>
                  </button>
                )
              })}
            </div>

            {/* Quick Launch Action Button */}
            <Button
              onClick={() => handleLogin()}
              disabled={loading}
              size="lg"
              className="w-full"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                  Authenticating session...
                </span>
              ) : (
                <>
                  <span>Enter Pipeline Queue as {selectedUser.name}</span>
                  <ArrowRight className="w-5 h-5 ml-2" />
                </>
              )}
            </Button>

            <div className="mt-6 text-center text-xs text-muted-foreground flex items-center justify-center gap-2 font-medium">
              <span>Enforced by Postgres Row Level Security (RLS)</span>
            </div>
          </CardContent>

        </Card>

      </div>
    </div>
  )
}
