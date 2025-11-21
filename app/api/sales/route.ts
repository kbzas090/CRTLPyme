import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { Prisma } from '@prisma/client'
import { canPerformAction } from '@/lib/subscription-middleware'

export async function POST(request: Request) {
  console.log('🟦 [SALES API] ========== INICIO ==========')
  
  try {
    // PASO 1: Autenticación
    console.log('🟦 [SALES API] PASO 1: Verificando autenticación...')
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      console.log('🔴 [SALES API] ERROR: Usuario no autenticado')
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }
    
    console.log('✅ [SALES API] Usuario autenticado:', session.user.email)

    // PASO 2: Obtener usuario y tenant
    console.log('🟦 [SALES API] PASO 2: Obteniendo datos de usuario...')
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { tenant: true }
    })

    if (!user?.tenantId) {
      console.log('🔴 [SALES API] ERROR: Usuario sin tenant')
      return NextResponse.json({ error: 'Usuario sin tenant' }, { status: 400 })
    }

    console.log('✅ [SALES API] Usuario encontrado:', {
      id: user.id,
      name: user.name,
      tenantId: user.tenantId
    })

    // PASO 3: Parsear body
    console.log('🟦 [SALES API] PASO 3: Parseando request body...')
    const body = await request.json()
    console.log('✅ [SALES API] Body recibido:', JSON.stringify(body, null, 2))

    const { items, paymentMethod, cashReceived } = body

    // PASO 4: Validaciones básicas
    console.log('🟦 [SALES API] PASO 4: Validando datos...')
    
    if (!items || !Array.isArray(items) || items.length === 0) {
      console.log('🔴 [SALES API] ERROR: Items inválidos')
      return NextResponse.json({ error: 'Items es requerido' }, { status: 400 })
    }

    if (!paymentMethod) {
      console.log('🔴 [SALES API] ERROR: Método de pago faltante')
      return NextResponse.json({ error: 'Método de pago es requerido' }, { status: 400 })
    }

    console.log('✅ [SALES API] Validaciones básicas OK')

    // PASO 5: Verificar sesión de caja
    console.log('🟦 [SALES API] PASO 5: Verificando sesión de caja...')
    const currentSession = await prisma.cashSession.findFirst({
      where: {
        userId: user.id,
        status: 'OPEN'
      }
    })

    if (!currentSession) {
      console.log('🔴 [SALES API] ERROR: No hay sesión de caja abierta')
      return NextResponse.json({ error: 'No hay sesión de caja abierta' }, { status: 400 })
    }

    console.log('✅ [SALES API] Sesión de caja encontrada:', {
      id: currentSession.id,
      openingAmount: currentSession.openingAmount
    })

    // PASO 6: Verificar límites de suscripción
    console.log('🟦 [SALES API] PASO 6: Verificando límites de suscripción...')
    
    try {
      const canCreate = await canPerformAction(user.tenantId, 'sales')
      console.log('✅ [SALES API] Resultado de canPerformAction:', canCreate)
      
      if (!canCreate) {
        console.log('🔴 [SALES API] ERROR: Límite de suscripción alcanzado')
        return NextResponse.json(
          { error: 'Has alcanzado el límite de ventas de tu plan' },
          { status: 403 }
        )
      }
    } catch (subError: any) {
      console.error('🔴 [SALES API] ERROR en canPerformAction:', subError)
      console.error('🔴 [SALES API] Stack trace:', subError.stack)
      throw subError
    }

    console.log('✅ [SALES API] Límites de suscripción OK')

    // PASO 7: Obtener inventarios y calcular totales
    console.log('🟦 [SALES API] PASO 7: Obteniendo inventarios...')
    
    const inventoryIds = items.map((item: any) => item.tenantInventoryId)
    console.log('🟦 [SALES API] IDs de inventario:', inventoryIds)
    
    const inventories = await prisma.tenantInventory.findMany({
      where: {
        id: { in: inventoryIds },
        tenantId: user.tenantId
      },
      include: {
        masterProduct: true
      }
    })

    console.log('✅ [SALES API] Inventarios encontrados:', inventories.length)

    if (inventories.length !== items.length) {
      console.log('🔴 [SALES API] ERROR: Algunos productos no encontrados')
      return NextResponse.json(
        { error: 'Algunos productos no fueron encontrados' },
        { status: 404 }
      )
    }

    // PASO 8: Validar stock
    console.log('🟦 [SALES API] PASO 8: Validando stock...')
    
    for (const item of items) {
      const inventory = inventories.find(inv => inv.id === item.tenantInventoryId)
      
      if (!inventory) {
        console.log('🔴 [SALES API] ERROR: Inventario no encontrado:', item.tenantInventoryId)
        return NextResponse.json(
          { error: `Producto no encontrado: ${item.tenantInventoryId}` },
          { status: 404 }
        )
      }

      if (inventory.stock < item.quantity) {
        console.log('🔴 [SALES API] ERROR: Stock insuficiente:', {
          productId: inventory.masterProduct.id,
          productName: inventory.masterProduct.name,
          requested: item.quantity,
          available: inventory.stock
        })
        return NextResponse.json(
          { error: `Stock insuficiente para ${inventory.masterProduct.name}` },
          { status: 400 }
        )
      }
    }

    console.log('✅ [SALES API] Stock suficiente para todos los productos')

    // PASO 9: Calcular totales
    console.log('🟦 [SALES API] PASO 9: Calculando totales...')
    
    let subtotal = 0
    const saleItems = items.map((item: any) => {
      const inventory = inventories.find(inv => inv.id === item.tenantInventoryId)!
      const itemSubtotal = Number(inventory.salePrice) * item.quantity
      subtotal += itemSubtotal

      return {
        tenantInventoryId: item.tenantInventoryId,
        quantity: item.quantity,
        unitPrice: Number(inventory.salePrice),
        unitCost: Number(inventory.costPrice),
        subtotal: itemSubtotal
      }
    })

    const tax = subtotal * 0.19
    const total = subtotal + tax

    console.log('✅ [SALES API] Totales calculados:', {
      subtotal,
      tax,
      total,
      itemsCount: saleItems.length
    })

    // PASO 10: Generar número de venta
    console.log('🟦 [SALES API] PASO 10: Generando número de venta...')
    
    const lastSale = await prisma.sale.findFirst({
      where: { tenantId: user.tenantId },
      orderBy: { createdAt: 'desc' }
    })

    const saleNumber = lastSale
      ? `V-${String(parseInt(lastSale.saleNumber.split('-')[1]) + 1).padStart(6, '0')}`
      : 'V-000001'

    console.log('✅ [SALES API] Número de venta generado:', saleNumber)

    // PASO 11: Crear venta en transacción
    console.log('🟦 [SALES API] PASO 11: Creando venta en base de datos...')
    
    const sale = await prisma.$transaction(async (tx) => {
      console.log('🟦 [SALES API] Transacción iniciada')
      
      // Crear venta
      console.log('🟦 [SALES API] Creando registro de venta...')
      const newSale = await tx.sale.create({
        data: {
          saleNumber,
          tenantId: user.tenantId,
          cashSessionId: currentSession.id,
          userId: user.id,
          subtotal: new Prisma.Decimal(subtotal),
          tax: new Prisma.Decimal(tax),
          total: new Prisma.Decimal(total),
          paymentMethod,
          cashReceived: cashReceived ? new Prisma.Decimal(cashReceived) : null,
          status: 'COMPLETED',
          items: {
            create: saleItems.map(item => ({
              tenantInventoryId: item.tenantInventoryId,
              quantity: item.quantity,
              unitPrice: new Prisma.Decimal(item.unitPrice),
              unitCost: new Prisma.Decimal(item.unitCost),
              subtotal: new Prisma.Decimal(item.subtotal),
              tenantId: user.tenantId
            }))
          }
        },
        include: {
          items: {
            include: {
              tenantInventory: {
                include: {
                  masterProduct: true
                }
              }
            }
          },
          cashSession: {
            include: {
              user: true
            }
          }
        }
      })

      console.log('✅ [SALES API] Venta creada:', newSale.id)

      // Actualizar stock
      console.log('🟦 [SALES API] Actualizando stock...')
      for (const item of saleItems) {
        await tx.tenantInventory.update({
          where: { id: item.tenantInventoryId },
          data: {
            stock: {
              decrement: item.quantity
            }
          }
        })

        // Registrar movimiento
        await tx.inventoryMovement.create({
          data: {
            tenantId: user.tenantId,
            tenantInventory: { connect: { id: item.tenantInventoryId } },
            type: 'SALE',
            quantity: -item.quantity,
            reason: `Venta ${saleNumber}`,
            userId: user.id
          }
        })
      }

      console.log('✅ [SALES API] Stock actualizado')

      // Actualizar sesión de caja
      console.log('🟦 [SALES API] Actualizando sesión de caja...')
      await tx.cashSession.update({
        where: { id: currentSession.id },
        data: {
          totalSales: {
            increment: new Prisma.Decimal(total)
          }
        }
      })

      console.log('✅ [SALES API] Sesión de caja actualizada')
      console.log('✅ [SALES API] Transacción completada')

      return newSale
    })

    console.log('✅ [SALES API] Venta completada exitosamente')

    // PASO 12: Crear audit log
    console.log('🟦 [SALES API] PASO 12: Creando audit log...')
    
    try {
      const serializedSale = JSON.parse(JSON.stringify(sale))
      
      await prisma.auditLog.create({
        data: {
          tenantId: user.tenantId,
          userId: user.id,
          action: 'CREATE_SALE',
          entityType: 'Sale',
          entityId: sale.id,
          details: serializedSale
        }
      })
      
      console.log('✅ [SALES API] Audit log creado')
    } catch (auditError: any) {
      console.error('⚠️ [SALES API] Error al crear audit log (no crítico):', auditError.message)
    }

    console.log('🟦 [SALES API] ========== FIN EXITOSO ==========')

    return NextResponse.json({
      success: true,
      sale
    })

  } catch (error: any) {
    console.error('🔴 [SALES API] ========== ERROR CRÍTICO ==========')
    console.error('🔴 [SALES API] Mensaje:', error.message)
    console.error('🔴 [SALES API] Stack trace:', error.stack)
    console.error('🔴 [SALES API] Error completo:', JSON.stringify(error, Object.getOwnPropertyNames(error)))
    
    return NextResponse.json(
      { error: error.message || 'Error al crear venta' },
      { status: 500 }
    )
  }
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user?.tenantId) {
      return NextResponse.json({ error: 'Usuario sin tenant' }, { status: 400 })
    }

    const sales = await prisma.sale.findMany({
      where: { tenantId: user.tenantId },
      include: {
        items: {
          include: {
            tenantInventory: {
              include: {
                masterProduct: true
              }
            }
          }
        },
        user: true,
        cashSession: {
          include: {
            user: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ sales })
  } catch (error: any) {
    console.error('Error al obtener ventas:', error)
    return NextResponse.json(
      { error: 'Error al obtener ventas' },
      { status: 500 }
    )
  }
}
