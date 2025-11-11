/**
 * API para gestionar planes de suscripción
 * Accesible por todos para listar, solo PROVEEDOR para crear/editar
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyAdminSaaSAccess } from '@/lib/admin-auth';

/**
 * GET /api/subscription-plans
 * Lista todos los planes de suscripción activos y visibles
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const showAll = searchParams.get('all') === 'true'; // Solo para admins

    // Si se solicita ver todos, verificar permisos de admin
    let where: any = { isActive: true, isVisible: true };
    
    if (showAll) {
      const { error } = await verifyAdminSaaSAccess();
      if (!error) {
        where = {}; // Mostrar todos los planes, incluso inactivos
      }
    }

    const plans = await prisma.subscriptionPlan.findMany({
      where,
      orderBy: {
        sortOrder: 'asc',
      },
    });

    // Contar suscripciones activas por plan
    const plansWithStats = await Promise.all(
      plans.map(async (plan) => {
        const activeSubscriptions = await prisma.subscription.count({
          where: {
            planId: plan.id,
            status: 'ACTIVE',
          },
        });

        return {
          ...plan,
          activeSubscriptions,
        };
      })
    );

    return NextResponse.json({
      plans: plansWithStats,
      total: plansWithStats.length,
    });
  } catch (error: any) {
    console.error('Error al listar planes:', error);
    console.error('Error details:', {
      message: error?.message,
      code: error?.code,
      stack: error?.stack,
    });
    return NextResponse.json(
      { 
        error: 'Error al obtener planes de suscripción',
        details: error?.message || 'Unknown error',
        code: error?.code || 'UNKNOWN'
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/subscription-plans
 * Crea un nuevo plan de suscripción (solo PROVEEDOR)
 */
export async function POST(request: NextRequest) {
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
      sortOrder,
    } = body;

    // Validar campos requeridos
    if (!name || price === undefined || !billingCycle) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos: name, price, billingCycle' },
        { status: 400 }
      );
    }

    // Crear el plan
    const newPlan = await prisma.subscriptionPlan.create({
      data: {
        name,
        description: description || null,
        price: parseFloat(price),
        billingCycle: billingCycle || 'MONTHLY',
        trialDays: trialDays || 0,
        features: features || null,
        maxUsers: maxUsers || null,
        maxProducts: maxProducts || null,
        maxSales: maxSales || null,
        isVisible: isVisible !== undefined ? isVisible : true,
        sortOrder: sortOrder || 0,
        isActive: true,
      },
    });

    return NextResponse.json(
      {
        message: 'Plan de suscripción creado exitosamente',
        plan: newPlan,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error al crear plan:', error);
    return NextResponse.json(
      { error: 'Error al crear plan de suscripción' },
      { status: 500 }
    );
  }
}
