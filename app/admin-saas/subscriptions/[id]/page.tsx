
'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';

interface SubscriptionDetail {
  id: string;
  status: string;
  startDate: string;
  endDate: string | null;
  nextBillingDate: string | null;
  lastBillingDate: string | null;
  autoRenew: boolean;
  billingCycle: string;
  discountPercent: number | null;
  lifetimeValue: number | null;
  paymentFailureCount: number;
  cancelledAt: string | null;
  cancellationReason: string | null;
  tenant: {
    id: string;
    businessName: string;
    email: string;
    rut: string;
    phone: string | null;
  };
  plan: {
    id: string;
    name: string;
    description: string | null;
    price: number;
    billingCycle: string;
  };
  payments: Array<{
    id: string;
    amount: number;
    status: string;
    paymentDate: string | null;
    createdAt: string;
  }>;
  stats: {
    totalPaid: number;
    successfulPayments: number;
    failedPayments: number;
  };
}

export default function SubscriptionDetailPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const subscriptionId = params?.id as string;

  const [subscription, setSubscription] = useState<SubscriptionDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [plans, setPlans] = useState<any[]>([]);
  const [selectedPlanId, setSelectedPlanId] = useState('');
  const [showChangePlanModal, setShowChangePlanModal] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    } else if (status === 'authenticated' && session?.user?.role !== 'PROVEEDOR') {
      router.push('/');
    }
  }, [status, session, router]);

  useEffect(() => {
    if (status === 'authenticated' && subscriptionId) {
      fetchSubscriptionDetail();
      fetchPlans();
    }
  }, [status, subscriptionId]);

  const fetchSubscriptionDetail = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/subscriptions/${subscriptionId}`);
      const data = await response.json();
      
      if (response.ok) {
        setSubscription(data.subscription);
      } else {
        console.error('Error fetching subscription:', data.error);
        alert('Error al cargar la suscripción');
      }
    } catch (error) {
      console.error('Error fetching subscription:', error);
      alert('Error al cargar la suscripción');
    } finally {
      setLoading(false);
    }
  };

  const fetchPlans = async () => {
    try {
      const response = await fetch('/api/subscription-plans?all=true');
      const data = await response.json();
      
      if (response.ok) {
        setPlans(data.plans || []);
      }
    } catch (error) {
      console.error('Error fetching plans:', error);
    }
  };

  const handleAction = async (action: 'cancel' | 'reactivate' | 'renew') => {
    if (!confirm(`¿Está seguro de que desea ${action === 'cancel' ? 'cancelar' : action === 'reactivate' ? 'reactivar' : 'renovar'} esta suscripción?`)) {
      return;
    }

    try {
      setActionLoading(true);
      const endpoint = `/api/subscriptions/${subscriptionId}/${action}`;
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(action === 'cancel' ? { immediate: false } : {}),
      });

      if (response.ok) {
        alert(`Suscripción ${action === 'cancel' ? 'cancelada' : action === 'reactivate' ? 'reactivada' : 'renovada'} exitosamente`);
        fetchSubscriptionDetail();
      } else {
        const data = await response.json();
        alert(`Error: ${data.error}`);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al procesar la acción');
    } finally {
      setActionLoading(false);
    }
  };

  const handleChangePlan = async () => {
    if (!selectedPlanId) {
      alert('Por favor, seleccione un plan');
      return;
    }

    if (!confirm('¿Está seguro de que desea cambiar el plan de esta suscripción?')) {
      return;
    }

    try {
      setActionLoading(true);
      const response = await fetch(`/api/subscriptions/${subscriptionId}/change-plan`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          newPlanId: selectedPlanId,
          immediate: true,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        alert(`Plan cambiado de ${data.oldPlan} a ${data.newPlan} exitosamente`);
        setShowChangePlanModal(false);
        fetchSubscriptionDetail();
      } else {
        const data = await response.json();
        alert(`Error: ${data.error}`);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al cambiar el plan');
    } finally {
      setActionLoading(false);
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
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(dateString));
  };

  const getStatusBadge = (status: string) => {
    const colors: { [key: string]: string } = {
      ACTIVE: 'bg-green-100 text-green-800',
      TRIAL: 'bg-blue-100 text-blue-800',
      CANCELLED: 'bg-gray-100 text-gray-800',
      EXPIRED: 'bg-red-100 text-red-800',
      SUSPENDED: 'bg-yellow-100 text-yellow-800',
      APPROVED: 'bg-green-100 text-green-800',
      PENDING: 'bg-yellow-100 text-yellow-800',
      FAILED: 'bg-red-100 text-red-800',
    };

    return (
      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${colors[status] || 'bg-gray-100 text-gray-800'}`}>
        {status}
      </span>
    );
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
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">Suscripción no encontrada</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => router.push('/admin-saas/subscriptions')}
          className="mb-4 text-blue-600 hover:text-blue-800 flex items-center gap-2"
        >
          ← Volver a Suscripciones
        </button>
        <h1 className="text-3xl font-bold mb-2">Detalle de Suscripción</h1>
        <p className="text-gray-600">{subscription.tenant.businessName}</p>
      </div>

      {/* Main Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {/* Tenant Info */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Información del Tenant</h2>
          <div className="space-y-3">
            <div>
              <div className="text-sm text-gray-600">Empresa</div>
              <div className="font-medium">{subscription.tenant.businessName}</div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Email</div>
              <div className="font-medium">{subscription.tenant.email}</div>
            </div>
            <div>
              <div className="text-sm text-gray-600">RUT</div>
              <div className="font-medium">{subscription.tenant.rut}</div>
            </div>
            {subscription.tenant.phone && (
              <div>
                <div className="text-sm text-gray-600">Teléfono</div>
                <div className="font-medium">{subscription.tenant.phone}</div>
              </div>
            )}
          </div>
        </div>

        {/* Plan Info */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Plan Actual</h2>
          <div className="space-y-3">
            <div>
              <div className="text-sm text-gray-600">Nombre</div>
              <div className="font-medium text-lg">{subscription.plan.name}</div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Precio</div>
              <div className="font-medium text-lg text-blue-600">
                {formatCurrency(subscription.plan.price)}
              </div>
              <div className="text-sm text-gray-500">
                {subscription.billingCycle}
              </div>
            </div>
            {subscription.discountPercent && (
              <div>
                <div className="text-sm text-gray-600">Descuento</div>
                <div className="font-medium text-green-600">
                  {subscription.discountPercent}%
                </div>
              </div>
            )}
          </div>
          <button
            onClick={() => setShowChangePlanModal(true)}
            className="mt-4 w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Cambiar Plan
          </button>
        </div>

        {/* Subscription Status */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Estado</h2>
          <div className="space-y-3">
            <div>
              <div className="text-sm text-gray-600 mb-1">Estado Actual</div>
              {getStatusBadge(subscription.status)}
            </div>
            <div>
              <div className="text-sm text-gray-600">Auto-renovación</div>
              <div className="font-medium">
                {subscription.autoRenew ? '✓ Activada' : '✗ Desactivada'}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Inicio</div>
              <div className="font-medium">{formatDate(subscription.startDate)}</div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Próxima Facturación</div>
              <div className="font-medium">{formatDate(subscription.nextBillingDate)}</div>
            </div>
            {subscription.paymentFailureCount > 0 && (
              <div>
                <div className="text-sm text-gray-600">Fallos de Pago</div>
                <div className="font-medium text-red-600">{subscription.paymentFailureCount}</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-sm text-gray-600 mb-1">Total Pagado</div>
          <div className="text-2xl font-bold text-green-600">
            {formatCurrency(subscription.stats.totalPaid)}
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-sm text-gray-600 mb-1">Pagos Exitosos</div>
          <div className="text-2xl font-bold text-blue-600">
            {subscription.stats.successfulPayments}
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-sm text-gray-600 mb-1">Pagos Fallidos</div>
          <div className="text-2xl font-bold text-red-600">
            {subscription.stats.failedPayments}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <h2 className="text-lg font-semibold mb-4">Acciones</h2>
        <div className="flex flex-wrap gap-3">
          {subscription.status === 'ACTIVE' && (
            <>
              <button
                onClick={() => handleAction('cancel')}
                disabled={actionLoading}
                className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                Cancelar Suscripción
              </button>
              <button
                onClick={() => handleAction('renew')}
                disabled={actionLoading}
                className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
              >
                Renovar Ahora
              </button>
            </>
          )}
          {['CANCELLED', 'EXPIRED', 'SUSPENDED'].includes(subscription.status) && (
            <button
              onClick={() => handleAction('reactivate')}
              disabled={actionLoading}
              className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              Reactivar Suscripción
            </button>
          )}
        </div>
      </div>

      {/* Payment History */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-4">Historial de Pagos</h2>
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Fecha de Pago
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {subscription.payments.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                    No hay pagos registrados
                  </td>
                </tr>
              ) : (
                subscription.payments.map((payment) => (
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
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(payment.paymentDate)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Change Plan Modal */}
      {showChangePlanModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-semibold mb-4">Cambiar Plan</h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Seleccionar Nuevo Plan
              </label>
              <select
                value={selectedPlanId}
                onChange={(e) => setSelectedPlanId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Seleccione un plan...</option>
                {plans
                  .filter(p => p.id !== subscription.plan.id)
                  .map((plan) => (
                    <option key={plan.id} value={plan.id}>
                      {plan.name} - {formatCurrency(plan.price)} / {plan.billingCycle}
                    </option>
                  ))}
              </select>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleChangePlan}
                disabled={actionLoading || !selectedPlanId}
                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                Confirmar Cambio
              </button>
              <button
                onClick={() => {
                  setShowChangePlanModal(false);
                  setSelectedPlanId('');
                }}
                disabled={actionLoading}
                className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
