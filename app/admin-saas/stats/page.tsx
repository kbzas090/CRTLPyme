/**
 * Página de estadísticas globales del sistema SaaS
 * Muestra métricas avanzadas y análisis del sistema completo
 */

'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import {
  BarChart3,
  TrendingUp,
  Users,
  Building2,
  Package,
  DollarSign,
  Activity,
} from 'lucide-react';

interface Stats {
  overview: {
    tenantsActive: number;
    tenantsInactive: number;
    tenantsTotal: number;
    recentTenants: number;
    totalUsers: number;
    totalInventoryItems: number;
    totalSales: number;
    totalSalesAmount: number;
  };
  usersByRole: Array<{ role: string; count: number }>;
  planDistribution: Array<{ plan: string; count: number }>;
  topTenants: Array<{
    id: string;
    businessName: string;
    rut: string;
    planType: string;
    totalSales: number;
    salesCount: number;
  }>;
}

export default function StatsPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/admin-saas/stats');
      
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error al cargar estadísticas:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
    }).format(amount);
  };

  const getRoleLabel = (role: string) => {
    const labels: { [key: string]: string } = {
      'PROVEEDOR': 'Administradores SaaS',
      'ADMIN': 'Administradores de Tenant',
      'CAJA': 'Cajeros',
      'INVENTARIO': 'Encargados de Inventario',
      'SOPORTE': 'Soporte',
    };
    return labels[role] || role;
  };

  const getPlanLabel = (plan: string) => {
    const labels: { [key: string]: string } = {
      'BASIC': 'Básico',
      'PRO': 'Profesional',
      'ENTERPRISE': 'Empresarial',
    };
    return labels[plan] || plan;
  };

  /**
   * Realiza una división segura evitando NaN e Infinity
   * @param numerator - El numerador
   * @param denominator - El denominador
   * @param decimals - Número de decimales (default: 1)
   * @returns El resultado formateado o "0.0" si la división no es válida
   */
  const safeDivide = (numerator: number, denominator: number, decimals: number = 1): string => {
    // Validar que ambos valores sean números válidos
    if (
      typeof numerator !== 'number' || 
      typeof denominator !== 'number' ||
      isNaN(numerator) || 
      isNaN(denominator) ||
      denominator === 0
    ) {
      return '0.0';
    }
    
    const result = numerator / denominator;
    
    // Validar que el resultado sea un número válido
    if (isNaN(result) || !isFinite(result)) {
      return '0.0';
    }
    
    return result.toFixed(decimals);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-96" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(8)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="flex h-96 items-center justify-center">
        <p className="text-gray-500">No se pudieron cargar las estadísticas</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Estadísticas del Sistema
        </h1>
        <p className="mt-2 text-gray-600">
          Métricas avanzadas y análisis del sistema multi-tenant
        </p>
      </div>

      {/* Estadísticas principales - Sección 1: Tenants */}
      <div>
        <h2 className="mb-4 text-xl font-semibold text-gray-900">Clientes (Tenants)</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">Total Tenants</CardTitle>
              <Building2 className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.overview.tenantsTotal}</div>
              <p className="text-xs text-gray-500">
                Clientes registrados
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">Tenants Activos</CardTitle>
              <Activity className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {stats.overview.tenantsActive}
              </div>
              <p className="text-xs text-gray-500">
                {safeDivide(stats.overview.tenantsActive * 100, stats.overview.tenantsTotal)}% del total
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">Tenants Inactivos</CardTitle>
              <Activity className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {stats.overview.tenantsInactive}
              </div>
              <p className="text-xs text-gray-500">
                {safeDivide(stats.overview.tenantsInactive * 100, stats.overview.tenantsTotal)}% del total
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">Nuevos (7 días)</CardTitle>
              <TrendingUp className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.overview.recentTenants}</div>
              <p className="text-xs text-gray-500">
                Clientes recientes
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Estadísticas principales - Sección 2: Usuarios y Productos */}
      <div>
        <h2 className="mb-4 text-xl font-semibold text-gray-900">Recursos del Sistema</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">Total Usuarios</CardTitle>
              <Users className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.overview.totalUsers}</div>
              <p className="text-xs text-gray-500">
                {safeDivide(stats.overview.totalUsers, stats.overview.tenantsActive)} usuarios/tenant
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">Total Productos</CardTitle>
              <Package className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.overview.totalInventoryItems}</div>
              <p className="text-xs text-gray-500">
                {safeDivide(stats.overview.totalInventoryItems, stats.overview.tenantsActive)} productos/tenant
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">Total Ventas</CardTitle>
              <BarChart3 className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.overview.totalSales}</div>
              <p className="text-xs text-gray-500">
                Transacciones completadas
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">Ingresos Totales</CardTitle>
              <DollarSign className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(Number(stats.overview.totalSalesAmount))}
              </div>
              <p className="text-xs text-gray-500">
                Volumen de negocio
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Distribución de Usuarios por Rol */}
      <Card>
        <CardHeader>
          <CardTitle>Distribución de Usuarios por Rol</CardTitle>
          <CardDescription>
            Cantidad de usuarios según su función en el sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stats.usersByRole.map((item, index) => {
              const percentage = parseFloat(safeDivide(item.count * 100, stats.overview.totalUsers));
              const colors = ['bg-blue-500', 'bg-purple-500', 'bg-green-500', 'bg-orange-500', 'bg-pink-500'];
              
              return (
                <div key={item.role} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`h-3 w-3 rounded-full ${colors[index % colors.length]}`} />
                      <span className="text-sm font-medium">{getRoleLabel(item.role)}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-gray-600">{item.count} usuarios</span>
                      <Badge variant="outline">{percentage.toFixed(1)}%</Badge>
                    </div>
                  </div>
                  <div className="h-2 w-full rounded-full bg-gray-200">
                    <div
                      className={`h-2 rounded-full ${colors[index % colors.length]}`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Distribución de Planes */}
      <Card>
        <CardHeader>
          <CardTitle>Distribución de Planes Contratados</CardTitle>
          <CardDescription>
            Tenants por tipo de plan de suscripción
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-3">
            {stats.planDistribution.map((item, index) => {
              const percentage = parseFloat(safeDivide(item.count * 100, stats.overview.tenantsActive));
              const colors = ['bg-blue-500', 'bg-purple-500', 'bg-green-500'];
              
              return (
                <div key={item.plan} className="text-center">
                  <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-gray-100">
                    <div className="text-3xl font-bold">{item.count}</div>
                  </div>
                  <h3 className="text-lg font-semibold">{getPlanLabel(item.plan)}</h3>
                  <div className="mt-2">
                    <Badge className={colors[index % colors.length]}>
                      {percentage.toFixed(1)}% del total
                    </Badge>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Top Tenants */}
      <Card>
        <CardHeader>
          <CardTitle>Top 5 Clientes por Volumen de Ventas</CardTitle>
          <CardDescription>
            Clientes más activos del sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stats.topTenants.map((tenant, index) => (
              <div
                key={tenant.id}
                className="flex items-center justify-between rounded-lg border p-4 hover:bg-gray-50"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-lg font-bold text-white">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-semibold">{tenant.businessName}</p>
                    <p className="text-sm text-gray-500">
                      {tenant.rut} • Plan {getPlanLabel(tenant.planType)}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-green-600">
                    {formatCurrency(tenant.totalSales)}
                  </p>
                  <p className="text-sm text-gray-500">
                    {tenant.salesCount} ventas
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Métricas Calculadas */}
      <Card>
        <CardHeader>
          <CardTitle>Métricas Calculadas</CardTitle>
          <CardDescription>
            Indicadores clave de rendimiento del sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <div className="text-center">
              <p className="text-sm text-gray-500">Promedio Usuarios/Tenant</p>
              <p className="text-3xl font-bold text-blue-600">
                {safeDivide(stats.overview.totalUsers, stats.overview.tenantsActive)}
              </p>
            </div>
            
            <div className="text-center">
              <p className="text-sm text-gray-500">Promedio Productos/Tenant</p>
              <p className="text-3xl font-bold text-purple-600">
                {safeDivide(stats.overview.totalInventoryItems, stats.overview.tenantsActive)}
              </p>
            </div>
            
            <div className="text-center">
              <p className="text-sm text-gray-500">Promedio Ventas/Tenant</p>
              <p className="text-3xl font-bold text-green-600">
                {safeDivide(stats.overview.totalSales, stats.overview.tenantsActive)}
              </p>
            </div>
            
            <div className="text-center">
              <p className="text-sm text-gray-500">Ticket Promedio</p>
              <p className="text-3xl font-bold text-orange-600">
                {formatCurrency(parseFloat(safeDivide(Number(stats.overview.totalSalesAmount), stats.overview.totalSales, 0)))}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
