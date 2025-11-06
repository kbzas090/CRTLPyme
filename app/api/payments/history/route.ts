
/**
 * API para obtener el historial de pagos
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

/**
 * GET /api/payments/history
 * Obtiene el historial de pagos del tenant o todos (si es PROVEEDOR)
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
    const tenantId = searchParams.get('tenantId');
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    let where: any = {};

    // Si es PROVEEDOR, puede ver todos los pagos
    if (session.user.role === 'PROVEEDOR') {
      if (tenantId) {
        where.tenantId = tenantId;
      }
    } else {
      // Si no es PROVEEDOR, solo puede ver sus propios pagos
      where.tenantId = session.user.tenantId;
    }

    if (status) {
      where.status = status;
    }

    const [payments, total] = await Promise.all([
      prisma.subscriptionPayment.findMany({
        where,
        include: {
          subscription: {
            include: {
              plan: true,
            },
          },
          tenant: {
            select: {
              id: true,
              businessName: true,
              email: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: limit,
        skip: offset,
      }),
      prisma.subscriptionPayment.count({ where }),
    ]);

    return NextResponse.json({
      payments,
      total,
      limit,
      offset,
      hasMore: offset + limit < total,
    });
  } catch (error) {
    console.error('Error al obtener historial de pagos:', error);
    return NextResponse.json(
      { error: 'Error al obtener historial de pagos' },
      { status: 500 }
    );
  }
}
