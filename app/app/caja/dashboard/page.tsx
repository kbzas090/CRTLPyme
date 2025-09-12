
'use client'

import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { MetricCard } from '@/components/dashboard/metric-card'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  DollarSign, 
  ShoppingCart, 
  CreditCard, 
  Clock,
  Calculator,
  Receipt,
  AlertCircle,
  CheckCircle,
  TrendingUp,
  Package
} from 'lucide-react'

export default function CajaDashboard() {
  // Mock data for demo - datos del turno actual
  const turnoActual = {
    ventasHoy: 485000,
    productosVendidos: 167,
    nVentas: 42,
    efectivoEsperado: 335000, // Apertura + ventas en efectivo
    efectivoContado: null, // Aún no se ha hecho arqueo
    horaApertura: '08:30',
    cajero: 'María González'
  }

  const ventasPorMedio = [
    { medio: 'Efectivo', monto: 285000, color: 'bg-green-500' },
    { medio: 'Débito', monto: 125000, color: 'bg-blue-500' },
    { medio: 'Crédito', monto: 75000, color: 'bg-purple-500' },
  ]

  const ultimasVentas = [
    { id: '#2045', hora: '14:35', total: 15800, medio: 'Efectivo', items: 'Coca-Cola, Pan, Leche' },
    { id: '#2044', hora: '14:32', total: 8900, medio: 'Débito', items: 'Galletas McKay, Jugo' },
    { id: '#2043', hora: '14:28', total: 23400, medio: 'Crédito', items: 'Arroz, Aceite, Fideos' },
    { id: '#2042', hora: '14:25', total: 5600, medio: 'Efectivo', items: 'Pan Hallulla (x4)' },
  ]

  const productosFrequentes = [
    { name: 'Coca-Cola 500ml', vendidos: 12, stock: 28 },
    { name: 'Pan Hallulla', vendidos: 18, stock: 15 },
    { name: 'Leche Soprole 1L', vendidos: 8, stock: 22 },
    { name: 'Galletas McKay', vendidos: 9, stock: 31 },
  ]

  const estadoCaja = {
    apertura: 50000,
    ventasEfectivo: 285000,
    egresosEfectivo: 15000, // Gastos varios
    esperado: 320000 // 50000 + 285000 - 15000
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Punto de Venta</h1>
            <p className="text-gray-600 mt-1">
              Turno iniciado a las {turnoActual.horaApertura} - {turnoActual.cajero}
            </p>
          </div>
          <div className="flex gap-3">
            <Button className="bg-blue-600 hover:bg-blue-700">
              <ShoppingCart className="h-4 w-4 mr-2" />
              Nueva Venta
            </Button>
            <Button variant="outline">
              <Calculator className="h-4 w-4 mr-2" />
              Arqueo de Caja
            </Button>
          </div>
        </div>

        {/* KPIs del Día */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            title="Monto Vendido"
            value={`$${turnoActual.ventasHoy.toLocaleString('es-CL')}`}
            subtitle="Total del día"
            change={{ value: '+8.2% vs ayer', type: 'positive' }}
            icon={DollarSign}
          />
          
          <MetricCard
            title="Productos Vendidos"
            value={turnoActual.productosVendidos}
            subtitle="Unidades totales"
            change={{ value: `${turnoActual.nVentas} transacciones`, type: 'neutral' }}
            icon={Package}
          />
          
          <MetricCard
            title="Ticket Promedio"
            value={`$${Math.round(turnoActual.ventasHoy / turnoActual.nVentas).toLocaleString('es-CL')}`}
            subtitle="Por transacción"
            change={{ value: '+2.1% vs promedio', type: 'positive' }}
            icon={Receipt}
          />
          
          <MetricCard
            title="Efectivo Esperado"
            value={`$${estadoCaja.esperado.toLocaleString('es-CL')}`}
            subtitle="En caja actual"
            change={{ value: 'Pendiente arqueo', type: 'neutral' }}
            icon={CreditCard}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
                  <div key={item.medio} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${item.color}`}></div>
                      <span className="font-medium">{item.medio}</span>
                    </div>
                    <span className="text-lg font-bold">${item.monto.toLocaleString('es-CL')}</span>
                  </div>
                ))}
              </div>

              {/* Estado de Caja */}
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-3 flex items-center gap-2">
                  <Calculator className="h-4 w-4" />
                  Estado de Caja
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-blue-700">Apertura:</span>
                    <span className="font-medium">${estadoCaja.apertura.toLocaleString('es-CL')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-700">Ventas efectivo:</span>
                    <span className="font-medium text-green-600">+${estadoCaja.ventasEfectivo.toLocaleString('es-CL')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-700">Egresos:</span>
                    <span className="font-medium text-red-600">-${estadoCaja.egresosEfectivo.toLocaleString('es-CL')}</span>
                  </div>
                  <div className="border-t pt-2">
                    <div className="flex justify-between">
                      <span className="font-medium text-blue-900">Esperado total:</span>
                      <span className="font-bold text-blue-900">${estadoCaja.esperado.toLocaleString('es-CL')}</span>
                    </div>
                  </div>
                </div>
              </div>

              <Button className="w-full mt-4" variant="outline">
                <Calculator className="h-4 w-4 mr-2" />
                Realizar Arqueo
              </Button>
            </CardContent>
          </Card>

          {/* Últimas Ventas */}
          <Card>
            <CardHeader>
              <CardTitle>Últimas Ventas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {ultimasVentas.map((venta) => (
                  <div key={venta.id} className="p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <span className="font-medium text-blue-600">{venta.id}</span>
                        <div className="flex items-center gap-2 mt-1">
                          <Clock className="h-3 w-3 text-gray-400" />
                          <span className="text-sm text-gray-600">{venta.hora}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-lg">${venta.total.toLocaleString('es-CL')}</span>
                        <div>
                          <Badge variant={venta.medio === 'Efectivo' ? 'default' : 'secondary'} className="text-xs">
                            {venta.medio}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 truncate">{venta.items}</p>
                  </div>
                ))}
              </div>
              <Button variant="ghost" className="w-full mt-3">
                Ver Todas las Ventas
              </Button>
            </CardContent>
          </Card>

          {/* Productos Frecuentes */}
          <Card>
            <CardHeader>
              <CardTitle>Productos Más Vendidos Hoy</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {productosFrequentes.map((product, index) => (
                  <div key={product.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-xs font-medium text-blue-600">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{product.name}</p>
                        <p className="text-xs text-gray-500">Stock: {product.stock} und.</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-green-600">{product.vendidos}</span>
                      <p className="text-xs text-gray-500">vendidos</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Alertas y Acciones */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Alertas */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-yellow-600" />
                Alertas del Turno
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-yellow-600" />
                    <span className="font-medium text-sm">Stock Bajo</span>
                  </div>
                  <p className="text-sm text-yellow-800 mt-1">Pan Hallulla: Solo quedan 15 unidades</p>
                </div>
                
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="font-medium text-sm">Sin Problemas de Conexión</span>
                  </div>
                  <p className="text-sm text-green-800 mt-1">Todos los medios de pago operativos</p>
                </div>

                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-blue-600" />
                    <span className="font-medium text-sm">Buen Rendimiento</span>
                  </div>
                  <p className="text-sm text-blue-800 mt-1">Superando ventas promedio del día (+8.2%)</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Atajos Rápidos */}
          <Card>
            <CardHeader>
              <CardTitle>Acciones Rápidas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3 mb-6">
                <Button className="h-auto p-4 flex flex-col gap-2 bg-blue-600 hover:bg-blue-700">
                  <ShoppingCart className="h-6 w-6" />
                  <span className="text-sm font-medium">Nueva Venta</span>
                </Button>
                <Button variant="outline" className="h-auto p-4 flex flex-col gap-2">
                  <Calculator className="h-6 w-6" />
                  <span className="text-sm font-medium">Arqueo/Cierre</span>
                </Button>
                <Button variant="outline" className="h-auto p-4 flex flex-col gap-2">
                  <Receipt className="h-6 w-6" />
                  <span className="text-sm font-medium">Reporte Diario</span>
                </Button>
                <Button variant="outline" className="h-auto p-4 flex flex-col gap-2">
                  <DollarSign className="h-6 w-6" />
                  <span className="text-sm font-medium">Egreso Caja</span>
                </Button>
              </div>

              {/* Información del Turno */}
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-sm mb-3">Información del Turno</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Hora apertura:</span>
                    <span className="font-medium">{turnoActual.horaApertura}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Cajero:</span>
                    <span className="font-medium">{turnoActual.cajero}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Estado:</span>
                    <Badge variant="default" className="text-xs">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Activo
                    </Badge>
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
