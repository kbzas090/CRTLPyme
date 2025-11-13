
'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { 
  Package, 
  ShoppingCart, 
  TrendingUp, 
  Users,
  ArrowRight,
  AlertTriangle
} from 'lucide-react'
import Link from 'next/link'

interface DashboardStats {
  totalProducts: number
  lowStockProducts: number
  totalSales: number
  activeUsers: number
}

export default function AdminDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Verificar autenticación
    if (status === 'unauthenticated') {
      router.push('/auth/login')
      return
    }

    // Cargar estadísticas
    if (status === 'authenticated') {
      loadDashboardStats()
    }
  }, [status, router])

  const loadDashboardStats = async () => {
    try {
      // Obtener inventario y ventas en paralelo
      const [inventoryRes, salesRes, usersRes] = await Promise.all([
        fetch('/api/inventory'),
        fetch('/api/sales/stats?period=month'),
        fetch('/api/users/stats')
      ])

      // Procesar inventario
      let totalProducts = 0
      let lowStockProducts = 0
      if (inventoryRes.ok) {
        const inventoryData = await inventoryRes.json()
        totalProducts = inventoryData.stats?.totalItems || 0
        lowStockProducts = inventoryData.stats?.lowStockCount || 0
      }

      // Procesar ventas
      let totalSales = 0
      if (salesRes.ok) {
        const salesData = await salesRes.json()
        totalSales = salesData.totalRevenue || 0
      }

      // Procesar usuarios
      let activeUsers = 1
      if (usersRes.ok) {
        const usersData = await usersRes.json()
        activeUsers = usersData.activeUsers || 1
      }

      const dashboardStats: DashboardStats = {
        totalProducts,
        lowStockProducts,
        totalSales,
        activeUsers,
      }
      
      setStats(dashboardStats)
    } catch (error) {
      console.error('Error al cargar estadísticas:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (status === 'loading' || isLoading) {
    return (
      <div className="p-4 lg:p-8 space-y-4 lg:space-y-6">
        <Skeleton className="h-8 lg:h-12 w-48 lg:w-64" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-24 lg:h-32" />
          ))}
        </div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="space-y-4 lg:space-y-6 max-w-full overflow-x-hidden">
      {/* Header */}
      <div className="space-y-1 px-4 sm:px-0">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight">
          Bienvenido, {session.user.firstName} {session.user.lastName}
        </h1>
        <p className="text-muted-foreground text-sm lg:text-base">
          Panel de control - {session.user.role}
        </p>
      </div>

      {/* Tarjetas de estadísticas */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 px-4 sm:px-0 max-w-full">
        {/* Total Productos */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium text-gray-600">
              Total Productos
            </CardTitle>
            <Package className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl lg:text-3xl font-bold">{stats?.totalProducts || 0}</div>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              Productos activos en inventario
            </p>
          </CardContent>
        </Card>

        {/* Stock Bajo */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium text-gray-600">
              Stock Bajo
            </CardTitle>
            <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-orange-500">
              {stats?.lowStockProducts || 0}
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              Productos bajo stock mínimo
            </p>
          </CardContent>
        </Card>

        {/* Ventas del Mes */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium text-gray-600">
              Ventas del Mes
            </CardTitle>
            <ShoppingCart className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg sm:text-xl lg:text-2xl font-bold">${stats?.totalSales?.toLocaleString('es-CL') || 0}</div>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              Ingresos del mes actual
            </p>
          </CardContent>
        </Card>

        {/* Usuarios Activos */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium text-gray-600">
              Usuarios Activos
            </CardTitle>
            <Users className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl lg:text-3xl font-bold">{stats?.activeUsers || 0}</div>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              Usuarios del sistema
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Módulos disponibles */}
      <div className="space-y-3 lg:space-y-4 px-4 sm:px-0">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
          Módulos del Sistema
        </h2>
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 max-w-full">
          {/* Punto de Venta */}
          <Card className="hover:shadow-lg transition-shadow border-green-200 bg-green-50">
            <CardHeader className="pb-3 sm:pb-4">
              <CardTitle className="flex items-center gap-2 text-green-700 text-base sm:text-lg">
                <ShoppingCart className="h-4 w-4 sm:h-5 sm:w-5" />
                Punto de Venta
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Sistema de ventas rápido y eficiente
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/admin/pos">
                <Button className="w-full bg-green-600 hover:bg-green-700 min-h-[44px] touch-manipulation text-sm sm:text-base">
                  Ir al POS
                  <ArrowRight className="ml-2 h-3 w-3 sm:h-4 sm:w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Sesión de Caja */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3 sm:pb-4">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5" />
                Sesión de Caja
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Apertura, cierre y arqueo de caja
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/admin/cash-session">
                <Button className="w-full min-h-[44px] touch-manipulation text-sm sm:text-base">
                  Gestionar Caja
                  <ArrowRight className="ml-2 h-3 w-3 sm:h-4 sm:w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Historial de Ventas */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3 sm:pb-4">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5" />
                Historial de Ventas
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Consulta y reportes de ventas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/admin/sales">
                <Button className="w-full min-h-[44px] touch-manipulation text-sm sm:text-base">
                  Ver Ventas
                  <ArrowRight className="ml-2 h-3 w-3 sm:h-4 sm:w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Inventario */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3 sm:pb-4">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <Package className="h-4 w-4 sm:h-5 sm:w-5" />
                Inventario
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Gestiona productos, stock y categorías
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/admin/inventory">
                <Button className="w-full min-h-[44px] touch-manipulation text-sm sm:text-base">
                  Ir a Inventario
                  <ArrowRight className="ml-2 h-3 w-3 sm:h-4 sm:w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Usuarios (próximamente) */}
          <Card className="opacity-60">
            <CardHeader className="pb-3 sm:pb-4">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <Users className="h-4 w-4 sm:h-5 sm:w-5" />
                Usuarios
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Gestión de usuarios del sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full min-h-[44px] touch-manipulation text-sm sm:text-base" disabled>
                Próximamente
              </Button>
            </CardContent>
          </Card>

          {/* Reportes Avanzados (próximamente) */}
          <Card className="opacity-60">
            <CardHeader className="pb-3 sm:pb-4">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5" />
                Reportes Avanzados
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Análisis de rentabilidad y break-even
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full min-h-[44px] touch-manipulation text-sm sm:text-base" disabled>
                Próximamente
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Alertas de stock bajo */}
      {stats && stats.lowStockProducts > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-700">
              <AlertTriangle className="h-5 w-5" />
              Alerta de Stock Bajo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-orange-700">
              Tienes {stats.lowStockProducts} producto(s) con stock bajo o agotado. 
              Revisa el inventario para realizar pedidos.
            </p>
            <Link href="/admin/inventory">
              <Button variant="outline" className="mt-4 border-orange-300 text-orange-700 hover:bg-orange-100">
                Ver Productos
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
