
/**
 * API para cambiar el plan de un tenant
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyAdminSaaSAccess } from '@/lib/admin-auth';
import { sendPlanChangeEmail } from '@/lib/sendgrid';

/**
 * POST /api/admin-saas/tenants/[id]/change-plan
 * Cambia el plan de suscripción de un tenant
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error, session } = await verifyAdminSaaSAccess();
  if (error) return error;

  try {
    const body = await request.json();
    const { newPlanId, effectiveDate, reason } = body;

    if (!newPlanId) {
      return NextResponse.json(
        { error: 'newPlanId es requerido' },
        { status: 400 }
      );
    }

    // Verificar que el tenant existe
    const tenant = await prisma.tenant.findUnique({
      where: { id: (await params).id },
      include: {
        subscriptions: {
          where: {
            status: {
              in: ['ACTIVE', 'TRIAL'],
            },
          },
          include: {
            plan: true,
          },
        },
      },
    });

    if (!tenant) {
      return NextResponse.json(
        { error: 'Tenant no encontrado' },
        { status: 404 }
      );
    }

    // Verificar que el nuevo plan existe
    const newPlan = await prisma.subscriptionPlan.findUnique({
      where: { id: newPlanId },
    });

    if (!newPlan) {
      return NextResponse.json(
        { error: 'Plan nuevo no encontrado' },
        { status: 404 }
      );
    }

    // Obtener la suscripción activa actual
    const currentSubscription = tenant.subscriptions[0];

    if (!currentSubscription) {
      return NextResponse.json(
        { error: 'El tenant no tiene una suscripción activa' },
        { status: 400 }
      );
    }

    const oldPlanName = currentSubscription.plan.name;
    const newPlanName = newPlan.name;

    // Calcular fecha efectiva
    const effective = effectiveDate ? new Date(effectiveDate) : new Date();

    // Actualizar la suscripción con el nuevo plan
    const updatedSubscription = await prisma.subscription.update({
      where: { id: currentSubscription.id },
      data: {
        planId: newPlanId,
      },
    });

    // Actualizar el planType del tenant
    let tenantPlanType = tenant.planType;
    if (newPlan.name.toLowerCase().includes('basic') || newPlan.name.toLowerCase().includes('básico')) {
      tenantPlanType = 'BASIC';
    } else if (newPlan.name.toLowerCase().includes('pro')) {
      tenantPlanType = 'PRO';
    } else if (newPlan.name.toLowerCase().includes('enterprise')) {
      tenantPlanType = 'ENTERPRISE';
    }

    await prisma.tenant.update({
      where: { id: (await params).id },
      data: {
        planType: tenantPlanType,
      },
    });

    // Registrar acción en logs
    await prisma.auditLog.create({
      data: {
        action: 'PLAN_CHANGED',
        entity: 'Subscription',
        entityId: currentSubscription.id,
        oldValues: {
          planId: currentSubscription.planId,
          planName: oldPlanName,
        },
        newValues: {
          planId: newPlanId,
          planName: newPlanName,
          reason,
        },
        tenantId: (await params).id,
      },
    });

    // Enviar email de cambio de plan
    await sendPlanChangeEmail(
      tenant.email,
      tenant.businessName,
      oldPlanName,
      newPlanName,
      effective
    );

    return NextResponse.json({
      message: 'Plan cambiado exitosamente',
      subscription: updatedSubscription,
      oldPlan: oldPlanName,
      newPlan: newPlanName,
    });
  } catch (error) {
    console.error('Error al cambiar plan:', error);
    return NextResponse.json(
      { error: 'Error al cambiar plan' },
      { status: 500 }
    );
  }
}
