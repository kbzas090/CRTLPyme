
/**
 * API para gestionar un tenant específico
 * Solo accesible por usuarios con rol PROVEEDOR
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyAdminSaaSAccess } from '@/lib/admin-auth';

/**
 * GET /api/admin-saas/tenants/[id]
 * Obtiene detalles completos de un tenant específico
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error, session } = await verifyAdminSaaSAccess();
  if (error) return error;

  try {
    const tenant = await prisma.tenant.findUnique({
      where: { id: (await params).id },
      include: {
        users: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
            isActive: true,
            createdAt: true,
          },
        },
        products: {
          select: {
            id: true,
            sku: true,
            name: true,
            category: true,
            costPrice: true,
            salePrice: true,
            stock: true,
            minStock: true,
            isActive: true,
          },
          where: {
            isActive: true,
          },
        },
        fixedExpenses: {
          where: {
            isActive: true,
          },
        },
        subscriptions: {
          where: {
            status: 'ACTIVE',
          },
          include: {
            plan: true,
          },
          orderBy: {
            startDate: 'desc',
          },
          take: 1,
        },
        _count: {
          select: {
            sales: true,
            cashSessions: true,
          },
        },
      },
    });

    if (!tenant) {
      return NextResponse.json(
        { error: 'Tenant no encontrado' },
        { status: 404 }
      );
    }

    // Obtener estadísticas de ventas
    const salesStats = await prisma.sale.aggregate({
      where: {
        tenantId: (await params).id,
        status: 'COMPLETED',
      },
      _sum: {
        total: true,
      },
      _count: true,
    });

    // Obtener ventas recientes
    const recentSales = await prisma.sale.findMany({
      where: {
        tenantId: (await params).id,
        status: 'COMPLETED',
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 10,
      select: {
        id: true,
        saleNumber: true,
        total: true,
        paymentMethod: true,
        createdAt: true,
        user: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    // Obtener la suscripción activa (si existe)
    const activeSubscription = tenant.subscriptions && tenant.subscriptions.length > 0 
      ? tenant.subscriptions[0] 
      : null;

    return NextResponse.json({
      tenant: {
        ...tenant,
        subscription: activeSubscription,
        stats: {
          totalSales: salesStats._count,
          salesAmount: salesStats._sum.total || 0,
          totalUsers: tenant.users.length,
          totalProducts: tenant.products.length,
          totalCashSessions: tenant._count.cashSessions,
        },
        recentSales,
      },
    });
  } catch (error) {
    console.error('Error al obtener detalles del tenant:', error);
    return NextResponse.json(
      { error: 'Error al obtener detalles del tenant' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin-saas/tenants/[id]
 * Actualiza información de un tenant
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error, session } = await verifyAdminSaaSAccess();
  if (error) return error;

  try {
    const body = await request.json();
    const { businessName, email, phone, address, planType, maxCashiers, extraCashiers, isActive } = body;

    const tenant = await prisma.tenant.findUnique({
      where: { id: (await params).id },
    });

    if (!tenant) {
      return NextResponse.json(
        { error: 'Tenant no encontrado' },
        { status: 404 }
      );
    }

    const updatedTenant = await prisma.tenant.update({
      where: { id: (await params).id },
      data: {
        ...(businessName && { businessName }),
        ...(email && { email }),
        ...(phone !== undefined && { phone }),
        ...(address !== undefined && { address }),
        ...(planType && { planType }),
        ...(maxCashiers !== undefined && { maxCashiers }),
        ...(extraCashiers !== undefined && { extraCashiers }),
        ...(isActive !== undefined && { isActive }),
      },
    });

    return NextResponse.json({
      message: 'Tenant actualizado exitosamente',
      tenant: updatedTenant,
    });
  } catch (error) {
    console.error('Error al actualizar tenant:', error);
    return NextResponse.json(
      { error: 'Error al actualizar tenant' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin-saas/tenants/[id]
 * Elimina un tenant (soft delete - lo marca como inactivo)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error, session } = await verifyAdminSaaSAccess();
  if (error) return error;

  try {
    const tenant = await prisma.tenant.findUnique({
      where: { id: (await params).id },
    });

    if (!tenant) {
      return NextResponse.json(
        { error: 'Tenant no encontrado' },
        { status: 404 }
      );
    }

    // Soft delete: marcar como inactivo
    const updatedTenant = await prisma.tenant.update({
      where: { id: (await params).id },
      data: {
        isActive: false,
      },
    });

    return NextResponse.json({
      message: 'Tenant desactivado exitosamente',
      tenant: updatedTenant,
    });
  } catch (error) {
    console.error('Error al eliminar tenant:', error);
    return NextResponse.json(
      { error: 'Error al eliminar tenant' },
      { status: 500 }
    );
  }
}
