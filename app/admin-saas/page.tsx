
/**
 * Dashboard principal del Administrador SaaS
 * Muestra resumen de todos los tenants y estadísticas generales
 */

'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Building2, 
  Users, 
  Package, 
  TrendingUp,
  AlertCircle,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

interface Stats {
  overview: {
    tenantsActive: number;
    tenantsInactive: number;
    tenantsTotal: number;
    recentTenants: number;
    totalUsers: number;
    totalInventoryItems: number;  // ✅ Items en inventarios de tenants
    totalMasterProducts: number;  // ✅ Productos en el pool maestro
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

export default function AdminSaaSDashboard() {
  const { data: session } = useSession();
  const [stats, setStats] = useState<Stats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/admin-saas/stats');
      
      if (!response.ok) {
        throw new Error('Error al cargar estadísticas');
      }

      const data = await response.json();
      setStats(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
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

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-8 w-64" />
          <Skeleton className="mt-2 h-4 w-96" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <AlertCircle className="h-5 w-5" />
              Error al cargar datos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">{error || 'No se pudieron cargar las estadísticas'}</p>
            <Button onClick={loadStats} className="mt-4">
              Reintentar
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Dashboard Administrador SaaS
        </h1>
        <p className="mt-2 text-gray-600">
          Gestión global de todos los clientes (tenants) del sistema CRTLPyme
        </p>
      </div>

      {/* Métricas principales */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Tenants Activos</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.overview.tenantsActive}</div>
            <p className="text-xs text-gray-500">
              {stats.overview.recentTenants} nuevos esta semana
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Total Usuarios</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.overview.totalUsers}</div>
            <p className="text-xs text-gray-500">
              En {stats.overview.tenantsTotal} tenants
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Items en Inventarios</CardTitle>
            <Package className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.overview.totalInventoryItems.toLocaleString('es-CL')}</div>
            <p className="text-xs text-gray-500">
              En catálogos de clientes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Ventas Totales</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(Number(stats.overview.totalSalesAmount))}</div>
            <p className="text-xs text-gray-500">
              {stats.overview.totalSales} transacciones
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Métrica adicional: Pool Maestro */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-sm font-medium">Pool Maestro de Productos</CardTitle>
          <Package className="h-4 w-4 text-orange-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.overview.totalMasterProducts.toLocaleString('es-CL')}</div>
          <p className="text-xs text-gray-500">
            Productos disponibles para que los clientes agreguen a sus inventarios
          </p>
        </CardContent>
      </Card>

      {/* Distribución de planes y roles */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Distribución de planes */}
        <Card>
          <CardHeader>
            <CardTitle>Distribución de Planes</CardTitle>
            <CardDescription>Clientes por tipo de plan contratado</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.planDistribution.map((item) => (
                <div key={item.plan} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-blue-500" />
                    <span className="text-sm font-medium">{item.plan}</span>
                  </div>
                  <span className="text-sm text-gray-600">{item.count} clientes</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Distribución de usuarios por rol */}
        <Card>
          <CardHeader>
            <CardTitle>Usuarios por Rol</CardTitle>
            <CardDescription>Distribución de usuarios en el sistema</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.usersByRole.map((item) => (
                <div key={item.role} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-purple-500" />
                    <span className="text-sm font-medium">{item.role}</span>
                  </div>
                  <span className="text-sm text-gray-600">{item.count} usuarios</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top 5 Tenants por ventas */}
      <Card>
        <CardHeader>
          <CardTitle>Top 5 Clientes por Ventas</CardTitle>
          <CardDescription>Clientes con mayor volumen de ventas</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stats.topTenants.map((tenant, index) => (
              <div key={tenant.id} className="flex items-center justify-between border-b pb-3 last:border-0">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-700">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium">{tenant.businessName}</p>
                    <p className="text-xs text-gray-500">
                      {tenant.rut} - Plan {tenant.planType}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-green-600">
                    {formatCurrency(tenant.totalSales)}
                  </p>
                  <p className="text-xs text-gray-500">{tenant.salesCount} ventas</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4">
            <Link href="/admin-saas/tenants">
              <Button variant="outline" className="w-full">
                Ver Todos los Tenants
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
