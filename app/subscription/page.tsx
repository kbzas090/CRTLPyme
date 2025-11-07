
'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface SubscriptionInfo {
  isActive: boolean;
  planName: string;
  status: string;
  expiresAt: Date | null;
  daysRemaining: number | null;
  features: any;
  limits: {
    users: { current: number; limit: number | null };
    products: { current: number; limit: number | null };
    sales: { current: number; limit: number | null };
  };
}

export default function MySubscriptionPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [subscription, setSubscription] = useState<any>(null);
  const [subscriptionInfo, setSubscriptionInfo] = useState<SubscriptionInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelLoading, setCancelLoading] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    } else if (status === 'authenticated') {
      fetchSubscriptionData();
    }
  }, [status, router]);

  const fetchSubscriptionData = async () => {
    try {
      setLoading(true);
      
      // Fetch subscription details
      const response = await fetch('/api/subscriptions');
      const data = await response.json();
      
      if (response.ok && data.subscriptions && data.subscriptions.length > 0) {
        setSubscription(data.subscriptions[0]);
      }
    } catch (error) {
      console.error('Error fetching subscription:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (!confirm('¿Está seguro de que desea cancelar su suscripción? Tendrá acceso hasta el final del período de facturación actual.')) {
      return;
    }

    try {
      setCancelLoading(true);
      const response = await fetch(`/api/subscriptions/${subscription.id}/cancel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reason: 'Cancelación solicitada por el usuario',
          immediate: false,
        }),
      });

      if (response.ok) {
        alert('Suscripción cancelada exitosamente. Tendrá acceso hasta el final del período de facturación.');
        fetchSubscriptionData();
      } else {
        const data = await response.json();
        alert(`Error al cancelar: ${data.error}`);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al procesar la cancelación');
    } finally {
      setCancelLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
    }).format(amount);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Intl.DateTimeFormat('es-CL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(new Date(dateString));
  };

  const getStatusBadge = (status: string) => {
    const colors: { [key: string]: string } = {
      ACTIVE: 'bg-green-100 text-green-800',
      TRIAL: 'bg-blue-100 text-blue-800',
      CANCELLED: 'bg-gray-100 text-gray-800',
      EXPIRED: 'bg-red-100 text-red-800',
      SUSPENDED: 'bg-yellow-100 text-yellow-800',
    };

    return (
      <span className={`px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full ${colors[status] || 'bg-gray-100 text-gray-800'}`}>
        {status}
      </span>
    );
  };

  const getLimitPercentage = (current: number, limit: number | null) => {
    if (limit === null) return 0;
    return (current / limit) * 100;
  };

  const getLimitColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-red-500';
    if (percentage >= 75) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  if (status === 'loading' || loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!subscription) {
    return (
      <div className="container mx-auto p-6">
        <div className="max-w-2xl mx-auto">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
            <h2 className="text-2xl font-bold mb-4">No tiene una suscripción activa</h2>
            <p className="text-gray-700 mb-6">
              Para acceder a todos los servicios de CRTLPyme, necesita contratar un plan.
            </p>
            <Link
              href="/subscriptions/plans"
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 inline-block"
            >
              Ver Planes Disponibles
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Mi Suscripción</h1>
          <p className="text-gray-600">Administre su plan y facturación</p>
        </div>

        {/* Status Alert */}
        {subscription.status === 'CANCELLED' && (
          <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-yellow-800">
              ⚠️ Su suscripción está cancelada. Tendrá acceso hasta {formatDate(subscription.endDate || subscription.nextBillingDate)}.
            </p>
          </div>
        )}

        {subscription.status === 'EXPIRED' && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">
              ⚠️ Su suscripción ha expirado. Por favor, renueve su plan para continuar usando los servicios.
            </p>
            <Link
              href="/subscriptions/plans"
              className="mt-3 inline-block bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
            >
              Renovar Ahora
            </Link>
          </div>
        )}

        {/* Subscription Card */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">{subscription.plan.name}</h2>
              <p className="text-gray-600">{subscription.plan.description}</p>
            </div>
            {getStatusBadge(subscription.status)}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <div className="text-sm text-gray-600 mb-1">Precio</div>
              <div className="text-2xl font-bold text-blue-600">
                {formatCurrency(subscription.plan.price)}
              </div>
              <div className="text-sm text-gray-500">por {subscription.billingCycle}</div>
            </div>

            <div>
              <div className="text-sm text-gray-600 mb-1">Próxima Facturación</div>
              <div className="text-lg font-semibold">
                {formatDate(subscription.nextBillingDate)}
              </div>
              {subscription.autoRenew && (
                <div className="text-sm text-green-600 mt-1">
                  ✓ Renovación automática activada
                </div>
              )}
            </div>
          </div>

          {/* Usage Limits */}
          {subscription.plan.maxUsers !== null && (
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold mb-4">Límites del Plan</h3>
              <div className="space-y-4">
                {/* Users Limit */}
                {subscription.plan.maxUsers !== null && (
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">Usuarios</span>
                      <span className="font-medium">
                        {subscriptionInfo?.limits.users.current || 0} / {subscription.plan.maxUsers}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${getLimitColor(
                          getLimitPercentage(subscriptionInfo?.limits.users.current || 0, subscription.plan.maxUsers)
                        )}`}
                        style={{
                          width: `${Math.min(
                            getLimitPercentage(subscriptionInfo?.limits.users.current || 0, subscription.plan.maxUsers),
                            100
                          )}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                )}

                {/* Products Limit */}
                {subscription.plan.maxProducts !== null && (
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">Productos</span>
                      <span className="font-medium">
                        {subscriptionInfo?.limits.products.current || 0} / {subscription.plan.maxProducts}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${getLimitColor(
                          getLimitPercentage(subscriptionInfo?.limits.products.current || 0, subscription.plan.maxProducts)
                        )}`}
                        style={{
                          width: `${Math.min(
                            getLimitPercentage(subscriptionInfo?.limits.products.current || 0, subscription.plan.maxProducts),
                            100
                          )}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                )}

                {/* Sales Limit */}
                {subscription.plan.maxSales !== null && (
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">Ventas (este mes)</span>
                      <span className="font-medium">
                        {subscriptionInfo?.limits.sales.current || 0} / {subscription.plan.maxSales}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${getLimitColor(
                          getLimitPercentage(subscriptionInfo?.limits.sales.current || 0, subscription.plan.maxSales)
                        )}`}
                        style={{
                          width: `${Math.min(
                            getLimitPercentage(subscriptionInfo?.limits.sales.current || 0, subscription.plan.maxSales),
                            100
                          )}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">Acciones</h3>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/subscriptions/plans"
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Cambiar Plan
            </Link>
            
            {subscription.status === 'ACTIVE' && (
              <button
                onClick={handleCancelSubscription}
                disabled={cancelLoading}
                className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {cancelLoading ? 'Procesando...' : 'Cancelar Suscripción'}
              </button>
            )}
          </div>
        </div>

        {/* Payment History */}
        {subscription.payments && subscription.payments.length > 0 && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Historial de Pagos</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Fecha
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Monto
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Estado
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {subscription.payments.slice(0, 5).map((payment: any) => (
                    <tr key={payment.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(payment.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {formatCurrency(payment.amount)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(payment.status)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
