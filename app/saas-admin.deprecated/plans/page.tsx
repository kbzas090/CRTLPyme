/**
 * SaaS Admin - Plans Page
 * Displays all available subscription plans with statistics
 */

'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, RefreshCw, Users, TrendingUp, Package, CheckCircle, XCircle } from 'lucide-react';

interface Plan {
  id: string;
  name: string;
  description: string | null;
  price: number;
  billingCycle: string;
  trialDays: number;
  isVisible: boolean;
  isActive: boolean;
  features: any;
  maxUsers: number | null;
  maxProducts: number | null;
  maxSales: number | null;
  sortOrder: number;
  activeSubscriptions: number;
  createdAt: string;
  updatedAt: string;
}

export default function PlansPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/saas/plans');
      if (response.ok) {
        const data = await response.json();
        setPlans(data.plans);
      }
    } catch (error) {
      console.error('Error loading plans:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getBillingCycleLabel = (cycle: string) => {
    const labels: { [key: string]: string } = {
      MONTHLY: 'Mensual',
      YEARLY: 'Anual',
      QUARTERLY: 'Trimestral',
    };
    return labels[cycle] || cycle;
  };

  const totalActiveSubscriptions = plans.reduce((sum, plan) => sum + plan.activeSubscriptions, 0);

  return (
    <div className="space-y-6 p-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-gray-900">
            Gestión de Planes
          </h1>
          <p className="mt-2 text-lg text-gray-600">
            Administra los planes de suscripción disponibles en la plataforma
          </p>
        </div>
        <Button onClick={loadPlans} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Actualizar
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total de Planes
            </CardTitle>
            <Package className="h-5 w-5 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">
              {plans.length}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {plans.filter(p => p.isActive).length} activos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-gray-600">
              Suscripciones Activas
            </CardTitle>
            <Users className="h-5 w-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">
              {totalActiveSubscriptions}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Total en todos los planes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-gray-600">
              Ingresos Potenciales
            </CardTitle>
            <TrendingUp className="h-5 w-5 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">
              {formatCurrency(
                plans.reduce((sum, plan) => 
                  sum + (Number(plan.price) * plan.activeSubscriptions), 0
                )
              )}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Por ciclo de facturación
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Plans Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      ) : plans.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12 text-gray-500">
            No hay planes disponibles
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {plans.map((plan) => (
            <Card key={plan.id} className={`hover:shadow-lg transition-shadow ${!plan.isActive ? 'opacity-60' : ''}`}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <div className="flex gap-2">
                    {plan.isActive ? (
                      <Badge variant="default" className="bg-green-100 text-green-700">
                        Activo
                      </Badge>
                    ) : (
                      <Badge variant="secondary">
                        Inactivo
                      </Badge>
                    )}
                    {!plan.isVisible && (
                      <Badge variant="outline">
                        Oculto
                      </Badge>
                    )}
                  </div>
                </div>
                {plan.description && (
                  <CardDescription className="mt-2">
                    {plan.description}
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Price */}
                <div className="border-b pb-4">
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-bold text-gray-900">
                      {formatCurrency(Number(plan.price))}
                    </span>
                    <span className="text-gray-500">
                      / {getBillingCycleLabel(plan.billingCycle)}
                    </span>
                  </div>
                  {plan.trialDays > 0 && (
                    <p className="text-sm text-green-600 mt-1">
                      {plan.trialDays} días de prueba gratis
                    </p>
                  )}
                </div>

                {/* Subscriptions */}
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-blue-600" />
                    <span className="text-sm font-medium text-gray-700">
                      Suscripciones Activas
                    </span>
                  </div>
                  <span className="text-2xl font-bold text-blue-600">
                    {plan.activeSubscriptions}
                  </span>
                </div>

                {/* Limits */}
                <div className="space-y-2">
                  <h4 className="font-semibold text-gray-700 text-sm">Límites del Plan</h4>
                  <div className="space-y-1 text-sm">
                    {plan.maxUsers !== null && (
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span>Hasta {plan.maxUsers} usuarios</span>
                      </div>
                    )}
                    {plan.maxProducts !== null && (
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span>Hasta {plan.maxProducts} productos</span>
                      </div>
                    )}
                    {plan.maxSales !== null && (
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span>Hasta {plan.maxSales} ventas/mes</span>
                      </div>
                    )}
                    {plan.maxUsers === null && plan.maxProducts === null && plan.maxSales === null && (
                      <div className="flex items-center gap-2 text-gray-500">
                        <CheckCircle className="h-4 w-4" />
                        <span>Sin límites</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Features */}
                {plan.features && Array.isArray(plan.features) && plan.features.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-semibold text-gray-700 text-sm">Características</h4>
                    <ul className="space-y-1 text-sm">
                      {plan.features.map((feature: string, index: number) => (
                        <li key={index} className="flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Revenue from this plan */}
                <div className="border-t pt-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Ingresos por ciclo:</span>
                    <span className="font-semibold text-gray-900">
                      {formatCurrency(Number(plan.price) * plan.activeSubscriptions)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
