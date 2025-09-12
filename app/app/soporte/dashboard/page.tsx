
'use client'

import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { MetricCard } from '@/components/dashboard/metric-card'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  HeadphonesIcon, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Users,
  Building,
  BarChart3,
  MessageSquare,
  Zap,
  TrendingUp
} from 'lucide-react'

export default function SoporteDashboard() {
  // Mock data for demo
  const soporteData = {
    ticketsAbiertos: 8,
    ticketsResueltosHoy: 12,
    tiempoPromedioRespuesta: 2.3, // horas
    satisfaccionPromedio: 4.2, // de 5
    tenantsConProblemas: 3,
    usuariosActivos: 147
  }

  const ticketsRecientes = [
    { 
      id: '#T-2045', 
      tenant: 'Almacén Norte', 
      asunto: 'Error en sincronización de inventario', 
      prioridad: 'alta', 
      tiempo: '2h', 
      estado: 'abierto' 
    },
    { 
      id: '#T-2044', 
      tenant: 'Tienda Central', 
      asunto: 'Problemas con códigos de barras', 
      prioridad: 'media', 
      tiempo: '45min', 
      estado: 'en_proceso' 
    },
    { 
      id: '#T-2043', 
      tenant: 'Minimarket Los Aromos', 
      asunto: 'Consulta sobre reportes', 
      prioridad: 'baja', 
      tiempo: '1h', 
      estado: 'resuelto' 
    },
    { 
      id: '#T-2042', 
      tenant: 'Almacén San Juan', 
      asunto: 'Configuración de punto de equilibrio', 
      prioridad: 'media', 
      tiempo: '3h', 
      estado: 'abierto' 
    },
  ]

  const categoriaProblemas = [
    { categoria: 'Inventario', cantidad: 5, porcentaje: 35 },
    { categoria: 'Punto de Venta', cantidad: 4, porcentaje: 28 },
    { categoria: 'Reportes', cantidad: 3, porcentaje: 21 },
    { categoria: 'Configuración', cantidad: 2, porcentaje: 14 },
  ]

  const tenantsActivos = [
    { name: 'Almacén San Juan', usuarios: 4, ultimaActividad: '5 min', estado: 'activo' },
    { name: 'Minimarket Los Aromos', usuarios: 3, ultimaActividad: '12 min', estado: 'activo' },
    { name: 'Tienda Doña María', usuarios: 2, ultimaActividad: '1h', estado: 'activo' },
    { name: 'Almacén Norte', usuarios: 3, ultimaActividad: '2 días', estado: 'inactivo' },
  ]

  const metricas = [
    { titulo: 'Tiempo Resolución', valor: '4.2h', cambio: '-15min vs semana', tipo: 'positive' },
    { titulo: 'Satisfacción Cliente', valor: '4.2/5', cambio: '+0.3 vs mes anterior', tipo: 'positive' },
    { titulo: 'Tickets Escalados', valor: '2', cambio: '-1 vs ayer', tipo: 'positive' },
    { titulo: 'Conocimiento Base', valor: '89%', cambio: 'Artículos utilizados', tipo: 'neutral' },
  ]

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard Soporte</h1>
            <p className="text-gray-600 mt-1">
              Gestión de tickets y soporte técnico
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline">
              <BarChart3 className="h-4 w-4 mr-2" />
              Reportes
            </Button>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <MessageSquare className="h-4 w-4 mr-2" />
              Nuevo Ticket
            </Button>
          </div>
        </div>

        {/* Métricas Principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            title="Tickets Abiertos"
            value={soporteData.ticketsAbiertos}
            subtitle="Pendientes de resolución"
            change={{ value: '+2 desde ayer', type: 'negative' }}
            icon={AlertCircle}
          />
          
          <MetricCard
            title="Resueltos Hoy"
            value={soporteData.ticketsResueltosHoy}
            subtitle="Tickets cerrados"
            change={{ value: '+3 vs promedio', type: 'positive' }}
            icon={CheckCircle}
          />
          
          <MetricCard
            title="Tiempo Respuesta"
            value={`${soporteData.tiempoPromedioRespuesta}h`}
            subtitle="Promedio de respuesta"
            change={{ value: '-15min vs semana', type: 'positive' }}
            icon={Clock}
          />
          
          <MetricCard
            title="Satisfacción"
            value={`${soporteData.satisfaccionPromedio}/5`}
            subtitle="Calificación promedio"
            change={{ value: '+0.2 vs mes anterior', type: 'positive' }}
            icon={HeadphonesIcon}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Tickets Recientes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Tickets Recientes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {ticketsRecientes.map((ticket) => (
                  <div key={ticket.id} className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <span className="font-medium text-blue-600">{ticket.id}</span>
                        <p className="text-sm text-gray-600">{ticket.tenant}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant={
                            ticket.prioridad === 'alta' ? 'destructive' : 
                            ticket.prioridad === 'media' ? 'secondary' : 
                            'outline'
                          }
                          className="text-xs"
                        >
                          {ticket.prioridad.toUpperCase()}
                        </Badge>
                        <Badge 
                          variant={
                            ticket.estado === 'resuelto' ? 'default' :
                            ticket.estado === 'en_proceso' ? 'secondary' :
                            'outline'
                          }
                          className="text-xs"
                        >
                          {ticket.estado.replace('_', ' ').toUpperCase()}
                        </Badge>
                      </div>
                    </div>
                    <p className="text-sm text-gray-900 mb-2">{ticket.asunto}</p>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Clock className="h-3 w-3" />
                      <span>Hace {ticket.tiempo}</span>
                    </div>
                  </div>
                ))}
              </div>
              <Button variant="ghost" className="w-full mt-4">
                Ver Todos los Tickets
              </Button>
            </CardContent>
          </Card>

          {/* Tenants Activos */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                Tenants Activos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {tenantsActivos.map((tenant) => (
                  <div key={tenant.name} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium text-sm">{tenant.name}</p>
                      <p className="text-xs text-gray-500">{tenant.usuarios} usuarios activos</p>
                    </div>
                    <div className="text-right">
                      <Badge 
                        variant={tenant.estado === 'activo' ? 'default' : 'secondary'}
                        className="text-xs mb-1"
                      >
                        {tenant.estado}
                      </Badge>
                      <p className="text-xs text-gray-500">{tenant.ultimaActividad}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Categorías de Problemas */}
          <Card>
            <CardHeader>
              <CardTitle>Categorías de Problemas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {categoriaProblemas.map((cat) => (
                  <div key={cat.categoria} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">{cat.categoria}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">{cat.cantidad} tickets</span>
                        <span className="text-sm text-gray-500">({cat.porcentaje}%)</span>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${cat.porcentaje}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Métricas de Rendimiento */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Rendimiento del Equipo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {metricas.map((metrica) => (
                  <div key={metrica.titulo} className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">{metrica.titulo}</span>
                    <div className="text-right">
                      <span className="font-medium">{metrica.valor}</span>
                      <div>
                        <Badge 
                          variant={metrica.tipo === 'positive' ? 'default' : 'secondary'}
                          className="text-xs"
                        >
                          {metrica.cambio}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Acciones y Herramientas */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Herramientas Rápidas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                <Button variant="outline" className="h-auto p-4 flex flex-col gap-2">
                  <MessageSquare className="h-5 w-5" />
                  <span className="text-sm">Crear Ticket</span>
                </Button>
                <Button variant="outline" className="h-auto p-4 flex flex-col gap-2">
                  <Users className="h-5 w-5" />
                  <span className="text-sm">Gestionar Usuarios</span>
                </Button>
                <Button variant="outline" className="h-auto p-4 flex flex-col gap-2">
                  <Building className="h-5 w-5" />
                  <span className="text-sm">Ver Tenants</span>
                </Button>
                <Button variant="outline" className="h-auto p-4 flex flex-col gap-2">
                  <BarChart3 className="h-5 w-5" />
                  <span className="text-sm">Reportes</span>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-yellow-500" />
                Alertas del Sistema
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-yellow-600" />
                    <span className="font-medium text-sm">3 tickets sin asignar</span>
                  </div>
                  <p className="text-sm text-yellow-800 mt-1">Requieren atención inmediata</p>
                </div>
                
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-blue-600" />
                    <span className="font-medium text-sm">Sistema operativo</span>
                  </div>
                  <p className="text-sm text-blue-800 mt-1">Todos los servicios funcionando correctamente</p>
                </div>

                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-green-600" />
                    <span className="font-medium text-sm">Mejorando rendimiento</span>
                  </div>
                  <p className="text-sm text-green-800 mt-1">-15 min en tiempo de respuesta esta semana</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
