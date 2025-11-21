
/**
 * API para generar reportes de movimientos de inventario
 * GET /api/reports/inventory-movements
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return NextResponse.json(
      { error: 'No autenticado' },
      { status: 401 }
    );
  }

  // Solo ADMIN y PROVEEDOR pueden ver reportes
  if (!['ADMIN', 'PROVEEDOR'].includes(session.user.role)) {
    return NextResponse.json(
      { error: 'No tiene permisos para ver reportes' },
      { status: 403 }
    );
  }

  const { searchParams } = new URL(request.url);
  const tenantId = searchParams.get('tenantId') || session.user.tenantId;
  const startDate = searchParams.get('startDate');
  const endDate = searchParams.get('endDate');
  const movementType = searchParams.get('type'); // ENTRY, EXIT, ADJUSTMENT

  // Verify access to tenant
  if (tenantId !== session.user.tenantId && session.user.role !== 'PROVEEDOR') {
    return NextResponse.json(
      { error: 'No tiene permisos para ver reportes de este tenant' },
      { status: 403 }
    );
  }

  try {
    // Construir filtros de fecha y tipo
    const dateFilter: any = {
      tenantId,
    };

    if (movementType) {
      dateFilter.type = movementType;
    }

    if (startDate) {
      dateFilter.createdAt = {
        ...dateFilter.createdAt,
        gte: new Date(startDate),
      };
    }

    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      dateFilter.createdAt = {
        ...dateFilter.createdAt,
        lte: end,
      };
    }

    // Obtener movimientos con información del producto y usuario
    const movements = await prisma.inventoryMovement.findMany({
      where: dateFilter,
      include: {
        tenantInventory: {
          include: {
            masterProduct: true,
          },
        },
        user: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Calcular estadísticas generales
    const totalMovements = movements.length;
    const entriesCount = movements.filter(m => m.type === 'ENTRY').length;
    const exitsCount = movements.filter(m => m.type === 'EXIT').length;
    const adjustmentsCount = movements.filter(m => m.type === 'ADJUSTMENT').length;

    const totalEntryQuantity = movements
      .filter(m => m.type === 'ENTRY')
      .reduce((sum, m) => sum + Math.abs(m.quantity), 0);
    
    const totalExitQuantity = movements
      .filter(m => m.type === 'EXIT')
      .reduce((sum, m) => sum + Math.abs(m.quantity), 0);

    // Movimientos por tipo
    const movementsByType = {
      ENTRY: {
        type: 'Entradas',
        count: entriesCount,
        totalQuantity: totalEntryQuantity,
      },
      EXIT: {
        type: 'Salidas',
        count: exitsCount,
        totalQuantity: totalExitQuantity,
      },
      ADJUSTMENT: {
        type: 'Ajustes',
        count: adjustmentsCount,
        totalQuantity: movements
          .filter(m => m.type === 'ADJUSTMENT')
          .reduce((sum, m) => sum + Math.abs(m.quantity), 0),
      },
    };

    // Movimientos por producto
    const movementsByProduct: any = {};
    movements.forEach((movement) => {
      const productName = movement.tenantInventory.masterProduct.name;
      if (!movementsByProduct[productName]) {
        movementsByProduct[productName] = {
          product: productName,
          entries: 0,
          exits: 0,
          adjustments: 0,
          totalQuantity: 0,
        };
      }

      if (movement.type === 'ENTRY') {
        movementsByProduct[productName].entries += Math.abs(movement.quantity);
      } else if (movement.type === 'EXIT') {
        movementsByProduct[productName].exits += Math.abs(movement.quantity);
      } else if (movement.type === 'ADJUSTMENT') {
        movementsByProduct[productName].adjustments += Math.abs(movement.quantity);
      }
      movementsByProduct[productName].totalQuantity += Math.abs(movement.quantity);
    });

    const topProducts = Object.values(movementsByProduct)
      .sort((a: any, b: any) => b.totalQuantity - a.totalQuantity)
      .slice(0, 10);

    // Movimientos por usuario
    const movementsByUser: any = {};
    movements.forEach((movement) => {
      const userName = `${movement.user.firstName} ${movement.user.lastName}`;
      if (!movementsByUser[userName]) {
        movementsByUser[userName] = {
          user: userName,
          count: 0,
        };
      }
      movementsByUser[userName].count += 1;
    });

    // Movimientos por día (últimos 30 días o rango seleccionado)
    const movementsByDay: any = {};
    movements.forEach((movement) => {
      const date = new Date(movement.createdAt);
      const key = date.toISOString().split('T')[0];

      if (!movementsByDay[key]) {
        movementsByDay[key] = {
          date: key,
          entries: 0,
          exits: 0,
          adjustments: 0,
          total: 0,
        };
      }

      movementsByDay[key].total += 1;
      if (movement.type === 'ENTRY') {
        movementsByDay[key].entries += 1;
      } else if (movement.type === 'EXIT') {
        movementsByDay[key].exits += 1;
      } else if (movement.type === 'ADJUSTMENT') {
        movementsByDay[key].adjustments += 1;
      }
    });

    return NextResponse.json({
      summary: {
        totalMovements,
        entriesCount,
        exitsCount,
        adjustmentsCount,
        totalEntryQuantity,
        totalExitQuantity,
        netChange: totalEntryQuantity - totalExitQuantity,
      },
      movementsByType: Object.values(movementsByType),
      movementsByDay: Object.values(movementsByDay),
      movementsByUser: Object.values(movementsByUser),
      topProducts,
      rawMovements: movements.map((movement) => ({
        id: movement.id,
        type: movement.type,
        quantity: movement.quantity,
        reason: movement.reason,
        notes: movement.notes,
        productName: movement.tenantInventory.masterProduct.name,
        productSku: movement.tenantInventory.customSku || movement.tenantInventory.masterProduct.sku,
        userName: `${movement.user.firstName} ${movement.user.lastName}`,
        createdAt: movement.createdAt,
      })),
    });
  } catch (error) {
    console.error('Error generando reporte de movimientos de inventario:', error);
    return NextResponse.json(
      { error: 'Error al generar reporte de movimientos de inventario' },
      { status: 500 }
    );
  }
}
