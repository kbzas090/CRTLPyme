
'use client'

import { useSession } from 'next-auth/react'
import { useRouter, usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { 
  Store,
  BarChart3,
  ShoppingCart,
  Package,
  Users,
  Settings,
  LogOut,
  User,
  Building,
  HeadphonesIcon,
  Receipt,
  DollarSign,
  CreditCard,
  Menu,
  X
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { UserRole } from '@prisma/client'

interface DashboardLayoutProps {
  children: React.ReactNode
}

const roleRoutes = {
  PROVEEDOR: [
    { href: '/saas/dashboard', label: 'Dashboard SaaS', icon: BarChart3 },
    { href: '/saas/tenants', label: 'Tenants', icon: Building },
    { href: '/saas/metrics', label: 'Métricas Globales', icon: BarChart3 },
  ],
  ADMIN: [
    { href: '/admin/dashboard', label: 'Dashboard', icon: BarChart3 },
    { href: '/admin/pos', label: 'Punto de Venta', icon: ShoppingCart },
    { href: '/admin/cash-session', label: 'Sesión de Caja', icon: DollarSign },
    { href: '/admin/sales', label: 'Historial Ventas', icon: Receipt },
    { href: '/admin/inventory', label: 'Inventario', icon: Package },
    { href: '/admin/users', label: 'Usuarios', icon: Users },
    { href: '/admin/settings', label: 'Configuración', icon: Settings },
  ],
  CAJA: [
    { href: '/admin/pos', label: 'Punto de Venta', icon: ShoppingCart },
    { href: '/admin/cash-session', label: 'Sesión de Caja', icon: DollarSign },
    { href: '/admin/sales', label: 'Mis Ventas', icon: Receipt },
  ],
  INVENTARIO: [
    { href: '/inventario/dashboard', label: 'Dashboard', icon: BarChart3 },
    { href: '/inventario/products', label: 'Productos', icon: Package },
    { href: '/inventario/stock', label: 'Gestión Stock', icon: Package },
  ],
  SOPORTE: [
    { href: '/soporte/dashboard', label: 'Dashboard', icon: BarChart3 },
    { href: '/soporte/tickets', label: 'Tickets', icon: HeadphonesIcon },
  ]
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    if (status === 'loading') return

    if (status === 'unauthenticated') {
      router.replace('/auth/login')
      return
    }

    // Check if user is accessing the correct role-based route
    if (session?.user?.role) {
      const currentRole = session.user.role
      const allowedRoutes = roleRoutes[currentRole as UserRole]?.map(route => route.href) || []
      const isValidRoute = allowedRoutes.some(route => pathname?.startsWith(route))
      
      if (!isValidRoute && pathname !== '/') {
        // Redirect to appropriate dashboard
        const defaultRoute = roleRoutes[currentRole as UserRole]?.[0]?.href || '/auth/login'
        router.replace(defaultRoute)
      }
    }
  }, [session, status, router, pathname])

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-sm text-gray-600">Cargando...</p>
        </div>
      </div>
    )
  }

  if (!session?.user) {
    return null
  }

  const userRole = session.user.role as UserRole
  const navigation = roleRoutes[userRole] || []
  const userInitials = `${session.user.firstName?.[0] || ''}${session.user.lastName?.[0] || ''}`.toUpperCase()

  const roleLabels = {
    PROVEEDOR: 'Administrador SaaS',
    ADMIN: 'Administrador',
    CAJA: 'Cajero',
    INVENTARIO: 'Inventario',
    SOPORTE: 'Soporte'
  }

  const handleSignOut = () => {
    router.push('/auth/signout')
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col lg:flex-row overflow-x-hidden">
      {/* Mobile Header */}
      <div className="lg:hidden bg-white border-b px-4 py-3 flex items-center justify-between w-full">
        <div className="flex items-center gap-2">
          <Store className="h-6 w-6 text-blue-600" />
          <div>
            <h1 className="text-sm font-bold text-gray-900">CRTLPyme</h1>
            <p className="text-xs text-gray-500">{roleLabels[userRole]}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {/* User Avatar */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-blue-600 text-white">
                    {userInitials}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {session.user.firstName} {session.user.lastName}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {session.user.email}
                  </p>
                  <p className="text-xs leading-none text-blue-600">
                    {roleLabels[userRole]}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                <span>Perfil</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                <span>Configuración</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Cerrar sesión</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          {/* Mobile Menu Button */}
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[min(300px,80vw)] sm:w-[min(350px,85vw)] max-w-sm p-0 z-50">
              <div className="flex flex-col h-full">
                {/* Mobile Menu Header */}
                <div className="flex items-center space-x-2 px-6 py-4 border-b">
                  <Store className="h-8 w-8 text-blue-600" />
                  <div>
                    <h1 className="text-lg font-bold text-gray-900">CRTLPyme</h1>
                    <p className="text-xs text-gray-500">{roleLabels[userRole]}</p>
                  </div>
                </div>

                {/* Mobile Navigation */}
                <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto">
                  {navigation.map((item) => {
                    const Icon = item.icon
                    const isActive = pathname === item.href
                    
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={cn(
                          'flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition-colors',
                          isActive
                            ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                            : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                        )}
                      >
                        <Icon className="h-5 w-5" />
                        {item.label}
                      </Link>
                    )
                  })}
                </nav>

                {/* Mobile User Section */}
                <div className="border-t p-4">
                  <div className="flex items-center gap-3 px-3 py-2">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-blue-600 text-white">
                        {userInitials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {session.user.firstName} {session.user.lastName}
                      </p>
                      <p className="text-xs text-gray-500 truncate">{session.user.email}</p>
                    </div>
                  </div>
                  
                  <Button
                    onClick={() => {
                      setIsMobileMenuOpen(false)
                      handleSignOut()
                    }}
                    variant="outline"
                    className="w-full justify-start mt-2"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Cerrar Sesión
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-64 bg-white shadow-lg border-r">
        <div className="flex h-full flex-col">
          {/* Desktop Header */}
          <div className="flex h-16 items-center gap-2 border-b px-6">
            <Store className="h-8 w-8 text-blue-600" />
            <div>
              <h1 className="text-lg font-bold text-gray-900">CRTLPyme</h1>
              <p className="text-xs text-gray-500">{roleLabels[userRole]}</p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="flex-1 space-y-1 px-3 py-4">
            {navigation.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                  )}
                >
                  <Icon className="h-5 w-5" />
                  {item.label}
                </Link>
              )
            })}
          </nav>

          {/* Desktop User Section */}
          <div className="border-t p-4">
            <div className="flex items-center gap-3 mb-3">
              <Avatar className="h-10 w-10">
                <AvatarFallback className="bg-blue-600 text-white">
                  {userInitials}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {session.user.firstName} {session.user.lastName}
                </p>
                <p className="text-xs text-gray-500 truncate">{session.user.email}</p>
              </div>
            </div>
            <Button
              onClick={handleSignOut}
              variant="outline"
              className="w-full justify-start"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Cerrar Sesión
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="container mx-auto p-4 lg:p-6 max-w-7xl">
          {children}
        </div>
      </main>
    </div>
  )
}
