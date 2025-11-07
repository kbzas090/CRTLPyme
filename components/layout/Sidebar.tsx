
'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  TrendingUp,
  DollarSign,
  Users,
  CreditCard,
  Settings,
  ChevronLeft,
  ChevronRight,
  Store,
  BarChart3,
  FileText,
  User
} from 'lucide-react'

interface NavItem {
  title: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  roles?: string[]
}

const navigationItems: NavItem[] = [
  {
    title: 'Dashboard',
    href: '/admin/dashboard',
    icon: LayoutDashboard,
    roles: ['ADMIN', 'PROVEEDOR', 'CAJA', 'INVENTARIO']
  },
  {
    title: 'Punto de Venta',
    href: '/admin/pos',
    icon: ShoppingCart,
    roles: ['ADMIN', 'CAJA']
  },
  {
    title: 'Inventario',
    href: '/admin/inventory',
    icon: Package,
    roles: ['ADMIN', 'INVENTARIO']
  },
  {
    title: 'Ventas',
    href: '/admin/sales',
    icon: TrendingUp,
    roles: ['ADMIN', 'CAJA']
  },
  {
    title: 'Caja',
    href: '/admin/cash-session',
    icon: DollarSign,
    roles: ['ADMIN', 'CAJA']
  },
  {
    title: 'Clientes',
    href: '/admin/customers',
    icon: Users,
    roles: ['ADMIN', 'CAJA']
  },
  {
    title: 'Suscripciones',
    href: '/admin/subscriptions',
    icon: CreditCard,
    roles: ['ADMIN']
  },
  {
    title: 'Admin SaaS',
    href: '/admin-saas',
    icon: Store,
    roles: ['PROVEEDOR']
  },
  {
    title: 'Reportes',
    href: '/admin/reports',
    icon: BarChart3,
    roles: ['ADMIN', 'PROVEEDOR']
  },
  {
    title: 'Configuración',
    href: '/admin/settings',
    icon: Settings,
    roles: ['ADMIN']
  }
]

export function Sidebar() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const [collapsed, setCollapsed] = useState(false)

  // Filtrar items de navegación según el rol del usuario
  const filteredNavItems = navigationItems.filter(item => {
    if (!item.roles || !session?.user?.role) return true
    return item.roles.includes(session.user.role)
  })

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-40 h-screen border-r bg-background transition-all duration-300',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Header con logo */}
      <div className="flex h-16 items-center justify-between border-b px-4">
        {!collapsed && (
          <Link href="/admin/dashboard" className="flex items-center space-x-2">
            <Store className="h-6 w-6 text-blue-600" />
            <span className="font-bold text-lg">CRTLPyme</span>
          </Link>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className={cn(collapsed && 'mx-auto')}
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Información del usuario */}
      {!collapsed && session?.user && (
        <div className="border-b p-4">
          <div className="flex items-center space-x-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
              <User className="h-5 w-5 text-blue-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">
                {session.user.firstName} {session.user.lastName}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {session.user.role}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Navegación */}
      <nav className="space-y-1 p-2 overflow-y-auto" style={{ height: 'calc(100vh - 145px)' }}>
        {filteredNavItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
          const Icon = item.icon

          return (
            <Link key={item.href} href={item.href}>
              <Button
                variant={isActive ? 'secondary' : 'ghost'}
                className={cn(
                  'w-full justify-start',
                  isActive && 'bg-blue-100 text-blue-700 hover:bg-blue-200',
                  collapsed && 'justify-center px-2'
                )}
              >
                <Icon className={cn('h-5 w-5', !collapsed && 'mr-3')} />
                {!collapsed && <span>{item.title}</span>}
              </Button>
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
