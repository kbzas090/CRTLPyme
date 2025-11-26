'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  TrendingUp,
  FileText,
  Users,
  Settings,
  LogOut,
  ChevronDown,
  Menu,
  X,
  BarChart3,
  AlertTriangle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { usePermissions } from '@/hooks/usePermissions'
import { MODULES } from '@/lib/permissions'

interface NavItem {
  name: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  module: string // Módulo del sistema de permisos
}

const navigationItems: NavItem[] = [
  {
    name: 'Dashboard',
    href: '/admin/dashboard',
    icon: LayoutDashboard,
    module: MODULES.DASHBOARD,
  },
  {
    name: 'Punto de Venta',
    href: '/admin/pos',
    icon: ShoppingCart,
    module: MODULES.POS,
  },
  {
    name: 'Inventario',
    href: '/admin/inventory',
    icon: Package,
    module: MODULES.INVENTORY,
  },
  {
    name: 'Sesión de Caja',
    href: '/admin/cash-session',
    icon: TrendingUp,
    module: MODULES.CASH_SESSION,
  },
  {
    name: 'Ventas',
    href: '/admin/sales',
    icon: FileText,
    module: MODULES.SALES,
  },
  {
    name: 'Reportes',
    href: '/admin/reports',
    icon: BarChart3,
    module: MODULES.REPORTS,
  },
]

export default function AdminNavBar() {
  const { data: session } = useSession()
  const router = useRouter()
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
  const [hasCashSessionOpen, setHasCashSessionOpen] = useState(false)
  const { hasModuleAccess, isAdmin: checkIsAdmin } = usePermissions()

  const handleLogout = async () => {
    // Verificar si hay una sesión de caja abierta antes de cerrar sesión
    try {
      const response = await fetch('/api/cash-sessions/current')
      if (response.ok) {
        const data = await response.json()
        
        // Si hay una sesión de caja abierta, mostrar diálogo de advertencia
        if (data.session && data.session.status === 'OPEN') {
          setHasCashSessionOpen(true)
          setShowLogoutConfirm(true)
          return
        }
      }
    } catch (error) {
      console.error('Error al verificar sesión de caja:', error)
      // En caso de error en la verificación, permitir cerrar sesión
    }
    
    // Si no hay caja abierta, cerrar sesión directamente
    router.push('/auth/signout')
  }

  const confirmLogout = () => {
    setShowLogoutConfirm(false)
    router.push('/auth/signout')
  }

  const cancelLogout = () => {
    setShowLogoutConfirm(false)
    setHasCashSessionOpen(false)
  }

  const getInitials = (firstName?: string, lastName?: string) => {
    const first = firstName?.charAt(0) || ''
    const last = lastName?.charAt(0) || ''
    return `${first}${last}`.toUpperCase() || 'U'
  }

  const isActive = (href: string) => {
    return pathname === href || pathname?.startsWith(href + '/')
  }

  // Filtrar elementos de navegación según permisos del usuario
  const filteredNavItems = navigationItems.filter(item => hasModuleAccess(item.module))

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 overflow-x-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 min-w-0">
          {/* Logo y nombre */}
          <div className="flex items-center">
            <Link href="/admin/dashboard" className="flex items-center space-x-2">
              <ShoppingCart className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-bold text-gray-900 hidden sm:block">
                CRTLPyme
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:space-x-1">
            {filteredNavItems.map((item) => {
              const Icon = item.icon
              const active = isActive(item.href)
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`
                    flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium
                    transition-colors duration-200 min-h-[40px]
                    ${
                      active
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                    }
                  `}
                >
                  <Icon className="h-4 w-4" />
                  <span className="hidden lg:inline">{item.name}</span>
                </Link>
              )
            })}
          </div>

          {/* User Profile Dropdown */}
          <div className="flex items-center space-x-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="flex items-center space-x-2 hover:bg-gray-100 min-h-[40px] touch-manipulation"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-blue-600 text-white">
                      {getInitials(session?.user?.firstName, session?.user?.lastName)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden lg:block text-left">
                    <p className="text-sm font-medium text-gray-700">
                      {session?.user?.firstName} {session?.user?.lastName}
                    </p>
                    <p className="text-xs text-gray-500">{session?.user?.role}</p>
                  </div>
                  <ChevronDown className="h-4 w-4 text-gray-500 hidden md:block" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium">
                      {session?.user?.firstName} {session?.user?.lastName}
                    </p>
                    <p className="text-xs text-gray-500">{session?.user?.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/admin/dashboard" className="cursor-pointer">
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    <span>Dashboard</span>
                  </Link>
                </DropdownMenuItem>
                {checkIsAdmin() && hasModuleAccess(MODULES.SETTINGS) && (
                  <DropdownMenuItem asChild>
                    <Link href="/admin/settings" className="cursor-pointer">
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Configuración</span>
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="text-red-600 cursor-pointer focus:text-red-600 focus:bg-red-50"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Cerrar Sesión</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <Button
                variant="ghost"
                size="icon"
                className="min-h-[44px] min-w-[44px] touch-manipulation"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white absolute top-full left-0 right-0 z-40 shadow-lg max-h-screen overflow-y-auto">
          <div className="px-2 pt-2 pb-3 space-y-1 max-w-full">
            {filteredNavItems.map((item) => {
              const Icon = item.icon
              const active = isActive(item.href)
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`
                    flex items-center space-x-3 px-4 py-3 rounded-md text-base font-medium
                    transition-colors min-h-[48px] touch-manipulation
                    ${
                      active
                        ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                        : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                    }
                  `}
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.name}</span>
                </Link>
              )
            })}
          </div>
        </div>
      )}

      {/* Diálogo de confirmación de cierre de sesión con caja abierta */}
      <AlertDialog open={showLogoutConfirm} onOpenChange={setShowLogoutConfirm}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-amber-100">
                <AlertTriangle className="h-6 w-6 text-amber-600" />
              </div>
              <AlertDialogTitle className="text-xl">
                Sesión de Caja Abierta
              </AlertDialogTitle>
            </div>
            <AlertDialogDescription className="text-base text-gray-600 pt-2">
              {hasCashSessionOpen && (
                <>
                  Tienes una <strong>sesión de caja abierta</strong>.
                  <br /><br />
                  Se recomienda <strong>cerrar la caja</strong> antes de cerrar sesión para mantener la integridad de los registros.
                  <br /><br />
                  ¿Deseas cerrar sesión de todas formas?
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2">
            <AlertDialogCancel 
              onClick={cancelLogout}
              className="w-full sm:w-auto min-h-[44px] touch-manipulation"
            >
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmLogout}
              className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white min-h-[44px] touch-manipulation"
            >
              Cerrar Sesión de Todas Formas
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </nav>
  )
}
