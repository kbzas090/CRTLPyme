/**
 * Subscription Plans Page
 * 
 * Página pública que muestra los planes de suscripción disponibles
 */

'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import SubscriptionPlans from '@/components/subscriptions/SubscriptionPlans';
import { Loader2 } from 'lucide-react';

export default function SubscriptionPlansPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [tenantId, setTenantId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      // Redirigir a login si no está autenticado
      router.push('/login?callbackUrl=/subscriptions/plans');
      return;
    }

    if (status === 'authenticated' && session?.user) {
      // Obtener tenantId del usuario
      // En este caso asumimos que el usuario tiene un tenantId
      // En producción deberías obtenerlo de la sesión o hacer una llamada al API
      const userTenantId = (session.user as any).tenantId;
      
      if (userTenantId) {
        setTenantId(userTenantId);
      } else {
        // Si no tiene tenantId, puede ser que necesite crear uno primero
        // Por ahora usamos un valor temporal para testing
        console.warn('Usuario sin tenantId, usando valor temporal');
        setTenantId('temp-tenant-id');
      }
      
      setLoading(false);
    }
  }, [session, status, router]);

  if (loading || status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!tenantId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold">Error</h2>
          <p className="text-muted-foreground">
            No se pudo determinar tu empresa. Por favor contacta a soporte.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12">
      <div className="container mx-auto">
        <SubscriptionPlans 
          tenantId={tenantId}
          onPaymentInit={(planId) => {
            console.log('Iniciando pago para plan:', planId);
          }}
        />
      </div>
    </div>
  );
}
