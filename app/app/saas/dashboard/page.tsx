
'use client'

import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { MetricCard } from '@/components/dashboard/metric-card'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Building, 
  Users, 
  DollarSign, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle,
  Clock,
  ArrowUpRight
} from 'lucide-react'

export default function SaaSDashboard() {
  // Mock data for demo
  const metrics = {
    tenantsActivos: 24,
    nuevosEsteMes: 5,
    usuariosTotales: 147,
    mrrSimulado: 850000, // CLP
    cobrosExitosos: 23,
    cobrosFallidos: 1,
    tenantsEnRiesgo: 2
  }

  const recentTenants = [
    { id: 1, name: 'Almacén San Juan', rut: '76.123.456-7', status: 'active', plan: 'BASIC', created: '2025-01-10' },
    { id: 2, name: 'Minimarket Los Aromos', rut: '76.234.567-8', status: 'active', plan: 'PRO', created: '2025-01-08' },
    { id: 3, name: 'Tienda Doña María', rut: '76.345.678-9', status: 'pending', plan: 'BASIC', created: '2025-01-07' },
  ]

  const riskTenants = [
    { id: 1, name: 'Almacén Norte', issue: 'Cobro fallido hace 3 días', severity: 'high' },
    { id: 2, name: 'Tienda Central', issue: 'Sin ventas últimos 7 días', severity: 'medium' },
  ]

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard SaaS</h1>
          <p className="text-gray-600 mt-1">
            Monitoreo y gestión de la plataforma POS SaaS Chile
          </p>
        </div>

        {/* Métricas Principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            title="Tenants Activos"
            value={metrics.tenantsActivos}
            subtitle="Total de clientes"
            change={{ value: `+${metrics.nuevosEsteMes} este mes`, type: 'positive' }}
            icon={Building}
          />
          
          <MetricCard
            title="Usuarios Totales"
            value={metrics.usuariosTotales}
            subtitle="En todos los tenants"
            change={{ value: '+12 esta semana', type: 'positive' }}
            icon={Users}
          />
          
          <MetricCard
            title="MRR Simulado"
            value={`$${metrics.mrrSimulado.toLocaleString('es-CL')}`}
            subtitle="Ingreso mensual recurrente"
            change={{ value: '+15.3% vs mes anterior', type: 'positive' }}
            icon={DollarSign}
          />
          
          <MetricCard
            title="Tasa de Cobro"
            value={`${Math.round((metrics.cobrosExitosos / (metrics.cobrosExitosos + metrics.cobrosFallidos)) * 100)}%`}
            subtitle={`${metrics.cobrosExitosos} exitosos, ${metrics.cobrosFallidos} fallidos`}
            change={{ value: '+2.1% vs mes anterior', type: 'positive' }}
            icon={TrendingUp}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Tenants Recientes */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                Tenants Recientes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentTenants.map((tenant) => (
                  <div key={tenant.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <div>
                          <p className="font-medium text-gray-900">{tenant.name}</p>
                          <p className="text-sm text-gray-500">RUT: {tenant.rut}</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant={tenant.status === 'active' ? 'default' : 'secondary'}>
                        {tenant.status === 'active' ? 'Activo' : 'Pendiente'}
                      </Badge>
                      <Badge variant="outline">
                        {tenant.plan}
                      </Badge>
                      <Button variant="ghost" size="sm">
                        <ArrowUpRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Tenants en Riesgo */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-600">
                <AlertTriangle className="h-5 w-5" />
                Tenants en Riesgo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {riskTenants.map((tenant) => (
                  <div key={tenant.id} className="p-4 border border-red-200 rounded-lg bg-red-50">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium text-gray-900">{tenant.name}</p>
                        <p className="text-sm text-red-600 mt-1">{tenant.issue}</p>
                      </div>
                      <Badge 
                        variant={tenant.severity === 'high' ? 'destructive' : 'secondary'}
                        className="text-xs"
                      >
                        {tenant.severity === 'high' ? 'Alto' : 'Medio'}
                      </Badge>
                    </div>
                    <Button size="sm" variant="outline" className="mt-3 w-full">
                      Ver Detalle
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Estadísticas de Uso */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Módulos Más Usados</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Punto de Venta</span>
                  <div className="flex items-center gap-2">
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full" style={{ width: '95%' }}></div>
                    </div>
                    <span className="text-sm text-gray-600">95%</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Inventario</span>
                  <div className="flex items-center gap-2">
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div className="bg-green-600 h-2 rounded-full" style={{ width: '78%' }}></div>
                    </div>
                    <span className="text-sm text-gray-600">78%</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Reportes</span>
                  <div className="flex items-center gap-2">
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div className="bg-purple-600 h-2 rounded-full" style={{ width: '62%' }}></div>
                    </div>
                    <span className="text-sm text-gray-600">62%</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Onboarding</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Tiempo promedio</span>
                  <span className="font-medium">8.5 min</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Tasa completitud</span>
                  <span className="font-medium text-green-600">92%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Abandonos</span>
                  <span className="font-medium text-red-600">8%</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Soporte</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm">3 tickets resueltos hoy</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-yellow-600" />
                  <span className="text-sm">2 tickets pendientes</span>
                </div>
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-blue-600" />
                  <span className="text-sm">Tiempo respuesta: 2.3h</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Acciones Rápidas */}
        <Card>
          <CardHeader>
            <CardTitle>Acciones Rápidas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button variant="outline" className="h-auto p-4 flex flex-col gap-2">
                <Building className="h-5 w-5" />
                <span className="text-sm">Aprobar Cajas Extra</span>
              </Button>
              <Button variant="outline" className="h-auto p-4 flex flex-col gap-2">
                <DollarSign className="h-5 w-5" />
                <span className="text-sm">Reintentar Cobros</span>
              </Button>
              <Button variant="outline" className="h-auto p-4 flex flex-col gap-2">
                <Users className="h-5 w-5" />
                <span className="text-sm">Gestionar Usuarios</span>
              </Button>
              <Button variant="outline" className="h-auto p-4 flex flex-col gap-2">
                <AlertTriangle className="h-5 w-5" />
                <span className="text-sm">Ver Alertas</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
