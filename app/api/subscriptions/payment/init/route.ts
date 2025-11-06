/**
 * API Route: Initialize Payment
 * 
 * POST /api/subscriptions/payment/init - Inicia una transacción de pago con Transbank
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';
import { createTransaction, generateBuyOrder, formatAmount } from '@/lib/transbank';

const prisma = new PrismaClient();

/**
 * POST /api/subscriptions/payment/init
 * 
 * Inicia una transacción de pago para una suscripción
 * 
 * Body:
 * {
 *   planId: string,           // ID del plan de suscripción
 *   tenantId: string,          // ID del tenant (empresa)
 *   returnUrl?: string         // URL de retorno (opcional)
 * }
 * 
 * @returns Token y URL para redirección al formulario de pago de Transbank
 */
export async function POST(request: NextRequest) {
  try {
    // Verificar autenticación
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'No autenticado' },
        { status: 401 }
      );
    }

    // Obtener datos del body
    const body = await request.json();
    const { planId, tenantId, returnUrl } = body;

    // Validar datos requeridos
    if (!planId || !tenantId) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Datos incompletos',
          message: 'Se requiere planId y tenantId'
        },
        { status: 400 }
      );
    }

    // Obtener el plan
    const plan = await prisma.subscriptionPlan.findUnique({
      where: { id: planId },
    });

    if (!plan) {
      return NextResponse.json(
        { success: false, error: 'Plan no encontrado' },
        { status: 404 }
      );
    }

    if (!plan.isActive) {
      return NextResponse.json(
        { success: false, error: 'Plan no disponible' },
        { status: 400 }
      );
    }

    // Verificar que el tenant existe
    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
    });

    if (!tenant) {
      return NextResponse.json(
        { success: false, error: 'Empresa no encontrada' },
        { status: 404 }
      );
    }

    // Verificar permisos del usuario en el tenant
    const userTenant = await prisma.user.findFirst({
      where: {
        id: session.user.id,
        tenantId: tenantId,
      },
    });

    if (!userTenant) {
      return NextResponse.json(
        { success: false, error: 'No tiene permisos para esta empresa' },
        { status: 403 }
      );
    }

    // Verificar si ya existe una suscripción activa
    const existingSubscription = await prisma.subscription.findFirst({
      where: {
        tenantId: tenantId,
        status: {
          in: ['ACTIVE', 'TRIALING'],
        },
      },
    });

    if (existingSubscription) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Ya existe una suscripción activa',
          message: 'Cancele la suscripción actual antes de crear una nueva'
        },
        { status: 400 }
      );
    }

    // Crear la suscripción en estado PENDING
    const subscription = await prisma.subscription.create({
      data: {
        tenantId: tenantId,
        planId: planId,
        status: 'PENDING',
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(
          Date.now() + (plan.billingCycle === 'YEARLY' ? 365 : 30) * 24 * 60 * 60 * 1000
        ),
        autoRenew: true,
      },
    });

    console.log('✅ Suscripción creada:', subscription.id);

    // Generar número de orden único
    const buyOrder = generateBuyOrder('SUB');
    const sessionId = subscription.id;
    const amount = formatAmount(Number(plan.price));

    // URL de retorno (callback)
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const callbackUrl = returnUrl || `${baseUrl}/api/subscriptions/payment/callback`;

    console.log('🔄 Iniciando transacción con Transbank:', {
      buyOrder,
      sessionId,
      amount,
      callbackUrl,
    });

    // Crear transacción en Transbank
    const transbankResponse = await createTransaction(
      buyOrder,
      sessionId,
      amount,
      callbackUrl
    );

    // Crear registro de pago
    const payment = await prisma.subscriptionPayment.create({
      data: {
        subscriptionId: subscription.id,
        amount: plan.price,
        transbankToken: transbankResponse.token,
        transbankBuyOrder: buyOrder,
        status: 'PENDING',
        paymentMethod: 'TRANSBANK_WEBPAY',
      },
    });

    console.log('✅ Pago registrado:', payment.id);

    return NextResponse.json({
      success: true,
      data: {
        subscriptionId: subscription.id,
        paymentId: payment.id,
        transbankToken: transbankResponse.token,
        transbankUrl: transbankResponse.url,
        amount: Number(plan.price),
        planName: plan.name,
      },
      message: 'Transacción iniciada exitosamente',
    });

  } catch (error) {
    console.error('❌ Error iniciando transacción de pago:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Error al iniciar transacción de pago',
        message: error instanceof Error ? error.message : 'Error desconocido',
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
