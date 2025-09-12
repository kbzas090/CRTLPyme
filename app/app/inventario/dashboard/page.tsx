
'use client'

import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { MetricCard } from '@/components/dashboard/metric-card'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { 
  Package, 
  AlertTriangle, 
  TrendingUp, 
  TrendingDown,
  ShoppingCart,
  DollarSign,
  BarChart3,
  RefreshCw,
  FileText,
  Plus
} from 'lucide-react'

export default function InventarioDashboard() {
  // Mock data for demo
  const inventarioData = {
    stockTotal: 1847000, // Valor total del inventario
    productosActivos: 156,
    productosQuiebre: 12,
    productosProximosQuiebre: 8, // <= umbral de reposición
    categorias: ['Bebidas', 'Snacks', 'Básicos', 'Lácteos', 'Limpieza']
  }

  const stockPorCategoria = [
    { categoria: 'Bebidas', productos: 45, valor: 485000, quiebres: 3 },
    { categoria: 'Snacks', productos: 38, valor: 392000, quiebres: 2 },
    { categoria: 'Básicos', productos: 28, valor: 520000, quiebres: 4 },
    { categoria: 'Lácteos', productos: 25, valor: 315000, quiebres: 2 },
    { categoria: 'Limpieza', productos: 20, valor: 135000, quiebres: 1 },
  ]

  const topMovers = [
    { name: 'Coca-Cola 500ml', vendidos: 85, categoria: 'Bebidas', stock: 28, rotacion: 'alta' },
    { name: 'Pan Hallulla', vendidos: 156, categoria: 'Básicos', stock: 15, rotacion: 'alta' },
    { name: 'Leche Soprole 1L', vendidos: 42, categoria: 'Lácteos', stock: 22, rotacion: 'media' },
    { name: 'Galletas McKay', vendidos: 38, categoria: 'Snacks', stock: 31, rotacion: 'media' },
  ]

  const slowMovers = [
    { name: 'Detergente Ariel 3kg', vendidos: 2, categoria: 'Limpieza', stock: 15, dias: 15 },
    { name: 'Aceite Especial 1L', vendidos: 1, categoria: 'Básicos', stock: 8, dias: 12 },
    { name: 'Yogurt Premium', vendidos: 3, categoria: 'Lácteos', stock: 12, dias: 8 },
  ]

  const productosQuiebre = [
    { name: 'Arroz Tucapel 1kg', categoria: 'Básicos', stock: 0, ultimaVenta: '2 días', demanda: 'Alta' },
    { name: 'Fideos Lucchetti', categoria: 'Básicos', stock: 0, ultimaVenta: '1 día', demanda: 'Alta' },
    { name: 'Jugo Livean 1L', categoria: 'Bebidas', stock: 0, ultimaVenta: '3 días', demanda: 'Media' },
  ]

  const sugerenciasReorden = [
    { name: 'Arroz Tucapel 1kg', stockActual: 0, sugerido: 50, costo: 45000 },
    { name: 'Pan Hallulla', stockActual: 15, sugerido: 35, costo: 12000 },
    { name: 'Coca-Cola 500ml', stockActual: 28, sugerido: 45, costo: 25500 },
  ]

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard Inventario</h1>
            <p className="text-gray-600 mt-1">
              Gestión y control de stock - Almacén San Juan
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Ajustar Stock
            </Button>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              Cargar Compra
            </Button>
          </div>
        </div>

        {/* Métricas Principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            title="Valor Total Stock"
            value={`$${inventarioData.stockTotal.toLocaleString('es-CL')}`}
            subtitle={`${inventarioData.productosActivos} productos activos`}
            change={{ value: '+3.2% vs mes anterior', type: 'positive' }}
            icon={DollarSign}
          />
          
          <MetricCard
            title="Productos en Quiebre"
            value={inventarioData.productosQuiebre}
            subtitle="Stock = 0"
            change={{ value: '+2 últimas 24h', type: 'negative' }}
            icon={AlertTriangle}
          />
          
          <MetricCard
            title="Próximos a Quiebre"
            value={inventarioData.productosProximosQuiebre}
            subtitle="Por debajo del mínimo"
            change={{ value: '≤ umbral reposición', type: 'neutral' }}
            icon={Package}
          />
          
          <MetricCard
            title="Cobertura Promedio"
            value="12.5 días"
            subtitle="Días de inventario"
            change={{ value: 'Basado en demanda', type: 'neutral' }}
            icon={BarChart3}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Stock por Categoría */}
          <Card>
            <CardHeader>
              <CardTitle>Stock por Categoría</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stockPorCategoria.map((cat) => (
                  <div key={cat.categoria} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="font-medium">{cat.categoria}</span>
                        <span className="text-sm text-gray-500 ml-2">({cat.productos} productos)</span>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">${cat.valor.toLocaleString('es-CL')}</div>
                        {cat.quiebres > 0 && (
                          <Badge variant="destructive" className="text-xs">
                            {cat.quiebres} quiebres
                          </Badge>
                        )}
                      </div>
                    </div>
                    <Progress 
                      value={(cat.valor / inventarioData.stockTotal) * 100} 
                      className="h-2" 
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Productos en Quiebre */}
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
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-medium text-sm">{product.name}</p>
                        <p className="text-xs text-gray-500">{product.categoria}</p>
                      </div>
                      <Badge 
                        variant={product.demanda === 'Alta' ? 'destructive' : 'secondary'}
                        className="text-xs"
                      >
                        {product.demanda}
                      </Badge>
                    </div>
                    <div className="flex justify-between text-xs text-gray-600">
                      <span>Stock: {product.stock}</span>
                      <span>Última venta: {product.ultimaVenta}</span>
                    </div>
                  </div>
                ))}
              </div>
              <Button className="w-full mt-4" variant="outline">
                Ver Todos los Quiebres
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Movers */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                Top Productos (7 días)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {topMovers.map((product, index) => (
                  <div key={product.name} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center text-xs font-medium text-green-600">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{product.name}</p>
                        <p className="text-xs text-gray-500">{product.categoria}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-green-600">{product.vendidos} und.</p>
                      <p className="text-xs text-gray-500">Stock: {product.stock}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Slow Movers */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingDown className="h-5 w-5 text-red-600" />
                Productos de Baja Rotación
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {slowMovers.map((product, index) => (
                  <div key={product.name} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center text-xs font-medium text-red-600">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{product.name}</p>
                        <p className="text-xs text-gray-500">{product.categoria}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-red-600">{product.vendidos} und.</p>
                      <p className="text-xs text-gray-500">{product.dias} días sin venta</p>
                    </div>
                  </div>
                ))}
              </div>
              <Button variant="outline" className="w-full mt-4">
                Ver Análisis Completo
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Sugerencias de Reorden */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5 text-blue-600" />
              Sugerencias de Reabastecimiento
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {sugerenciasReorden.map((item) => (
                <div key={item.name} className="flex items-center justify-between p-4 border rounded-lg hover:bg-blue-50 transition-colors">
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-gray-600">
                      Stock actual: <span className="font-medium">{item.stockActual}</span> → 
                      Sugerido: <span className="font-medium text-blue-600">{item.sugerido}</span>
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg">${item.costo.toLocaleString('es-CL')}</p>
                    <p className="text-sm text-gray-500">Costo estimado</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-3 mt-6">
              <Button className="flex-1 bg-blue-600 hover:bg-blue-700">
                <ShoppingCart className="h-4 w-4 mr-2" />
                Generar Orden de Compra
              </Button>
              <Button variant="outline">
                <FileText className="h-4 w-4 mr-2" />
                Exportar Lista
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Acciones Rápidas */}
        <Card>
          <CardHeader>
            <CardTitle>Acciones Rápidas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button variant="outline" className="h-auto p-4 flex flex-col gap-2">
                <Plus className="h-5 w-5" />
                <span className="text-sm">Cargar Compra</span>
              </Button>
              <Button variant="outline" className="h-auto p-4 flex flex-col gap-2">
                <RefreshCw className="h-5 w-5" />
                <span className="text-sm">Ajustar Stock</span>
              </Button>
              <Button variant="outline" className="h-auto p-4 flex flex-col gap-2">
                <FileText className="h-5 w-5" />
                <span className="text-sm">Informe Rotación</span>
              </Button>
              <Button variant="outline" className="h-auto p-4 flex flex-col gap-2">
                <BarChart3 className="h-5 w-5" />
                <span className="text-sm">Análisis Mermas</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
