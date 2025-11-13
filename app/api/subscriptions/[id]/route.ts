/**
 * API para gestionar una suscripción específica
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { verifyAdminSaaSAccess } from '@/lib/admin-auth';
import { sendPlanChangeEmail } from '@/lib/sendgrid';

/**
 * GET /api/subscriptions/[id]
 * Obtiene detalles de una suscripción específica
 */
export async function GET(
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
    const subscription = await prisma.subscription.findUnique({
      where: { id: (await params).id },
      include: {
        plan: true,
        tenant: true,
        payments: {
          orderBy: {
            createdAt: 'desc',
          },
          take: 10,
        },
      },
    });

    if (!subscription) {
      return NextResponse.json(
        { error: 'Suscripción no encontrada' },
        { status: 404 }
      );
    }

    // Verificar permisos
    if (
      session.user.role !== 'PROVEEDOR' &&
      subscription.tenantId !== session.user.tenantId
    ) {
      return NextResponse.json(
        { error: 'No tiene permisos para ver esta suscripción' },
        { status: 403 }
      );
    }

    // Calcular estadísticas
    const totalPaid = await prisma.subscriptionPayment.aggregate({
      where: {
        subscriptionId: (await params).id,
        status: 'APPROVED',
      },
      _sum: {
        amount: true,
      },
      _count: true,
    });

    const failedPayments = await prisma.subscriptionPayment.count({
      where: {
        subscriptionId: (await params).id,
        status: 'FAILED',
      },
    });

    return NextResponse.json({
      subscription: {
        ...subscription,
        stats: {
          totalPaid: totalPaid._sum.amount || 0,
          successfulPayments: totalPaid._count,
          failedPayments,
        },
      },
    });
  } catch (error) {
    console.error('Error al obtener suscripción:', error);
    return NextResponse.json(
      { error: 'Error al obtener suscripción' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/subscriptions/[id]
 * Actualiza una suscripción (solo PROVEEDOR)
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error, session } = await verifyAdminSaaSAccess();
  if (error) return error;

  try {
    const body = await request.json();
    const {
      planId,
      status,
      billingCycle,
      nextBillingDate,
      discountPercent,
      discountEndsAt,
      autoRenew,
      cancellationReason,
    } = body;

    // Verificar que la suscripción existe
    const existingSubscription = await prisma.subscription.findUnique({
      where: { id: (await params).id },
      include: {
        plan: true,
        tenant: true,
      },
    });

    if (!existingSubscription) {
      return NextResponse.json(
        { error: 'Suscripción no encontrada' },
        { status: 404 }
      );
    }

    // Si se cambia el plan, enviar notificación
    let newPlan = null;
    if (planId && planId !== existingSubscription.planId) {
      newPlan = await prisma.subscriptionPlan.findUnique({
        where: { id: planId },
      });

      if (!newPlan) {
        return NextResponse.json(
          { error: 'Plan nuevo no encontrado' },
          { status: 404 }
        );
      }
    }

    // Preparar datos para actualizar
    const updateData: any = {};
    
    if (planId) updateData.planId = planId;
    if (status) {
      updateData.status = status;
      if (status === 'CANCELLED') {
        updateData.cancelledAt = new Date();
        if (cancellationReason) {
          updateData.cancellationReason = cancellationReason;
        }
      }
    }
    if (billingCycle) updateData.billingCycle = billingCycle;
    if (nextBillingDate) updateData.nextBillingDate = new Date(nextBillingDate);
    if (discountPercent !== undefined) {
      updateData.discountPercent = discountPercent ? parseFloat(discountPercent) : null;
    }
    if (discountEndsAt !== undefined) {
      updateData.discountEndsAt = discountEndsAt ? new Date(discountEndsAt) : null;
    }
    if (autoRenew !== undefined) updateData.autoRenew = autoRenew;

    // Actualizar la suscripción
    const updatedSubscription = await prisma.subscription.update({
      where: { id: (await params).id },
      data: updateData,
      include: {
        plan: true,
        tenant: true,
      },
    });

    // Si cambió el plan, enviar email
    if (newPlan) {
      await sendPlanChangeEmail(
        existingSubscription.tenant.email,
        existingSubscription.tenant.businessName,
        existingSubscription.plan.name,
        newPlan.name,
        updatedSubscription.nextBillingDate || new Date()
      );
    }

    return NextResponse.json({
      message: 'Suscripción actualizada exitosamente',
      subscription: updatedSubscription,
    });
  } catch (error) {
    console.error('Error al actualizar suscripción:', error);
    return NextResponse.json(
      { error: 'Error al actualizar suscripción' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/subscriptions/[id]
 * Cancela una suscripción (solo PROVEEDOR)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error, session } = await verifyAdminSaaSAccess();
  if (error) return error;

  try {
    const { searchParams } = new URL(request.url);
    const reason = searchParams.get('reason') || 'Cancelación solicitada';

    // Verificar que la suscripción existe
    const existingSubscription = await prisma.subscription.findUnique({
      where: { id: (await params).id },
    });

    if (!existingSubscription) {
      return NextResponse.json(
        { error: 'Suscripción no encontrada' },
        { status: 404 }
      );
    }

    // Cancelar la suscripción
    const cancelledSubscription = await prisma.subscription.update({
      where: { id: (await params).id },
      data: {
        status: 'CANCELLED',
        cancelledAt: new Date(),
        cancellationReason: reason,
        autoRenew: false,
      },
      include: {
        plan: true,
        tenant: true,
      },
    });

    return NextResponse.json({
      message: 'Suscripción cancelada exitosamente',
      subscription: cancelledSubscription,
    });
  } catch (error) {
    console.error('Error al cancelar suscripción:', error);
    return NextResponse.json(
      { error: 'Error al cancelar suscripción' },
      { status: 500 }
    );
  }
}
