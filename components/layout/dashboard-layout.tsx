
'use client'

import { useSession, signOut } from 'next-auth/react'
import { useRouter, usePathname } from 'next/navigation'
import { useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
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
  HeadphonesIcon
} from 'lucide-react'
import { UserRole } from '@prisma/client'

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
    { href: '/admin/sales', label: 'Ventas', icon: ShoppingCart },
    { href: '/admin/inventory', label: 'Inventario', icon: Package },
    { href: '/admin/users', label: 'Usuarios', icon: Users },
    { href: '/admin/settings', label: 'Configuración', icon: Settings },
  ],
  CAJA: [
    { href: '/caja/dashboard', label: 'Dashboard', icon: BarChart3 },
    { href: '/caja/pos', label: 'Punto de Venta', icon: ShoppingCart },
    { href: '/caja/cash-session', label: 'Sesión de Caja', icon: Settings },
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
    signOut({ callbackUrl: '/' })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo & Navigation */}
            <div className="flex items-center space-x-8">
              <Link href="/" className="flex items-center space-x-2">
                <Store className="h-8 w-8 text-blue-600" />
                <span className="font-bold text-xl text-gray-900">POS SaaS Chile</span>
              </Link>
              
              {/* Navigation */}
              <nav className="hidden md:flex space-x-6">
                {navigation.map((item) => {
                  const Icon = item.icon
                  const isActive = pathname === item.href
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`inline-flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                        isActive
                          ? 'bg-blue-100 text-blue-700'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                      }`}
                    >
                      <Icon className="w-4 h-4 mr-2" />
                      {item.label}
                    </Link>
                  )
                })}
              </nav>
            </div>

            {/* User Menu */}
            <div className="flex items-center space-x-4">
              <div className="hidden md:block text-sm text-gray-600">
                {roleLabels[userRole]}
              </div>
              
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
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  )
}
