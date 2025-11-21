
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { z } from 'zod'
import { canPerformAction } from '@/lib/subscription-middleware'

// Schema de validación para crear venta
const createSaleSchema = z.object({
  items: z.array(z.object({
    tenantInventoryId: z.string(),
    quantity: z.number().int().positive(),
  })).min(1, 'Debe incluir al menos un producto'),
  paymentMethod: z.enum(['CASH', 'DEBIT', 'CREDIT', 'TRANSFER']),
  cashReceived: z.number().optional(),
})

// GET: Listar ventas
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const cashSessionId = searchParams.get('cashSessionId')
    const limit = parseInt(searchParams.get('limit') || '50')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    const where: any = {
      tenantId: session.user.tenantId,
    }

    if (cashSessionId) {
      where.cashSessionId = cashSessionId
    }

    if (startDate) {
      where.createdAt = {
        ...where.createdAt,
        gte: new Date(startDate),
      }
    }

    if (endDate) {
      where.createdAt = {
        ...where.createdAt,
        lte: new Date(endDate),
      }
    }

    // Si es CAJA, solo ver sus ventas
    if (session.user.role === 'CAJA') {
      where.userId = session.user.id
    }

    const sales = await prisma.sale.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        items: {
          include: {
            tenantInventory: {
              select: {
                id: true,
                customSku: true,
                masterProduct: {
                  select: {
                    id: true,
                    name: true,
                    sku: true,
                  },
                },
              },
            },
          },
        },
        cashSession: {
          select: {
            id: true,
            openedAt: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    })

    return NextResponse.json(sales)
  } catch (error) {
    console.error('Error al obtener ventas:', error)
    return NextResponse.json({ error: 'Error al obtener ventas' }, { status: 500 })
  }
}

