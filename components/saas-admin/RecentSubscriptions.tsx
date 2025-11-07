
/**
 * Recent Subscriptions Component
 * Shows the most recent subscription purchases
 */

'use client';

import { useEffect, useState } from 'react';
import { Loader2, ExternalLink } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface Subscription {
  id: string;
  createdAt: string;
  status: string;
  tenant: {
    businessName: string;
    email: string;
  };
  plan: {
    name: string;
    price: number;
  };
}

export function RecentSubscriptions() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSubscriptions();
  }, []);

  const loadSubscriptions = async () => {
    try {
      const response = await fetch('/api/saas/subscriptions/recent?limit=10');
      if (response.ok) {
        const data = await response.json();
        setSubscriptions(data.subscriptions);
      }
    } catch (error) {
      console.error('Error loading subscriptions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-CL', {
      day: 'numeric',
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-48">
        <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
      </div>
    );
  }

  if (subscriptions.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No hay suscripciones recientes
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {subscriptions.map((subscription) => (
        <div
          key={subscription.id}
          className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors"
        >
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <p className="font-medium text-gray-900">
                {subscription.tenant.businessName}
              </p>
              <Badge variant="outline" className="text-xs">
                {subscription.plan.name}
              </Badge>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {subscription.tenant.email}
            </p>
          </div>
          <div className="text-right">
            <p className="font-semibold text-gray-900">
              {formatCurrency(Number(subscription.plan.price))}
            </p>
            <p className="text-xs text-gray-500">{formatDate(subscription.createdAt)}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
