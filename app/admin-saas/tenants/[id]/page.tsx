/**
 * Página de detalle de un tenant específico
 * Muestra información completa, usuarios, productos y ventas
 */

'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  Building2,
  Users,
  Package,
  TrendingUp,
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Calendar,
  AlertCircle,
  CheckCircle,
  XCircle,
  CreditCard,
  Loader2,
} from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';

// Helper para traducir tipos de plan
const getPlanName = (planType: string): string => {
  const planNames: Record<string, string> = {
    'BASIC': 'Plan Básico',
    'STANDARD': 'Plan Estándar', 
    'PREMIUM': 'Plan Premium',
    'ENTERPRISE': 'Plan Enterprise',
  };
  return planNames[planType] || planType;
};

interface SubscriptionPlan {
  id: string;
  name: string;
  description: string | null;
  price: number;
  billingCycle: string;
  features: string[];
  maxUsers: number | null;
  maxProducts: number | null;
  maxSales: number | null;
  isActive: boolean;
  isVisible: boolean;
}

interface TenantSubscription {
  id: string;
  planId: string;
  status: string;
  startDate: string;
  endDate: string | null;
  nextBillingDate: string | null;
  plan: SubscriptionPlan;
}

interface TenantDetail {
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
  updatedAt: string;
  subscription?: TenantSubscription;
  stats: {
    totalSales: number;
    salesAmount: number;
    totalUsers: number;
    totalProducts: number;
    totalCashSessions: number;
  };
  users: Array<{
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    isActive: boolean;
    createdAt: string;
  }>;
  products: Array<{
    id: string;
    sku: string;
    name: string;
    category: string;
    costPrice: string;
    salePrice: string;
    stock: number;
    minStock: number;
    isActive: boolean;
  }>;
  recentSales: Array<{
    id: string;
    saleNumber: string;
    total: string;
    paymentMethod: string;
    createdAt: string;
    user: {
      firstName: string;
      lastName: string;
    };
  }>;
  fixedExpenses: Array<{
    id: string;
    name: string;
    amount: string;
    frequency: string;
    isActive: boolean;
  }>;
}

