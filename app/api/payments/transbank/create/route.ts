/**
 * API para crear transacción de pago con Transbank
 * POST /api/payments/transbank/create
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { createTransaction, getReturnUrl } from '@/lib/transbank';

export async function POST(request: NextRequest) {
  try {
    // Verificar autenticación
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    // Obtener usuario
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { tenant: true }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    // Solo ADMIN y PROVEEDOR pueden cambiar el plan
    if (!['ADMIN', 'PROVEEDOR'].includes(user.role)) {
      return NextResponse.json(
        { error: 'No tienes permisos para realizar esta acción. Solo administradores pueden cambiar el plan.' },
        { status: 403 }
      );
    }

    // Parsear body
    const body = await request.json();
    const { tenantId, planId } = body;

    if (!tenantId || !planId) {
      return NextResponse.json(
        { error: 'tenantId y planId son requeridos' },
        { status: 400 }
      );
    }

    // Verificar que el plan existe
    const plan = await prisma.subscriptionPlan.findUnique({
      where: { id: planId }
    });

    if (!plan || !plan.isActive) {
      return NextResponse.json(
        { error: 'Plan no encontrado o inactivo' },
        { status: 404 }
      );
    }

    // Verificar que el tenant existe
    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId }
    });

    if (!tenant) {
      return NextResponse.json(
        { error: 'Tenant no encontrado' },
        { status: 404 }
      );
    }

    // Generar identificadores únicos para la transacción
    // buyOrder debe ser máximo 26 caracteres para Transbank
    const timestamp = Date.now().toString().slice(-10); // Últimos 10 dígitos
    const tenantShort = tenantId.substring(0, 8); // Primeros 8 caracteres
    const buyOrder = `PC${timestamp}${tenantShort}`; // PC = Plan Change, total 20 chars
    const sessionId = `PS${timestamp}${user.id.substring(0, 8)}`; // PS = Payment Session
    const amount = Math.round(Number(plan.price)); // Transbank requiere enteros
    const returnUrl = getReturnUrl();

    // Crear transacción en Transbank
    const transactionResult = await createTransaction(
      buyOrder,
      sessionId,
      amount,
      returnUrl
    );

    if (!transactionResult.success) {
      return NextResponse.json(
        { error: 'Error al crear transacción en Transbank', details: transactionResult.error },
        { status: 500 }
      );
    }

    // Guardar información de la transacción en base de datos
    await prisma.paymentTransaction.create({
      data: {
        tenantId,
        planId,
        amount: plan.price,
        status: 'PENDING',
        provider: 'TRANSBANK',
        transactionId: transactionResult.token!,
        metadata: {
          buyOrder,
          sessionId,
          planName: plan.name,
          createdBy: user.id
        }
      }
    });

    // Retornar token y URL de pago
    return NextResponse.json({
      success: true,
      token: transactionResult.token,
      url: transactionResult.url,
      buyOrder,
      amount
    });

  } catch (error: any) {
    console.error('Error creating Transbank transaction:', error);
    return NextResponse.json(
      { error: 'Error al crear transacción', details: error.message },
      { status: 500 }
    );
  }
}
