
/**
 * API to check subscription status for a tenant
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getSubscriptionStatusSummary } from '@/lib/subscription-service';

/**
 * GET /api/subscriptions/status
 * Get current subscription status for the authenticated user's tenant
 */
export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return NextResponse.json(
      { error: 'No autenticado' },
      { status: 401 }
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    const tenantId = searchParams.get('tenantId') || session.user.tenantId;

    // Only PROVEEDOR can check other tenants' status
    if (tenantId !== session.user.tenantId && session.user.role !== 'PROVEEDOR') {
      return NextResponse.json(
        { error: 'No tiene permisos para ver el estado de esta suscripción' },
        { status: 403 }
      );
    }

    const status = await getSubscriptionStatusSummary(tenantId);

    return NextResponse.json(status);
  } catch (error) {
    console.error('Error al obtener estado de suscripción:', error);
    return NextResponse.json(
      { error: 'Error al obtener estado de suscripción' },
      { status: 500 }
    );
  }
}
