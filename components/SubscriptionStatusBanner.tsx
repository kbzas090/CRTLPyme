
'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

interface SubscriptionStatus {
  hasActiveSubscription: boolean;
  subscription: any | null;
  daysUntilExpiration: number | null;
  isExpiringSoon: boolean;
}

export default function SubscriptionStatusBanner() {
  const { data: session, status } = useSession();
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'authenticated' && session?.user?.role !== 'PROVEEDOR') {
      fetchSubscriptionStatus();
    } else {
      setLoading(false);
    }
  }, [status, session]);

  const fetchSubscriptionStatus = async () => {
    try {
      const response = await fetch('/api/subscriptions/status');
      const data = await response.json();
      
      if (response.ok) {
        setSubscriptionStatus(data);
      }
    } catch (error) {
      console.error('Error fetching subscription status:', error);
    } finally {
      setLoading(false);
    }
  };

  // Don't show for PROVEEDOR role
  if (session?.user?.role === 'PROVEEDOR' || loading) {
    return null;
  }

  // No active subscription
  if (subscriptionStatus && !subscriptionStatus.hasActiveSubscription) {
    return (
      <div className="bg-red-600 text-white px-4 py-3 text-center">
        <p className="text-sm">
          ⚠️ No tienes una suscripción activa. 
          <Link href="/subscriptions/plans" className="ml-2 underline font-semibold">
            Ver planes disponibles
          </Link>
        </p>
      </div>
    );
  }

  // Subscription expiring soon
  if (subscriptionStatus?.isExpiringSoon && subscriptionStatus.daysUntilExpiration !== null) {
    return (
      <div className="bg-yellow-500 text-white px-4 py-3 text-center">
        <p className="text-sm">
          ⚠️ Tu suscripción vence en {subscriptionStatus.daysUntilExpiration} día(s). 
          <Link href="/subscriptions" className="ml-2 underline font-semibold">
            Renovar ahora
          </Link>
        </p>
      </div>
    );
  }

  // Trial period
  if (subscriptionStatus?.subscription?.status === 'TRIAL' && subscriptionStatus.daysUntilExpiration !== null) {
    return (
      <div className="bg-blue-600 text-white px-4 py-3 text-center">
        <p className="text-sm">
          🎉 Estás en período de prueba. Te quedan {subscriptionStatus.daysUntilExpiration} día(s).
          <Link href="/subscriptions/plans" className="ml-2 underline font-semibold">
            Ver planes
          </Link>
        </p>
      </div>
    );
  }

  return null;
}
