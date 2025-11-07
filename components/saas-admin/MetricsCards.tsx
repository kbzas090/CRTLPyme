
/**
 * Key Metrics Cards Component
 * Displays main subscription metrics
 */

'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Users,
  Calendar,
  CreditCard,
  DollarSign,
  TrendingUp,
  Loader2
} from 'lucide-react';

interface Metrics {
  activeAccounts: number;
  upcomingRenewals: number;
  recentSubscriptions: number;
  monthlyRevenue: number;
  planDistribution: Array<{
    planId: string;
    planName: string;
    count: number;
  }>;
}

export function MetricsCards() {
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadMetrics();
  }, []);

  const loadMetrics = async () => {
    try {
      const response = await fetch('/api/saas/metrics');
      if (response.ok) {
        const data = await response.json();
        setMetrics(data);
      }
    } catch (error) {
      console.error('Error loading metrics:', error);
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

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <Loader2 className="h-4 w-4 animate-spin" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">...</div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!metrics) {
    return null;
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {/* Active Accounts */}
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-sm font-medium text-gray-600">
            Cuentas Activas
          </CardTitle>
          <Users className="h-5 w-5 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-gray-900">
            {metrics.activeAccounts}
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Tenants con suscripción activa
          </p>
        </CardContent>
      </Card>

      {/* Upcoming Renewals */}
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-sm font-medium text-gray-600">
            Renovaciones Próximas
          </CardTitle>
          <Calendar className="h-5 w-5 text-blue-600" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-gray-900">
            {metrics.upcomingRenewals}
          </div>
          <p className="text-xs text-gray-500 mt-1">
            En los próximos 30 días
          </p>
        </CardContent>
      </Card>

      {/* Recent Subscriptions */}
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-sm font-medium text-gray-600">
            Suscripciones Recientes
          </CardTitle>
          <CreditCard className="h-5 w-5 text-purple-600" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-gray-900">
            {metrics.recentSubscriptions}
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Últimos 7 días
          </p>
        </CardContent>
      </Card>

      {/* Monthly Revenue */}
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-sm font-medium text-gray-600">
            Ingresos del Mes
          </CardTitle>
          <DollarSign className="h-5 w-5 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-gray-900">
            {formatCurrency(Number(metrics.monthlyRevenue))}
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Mes actual
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
