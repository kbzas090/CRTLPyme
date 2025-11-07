
/**
 * API for Individual Plan Management
 * GET /api/saas/plans/[id] - Get plan details
 * PUT /api/saas/plans/[id] - Update plan
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyAdminSaaSAccess } from '@/lib/admin-auth';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { error, session } = await verifyAdminSaaSAccess();
  if (error) return error;

  try {
    const plan = await prisma.subscriptionPlan.findUnique({
      where: {
        id: params.id
      },
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

    if (!plan) {
      return NextResponse.json(
        { error: 'Plan not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      ...plan,
      activeSubscriptions: plan._count.subscriptions
    });

  } catch (error) {
    console.error('Error fetching plan:', error);
    return NextResponse.json(
      { error: 'Error fetching plan' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { error, session } = await verifyAdminSaaSAccess();
  if (error) return error;

  try {
    const body = await request.json();
    
    const updatedPlan = await prisma.subscriptionPlan.update({
      where: {
        id: params.id
      },
      data: {
        name: body.name,
        description: body.description,
        price: body.price,
        billingCycle: body.billingCycle,
        trialDays: body.trialDays,
        features: body.features,
        maxUsers: body.maxUsers,
        maxProducts: body.maxProducts,
        maxSales: body.maxSales,
        isVisible: body.isVisible,
        isActive: body.isActive,
        sortOrder: body.sortOrder,
      }
    });

    return NextResponse.json(updatedPlan);

  } catch (error) {
    console.error('Error updating plan:', error);
    return NextResponse.json(
      { error: 'Error updating plan' },
      { status: 500 }
    );
  }
}