// POST: Crear venta
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      console.error('❌ POST /api/sales: No autorizado - no hay sesión')
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    console.log('📝 POST /api/sales: Usuario:', session.user.email, 'Role:', session.user.role)

    // Verificar permisos (ADMIN y CAJA pueden crear ventas)
    if (!['ADMIN', 'CAJA'].includes(session.user.role)) {
      console.error('❌ POST /api/sales: Usuario sin permisos:', session.user.role)
      return NextResponse.json(
        { error: 'No tienes permisos para crear ventas' },
        { status: 403 }
      )
    }

    // VALIDACIÓN DE LÍMITES DE SUSCRIPCIÓN
    const limitCheck = await canPerformAction(session.user.tenantId, 'create_sale')
    if (!limitCheck.allowed) {
      console.warn('⚠️ POST /api/sales: Límite de suscripción alcanzado para tenant:', session.user.tenantId)
      return NextResponse.json(
        { 
          error: limitCheck.message,
          limitExceeded: true,
          upgradeRequired: true 
        },
        { status: 403 }
      )
    }

    const body = await request.json()
    console.log('📦 POST /api/sales: Body recibido:', JSON.stringify(body, null, 2))
    
    const validatedData = createSaleSchema.parse(body)
    console.log('✅ POST /api/sales: Datos validados correctamente')

    // Verificar que haya una sesión de caja abierta
    const activeSession = await prisma.cashSession.findFirst({
      where: {
        userId: session.user.id,
        tenantId: session.user.tenantId,
        status: 'OPEN',
      },
    })

    if (!activeSession) {
      console.error('❌ POST /api/sales: No hay sesión de caja abierta para usuario:', session.user.id)
      return NextResponse.json(
        { error: 'Debes abrir una sesión de caja antes de realizar ventas' },
        { status: 400 }
      )
    }

    console.log('✅ POST /api/sales: Sesión de caja encontrada:', activeSession.id)

    // Obtener inventario del tenant y verificar stock
    const inventoryIds = validatedData.items.map(item => item.tenantInventoryId)
    console.log('🔍 POST /api/sales: Buscando productos en inventario:', inventoryIds)
    
    const inventoryItems = await prisma.tenantInventory.findMany({
      where: {
        id: { in: inventoryIds },
        tenantId: session.user.tenantId,
        isActive: true,
      },
      include: {
        masterProduct: {
          select: {
            id: true,
            name: true,
            sku: true,
          },
        },
      },
    })

    console.log('📦 POST /api/sales: Productos encontrados:', inventoryItems.length)

    if (inventoryItems.length !== validatedData.items.length) {
      console.error('❌ POST /api/sales: Algunos productos no existen. Esperados:', validatedData.items.length, 'Encontrados:', inventoryItems.length)
      return NextResponse.json(
        { error: 'Algunos productos no existen o están inactivos' },
        { status: 400 }
      )
    }

    // Verificar stock suficiente
    for (const item of validatedData.items) {
      const inventoryItem = inventoryItems.find(p => p.id === item.tenantInventoryId)
      if (!inventoryItem) {
        console.error('❌ POST /api/sales: Producto no encontrado:', item.tenantInventoryId)
        return NextResponse.json(
          { error: `Producto no encontrado en inventario: ${item.tenantInventoryId}` },
          { status: 400 }
        )
      }
      if (inventoryItem.stock < item.quantity) {
        console.error('❌ POST /api/sales: Stock insuficiente para', inventoryItem.masterProduct.name, 'Solicitado:', item.quantity, 'Disponible:', inventoryItem.stock)
        return NextResponse.json(
          { error: `Stock insuficiente para ${inventoryItem.masterProduct.name}. Disponible: ${inventoryItem.stock}` },
          { status: 400 }
        )
      }
    }

    console.log('✅ POST /api/sales: Todos los productos tienen stock suficiente')

    // Calcular totales
    let subtotal = 0
    const saleItems = validatedData.items.map(item => {
      const inventoryItem = inventoryItems.find(p => p.id === item.tenantInventoryId)!
      const itemSubtotal = Number(inventoryItem.salePrice) * item.quantity
      subtotal += itemSubtotal
      
      return {
        tenantInventoryId: item.tenantInventoryId,
        quantity: item.quantity,
        unitPrice: inventoryItem.salePrice,
        unitCost: inventoryItem.costPrice,
        subtotal: itemSubtotal,
      }
    })

    const tax = subtotal * 0.19 // IVA 19%
    const total = subtotal + tax

    // Calcular cambio si es pago en efectivo
    let change: number | null = null
    if (validatedData.paymentMethod === 'CASH' && validatedData.cashReceived) {
      change = validatedData.cashReceived - total
      if (change < 0) {
        return NextResponse.json(
          { error: 'El monto recibido es insuficiente' },
          { status: 400 }
        )
      }
    }

    // Generar número de venta
    const lastSale = await prisma.sale.findFirst({
      where: { tenantId: session.user.tenantId },
      orderBy: { saleNumber: 'desc' },
      select: { saleNumber: true },
    })

    const nextNumber = lastSale 
      ? parseInt(lastSale.saleNumber) + 1 
      : 1
    const saleNumber = nextNumber.toString().padStart(8, '0')
    console.log('🔢 POST /api/sales: Número de venta generado:', saleNumber)

    // Crear venta en transacción
    console.log('💾 POST /api/sales: Iniciando transacción de base de datos...')
    const sale = await prisma.$transaction(async (tx) => {
      // Crear venta
      const newSale = await tx.sale.create({
        data: {
          saleNumber,
          subtotal,
          tax,
          total,
          paymentMethod: validatedData.paymentMethod,
          cashReceived: validatedData.cashReceived,
          change,
          status: 'COMPLETED',
          userId: session.user.id,
          tenantId: session.user.tenantId,
          cashSessionId: activeSession.id,
          items: {
            create: saleItems.map(item => ({
              ...item,
              tenantId: session.user.tenantId,
            })),
          },
        },
        include: {
          items: {
            include: {
              tenantInventory: {
                include: {
                  masterProduct: true,
                },
              },
            },
          },
          user: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
        },
      })

      console.log('✅ POST /api/sales: Venta creada con ID:', newSale.id)

      // Actualizar stock en TenantInventory
      console.log('📦 POST /api/sales: Actualizando stock de productos...')
      for (const item of validatedData.items) {
        await tx.tenantInventory.update({
          where: { 
            id: item.tenantInventoryId,
          },
          data: {
            stock: {
              decrement: item.quantity,
            },
          },
        })
      }

      console.log('✅ POST /api/sales: Stock actualizado correctamente')

      return newSale
    })

    console.log('✅ POST /api/sales: Transacción completada exitosamente')

    // Registrar en auditoría (serializar correctamente el objeto)
    try {
      await prisma.auditLog.create({
        data: {
          action: 'CREATE',
          entity: 'Sale',
          entityId: sale.id,
          newValues: JSON.parse(JSON.stringify(sale)),
          userId: session.user.id,
          tenantId: session.user.tenantId,
        },
      })
    } catch (auditError) {
      console.error('⚠️ Error al crear log de auditoría (no crítico):', auditError)
      // No fallar la venta si falla el audit log
    }

    return NextResponse.json(sale, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error al crear venta:', error)
    return NextResponse.json({ error: 'Error al crear venta' }, { status: 500 })
  }
}
