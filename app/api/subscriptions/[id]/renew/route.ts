
/**
 * API to manually renew a subscription
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminSaaSAccess } from '@/lib/admin-auth';
import { renewSubscription } from '@/lib/subscription-service';

/**
 * POST /api/subscriptions/[id]/renew
 * Manually renew a subscription (only PROVEEDOR)
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { error } = await verifyAdminSaaSAccess();
  if (error) return error;

  try {
    const result = await renewSubscription(params.id);

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
    console.error('Error al renovar suscripción:', error);
    return NextResponse.json(
      { error: 'Error al renovar suscripción' },
      { status: 500 }
    );
  }
}
