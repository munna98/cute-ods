'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { DEMO_USERS, getRoleDefaultPath, Role } from '@/lib/auth-constants'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Baby, 
  Users, 
  ShoppingBag, 
  Palette, 
  Factory, 
  ShieldCheck, 
  LogOut, 
  ChevronDown,
  Sparkles,
  Layers
} from 'lucide-react'

interface HeaderProps {
  currentUser: {
    id: string
    name: string
    role: Role
  }
}

export function Header({ currentUser }: HeaderProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

  const handleRoleSwitch = (user: typeof DEMO_USERS[0]) => {
    document.cookie = `ods_user_id=${user.id}; path=/`
    document.cookie = `ods_user_role=${user.role}; path=/`
    setIsDropdownOpen(false)
    const newPath = getRoleDefaultPath(user.role)
    router.push(newPath)
    router.refresh()
  }

  const getRoleBadgeVariant = (role: Role) => {
    switch (role) {
      case Role.SALES:
        return 'accent'
      case Role.DESIGN:
        return 'secondary'
      case Role.PRODUCTION:
        return 'warning'
      case Role.ADMIN:
        return 'default'
      default:
        return 'outline'
    }
  }

  return (
    <header className="sticky top-0 z-50 w-full bg-card/85 border-b border-border px-4 lg:px-8 py-3 shadow-xs backdrop-blur-md">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        {/* Brand & Logo */}
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-2xl bg-primary p-0.5 shadow-xs group-hover:scale-105 transition-transform duration-200">
              <div className="w-full h-full bg-card rounded-[14px] flex items-center justify-center">
                <Baby className="w-5 h-5 text-primary group-hover:rotate-12 transition-transform duration-300" />
              </div>
            </div>
            <div>
              <span className="font-bold text-xl tracking-tight text-foreground flex items-center gap-1.5">
                Cute<span className="gradient-text">ODS</span>
              </span>
              <span className="text-[10px] text-muted-foreground font-mono tracking-wider block -mt-1 uppercase">
                Order Pipeline
              </span>
            </div>
          </Link>

          {/* Role Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 ml-4 pl-4 border-l border-border">
            {(currentUser.role === Role.SALES || currentUser.role === Role.ADMIN) && (
              <>
                <Link
                  href="/sales/leads"
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-sm font-semibold transition-all ${
                    pathname.startsWith('/sales/leads')
                      ? 'bg-accent text-accent-foreground border border-border shadow-xs'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  }`}
                >
                  <Users className="w-4 h-4 text-primary" />
                  Leads
                </Link>
                <Link
                  href="/sales/orders"
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-sm font-semibold transition-all ${
                    pathname.startsWith('/sales/orders')
                      ? 'bg-accent text-accent-foreground border border-border shadow-xs'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  }`}
                >
                  <ShoppingBag className="w-4 h-4 text-primary" />
                  Sales Orders
                </Link>
              </>
            )}

            {(currentUser.role === Role.DESIGN || currentUser.role === Role.ADMIN) && (
              <Link
                href="/design/queue"
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-sm font-semibold transition-all ${
                  pathname.startsWith('/design')
                    ? 'bg-accent text-accent-foreground border border-border shadow-xs'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
              >
                <Palette className="w-4 h-4 text-primary" />
                Design Queue
              </Link>
            )}

            {(currentUser.role === Role.PRODUCTION || currentUser.role === Role.ADMIN) && (
              <Link
                href="/production/queue"
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-sm font-semibold transition-all ${
                  pathname.startsWith('/production')
                    ? 'bg-accent text-accent-foreground border border-border shadow-xs'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
              >
                <Factory className="w-4 h-4 text-primary" />
                Production Queue
              </Link>
            )}

            {currentUser.role === Role.ADMIN && (
              <>
                <Link
                  href="/admin/orders"
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-sm font-semibold transition-all ${
                    pathname === '/admin/orders'
                      ? 'bg-accent text-accent-foreground border border-border shadow-xs'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  }`}
                >
                  <ShieldCheck className="w-4 h-4 text-primary" />
                  All Orders
                </Link>
                <Link
                  href="/admin/inventory"
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-sm font-semibold transition-all ${
                    pathname === '/admin/inventory'
                      ? 'bg-accent text-accent-foreground border border-border shadow-xs'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  }`}
                >
                  <Layers className="w-4 h-4 text-primary" />
                  Stock Inventory
                </Link>
              </>
            )}
          </nav>
        </div>

        {/* User Role Switcher Dropdown */}
        <div className="relative">
          <Button
            variant="outline"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-3 px-3 py-1.5 h-auto rounded-2xl bg-card border-border shadow-2xs hover:bg-muted"
          >
            <div className="text-right hidden sm:block">
              <div className="text-xs font-bold text-foreground">{currentUser.name}</div>
              <div className="text-[10px] text-muted-foreground flex items-center justify-end gap-1">
                <span>Role:</span>
                <Badge variant={getRoleBadgeVariant(currentUser.role)} className="px-1.5 py-0">
                  {currentUser.role}
                </Badge>
              </div>
            </div>
            <div className="w-8 h-8 rounded-xl bg-accent border border-border flex items-center justify-center text-accent-foreground font-bold text-xs">
              {currentUser.name.charAt(0)}
            </div>
            <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
          </Button>

          {/* Quick Role Switcher Dropdown */}
          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-popover text-popover-foreground border border-border rounded-3xl p-2.5 shadow-xl z-50">
              <div className="px-3 py-2 border-b border-border flex items-center justify-between">
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-primary" /> Switch Team Role
                </span>
              </div>

              <div className="py-1.5 space-y-1">
                {DEMO_USERS.map((user) => (
                  <button
                    key={user.id}
                    onClick={() => handleRoleSwitch(user)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                      currentUser.id === user.id
                        ? 'bg-accent text-accent-foreground font-bold border border-border'
                        : 'text-foreground hover:bg-muted'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-6 h-6 rounded-lg bg-accent flex items-center justify-center text-accent-foreground font-bold text-[10px]">
                        {user.name.charAt(0)}
                      </div>
                      <div className="text-left">
                        <div className="font-semibold text-foreground">{user.name}</div>
                      </div>
                    </div>
                    <Badge variant={getRoleBadgeVariant(user.role)} className="px-1.5 py-0 text-[9px]">
                      {user.role}
                    </Badge>
                  </button>
                ))}
              </div>

              <div className="mt-1 pt-1 border-t border-border">
                <Link
                  href="/login"
                  onClick={() => setIsDropdownOpen(false)}
                  className="flex items-center gap-2 w-full px-3 py-2 rounded-xl text-xs text-destructive hover:bg-destructive/10 transition-colors font-semibold"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Sign Out / Switch Account
                </Link>
              </div>
            </div>
          )}
        </div>

      </div>
    </header>
  )
}
