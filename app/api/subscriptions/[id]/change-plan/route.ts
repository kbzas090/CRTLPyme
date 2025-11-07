
/**
 * API to change subscription plan (upgrade/downgrade)
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { verifyAdminSaaSAccess } from '@/lib/admin-auth';
import { changeSubscriptionPlan } from '@/lib/subscription-service';
import { sendPlanChangeEmail } from '@/lib/sendgrid';

/**
 * POST /api/subscriptions/[id]/change-plan
 * Change subscription plan
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
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
    const { newPlanId, immediate } = body;

    if (!newPlanId) {
      return NextResponse.json(
        { error: 'El campo newPlanId es requerido' },
        { status: 400 }
      );
    }

    // Only PROVEEDOR or the subscription owner can change plan
    const { error: adminError } = await verifyAdminSaaSAccess();
    const isAdmin = !adminError;

    const { prisma } = await import('@/lib/db');
    const subscription = await prisma.subscription.findUnique({
      where: { id: params.id },
      include: {
        tenant: true,
        plan: true,
      },
    });

    if (!subscription) {
      return NextResponse.json(
        { error: 'Suscripción no encontrada' },
        { status: 404 }
      );
    }

    if (!isAdmin && subscription.tenantId !== session.user.tenantId) {
      return NextResponse.json(
        { error: 'No tiene permisos para cambiar el plan de esta suscripción' },
        { status: 403 }
      );
    }

    // Get new plan details
    const newPlan = await prisma.subscriptionPlan.findUnique({
      where: { id: newPlanId },
    });

    if (!newPlan) {
      return NextResponse.json(
        { error: 'Plan no encontrado' },
        { status: 404 }
      );
    }

    const result = await changeSubscriptionPlan(
      params.id,
      newPlanId,
      immediate || false
    );

    if (!result.success) {
      return NextResponse.json(
        { error: result.message },
        { status: 400 }
      );
    }

    // Send email notification
    await sendPlanChangeEmail(
      subscription.tenant.email,
      subscription.tenant.businessName,
      subscription.plan.name,
      newPlan.name,
      result.subscription.nextBillingDate || new Date()
    );

    return NextResponse.json({
      message: result.message,
      subscription: result.subscription,
      oldPlan: subscription.plan.name,
      newPlan: newPlan.name,
    });
  } catch (error) {
    console.error('Error al cambiar plan de suscripción:', error);
    return NextResponse.json(
      { error: 'Error al cambiar plan de suscripción' },
      { status: 500 }
    );
  }
}
