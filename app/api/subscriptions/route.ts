/**
 * API para gestionar suscripciones de tenants
 * PROVEEDOR puede ver todas, tenants solo pueden ver la suya
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { verifyAdminSaaSAccess } from '@/lib/admin-auth';

/**
 * GET /api/subscriptions
 * Lista suscripciones (todas para admin, propia para tenant)
 */
export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return NextResponse.json(
      { error: 'No autenticado' },
      { status: 401 }
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const tenantId = searchParams.get('tenantId');

    let where: any = {};

    // Si es PROVEEDOR, puede ver todas las suscripciones
    if (session.user.role === 'PROVEEDOR') {
      if (status) {
        where.status = status;
      }
      if (tenantId) {
        where.tenantId = tenantId;
      }
    } else {
      // Si no es PROVEEDOR, solo puede ver su propia suscripción
      where.tenantId = session.user.tenantId;
    }

    const subscriptions = await prisma.subscription.findMany({
      where,
      include: {
        plan: true,
        tenant: {
          select: {
            id: true,
            businessName: true,
            email: true,
            rut: true,
          },
        },
        _count: {
          select: {
            payments: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Calcular estadísticas para cada suscripción
    const subscriptionsWithStats = await Promise.all(
      subscriptions.map(async (subscription) => {
        const totalPaid = await prisma.subscriptionPayment.aggregate({
          where: {
            subscriptionId: subscription.id,
            status: 'APPROVED',
          },
          _sum: {
            amount: true,
          },
        });

        const lastPayment = await prisma.subscriptionPayment.findFirst({
          where: {
            subscriptionId: subscription.id,
          },
          orderBy: {
            createdAt: 'desc',
          },
        });

        return {
          ...subscription,
          totalPaid: totalPaid._sum.amount || 0,
          lastPayment: lastPayment,
        };
      })
    );

    return NextResponse.json({
      subscriptions: subscriptionsWithStats,
      total: subscriptionsWithStats.length,
    });
  } catch (error) {
    console.error('Error al listar suscripciones:', error);
    return NextResponse.json(
      { error: 'Error al obtener suscripciones' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/subscriptions
 * Crea una nueva suscripción para un tenant (solo PROVEEDOR)
 */
export async function POST(request: NextRequest) {
  const { error, session } = await verifyAdminSaaSAccess();
  if (error) return error;

  try {
    const body = await request.json();
    const {
      tenantId,
      planId,
      billingCycle,
      trialDays,
      discountPercent,
      discountEndsAt,
      autoRenew,
    } = body;

    // Validar campos requeridos
    if (!tenantId || !planId) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos: tenantId, planId' },
        { status: 400 }
      );
    }

    // Verificar que el tenant existe
    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
    });

    if (!tenant) {
      return NextResponse.json(
        { error: 'Tenant no encontrado' },
        { status: 404 }
      );
    }

    // Verificar que el plan existe
    const plan = await prisma.subscriptionPlan.findUnique({
      where: { id: planId },
    });

    if (!plan) {
      return NextResponse.json(
        { error: 'Plan no encontrado' },
        { status: 404 }
      );
    }

    // Verificar si ya tiene una suscripción activa
    const existingSubscription = await prisma.subscription.findFirst({
      where: {
        tenantId,
        status: {
          in: ['ACTIVE', 'TRIAL'],
        },
      },
    });

    if (existingSubscription) {
      return NextResponse.json(
        { error: 'El tenant ya tiene una suscripción activa' },
        { status: 409 }
      );
    }

    // Calcular fechas
    const startDate = new Date();
    const trialDaysToUse = trialDays || plan.trialDays || 0;
    const trialEndsAt = trialDaysToUse > 0
      ? new Date(startDate.getTime() + trialDaysToUse * 24 * 60 * 60 * 1000)
      : null;

    // Calcular próxima fecha de facturación
    const nextBillingDate = new Date(startDate);
    const cycleToUse = billingCycle || plan.billingCycle;
    
    if (cycleToUse === 'MONTHLY') {
      nextBillingDate.setMonth(nextBillingDate.getMonth() + 1);
    } else if (cycleToUse === 'QUARTERLY') {
      nextBillingDate.setMonth(nextBillingDate.getMonth() + 3);
    } else if (cycleToUse === 'ANNUAL') {
      nextBillingDate.setFullYear(nextBillingDate.getFullYear() + 1);
    }

    // Si hay período de prueba, la próxima facturación es después del trial
    const finalNextBillingDate = trialEndsAt || nextBillingDate;

    // Crear la suscripción
    const newSubscription = await prisma.subscription.create({
      data: {
        tenantId,
        planId,
        status: trialDaysToUse > 0 ? 'TRIAL' : 'ACTIVE',
        startDate,
        billingCycle: cycleToUse,
        nextBillingDate: finalNextBillingDate,
        trialEndsAt,
        trialDays: trialDaysToUse,
        discountPercent: discountPercent ? parseFloat(discountPercent) : null,
        discountEndsAt: discountEndsAt ? new Date(discountEndsAt) : null,
        autoRenew: autoRenew !== undefined ? autoRenew : true,
      },
      include: {
        plan: true,
        tenant: true,
      },
    });

    return NextResponse.json(
      {
        message: 'Suscripción creada exitosamente',
        subscription: newSubscription,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error al crear suscripción:', error);
    return NextResponse.json(
      { error: 'Error al crear suscripción' },
      { status: 500 }
    );
  }
}
