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
  AlertTriangle,
  DollarSign,
  CreditCard
} from 'lucide-react'
import Link from 'next/link'
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface DashboardStats {
  totalProducts: number
  lowStockProducts: number
  totalSales: number
  totalRevenue: number
  activeUsers: number
  totalCustomers: number
  salesByDay: Array<{ date: string; sales: number; revenue: number }>
  topProducts: Array<{ name: string; sales: number }>
}

const COLORS = ['#2563eb', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']

export default function AdminDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login')
      return
    }

    if (status === 'authenticated') {
      loadDashboardStats()
    }
  }, [status, router])

  const loadDashboardStats = async () => {
    try {
      const response = await fetch('/api/products')
      const products = response.ok ? await response.json() : []
      
      // Generar datos de ejemplo para gráficos
      const salesByDay = generateMockSalesByDay()
      const topProducts = generateMockTopProducts(products.slice(0, 5))
      
      const stats: DashboardStats = {
        totalProducts: products.length,
        lowStockProducts: products.filter((p: any) => p.stock <= p.minStock).length,
        totalSales: 145,
        totalRevenue: 1250000,
        activeUsers: 3,
        totalCustomers: 28,
        salesByDay,
        topProducts
      }
      
      setStats(stats)
    } catch (error) {
      console.error('Error al cargar estadísticas:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const generateMockSalesByDay = () => {
    const days = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']
    return days.map(day => ({
      date: day,
      sales: Math.floor(Math.random() * 30) + 10,
      revenue: Math.floor(Math.random() * 500000) + 100000
    }))
  }

  const generateMockTopProducts = (products: any[]) => {
    return products.map(p => ({
      name: p.name?.substring(0, 20) || 'Producto',
      sales: Math.floor(Math.random() * 50) + 5
    }))
  }

  if (status === 'loading' || isLoading) {
    return (
      <div className="p-8 space-y-6">
        <Skeleton className="h-12 w-64" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Bienvenido, {session.user.firstName} {session.user.lastName}
        </h1>
        <p className="text-muted-foreground mt-2">
          Panel de control - {session.user.role}
        </p>
      </div>

      {/* Tarjetas de estadísticas principales */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ingresos Totales</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${stats?.totalRevenue.toLocaleString('es-CL')}
            </div>
            <p className="text-xs text-muted-foreground">
              +12.5% respecto al mes anterior
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ventas</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalSales || 0}</div>
            <p className="text-xs text-muted-foreground">
              En los últimos 30 días
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clientes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalCustomers || 0}</div>
            <p className="text-xs text-muted-foreground">
              Clientes registrados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Productos</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalProducts || 0}</div>
            <p className="text-xs text-muted-foreground">
              En inventario
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Ventas por día */}
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Ventas de la Semana</CardTitle>
            <CardDescription>
              Evolución de ventas e ingresos
            </CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={stats?.salesByDay || []}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#2563eb" 
                  fillOpacity={1} 
                  fill="url(#colorRevenue)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Productos más vendidos */}
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Productos Más Vendidos</CardTitle>
            <CardDescription>
              Top 5 esta semana
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats?.topProducts || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="sales" fill="#10b981" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Módulos disponibles */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Punto de Venta */}
        <Card className="hover:shadow-lg transition-shadow border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-700">
              <ShoppingCart className="h-5 w-5" />
              Punto de Venta
            </CardTitle>
            <CardDescription>
              Sistema de ventas rápido y eficiente
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/admin/pos">
              <Button className="w-full bg-green-600 hover:bg-green-700">
                Ir al POS
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Inventario */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Inventario
            </CardTitle>
            <CardDescription>
              Gestiona productos, stock y categorías
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/admin/inventory">
              <Button className="w-full">
                Ir a Inventario
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Clientes */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Clientes
            </CardTitle>
            <CardDescription>
              Gestión de clientes y historial
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/admin/customers">
              <Button className="w-full">
                Ver Clientes
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Ventas */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Historial de Ventas
            </CardTitle>
            <CardDescription>
              Consulta y reportes de ventas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/admin/sales">
              <Button className="w-full">
                Ver Ventas
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Caja */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Sesión de Caja
            </CardTitle>
            <CardDescription>
              Apertura, cierre y arqueo de caja
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/admin/cash-session">
              <Button className="w-full">
                Gestionar Caja
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Suscripciones */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Suscripción
            </CardTitle>
            <CardDescription>
              Gestiona tu plan y facturación
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/admin/subscriptions">
              <Button className="w-full">
                Ver Suscripción
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>
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
