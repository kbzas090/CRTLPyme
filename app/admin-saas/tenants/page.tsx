
/**
 * Página de gestión de todos los tenants
 * Lista todos los clientes del sistema SaaS
 */

'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import {
  Building2,
  Users,
  Package,
  TrendingUp,
  CheckCircle,
  XCircle,
  Eye,
  AlertTriangle,
} from 'lucide-react';
import Link from 'next/link';
import { Input } from '@/components/ui/input';

interface Tenant {
  id: string;
  businessName: string;
  rut: string;
  email: string;
  phone: string | null;
  address: string | null;
  planType: string;
  isActive: boolean;
  maxCashiers: number;
  extraCashiers: number;
  createdAt: string;
  stats: {
    totalUsers: number;
    totalProducts: number;
    totalSales: number;
    salesAmount: number;
    lowStockProducts: number;
  };
}

export default function TenantsListPage() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [filteredTenants, setFilteredTenants] = useState<Tenant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterActive, setFilterActive] = useState<'all' | 'active' | 'inactive'>('all');

  useEffect(() => {
    loadTenants();
  }, []);

  useEffect(() => {
    filterTenantsList();
  }, [searchTerm, filterActive, tenants]);

  const loadTenants = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/admin-saas/tenants');
      
      if (response.ok) {
        const data = await response.json();
        setTenants(data.tenants);
      }
    } catch (error) {
      console.error('Error al cargar tenants:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterTenantsList = () => {
    let filtered = tenants;

    // Filtrar por estado
    if (filterActive === 'active') {
      filtered = filtered.filter(t => t.isActive);
    } else if (filterActive === 'inactive') {
      filtered = filtered.filter(t => !t.isActive);
    }

    // Filtrar por búsqueda
    if (searchTerm) {
      filtered = filtered.filter(
        t =>
          t.businessName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          t.rut.includes(searchTerm) ||
          t.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredTenants(filtered);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-CL', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-96" />
        <div className="grid gap-4">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Gestor de clientes</h1>
        <p className="mt-2 text-gray-600">
          Administra todos los clientes del sistema CRTLPyme
        </p>
      </div>

      {/* Resumen rápido */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Tenants</p>
                <p className="text-2xl font-bold">{tenants.length}</p>
              </div>
              <Building2 className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Activos</p>
                <p className="text-2xl font-bold text-green-600">
                  {tenants.filter(t => t.isActive).length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Inactivos</p>
                <p className="text-2xl font-bold text-red-600">
                  {tenants.filter(t => !t.isActive).length}
                </p>
              </div>
              <XCircle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros y búsqueda */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Input
              placeholder="Buscar por nombre, RUT o email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1"
            />
            <div className="flex gap-2">
              <Button
                variant={filterActive === 'all' ? 'default' : 'outline'}
                onClick={() => setFilterActive('all')}
              >
                Todos
              </Button>
              <Button
                variant={filterActive === 'active' ? 'default' : 'outline'}
                onClick={() => setFilterActive('active')}
              >
                Activos
              </Button>
              <Button
                variant={filterActive === 'inactive' ? 'default' : 'outline'}
                onClick={() => setFilterActive('inactive')}
              >
                Inactivos
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de tenants */}
      <div className="space-y-4">
        <p className="text-sm text-gray-600">
          Mostrando {filteredTenants.length} de {tenants.length} tenants
        </p>

        {filteredTenants.map((tenant) => (
          <Card key={tenant.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-xl">{tenant.businessName}</CardTitle>
                    <Badge variant={tenant.isActive ? 'default' : 'secondary'}>
                      {tenant.isActive ? 'Activo' : 'Inactivo'}
                    </Badge>
                    <Badge variant="outline">{tenant.planType}</Badge>
                  </div>
                  <CardDescription>
                    RUT: {tenant.rut} • Creado: {formatDate(tenant.createdAt)}
                  </CardDescription>
                </div>
                <Link href={`/admin-saas/tenants/${tenant.id}`}>
                  <Button size="sm">
                    <Eye className="mr-2 h-4 w-4" />
                    Ver Detalles
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
                {/* Usuarios */}
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-blue-100 p-2">
                    <Users className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Usuarios</p>
                    <p className="text-lg font-semibold">{tenant.stats.totalUsers}</p>
                  </div>
                </div>

                {/* Productos */}
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-purple-100 p-2">
                    <Package className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Productos</p>
                    <p className="text-lg font-semibold">{tenant.stats.totalProducts}</p>
                  </div>
                </div>

                {/* Ventas */}
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-green-100 p-2">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Ventas</p>
                    <p className="text-lg font-semibold">{tenant.stats.totalSales}</p>
                  </div>
                </div>

                {/* Monto ventas */}
                <div>
                  <p className="text-sm text-gray-500">Total Vendido</p>
                  <p className="text-lg font-semibold text-green-600">
                    {formatCurrency(Number(tenant.stats.salesAmount))}
                  </p>
                </div>

                {/* Stock bajo */}
                {tenant.stats.lowStockProducts > 0 && (
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-orange-500" />
                    <div>
                      <p className="text-sm text-gray-500">Stock Bajo</p>
                      <p className="text-lg font-semibold text-orange-600">
                        {tenant.stats.lowStockProducts}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Información de contacto */}
              <div className="mt-4 border-t pt-4">
                <div className="grid gap-2 text-sm md:grid-cols-2">
                  <div>
                    <span className="font-medium">Email:</span>{' '}
                    <span className="text-gray-600">{tenant.email}</span>
                  </div>
                  {tenant.phone && (
                    <div>
                      <span className="font-medium">Teléfono:</span>{' '}
                      <span className="text-gray-600">{tenant.phone}</span>
                    </div>
                  )}
                  {tenant.address && (
                    <div className="md:col-span-2">
                      <span className="font-medium">Dirección:</span>{' '}
                      <span className="text-gray-600">{tenant.address}</span>
                    </div>
                  )}
                  <div>
                    <span className="font-medium">Cajas:</span>{' '}
                    <span className="text-gray-600">
                      {tenant.maxCashiers} máx ({tenant.extraCashiers} extras)
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {filteredTenants.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <Building2 className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-4 text-lg font-medium text-gray-900">
                No se encontraron tenants
              </h3>
              <p className="mt-2 text-gray-500">
                Intenta ajustar los filtros de búsqueda
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
