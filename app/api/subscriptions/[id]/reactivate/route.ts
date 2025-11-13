
/**
 * API to reactivate a cancelled or expired subscription
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminSaaSAccess } from '@/lib/admin-auth';
import { reactivateSubscription } from '@/lib/subscription-service';

/**
 * POST /api/subscriptions/[id]/reactivate
 * Reactivate a subscription (only PROVEEDOR)
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await verifyAdminSaaSAccess();
  if (error) return error;

  try {
    const result = await reactivateSubscription((await params).id);

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
    console.error('Error al reactivar suscripción:', error);
    return NextResponse.json(
      { error: 'Error al reactivar suscripción' },
      { status: 500 }
    );
  }
}
