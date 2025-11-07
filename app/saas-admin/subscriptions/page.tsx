/**
 * SaaS Admin - Subscriptions Page
 * Displays all subscription data with filtering and pagination
 */

'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Search, RefreshCw, Calendar, CreditCard, Building2 } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface Subscription {
  id: string;
  status: string;
  startDate: string;
  endDate: string | null;
  nextBillingDate: string | null;
  autoRenew: boolean;
  tenant: {
    id: string;
    businessName: string;
    email: string;
    rut: string;
  };
  plan: {
    id: string;
    name: string;
    price: number;
    billingCycle: string;
  };
  createdAt: string;
}

export default function SubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [pagination, setPagination] = useState({
    total: 0,
    limit: 50,
    offset: 0,
    hasMore: false
  });

  useEffect(() => {
    loadSubscriptions();
  }, [statusFilter, pagination.offset]);

  const loadSubscriptions = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        limit: pagination.limit.toString(),
        offset: pagination.offset.toString(),
      });

      if (statusFilter && statusFilter !== 'all') {
        params.append('status', statusFilter);
      }

      const response = await fetch(`/api/saas/subscriptions?${params}`);
      if (response.ok) {
        const data = await response.json();
        setSubscriptions(data.subscriptions);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error('Error loading subscriptions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('es-CL', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    const variants: { [key: string]: { variant: any; label: string } } = {
      ACTIVE: { variant: 'default', label: 'Activa' },
      CANCELLED: { variant: 'destructive', label: 'Cancelada' },
      EXPIRED: { variant: 'secondary', label: 'Expirada' },
      SUSPENDED: { variant: 'outline', label: 'Suspendida' },
    };

    const config = variants[status] || { variant: 'outline', label: status };
    return <Badge variant={config.variant as any}>{config.label}</Badge>;
  };

  const filteredSubscriptions = subscriptions.filter(sub =>
    searchTerm === '' ||
    sub.tenant.businessName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sub.tenant.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sub.tenant.rut.includes(searchTerm)
  );

  return (
    <div className="space-y-6 p-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-gray-900">
          Gestión de Suscripciones
        </h1>
        <p className="mt-2 text-lg text-gray-600">
          Administra todas las suscripciones de clientes en la plataforma
        </p>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros y Búsqueda</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                <Input
                  placeholder="Buscar por negocio, email o RUT..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                <SelectItem value="ACTIVE">Activas</SelectItem>
                <SelectItem value="CANCELLED">Canceladas</SelectItem>
                <SelectItem value="EXPIRED">Expiradas</SelectItem>
                <SelectItem value="SUSPENDED">Suspendidas</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={loadSubscriptions} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Actualizar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Subscriptions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Suscripciones ({pagination.total})</CardTitle>
          <CardDescription>
            Lista completa de suscripciones con detalles de cliente y plan
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          ) : filteredSubscriptions.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              No se encontraron suscripciones
            </div>
          ) : (
            <>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Cliente</TableHead>
                      <TableHead>Plan</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Precio</TableHead>
                      <TableHead>Inicio</TableHead>
                      <TableHead>Próxima Facturación</TableHead>
                      <TableHead>Auto-Renovación</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSubscriptions.map((subscription) => (
                      <TableRow key={subscription.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium flex items-center gap-2">
                              <Building2 className="h-4 w-4 text-gray-400" />
                              {subscription.tenant.businessName}
                            </div>
                            <div className="text-sm text-gray-500">
                              {subscription.tenant.email}
                            </div>
                            <div className="text-xs text-gray-400">
                              RUT: {subscription.tenant.rut}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <CreditCard className="h-4 w-4 text-gray-400" />
                            <div>
                              <div className="font-medium">{subscription.plan.name}</div>
                              <div className="text-xs text-gray-500">
                                {subscription.plan.billingCycle}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(subscription.status)}
                        </TableCell>
                        <TableCell className="font-semibold">
                          {formatCurrency(Number(subscription.plan.price))}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2 text-sm">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            {formatDate(subscription.startDate)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2 text-sm">
                            {subscription.nextBillingDate ? (
                              <>
                                <Calendar className="h-4 w-4 text-blue-500" />
                                {formatDate(subscription.nextBillingDate)}
                              </>
                            ) : (
                              <span className="text-gray-400">N/A</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {subscription.autoRenew ? (
                            <Badge variant="outline" className="bg-green-50 text-green-700">
                              Sí
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="bg-gray-50 text-gray-700">
                              No
                            </Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between mt-4">
                <div className="text-sm text-gray-500">
                  Mostrando {pagination.offset + 1} - {Math.min(pagination.offset + pagination.limit, pagination.total)} de {pagination.total}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPagination({ ...pagination, offset: Math.max(0, pagination.offset - pagination.limit) })}
                    disabled={pagination.offset === 0}
                  >
                    Anterior
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPagination({ ...pagination, offset: pagination.offset + pagination.limit })}
                    disabled={!pagination.hasMore}
                  >
                    Siguiente
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
