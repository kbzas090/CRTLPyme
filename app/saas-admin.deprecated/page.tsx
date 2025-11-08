
/**
 * New SaaS Admin Dashboard - Subscription Management Focus
 * Specifically for PROVEEDOR role - completely different from regular admin dashboard
 */

'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  CreditCard,
  TrendingUp,
  Users,
  Calendar,
  DollarSign,
  AlertCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { MetricsCards } from '@/components/saas-admin/MetricsCards';
import { PlanManagement } from '@/components/saas-admin/PlanManagement';
import { RecentSubscriptions } from '@/components/saas-admin/RecentSubscriptions';
import { UpcomingRenewals } from '@/components/saas-admin/UpcomingRenewals';
import { RevenueChart } from '@/components/saas-admin/RevenueChart';
import { PlanDistributionChart } from '@/components/saas-admin/PlanDistributionChart';

export default function SaaSAdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session) {
      router.push('/auth/login');
      return;
    }

    if (session.user.role !== 'PROVEEDOR') {
      router.push('/dashboard');
      return;
    }

    setIsLoading(false);
  }, [session, status, router]);

  if (isLoading || status === 'loading') {
    return (
      <div className="space-y-6 p-8">
        <div>
          <Skeleton className="h-10 w-96" />
          <Skeleton className="mt-2 h-4 w-[600px]" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-gray-900">
          Gestión de Suscripciones
        </h1>
        <p className="mt-2 text-lg text-gray-600">
          Panel de control para administración de planes y suscripciones de CRTLPyme
        </p>
      </div>

      {/* Key Metrics Cards */}
      <MetricsCards />

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Resumen</TabsTrigger>
          <TabsTrigger value="plans">Gestión de Planes</TabsTrigger>
          <TabsTrigger value="subscriptions">Suscripciones</TabsTrigger>
          <TabsTrigger value="revenue">Ingresos</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Revenue Chart */}
            <Card className="col-span-2">
              <CardHeader>
                <CardTitle>Tendencia de Ingresos</CardTitle>
                <CardDescription>
                  Ingresos mensuales por suscripciones (últimos 6 meses)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <RevenueChart />
              </CardContent>
            </Card>

            {/* Plan Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Distribución de Planes</CardTitle>
                <CardDescription>
                  Cantidad de suscripciones activas por plan
                </CardDescription>
              </CardHeader>
              <CardContent>
                <PlanDistributionChart />
              </CardContent>
            </Card>

            {/* Recent Subscriptions */}
            <Card>
              <CardHeader>
                <CardTitle>Suscripciones Recientes</CardTitle>
                <CardDescription>
                  Últimas 10 suscripciones creadas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <RecentSubscriptions />
              </CardContent>
            </Card>
          </div>

          {/* Upcoming Renewals */}
          <Card>
            <CardHeader>
              <CardTitle>Renovaciones Próximas</CardTitle>
              <CardDescription>
                Suscripciones que se renovarán en los próximos 30 días
              </CardDescription>
            </CardHeader>
            <CardContent>
              <UpcomingRenewals />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Plans Management Tab */}
        <TabsContent value="plans">
          <PlanManagement />
        </TabsContent>

        {/* Subscriptions Tab */}
        <TabsContent value="subscriptions">
          <Card>
            <CardHeader>
              <CardTitle>Todas las Suscripciones</CardTitle>
              <CardDescription>
                Gestión completa de suscripciones de clientes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500">
                Funcionalidad de gestión de suscripciones en desarrollo...
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Revenue Tab */}
        <TabsContent value="revenue">
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Análisis de Ingresos</CardTitle>
                <CardDescription>
                  Desglose detallado de ingresos por período
                </CardDescription>
              </CardHeader>
              <CardContent>
                <RevenueChart months={12} />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
