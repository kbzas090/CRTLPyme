
/**
 * API para gestionar usuarios de un tenant específico
 * Solo accesible por usuarios con rol PROVEEDOR
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyAdminSaaSAccess } from '@/lib/admin-auth';

/**
 * GET /api/admin-saas/tenants/[id]/users
 * Lista todos los usuarios de un tenant específico
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error, session } = await verifyAdminSaaSAccess();
  if (error) return error;

  try {
    const users = await prisma.user.findMany({
      where: {
        tenantId: (await params).id,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            sales: true,
            cashSessions: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({
      users,
      total: users.length,
    });
  } catch (error) {
    console.error('Error al obtener usuarios del tenant:', error);
    return NextResponse.json(
      { error: 'Error al obtener usuarios del tenant' },
      { status: 500 }
    );
  }
}
