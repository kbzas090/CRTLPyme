
'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { 
  Menu, 
  ShoppingCart, 
  X,
  Home,
  User,
  Settings,
  LogOut
} from 'lucide-react'

interface MobileNavProps {
  navigation?: Array<{
    name: string
    href: string
    icon: React.ComponentType<{ className?: string }>
  }>
  onSignOut?: () => void
  user?: {
    firstName?: string
    lastName?: string
    email?: string
    role?: string
  }
  showAuth?: boolean
}

export function MobileNav({ navigation = [], onSignOut, user, showAuth = false }: MobileNavProps) {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  const isActive = (href: string) => {
    return pathname === href || pathname?.startsWith(href + '/')
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          className="mr-2 px-0 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 md:hidden"
        >
          <Menu className="h-6 w-6" />
          <span className="sr-only">Toggle Menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="pr-0 w-[300px] sm:w-[350px]">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center space-x-2 px-6 py-4 border-b">
            <ShoppingCart className="h-8 w-8 text-blue-600" />
            <div>
              <h1 className="text-lg font-bold text-gray-900">CRTLPyme</h1>
              <p className="text-xs text-gray-500">Control Total</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto">
            {navigation.map((item) => {
              const Icon = item.icon
              const active = isActive(item.href)
              
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition-colors',
                    active
                      ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                  )}
                >
                  <Icon className="h-5 w-5" />
                  {item.name}
                </Link>
              )
            })}
          </nav>

          {/* Auth Section */}
          {showAuth && user && (
            <div className="border-t p-4 space-y-3">
              <div className="flex items-center gap-3 px-3 py-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                  <User className="h-5 w-5 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {user.firstName} {user.lastName}
                  </p>
                  <p className="text-xs text-gray-500 truncate">{user.email}</p>
                  {user.role && (
                    <p className="text-xs text-blue-600">{user.role}</p>
                  )}
                </div>
              </div>
              
              {onSignOut && (
                <Button
                  onClick={() => {
                    setOpen(false)
                    onSignOut()
                  }}
                  variant="outline"
                  className="w-full justify-start"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Cerrar Sesión
                </Button>
              )}
            </div>
          )}

          {/* Landing Auth Links */}
          {showAuth && !user && (
            <div className="border-t p-4 space-y-2">
              <Link
                href="/auth/login"
                onClick={() => setOpen(false)}
                className="flex w-full items-center justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow hover:bg-blue-700"
              >
                Iniciar Sesión
              </Link>
              <Link
                href="/demo"
                onClick={() => setOpen(false)}
                className="flex w-full items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
              >
                Prueba Gratis
              </Link>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
