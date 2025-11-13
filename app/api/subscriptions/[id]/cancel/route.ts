
/**
 * API to cancel a subscription
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { verifyAdminSaaSAccess } from '@/lib/admin-auth';
import { cancelSubscription } from '@/lib/subscription-service';

/**
 * POST /api/subscriptions/[id]/cancel
 * Cancel a subscription
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return NextResponse.json(
      { error: 'No autenticado' },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();
    const { reason, immediate } = body;

    // Only PROVEEDOR or the subscription owner can cancel
    const { error: adminError } = await verifyAdminSaaSAccess();
    const isAdmin = !adminError;

    if (!isAdmin) {
      // Verify the subscription belongs to the user's tenant
      const { prisma } = await import('@/lib/db');
      const subscription = await prisma.subscription.findUnique({
        where: { id: (await params).id },
      });

      if (!subscription || subscription.tenantId !== session.user.tenantId) {
        return NextResponse.json(
          { error: 'No tiene permisos para cancelar esta suscripción' },
          { status: 403 }
        );
      }
    }

    const result = await cancelSubscription(
      (await params).id,
      reason,
      immediate || false
    );

    if (!result.success) {
      return NextResponse.json(
        { error: result.message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      message: result.message,
      subscription: result.subscription,
    });
  } catch (error) {
    console.error('Error al cancelar suscripción:', error);
    return NextResponse.json(
      { error: 'Error al cancelar suscripción' },
      { status: 500 }
    );
  }
}
