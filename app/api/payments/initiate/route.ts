
/**
 * API para iniciar un pago de suscripción con Transbank
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { processSubscriptionPayment, generateBuyOrder } from '@/lib/transbank';

/**
 * POST /api/payments/initiate
 * Inicia un pago de suscripción con Transbank
 */
export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return NextResponse.json(
      { error: 'No autenticado' },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();
    const { subscriptionId } = body;

    if (!subscriptionId) {
      return NextResponse.json(
        { error: 'subscriptionId es requerido' },
        { status: 400 }
      );
    }

    // Obtener la suscripción con el plan
    const subscription = await prisma.subscription.findUnique({
      where: { id: subscriptionId },
      include: {
        plan: true,
        tenant: true,
      },
    });

    if (!subscription) {
      return NextResponse.json(
        { error: 'Suscripción no encontrada' },
        { status: 404 }
      );
    }

    // Verificar permisos (el tenant debe ser el dueño o un PROVEEDOR)
    if (
      session.user.role !== 'PROVEEDOR' &&
      subscription.tenantId !== session.user.tenantId
    ) {
      return NextResponse.json(
        { error: 'No tiene permisos para pagar esta suscripción' },
        { status: 403 }
      );
    }

    // Calcular el monto a cobrar
    let amount = Number(subscription.plan.price);

    // Aplicar descuento si existe y está vigente
    if (
      subscription.discountPercent &&
      (!subscription.discountEndsAt || subscription.discountEndsAt > new Date())
    ) {
      const discount = (amount * Number(subscription.discountPercent)) / 100;
      amount = amount - discount;
    }

    // Generar orden de compra
    const buyOrder = generateBuyOrder(`SUB-${subscription.tenantId.slice(0, 8)}`);

    // URL de retorno (ajustar según tu configuración)
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const returnUrl = `${baseUrl}/api/payments/confirm`;

    // Crear registro de pago en la base de datos
    const payment = await prisma.subscriptionPayment.create({
      data: {
        subscriptionId: subscription.id,
        tenantId: subscription.tenantId,
        amount,
        currency: 'CLP',
        transbankBuyOrder: buyOrder,
        status: 'PENDING',
      },
    });

    // Iniciar transacción en Transbank
    const transbankResult = await processSubscriptionPayment(
      subscription.tenantId,
      subscription.id,
      amount,
      returnUrl
    );

    if (!transbankResult.success || !transbankResult.token) {
      // Actualizar el pago como fallido
      await prisma.subscriptionPayment.update({
        where: { id: payment.id },
        data: {
          status: 'FAILED',
          transactionResponse: {
            error: transbankResult.error,
          },
        },
      });

      return NextResponse.json(
        { error: transbankResult.error || 'Error al iniciar pago' },
        { status: 500 }
      );
    }

    // Actualizar el pago con el token de Transbank
    await prisma.subscriptionPayment.update({
      where: { id: payment.id },
      data: {
        transbankToken: transbankResult.token,
      },
    });

    return NextResponse.json({
      success: true,
      paymentId: payment.id,
      token: transbankResult.token,
      url: transbankResult.url,
      amount,
    });
  } catch (error) {
    console.error('Error al iniciar pago:', error);
    return NextResponse.json(
      { error: 'Error al iniciar pago' },
      { status: 500 }
    );
  }
}
