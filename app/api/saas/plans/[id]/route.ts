/**
 * API for Individual Subscription Plan Management
 * PUT /api/saas/plans/[id] - Update a plan
 * DELETE /api/saas/plans/[id] - Delete a plan
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyAdminSaaSAccess } from '@/lib/admin-auth';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error, session } = await verifyAdminSaaSAccess();
  if (error) return error;

  try {
    const body = await request.json();
    const { id: planId } = await params;

    // Check if plan exists
    const existingPlan = await prisma.subscriptionPlan.findUnique({
      where: { id: planId },
    });

    if (!existingPlan) {
      return NextResponse.json(
        { error: 'Plan no encontrado' },
        { status: 404 }
      );
    }

    // Validate required fields
    if (!body.name || body.price === undefined || !body.billingCycle) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos' },
        { status: 400 }
      );
    }

    const plan = await prisma.subscriptionPlan.update({
      where: { id: planId },
      data: {
        name: body.name,
        description: body.description || null,
        price: body.price,
        billingCycle: body.billingCycle,
        trialDays: body.trialDays || 0,
        isVisible: body.isVisible !== undefined ? body.isVisible : true,
        isActive: body.isActive !== undefined ? body.isActive : true,
        features: body.features || [],
        maxUsers: body.maxUsers || null,
        maxProducts: body.maxProducts || null,
        maxSales: body.maxSales || null,
        sortOrder: body.sortOrder || 0,
      },
    });

    return NextResponse.json({
      plan: {
        ...plan,
        price: Number(plan.price),
      }
    });

  } catch (error) {
    console.error('Error updating plan:', error);
    return NextResponse.json(
      { error: 'Error al actualizar el plan' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error, session } = await verifyAdminSaaSAccess();
  if (error) return error;

  try {
    const { id: planId } = await params;

    // Check if plan exists
    const existingPlan = await prisma.subscriptionPlan.findUnique({
      where: { id: planId },
      include: {
        _count: {
          select: {
            subscriptions: {
              where: {
                status: 'ACTIVE'
              }
            }
          }
        }
      }
    });

    if (!existingPlan) {
      return NextResponse.json(
        { error: 'Plan no encontrado' },
        { status: 404 }
      );
    }

    // Check if plan has active subscriptions
    if (existingPlan._count.subscriptions > 0) {
      return NextResponse.json(
        { error: 'No se puede eliminar un plan con suscripciones activas' },
        { status: 400 }
      );
    }

    await prisma.subscriptionPlan.delete({
      where: { id: planId },
    });

    return NextResponse.json({
      message: 'Plan eliminado correctamente'
    });

  } catch (error) {
    console.error('Error deleting plan:', error);
    return NextResponse.json(
      { error: 'Error al eliminar el plan' },
      { status: 500 }
    );
  }
}
