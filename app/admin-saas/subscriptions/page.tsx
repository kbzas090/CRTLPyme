
'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

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
  totalPaid?: number;
  lastPayment?: any;
  _count?: {
    payments: number;
  };
}

export default function SubscriptionsManagementPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    } else if (status === 'authenticated' && session?.user?.role !== 'PROVEEDOR') {
      router.push('/');
    }
  }, [status, session, router]);

  useEffect(() => {
    if (status === 'authenticated') {
      fetchSubscriptions();
    }
  }, [status, filter]);

  const fetchSubscriptions = async () => {
    try {
      setLoading(true);
      const url = filter === 'ALL'
        ? '/api/subscriptions'
        : `/api/subscriptions?status=${filter}`;
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (response.ok) {
        setSubscriptions(data.subscriptions || []);
      } else {
        console.error('Error fetching subscriptions:', data.error);
      }
    } catch (error) {
      console.error('Error fetching subscriptions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (subscriptionId: string, action: 'cancel' | 'reactivate' | 'renew') => {
    try {
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
        fetchSubscriptions();
      } else {
        const data = await response.json();
        alert(`Error: ${data.error}`);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al procesar la acción');
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-800';
      case 'TRIAL':
        return 'bg-blue-100 text-blue-800';
      case 'CANCELLED':
        return 'bg-gray-100 text-gray-800';
      case 'EXPIRED':
        return 'bg-red-100 text-red-800';
      case 'SUSPENDED':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
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
      month: 'short',
      day: 'numeric',
    }).format(new Date(dateString));
  };

  const filteredSubscriptions = subscriptions.filter(sub =>
    sub.tenant.businessName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sub.tenant.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sub.tenant.rut.includes(searchTerm)
  );

  if (status === 'loading' || loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Gestión de Suscripciones</h1>
        <p className="text-gray-600">Administra todas las suscripciones de los tenants</p>
      </div>

      {/* Filters and Search */}
      <div className="mb-6 flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Buscar por empresa, email o RUT..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {['ALL', 'ACTIVE', 'TRIAL', 'CANCELLED', 'EXPIRED', 'SUSPENDED'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === status
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {status === 'ALL' ? 'Todas' : status}
            </button>
          ))}
        </div>
      </div>

      {/* Subscriptions Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tenant
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Plan
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Próxima Facturación
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Pagado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredSubscriptions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    No se encontraron suscripciones
                  </td>
                </tr>
              ) : (
                filteredSubscriptions.map((subscription) => (
                  <tr key={subscription.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <div className="text-sm font-medium text-gray-900">
                          {subscription.tenant.businessName}
                        </div>
                        <div className="text-sm text-gray-500">
                          {subscription.tenant.email}
                        </div>
                        <div className="text-xs text-gray-400">
                          RUT: {subscription.tenant.rut}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {subscription.plan.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {formatCurrency(subscription.plan.price)} / {subscription.plan.billingCycle}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeColor(subscription.status)}`}>
                        {subscription.status}
                      </span>
                      {subscription.autoRenew && (
                        <div className="text-xs text-gray-500 mt-1">
                          Auto-renovación: Sí
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(subscription.nextBillingDate)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {formatCurrency(subscription.totalPaid || 0)}
                      </div>
                      <div className="text-xs text-gray-500">
                        {subscription._count?.payments || 0} pagos
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex flex-col gap-2">
                        <button
                          onClick={() => router.push(`/admin-saas/subscriptions/${subscription.id}`)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Ver Detalles
                        </button>
                        {subscription.status === 'ACTIVE' && (
                          <button
                            onClick={() => handleStatusChange(subscription.id, 'cancel')}
                            className="text-red-600 hover:text-red-900"
                          >
                            Cancelar
                          </button>
                        )}
                        {['CANCELLED', 'EXPIRED', 'SUSPENDED'].includes(subscription.status) && (
                          <button
                            onClick={() => handleStatusChange(subscription.id, 'reactivate')}
                            className="text-green-600 hover:text-green-900"
                          >
                            Reactivar
                          </button>
                        )}
                        {subscription.status === 'ACTIVE' && (
                          <button
                            onClick={() => handleStatusChange(subscription.id, 'renew')}
                            className="text-purple-600 hover:text-purple-900"
                          >
                            Renovar Ahora
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-sm text-gray-600 mb-1">Total Suscripciones</div>
          <div className="text-2xl font-bold text-gray-900">{subscriptions.length}</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-sm text-gray-600 mb-1">Activas</div>
          <div className="text-2xl font-bold text-green-600">
            {subscriptions.filter(s => s.status === 'ACTIVE').length}
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-sm text-gray-600 mb-1">En Prueba</div>
          <div className="text-2xl font-bold text-blue-600">
            {subscriptions.filter(s => s.status === 'TRIAL').length}
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-sm text-gray-600 mb-1">Expiradas/Canceladas</div>
          <div className="text-2xl font-bold text-red-600">
            {subscriptions.filter(s => ['EXPIRED', 'CANCELLED', 'SUSPENDED'].includes(s.status)).length}
          </div>
        </div>
      </div>
    </div>
  );
}
