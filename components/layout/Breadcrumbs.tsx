
'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { Home } from 'lucide-react'
import { Fragment } from 'react'

const routeNames: Record<string, string> = {
  admin: 'Administración',
  'admin-saas': 'Admin SaaS',
  dashboard: 'Dashboard',
  pos: 'Punto de Venta',
  inventory: 'Inventario',
  sales: 'Ventas',
  'cash-session': 'Caja',
  customers: 'Clientes',
  subscriptions: 'Suscripciones',
  settings: 'Configuración',
  reports: 'Reportes',
  tenants: 'Tenants',
  'master-products': 'Productos Maestros',
  stats: 'Estadísticas',
  new: 'Nuevo',
  edit: 'Editar',
  profile: 'Perfil'
}

export function Breadcrumbs() {
  const pathname = usePathname()
  
  // No mostrar breadcrumbs en ciertas rutas
  if (pathname === '/' || pathname === '/auth/login' || pathname === '/auth/register') {
    return null
  }

  const segments = pathname.split('/').filter(Boolean)
  
  return (
    <div className="border-b bg-background">
      <div className="px-6 py-3">
        <Breadcrumb>
          <BreadcrumbList>
            {/* Home link */}
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/admin/dashboard" className="flex items-center">
                  <Home className="h-4 w-4" />
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>

            {segments.map((segment, index) => {
              const href = '/' + segments.slice(0, index + 1).join('/')
              const isLast = index === segments.length - 1
              const title = routeNames[segment] || segment.charAt(0).toUpperCase() + segment.slice(1)

              return (
                <Fragment key={href}>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    {isLast ? (
                      <BreadcrumbPage>{title}</BreadcrumbPage>
                    ) : (
                      <BreadcrumbLink asChild>
                        <Link href={href}>{title}</Link>
                      </BreadcrumbLink>
                    )}
                  </BreadcrumbItem>
                </Fragment>
              )
            })}
          </BreadcrumbList>
        </Breadcrumb>
      </div>
    </div>
  )
}
