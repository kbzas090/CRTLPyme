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
      email: user.email,
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
      initialAmount: currentSession.initialAmount
    })

    // PASO 6: Verificar límites de suscripción
    console.log('🟦 [SALES API] PASO 6: Verificando límites de suscripción...')
    
    try {
      const canCreate = await canPerformAction(user.tenantId, 'create_sale')
      console.log('✅ [SALES API] Resultado de canPerformAction:', canCreate)
      
      if (!canCreate.allowed) {
        console.log('🔴 [SALES API] ERROR: Límite de suscripción alcanzado')
        return NextResponse.json(
          { error: canCreate.message || 'Has alcanzado el límite de ventas de tu plan' },
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
    const change = (paymentMethod === 'CASH' && cashReceived) 
      ? Number(cashReceived) - total 
      : null

    console.log('✅ [SALES API] Totales calculados:', {
      subtotal,
      tax,
      total,
      cashReceived,
      change,
      itemsCount: saleItems.length
    })

    // PASO 10 y 11: Crear venta en transacción (con generación de número dentro de TX)
    console.log('🟦 [SALES API] PASO 10-11: Creando venta en base de datos (con generación de número)...')
    
    const sale = await prisma.$transaction(async (tx) => {
      console.log('🟦 [SALES API] Transacción iniciada')
      
      // Generar número de venta DENTRO de la transacción para evitar duplicados
      console.log('🟦 [SALES API] Generando número de venta...')
      
      const lastSale = await tx.sale.findFirst({
        where: { tenantId: user.tenantId },
        orderBy: { createdAt: 'desc' },
        select: { saleNumber: true }
      })

      let saleNumber: string
      if (lastSale && lastSale.saleNumber && typeof lastSale.saleNumber === 'string') {
        // Extraer el número del formato "V-XXXXXX"
        const parts = lastSale.saleNumber.split('-')
        const numberPart = parts.length > 1 ? parts[1] : '0'
        const lastNumber = parseInt(numberPart, 10)
        
        // Validar que sea un número válido y positivo
        if (!isNaN(lastNumber) && lastNumber >= 0 && isFinite(lastNumber)) {
          const nextNumber = lastNumber + 1
          saleNumber = `V-${String(nextNumber).padStart(6, '0')}`
          console.log(`✅ [SALES API] Número incrementado de ${lastSale.saleNumber} a ${saleNumber}`)
        } else {
          console.warn('⚠️ [SALES API] Número de venta anterior inválido:', lastSale.saleNumber)
          saleNumber = 'V-000001'
        }
      } else {
        console.log('ℹ️ [SALES API] No hay ventas previas, iniciando desde V-000001')
        saleNumber = 'V-000001'
      }

      console.log('✅ [SALES API] Número de venta generado:', saleNumber)
      
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
          change: change !== null ? new Prisma.Decimal(change) : null,
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
          user: {
            select: {
              firstName: true,
              lastName: true
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

        // ✅ Registrar movimiento de inventario
        console.log(`🟦 [SALES API] Registrando movimiento de inventario para item ${item.tenantInventoryId}...`)
        await tx.inventoryMovement.create({
          data: {
            tenantId: user.tenantId,
            tenantInventoryId: item.tenantInventoryId,
            type: 'EXIT',
            quantity: -item.quantity,
            reason: `Venta ${saleNumber}`,
            createdBy: user.id
          }
        })
        console.log(`✅ [SALES API] Movimiento de inventario registrado`)
      }

      console.log('✅ [SALES API] Stock actualizado')

      // ⚠️ NOTA: NO se actualiza totalSales en cashSession
      // El campo 'totalSales' NO existe en el modelo CashSession
      // Las ventas totales se calculan sumando las ventas relacionadas
      console.log('ℹ️ [SALES API] CashSession no requiere actualización (totalSales no existe)')
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
          action: 'CREATE',
          entity: 'Sale',
          entityId: sale.id,
          newValues: serializedSale
        }
      })
      
      console.log('✅ [SALES API] Audit log creado')
    } catch (auditError: any) {
      console.error('⚠️ [SALES API] Error al crear audit log (no crítico):', auditError.message)
    }

    console.log('🟦 [SALES API] ========== FIN EXITOSO ==========')

    // Devolver solo el objeto sale (sin wrapper) para compatibilidad con el frontend
    return NextResponse.json(sale)

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

    // Devolver directamente el array (sin wrapper) para compatibilidad con el frontend
    return NextResponse.json(sales)
  } catch (error: any) {
    console.error('Error al obtener ventas:', error)
    return NextResponse.json(
      { error: 'Error al obtener ventas' },
      { status: 500 }
    )
  }
}
