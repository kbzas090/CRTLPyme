
'use client'

import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { MetricCard } from '@/components/dashboard/metric-card'
import { SalesChart } from '@/components/charts/sales-chart'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { 
  DollarSign, 
  ShoppingCart, 
  TrendingUp, 
  Package,
  Calculator,
  CreditCard,
  AlertTriangle,
  Target,
  ArrowUpRight
} from 'lucide-react'

export default function AdminDashboard() {
  // Mock data for demo - datos típicos de una PYME chilena
  const metrics = {
    ventasHoy: 485000,
    ventasEsteMes: 8950000,
    ticketPromedio: 12500,
    nVentasHoy: 42,
    nVentasEsteMes: 387,
    stockValorado: 1850000,
    margenBruto: 2650000, // Margen bruto acumulado este mes
    puntoEquilibrio: 175000, // Lo que necesita vender diariamente
    gastosFixos: 3500000, // Gastos fijos mensuales
    productosEnQuiebre: 8
  }

  const ventasPorMedio = [
    { medio: 'Efectivo', monto: 285000, porcentaje: 58.8 },
    { medio: 'Débito', monto: 125000, porcentaje: 25.8 },
    { medio: 'Crédito', monto: 75000, porcentaje: 15.5 },
  ]

  const topProductos = [
    { name: 'Coca-Cola 500ml', sold: 28, margin: 15600, category: 'Bebidas' },
    { name: 'Pan Hallulla', sold: 45, margin: 9000, category: 'Panadería' },
    { name: 'Leche Soprole 1L', sold: 18, margin: 10800, category: 'Lácteos' },
    { name: 'Galletas McKay', sold: 22, margin: 8800, category: 'Snacks' },
  ]

  const productosQuiebre = [
    { name: 'Arroz Tucapel 1kg', stock: 0, lastSold: '2 días' },
    { name: 'Fideos Lucchetti', stock: 0, lastSold: '1 día' },
    { name: 'Aceite Chef 1L', stock: 2, lastSold: 'Hoy' },
  ]

  // Cálculo del progreso hacia punto de equilibrio
  const ventasAcumuladasMes = metrics.ventasEsteMes
  const metaMensual = metrics.puntoEquilibrio * 30 // Aproximadamente 30 días
  const progressPuntoEquilibrio = Math.min((ventasAcumuladasMes / metaMensual) * 100, 100)

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard Administrativo</h1>
          <p className="text-gray-600 mt-1">
            Gestión integral de tu negocio - Almacén San Juan
          </p>
        </div>

        {/* Métricas Principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            title="Ventas Hoy"
            value={`$${metrics.ventasHoy.toLocaleString('es-CL')}`}
            subtitle={`${metrics.nVentasHoy} ventas realizadas`}
            change={{ value: '+12.5% vs ayer', type: 'positive' }}
            icon={DollarSign}
          />
          
          <MetricCard
            title="Ticket Promedio"
            value={`$${metrics.ticketPromedio.toLocaleString('es-CL')}`}
            subtitle="Promedio por venta"
            change={{ value: '+3.2% vs semana', type: 'positive' }}
            icon={ShoppingCart}
          />
          
          <MetricCard
            title="Margen Bruto"
            value={`$${metrics.margenBruto.toLocaleString('es-CL')}`}
            subtitle="Ganancia acumulada este mes"
            change={{ value: '+8.7% vs mes anterior', type: 'positive' }}
            icon={TrendingUp}
          />
          
          <MetricCard
            title="Stock Valorizado"
            value={`$${metrics.stockValorado.toLocaleString('es-CL')}`}
            subtitle={`${metrics.productosEnQuiebre} productos en quiebre`}
            change={{ value: `${metrics.productosEnQuiebre} alertas`, type: 'negative' }}
            icon={Package}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Gráfico de Ventas */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Ventas de la Semana</CardTitle>
            </CardHeader>
            <CardContent>
              <SalesChart />
            </CardContent>
          </Card>

          {/* Punto de Equilibrio */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5 text-blue-600" />
                Punto de Equilibrio
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-600">Progreso Mensual</span>
                    <span className="text-sm font-medium">{progressPuntoEquilibrio.toFixed(1)}%</span>
                  </div>
                  <Progress value={progressPuntoEquilibrio} className="h-3" />
                </div>
                
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Meta diaria:</span>
                    <span className="font-medium">${metrics.puntoEquilibrio.toLocaleString('es-CL')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Vendido hoy:</span>
                    <span className={`font-medium ${metrics.ventasHoy >= metrics.puntoEquilibrio ? 'text-green-600' : 'text-red-600'}`}>
                      ${metrics.ventasHoy.toLocaleString('es-CL')}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Gastos fijos/mes:</span>
                    <span className="font-medium">${metrics.gastosFixos.toLocaleString('es-CL')}</span>
                  </div>
                </div>
                
                <div className="pt-3 border-t">
                  {metrics.ventasHoy >= metrics.puntoEquilibrio ? (
                    <Badge variant="default" className="w-full justify-center">
                      <Target className="h-3 w-3 mr-1" />
                      Meta Alcanzada Hoy
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="w-full justify-center">
                      Faltan ${(metrics.puntoEquilibrio - metrics.ventasHoy).toLocaleString('es-CL')}
                    </Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Ventas por Medio de Pago */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Ventas por Medio de Pago
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {ventasPorMedio.map((item) => (
                  <div key={item.medio} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">{item.medio}</span>
                      <div className="text-right">
                        <span className="font-medium">${item.monto.toLocaleString('es-CL')}</span>
                        <span className="text-sm text-gray-500 ml-2">({item.porcentaje}%)</span>
                      </div>
                    </div>
                    <Progress value={item.porcentaje} className="h-2" />
                  </div>
                ))}
              </div>
              
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-900">Efectivo Esperado en Caja</span>
                </div>
                <p className="text-lg font-bold text-blue-900">
                  ${(ventasPorMedio[0].monto + 50000).toLocaleString('es-CL')}
                </p>
                <p className="text-xs text-blue-600">Apertura: $50.000 + Ventas efectivo</p>
              </div>
            </CardContent>
          </Card>

          {/* Top Productos */}
          <Card>
            <CardHeader>
              <CardTitle>Productos Más Vendidos (Hoy)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topProductos.map((product, index) => (
                  <div key={product.name} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-sm font-medium text-blue-600">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{product.name}</p>
                        <p className="text-xs text-gray-500">{product.category}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-sm">{product.sold} und.</p>
                      <p className="text-xs text-green-600">+${product.margin.toLocaleString('es-CL')}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Alertas y Productos en Quiebre */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-600">
                <AlertTriangle className="h-5 w-5" />
                Productos en Quiebre
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {productosQuiebre.map((product) => (
                  <div key={product.name} className="p-3 border border-red-200 rounded-lg bg-red-50">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-sm text-gray-900">{product.name}</p>
                        <p className="text-xs text-red-600">Stock: {product.stock} unidades</p>
                        <p className="text-xs text-gray-500">Última venta: {product.lastSold}</p>
                      </div>
                      <Badge variant={product.stock === 0 ? 'destructive' : 'secondary'} className="text-xs">
                        {product.stock === 0 ? 'Sin Stock' : 'Crítico'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
              <Button className="w-full mt-4" variant="outline">
                Ver Todos los Productos
              </Button>
            </CardContent>
          </Card>

          {/* Acciones Rápidas */}
          <Card>
            <CardHeader>
              <CardTitle>Acciones Rápidas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                <Button variant="outline" className="h-auto p-4 flex flex-col gap-2 text-center">
                  <Package className="h-5 w-5" />
                  <span className="text-xs">Cargar Compra</span>
                </Button>
                <Button variant="outline" className="h-auto p-4 flex flex-col gap-2 text-center">
                  <TrendingUp className="h-5 w-5" />
                  <span className="text-xs">Ajustar Precios</span>
                </Button>
                <Button variant="outline" className="h-auto p-4 flex flex-col gap-2 text-center">
                  <Calculator className="h-5 w-5" />
                  <span className="text-xs">Gastos Fijos</span>
                </Button>
                <Button variant="outline" className="h-auto p-4 flex flex-col gap-2 text-center">
                  <ArrowUpRight className="h-5 w-5" />
                  <span className="text-xs">Exportar Cierre</span>
                </Button>
              </div>

              {/* Resumen Financiero Rápido */}
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-sm mb-3">Resumen Financiero</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Ventas este mes:</span>
                    <span className="font-medium">${metrics.ventasEsteMes.toLocaleString('es-CL')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Margen bruto:</span>
                    <span className="font-medium text-green-600">${metrics.margenBruto.toLocaleString('es-CL')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Gastos fijos:</span>
                    <span className="font-medium text-red-600">-${metrics.gastosFixos.toLocaleString('es-CL')}</span>
                  </div>
                  <div className="border-t pt-2">
                    <div className="flex justify-between">
                      <span className="font-medium">Utilidad estimada:</span>
                      <span className={`font-bold ${(metrics.margenBruto - metrics.gastosFixos) > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        ${(metrics.margenBruto - metrics.gastosFixos).toLocaleString('es-CL')}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
