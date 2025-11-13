/**
 * API para gestionar un plan de suscripción específico
 * Solo accesible por PROVEEDOR
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyAdminSaaSAccess } from '@/lib/admin-auth';

/**
 * GET /api/subscription-plans/[id]
 * Obtiene los detalles de un plan específico
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const plan = await prisma.subscriptionPlan.findUnique({
      where: { id: (await params).id },
      include: {
        _count: {
          select: {
            subscriptions: true,
          },
        },
      },
    });

    if (!plan) {
      return NextResponse.json(
        { error: 'Plan no encontrado' },
        { status: 404 }
      );
    }

    // Obtener estadísticas del plan
    const activeSubscriptions = await prisma.subscription.count({
      where: {
        planId: (await params).id,
        status: 'ACTIVE',
      },
    });

    const totalRevenue = await prisma.subscriptionPayment.aggregate({
      where: {
        subscription: {
          planId: (await params).id,
        },
        status: 'APPROVED',
      },
      _sum: {
        amount: true,
      },
    });

    return NextResponse.json({
      plan: {
        ...plan,
        activeSubscriptions,
        totalRevenue: totalRevenue._sum.amount || 0,
      },
    });
  } catch (error) {
    console.error('Error al obtener plan:', error);
    return NextResponse.json(
      { error: 'Error al obtener plan' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/subscription-plans/[id]
 * Actualiza un plan de suscripción (solo PROVEEDOR)
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
      name,
      description,
      price,
      billingCycle,
      trialDays,
      features,
      maxUsers,
      maxProducts,
      maxSales,
      isVisible,
      isActive,
      sortOrder,
    } = body;

    // Verificar que el plan existe
    const existingPlan = await prisma.subscriptionPlan.findUnique({
      where: { id: (await params).id },
    });

    if (!existingPlan) {
      return NextResponse.json(
        { error: 'Plan no encontrado' },
        { status: 404 }
      );
    }

    // Actualizar el plan
    const updatedPlan = await prisma.subscriptionPlan.update({
      where: { id: (await params).id },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(price !== undefined && { price: parseFloat(price) }),
        ...(billingCycle && { billingCycle }),
        ...(trialDays !== undefined && { trialDays }),
        ...(features !== undefined && { features }),
        ...(maxUsers !== undefined && { maxUsers }),
        ...(maxProducts !== undefined && { maxProducts }),
        ...(maxSales !== undefined && { maxSales }),
        ...(isVisible !== undefined && { isVisible }),
        ...(isActive !== undefined && { isActive }),
        ...(sortOrder !== undefined && { sortOrder }),
      },
    });

    return NextResponse.json({
      message: 'Plan actualizado exitosamente',
      plan: updatedPlan,
    });
  } catch (error) {
    console.error('Error al actualizar plan:', error);
    return NextResponse.json(
      { error: 'Error al actualizar plan' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/subscription-plans/[id]
 * Desactiva un plan de suscripción (solo PROVEEDOR)
 * No se elimina físicamente para mantener integridad de datos
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error, session } = await verifyAdminSaaSAccess();
  if (error) return error;

  try {
    // Verificar que el plan existe
    const existingPlan = await prisma.subscriptionPlan.findUnique({
      where: { id: (await params).id },
      include: {
        _count: {
          select: {
            subscriptions: true,
          },
        },
      },
    });

    if (!existingPlan) {
      return NextResponse.json(
        { error: 'Plan no encontrado' },
        { status: 404 }
      );
    }

    // Verificar si hay suscripciones activas
    const activeSubscriptions = await prisma.subscription.count({
      where: {
        planId: (await params).id,
        status: 'ACTIVE',
      },
    });

    if (activeSubscriptions > 0) {
      return NextResponse.json(
        { 
          error: 'No se puede desactivar un plan con suscripciones activas',
          activeSubscriptions,
        },
        { status: 400 }
      );
    }

    // Desactivar el plan
    const updatedPlan = await prisma.subscriptionPlan.update({
      where: { id: (await params).id },
      data: {
        isActive: false,
        isVisible: false,
      },
    });

    return NextResponse.json({
      message: 'Plan desactivado exitosamente',
      plan: updatedPlan,
    });
  } catch (error) {
    console.error('Error al desactivar plan:', error);
    return NextResponse.json(
      { error: 'Error al desactivar plan' },
      { status: 500 }
    );
  }
}
