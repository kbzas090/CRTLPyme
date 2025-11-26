/**
 * API for Subscription Plan Management
 * GET /api/saas/plans - List all plans
 * POST /api/saas/plans - Create a new plan
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyAdminSaaSAccess } from '@/lib/admin-auth';

export async function GET(request: NextRequest) {
  const { error, session } = await verifyAdminSaaSAccess();
  if (error) return error;

  try {
    const plans = await prisma.subscriptionPlan.findMany({
      orderBy: {
        sortOrder: 'asc'
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

    return NextResponse.json({
      plans: plans.map(plan => {
        // Transformar features a array si es necesario
        let features = plan.features;
        if (typeof features === 'string') {
          try {
            features = JSON.parse(features);
          } catch (e) {
            features = [];
          }
        }
        if (!Array.isArray(features)) {
          features = [];
        }

        return {
          ...plan,
          features,
          price: Number(plan.price),
          activeSubscriptions: plan._count.subscriptions
        };
      })
    });

  } catch (error) {
    console.error('Error fetching plans:', error);
    return NextResponse.json(
      { error: 'Error fetching plans' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const { error, session } = await verifyAdminSaaSAccess();
  if (error) return error;

  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.name || body.price === undefined || !body.billingCycle) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos' },
        { status: 400 }
      );
    }

    const plan = await prisma.subscriptionPlan.create({
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
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating plan:', error);
    return NextResponse.json(
      { error: 'Error al crear el plan' },
      { status: 500 }
    );
  }
}