export default function TenantDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [tenant, setTenant] = useState<TenantDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [availablePlans, setAvailablePlans] = useState<SubscriptionPlan[]>([]);
  const [isChangePlanDialogOpen, setIsChangePlanDialogOpen] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);

  useEffect(() => {
    if (params.id) {
      loadTenantDetail();
    }
  }, [params.id]);

  const loadTenantDetail = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/admin-saas/tenants/${params.id}`);
      
      if (!response.ok) {
        throw new Error('Error al cargar detalles del tenant');
      }

      const data = await response.json();
      setTenant(data.tenant);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setIsLoading(false);
    }
  };

  const loadAvailablePlans = async () => {
    try {
      const response = await fetch('/api/saas/plans');
      if (response.ok) {
        const data = await response.json();
        // Filtrar solo planes activos
        setAvailablePlans(data.plans.filter((p: SubscriptionPlan) => p.isActive));
      }
    } catch (error) {
      console.error('Error loading plans:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los planes disponibles',
        variant: 'destructive',
      });
    }
  };

  const handleOpenChangePlanDialog = () => {
    loadAvailablePlans();
    setIsChangePlanDialogOpen(true);
  };

  const handleChangePlan = async (planId: string) => {
    if (!tenant) return;

    setIsProcessingPayment(true);
    setSelectedPlanId(planId);

    try {
      // Crear la transacción de pago con Transbank
      const response = await fetch('/api/payments/transbank/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tenantId: tenant.id,
          planId: planId,
          amount: availablePlans.find(p => p.id === planId)?.price || 0,
        }),
      });

      if (!response.ok) {
        throw new Error('Error al crear la transacción de pago');
      }

      const data = await response.json();

      // Redirigir a Transbank
      if (data.url && data.token) {
        // Crear un formulario para enviar el token a Transbank
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = data.url;

        const tokenInput = document.createElement('input');
        tokenInput.type = 'hidden';
        tokenInput.name = 'token_ws';
        tokenInput.value = data.token;
        form.appendChild(tokenInput);

        document.body.appendChild(form);
        form.submit();
      } else {
        throw new Error('No se recibió la URL de pago');
      }
    } catch (error) {
      console.error('Error al iniciar pago:', error);
      toast({
        title: 'Error',
        description: 'No se pudo iniciar el proceso de pago',
        variant: 'destructive',
      });
      setIsProcessingPayment(false);
      setSelectedPlanId(null);
    }
  };

  const formatCurrency = (amount: string | number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
    }).format(Number(amount));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-CL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('es-CL', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'default';
      case 'CAJA':
        return 'secondary';
      case 'INVENTARIO':
        return 'outline';
      default:
        return 'outline';
    }
  };

  const getBillingCycleLabel = (cycle: string) => {
    const labels: { [key: string]: string } = {
      MONTHLY: 'Mensual',
      YEARLY: 'Anual',
      QUARTERLY: 'Trimestral',
    };
    return labels[cycle] || cycle;
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-96" />
        <div className="grid gap-4 md:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  if (error || !tenant) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <AlertCircle className="h-5 w-5" />
              Error al cargar tenant
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">{error || 'No se pudo cargar la información del tenant'}</p>
            <Button onClick={() => router.back()} className="mt-4">
              Volver
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header con navegación */}
      <div>
        <Link href="/admin-saas/tenants">
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver a Tenants
          </Button>
        </Link>
        
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold text-gray-900">{tenant.businessName}</h1>
              <Badge variant={tenant.isActive ? 'default' : 'secondary'}>
                {tenant.isActive ? (
                  <>
                    <CheckCircle className="mr-1 h-3 w-3" />
                    Activo
                  </>
                ) : (
                  <>
                    <XCircle className="mr-1 h-3 w-3" />
                    Inactivo
                  </>
                )}
              </Badge>
              <Badge variant="outline">{getPlanName(tenant.planType)}</Badge>
            </div>
            <p className="mt-2 text-gray-600">RUT: {tenant.rut}</p>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline">Editar</Button>
            <Button variant={tenant.isActive ? 'destructive' : 'default'}>
              {tenant.isActive ? 'Desactivar' : 'Activar'}
            </Button>
          </div>
        </div>
      </div>

      {/* Información de contacto */}
      <Card>
        <CardHeader>
          <CardTitle>Información de Contacto</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium">{tenant.email}</p>
              </div>
            </div>
            
            {tenant.phone && (
              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Teléfono</p>
                  <p className="font-medium">{tenant.phone}</p>
                </div>
              </div>
            )}
            
            {tenant.address && (
              <div className="flex items-center gap-3">
                <MapPin className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Dirección</p>
                  <p className="font-medium">{tenant.address}</p>
                </div>
              </div>
            )}
            
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Creado</p>
                <p className="font-medium">{formatDate(tenant.createdAt)}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Suscripción y Plan */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Plan de Suscripción</CardTitle>
              <CardDescription>Información del plan actual y opciones de cambio</CardDescription>
            </div>
            <Button onClick={handleOpenChangePlanDialog}>
              <CreditCard className="mr-2 h-4 w-4" />
              Cambiar Plan
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {tenant.subscription ? (
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <p className="text-sm text-gray-500">Plan Actual</p>
                  <p className="text-xl font-bold">{tenant.subscription.plan.name}</p>
                  {tenant.subscription.plan.description && (
                    <p className="text-sm text-gray-600 mt-1">{tenant.subscription.plan.description}</p>
                  )}
                </div>
                <div>
                  <p className="text-sm text-gray-500">Precio</p>
                  <p className="text-xl font-bold text-green-600">
                    {formatCurrency(tenant.subscription.plan.price)}
                  </p>
                  <p className="text-sm text-gray-600">
                    {getBillingCycleLabel(tenant.subscription.plan.billingCycle)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Estado</p>
                  <Badge variant={tenant.subscription.status === 'ACTIVE' ? 'default' : 'secondary'} className="mt-1">
                    {tenant.subscription.status === 'ACTIVE' ? 'Activa' : tenant.subscription.status}
                  </Badge>
                  {tenant.subscription.nextBillingDate && (
                    <p className="text-xs text-gray-500 mt-1">
                      Próximo pago: {formatDate(tenant.subscription.nextBillingDate)}
                    </p>
                  )}
                </div>
              </div>

              {tenant.subscription.plan.features && tenant.subscription.plan.features.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">Características del Plan:</p>
                  <ul className="grid gap-2 md:grid-cols-2">
                    {tenant.subscription.plan.features.map((feature, index) => (
                      <li key={index} className="flex items-center gap-2 text-sm text-gray-600">
                        <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="border-t pt-4">
                <p className="text-sm font-medium text-gray-700 mb-2">Límites del Plan:</p>
                <div className="grid gap-2 md:grid-cols-3 text-sm">
                  <div>
                    <span className="text-gray-500">Usuarios:</span>{' '}
                    <span className="font-medium">{tenant.subscription.plan.maxUsers || 'Ilimitado'}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Productos:</span>{' '}
                    <span className="font-medium">{tenant.subscription.plan.maxProducts || 'Ilimitado'}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Ventas/mes:</span>{' '}
                    <span className="font-medium">{tenant.subscription.plan.maxSales || 'Ilimitado'}</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <AlertCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-gray-600 mb-4">Este tenant no tiene una suscripción activa</p>
              <Button onClick={handleOpenChangePlanDialog}>
                <CreditCard className="mr-2 h-4 w-4" />
                Asignar Plan
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Estadísticas principales */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Usuarios</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tenant.stats.totalUsers}</div>
            <p className="text-xs text-gray-500">
              Usuarios registrados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Productos</CardTitle>
            <Package className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tenant.stats.totalProducts}</div>
            <p className="text-xs text-gray-500">
              En catálogo
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Ventas</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tenant.stats.totalSales}</div>
            <p className="text-xs text-gray-500">
              Transacciones
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Total Vendido</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(tenant.stats.salesAmount)}</div>
            <p className="text-xs text-gray-500">
              Ingresos totales
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs con detalles */}
      <Tabs defaultValue="users" className="space-y-4">
        <TabsList>
          <TabsTrigger value="users">
            Usuarios ({tenant.users.length})
          </TabsTrigger>
          <TabsTrigger value="products">
            Productos ({tenant.products.length})
          </TabsTrigger>
          <TabsTrigger value="sales">
            Ventas Recientes
          </TabsTrigger>
          <TabsTrigger value="expenses">
            Gastos Fijos
          </TabsTrigger>
        </TabsList>

        {/* Tab de Usuarios */}
        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>Usuarios del Tenant</CardTitle>
              <CardDescription>
                Lista de todos los usuarios registrados para este cliente
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {tenant.users.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between border-b pb-4 last:border-0"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                        <Users className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium">
                          {user.firstName} {user.lastName}
                        </p>
                        <p className="text-sm text-gray-500">{user.email}</p>
                        <p className="text-xs text-gray-400">
                          Creado: {formatDate(user.createdAt)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={getRoleBadgeColor(user.role)}>
                        {user.role}
                      </Badge>
                      <Badge variant={user.isActive ? 'default' : 'secondary'}>
                        {user.isActive ? 'Activo' : 'Inactivo'}
                      </Badge>
                    </div>
                  </div>
                ))}
                
                {tenant.users.length === 0 && (
                  <p className="py-8 text-center text-gray-500">
                    No hay usuarios registrados
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab de Productos */}
        <TabsContent value="products">
          <Card>
            <CardHeader>
              <CardTitle>Catálogo de Productos</CardTitle>
              <CardDescription>
                Productos registrados en el inventario del cliente
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="pb-3 text-left text-sm font-medium text-gray-500">SKU</th>
                      <th className="pb-3 text-left text-sm font-medium text-gray-500">Producto</th>
                      <th className="pb-3 text-left text-sm font-medium text-gray-500">Categoría</th>
                      <th className="pb-3 text-right text-sm font-medium text-gray-500">Costo</th>
                      <th className="pb-3 text-right text-sm font-medium text-gray-500">Precio</th>
                      <th className="pb-3 text-right text-sm font-medium text-gray-500">Stock</th>
                      <th className="pb-3 text-center text-sm font-medium text-gray-500">Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tenant.products.map((product) => (
                      <tr key={product.id} className="border-b">
                        <td className="py-3 text-sm">{product.sku}</td>
                        <td className="py-3 text-sm font-medium">{product.name}</td>
                        <td className="py-3 text-sm text-gray-600">{product.category}</td>
                        <td className="py-3 text-right text-sm">{formatCurrency(product.costPrice)}</td>
                        <td className="py-3 text-right text-sm font-medium">{formatCurrency(product.salePrice)}</td>
                        <td className={`py-3 text-right text-sm font-medium ${
                          product.stock <= product.minStock ? 'text-orange-600' : ''
                        }`}>
                          {product.stock}
                          {product.stock <= product.minStock && (
                            <AlertCircle className="ml-1 inline h-4 w-4 text-orange-500" />
                          )}
                        </td>
                        <td className="py-3 text-center">
                          <Badge variant={product.isActive ? 'default' : 'secondary'}>
                            {product.isActive ? 'Activo' : 'Inactivo'}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                
                {tenant.products.length === 0 && (
                  <p className="py-8 text-center text-gray-500">
                    No hay productos registrados
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab de Ventas Recientes */}
        <TabsContent value="sales">
          <Card>
            <CardHeader>
              <CardTitle>Últimas Ventas</CardTitle>
              <CardDescription>
                Últimas 10 transacciones realizadas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {tenant.recentSales.map((sale) => (
                  <div
                    key={sale.id}
                    className="flex items-center justify-between border-b pb-4 last:border-0"
                  >
                    <div>
                      <p className="font-medium">Venta #{sale.saleNumber}</p>
                      <p className="text-sm text-gray-500">
                        {sale.user.firstName} {sale.user.lastName}
                      </p>
                      <p className="text-xs text-gray-400">
                        {formatDateTime(sale.createdAt)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-green-600">
                        {formatCurrency(sale.total)}
                      </p>
                      <Badge variant="outline">{sale.paymentMethod}</Badge>
                    </div>
                  </div>
                ))}
                
                {tenant.recentSales.length === 0 && (
                  <p className="py-8 text-center text-gray-500">
                    No hay ventas registradas
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab de Gastos Fijos */}
        <TabsContent value="expenses">
          <Card>
            <CardHeader>
              <CardTitle>Gastos Fijos</CardTitle>
              <CardDescription>
                Gastos operacionales configurados
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {tenant.fixedExpenses.map((expense) => (
                  <div
                    key={expense.id}
                    className="flex items-center justify-between border-b pb-4 last:border-0"
                  >
                    <div>
                      <p className="font-medium">{expense.name}</p>
                      <p className="text-sm text-gray-500">
                        Frecuencia: {expense.frequency}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold">
                        {formatCurrency(expense.amount)}
                      </p>
                      <Badge variant={expense.isActive ? 'default' : 'secondary'}>
                        {expense.isActive ? 'Activo' : 'Inactivo'}
                      </Badge>
                    </div>
                  </div>
                ))}
                
                {tenant.fixedExpenses.length === 0 && (
                  <p className="py-8 text-center text-gray-500">
                    No hay gastos fijos configurados
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Diálogo de Cambio de Plan */}
      <Dialog open={isChangePlanDialogOpen} onOpenChange={setIsChangePlanDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Cambiar Plan de Suscripción</DialogTitle>
            <DialogDescription>
              Selecciona un nuevo plan para el cliente. Se iniciará el proceso de pago con Transbank.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {availablePlans.length === 0 ? (
              <div className="text-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Cargando planes disponibles...</p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {availablePlans.map((plan) => (
                  <Card 
                    key={plan.id} 
                    className={`hover:shadow-lg transition-shadow ${
                      tenant?.subscription?.planId === plan.id ? 'border-blue-500 border-2' : ''
                    }`}
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg">{plan.name}</CardTitle>
                          {plan.description && (
                            <CardDescription className="mt-1">{plan.description}</CardDescription>
                          )}
                        </div>
                        {tenant?.subscription?.planId === plan.id && (
                          <Badge>Plan Actual</Badge>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Precio */}
                      <div className="border-b pb-3">
                        <div className="text-2xl font-bold text-gray-900">
                          {formatCurrency(Number(plan.price))}
                        </div>
                        <p className="text-sm text-gray-500">
                          {getBillingCycleLabel(plan.billingCycle)}
                        </p>
                      </div>

                      {/* Características */}
                      {plan.features && plan.features.length > 0 && (
                        <div className="space-y-2">
                          {plan.features.slice(0, 5).map((feature, index) => (
                            <div key={index} className="flex items-start gap-2 text-sm">
                              <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                              <span className="text-gray-600">{feature}</span>
                            </div>
                          ))}
                          {plan.features.length > 5 && (
                            <p className="text-xs text-gray-500 pl-6">
                              +{plan.features.length - 5} características más
                            </p>
                          )}
                        </div>
                      )}

                      {/* Límites */}
                      <div className="border-t pt-3 space-y-1 text-sm">
                        {plan.maxUsers && (
                          <div className="flex justify-between">
                            <span className="text-gray-500">Usuarios:</span>
                            <span className="font-medium">{plan.maxUsers}</span>
                          </div>
                        )}
                        {plan.maxProducts && (
                          <div className="flex justify-between">
                            <span className="text-gray-500">Productos:</span>
                            <span className="font-medium">{plan.maxProducts}</span>
                          </div>
                        )}
                        {plan.maxSales && (
                          <div className="flex justify-between">
                            <span className="text-gray-500">Ventas/mes:</span>
                            <span className="font-medium">{plan.maxSales}</span>
                          </div>
                        )}
                      </div>

                      {/* Botón de acción */}
                      <Button
                        className="w-full"
                        onClick={() => handleChangePlan(plan.id)}
                        disabled={
                          isProcessingPayment || 
                          tenant?.subscription?.planId === plan.id
                        }
                      >
                        {isProcessingPayment && selectedPlanId === plan.id ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Procesando...
                          </>
                        ) : tenant?.subscription?.planId === plan.id ? (
                          'Plan Actual'
                        ) : (
                          <>
                            <CreditCard className="mr-2 h-4 w-4" />
                            Seleccionar Plan
                          </>
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsChangePlanDialogOpen(false)}
              disabled={isProcessingPayment}
            >
              Cancelar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
