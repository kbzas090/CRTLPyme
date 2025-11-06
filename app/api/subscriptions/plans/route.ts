/**
 * API Route: Subscription Plans
 * 
 * GET /api/subscriptions/plans - Obtiene todos los planes de suscripción disponibles
 */

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * GET /api/subscriptions/plans
 * 
 * Obtiene todos los planes de suscripción activos y visibles
 * 
 * Query params opcionales:
 * - billingCycle: 'MONTHLY' | 'YEARLY' - Filtrar por ciclo de facturación
 * 
 * @returns Lista de planes de suscripción
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const billingCycle = searchParams.get('billingCycle');

    // Construir filtros
    const where: any = {
      isActive: true,
      isVisible: true,
    };

    if (billingCycle && (billingCycle === 'MONTHLY' || billingCycle === 'YEARLY')) {
      where.billingCycle = billingCycle;
    }

    // Obtener planes
    const plans = await prisma.subscriptionPlan.findMany({
      where,
      orderBy: {
        sortOrder: 'asc',
      },
      select: {
        id: true,
        name: true,
        description: true,
        price: true,
        billingCycle: true,
        trialDays: true,
        features: true,
        maxUsers: true,
        maxProducts: true,
        maxSales: true,
        sortOrder: true,
        isActive: true,
        isVisible: true,
        createdAt: true,
      },
    });

    // Parsear features (viene como string JSON)
    const plansWithParsedFeatures = plans.map(plan => ({
      ...plan,
      features: typeof plan.features === 'string' 
        ? JSON.parse(plan.features) 
        : plan.features,
      // Convertir Decimal a number para JSON
      price: Number(plan.price),
    }));

    console.log(`✅ Obtenidos ${plans.length} planes de suscripción`);

    return NextResponse.json({
      success: true,
      data: plansWithParsedFeatures,
      count: plansWithParsedFeatures.length,
    });

  } catch (error) {
    console.error('❌ Error obteniendo planes de suscripción:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Error al obtener planes de suscripción',
        message: error instanceof Error ? error.message : 'Error desconocido',
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
