import { PrismaClient, MovementType, PaymentMethod, SaleStatus } from '@prisma/client'

const prisma = new PrismaClient()

// Definición de tipos de negocio y sus productos
const BUSINESS_CATALOG = {
  minimarket: {
    name: 'Minimarket/Almacén',
    products: [
      { name: 'Coca Cola 500ml', category: 'Bebidas', brand: 'Coca Cola', costPrice: 600, salePrice: 900, stock: 50 },
      { name: 'Pan de molde', category: 'Panadería', brand: 'Ideal', costPrice: 800, salePrice: 1200, stock: 30 },
      { name: 'Leche 1L', category: 'Lácteos', brand: 'Colun', costPrice: 700, salePrice: 1100, stock: 40 },
      { name: 'Arroz 1kg', category: 'Abarrotes', brand: 'Tucapel', costPrice: 900, salePrice: 1400, stock: 25 },
      { name: 'Aceite 1L', category: 'Abarrotes', brand: 'Chef', costPrice: 1500, salePrice: 2300, stock: 20 },
      { name: 'Huevos docena', category: 'Lácteos', brand: 'Los Colonos', costPrice: 2000, salePrice: 2800, stock: 35 },
      { name: 'Jabón en barra', category: 'Aseo', brand: 'Noble', costPrice: 500, salePrice: 800, stock: 45 },
      { name: 'Papel higiénico 4 rollos', category: 'Aseo', brand: 'Elite', costPrice: 1200, salePrice: 1800, stock: 40 },
      { name: 'Fideos 400g', category: 'Abarrotes', brand: 'Carozzi', costPrice: 600, salePrice: 1000, stock: 50 },
      { name: 'Café instantáneo 170g', category: 'Bebidas', brand: 'Nescafé', costPrice: 3500, salePrice: 4800, stock: 15 },
      { name: 'Azúcar 1kg', category: 'Abarrotes', brand: 'Iansa', costPrice: 800, salePrice: 1300, stock: 30 },
      { name: 'Sal 1kg', category: 'Abarrotes', brand: 'Lobos', costPrice: 300, salePrice: 600, stock: 25 },
      { name: 'Mantequilla 250g', category: 'Lácteos', brand: 'Soprole', costPrice: 1800, salePrice: 2500, stock: 20 },
      { name: 'Galletas surtidas', category: 'Snacks', brand: 'McKay', costPrice: 800, salePrice: 1300, stock: 40 },
      { name: 'Jugo en polvo', category: 'Bebidas', brand: 'Zuko', costPrice: 400, salePrice: 700, stock: 50 },
      { name: 'Atún en lata', category: 'Conservas', brand: 'San José', costPrice: 1200, salePrice: 1800, stock: 35 },
      { name: 'Mayonesa 500g', category: 'Salsas', brand: 'Hellmanns', costPrice: 1600, salePrice: 2400, stock: 20 },
      { name: 'Ketchup 400g', category: 'Salsas', brand: 'Maggi', costPrice: 1200, salePrice: 1900, stock: 25 },
      { name: 'Cerveza lata', category: 'Bebidas', brand: 'Cristal', costPrice: 700, salePrice: 1100, stock: 60 },
      { name: 'Pañales pack 30', category: 'Bebé', brand: 'Huggies', costPrice: 8000, salePrice: 11000, stock: 15 },
    ]
  }
}

// Utilidades de fechas
function randomDate(start: Date, end: Date): Date {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()))
}

function getRandomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)]
}

function getRandomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

// Función principal de población
async function populateRealisticData() {
  console.log('🚀 Iniciando población de datos realistas para minimarkets...\n')

  try {
    // 1. Obtener todos los tenants activos (excepto los de prueba)
    const tenants = await prisma.tenant.findMany({
      where: { 
        isActive: true,
        businessName: {
          notIn: ['Empresa Demo CRTLPyme', 'CRTLPyme - Plataforma']
        }
      },
      include: { users: { where: { role: 'ADMIN', isActive: true }, take: 1 } }
    })

    console.log(`✅ Encontrados ${tenants.length} tenants activos\n`)

    const stats = {
      totalProducts: 0,
      totalMovements: 0,
      totalSales: 0,
      totalRevenue: 0,
      tenantStats: [] as any[]
    }

    for (const tenant of tenants) {
      console.log(`\n📦 Procesando: ${tenant.businessName}`)

      const businessType = BUSINESS_CATALOG.minimarket
      const adminUser = tenant.users[0]

      if (!adminUser) {
        console.log(`   ⚠️  No se encontró usuario admin, saltando...`)
        continue
      }

      // 2. Crear productos para el tenant
      console.log(`   📝 Creando productos...`)
      const createdProducts = []

      for (const product of businessType.products) {
        // Crear o buscar MasterProduct
        let masterProduct = await prisma.masterProduct.findFirst({
          where: {
            name: product.name,
            category: product.category
          }
        })

        if (!masterProduct) {
          masterProduct = await prisma.masterProduct.create({
            data: {
              sku: `SKU-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              name: product.name,
              description: `${product.name} - ${product.category}`,
              category: product.category,
              brand: product.brand,
              suggestedPrice: product.salePrice,
              unit: 'unidad',
              isActive: true
            }
          })
        }

        // Verificar si ya existe en el inventario del tenant
        const existingInventory = await prisma.tenantInventory.findFirst({
          where: {
            tenantId: tenant.id,
            masterProductId: masterProduct.id
          }
        })

        if (existingInventory) {
          console.log(`   ⚠️  Producto ${product.name} ya existe en el inventario, saltando...`)
          createdProducts.push({ inventory: existingInventory, product: masterProduct })
          continue
        }

        // Crear TenantInventory
        const tenantInventory = await prisma.tenantInventory.create({
          data: {
            tenantId: tenant.id,
            masterProductId: masterProduct.id,
            costPrice: product.costPrice,
            salePrice: product.salePrice,
            stock: product.stock,
            minStock: 5,
            isActive: true
          }
        })

        createdProducts.push({ inventory: tenantInventory, product: masterProduct })
      }

      console.log(`   ✅ ${createdProducts.length} productos disponibles`)
      stats.totalProducts += createdProducts.length

      // 3. Crear movimientos de inventario (solo para productos con stock > 0)
      console.log(`   📋 Creando movimientos de inventario...`)
      let movementsCount = 0

      const productsWithStock = createdProducts.filter(p => p.inventory.stock > 0)

      for (const { inventory } of productsWithStock) {
        // Verificar si ya existen movimientos para este producto
        const existingMovements = await prisma.inventoryMovement.count({
          where: {
            tenantInventoryId: inventory.id,
            tenantId: tenant.id
          }
        })

        if (existingMovements > 0) {
          console.log(`   ⚠️  Ya existen movimientos para un producto, saltando movimientos iniciales...`)
          continue
        }

        // Crear entrada inicial (compra)
        const entryDate = randomDate(new Date('2025-06-01'), new Date('2025-06-15'))
        await prisma.inventoryMovement.create({
          data: {
            tenantInventoryId: inventory.id,
            type: 'ENTRY',
            quantity: inventory.stock,
            reason: 'Compra inicial de inventario',
            notes: 'Stock inicial del sistema',
            createdBy: adminUser.id,
            tenantId: tenant.id,
            createdAt: entryDate
          }
        })
        movementsCount++

        // Algunas entradas adicionales aleatorias
        const additionalEntries = getRandomInt(2, 5)
        for (let i = 0; i < additionalEntries; i++) {
          const entryAmount = getRandomInt(10, 50)
          const entryDate = randomDate(new Date('2025-06-16'), new Date('2025-11-10'))
          
          await prisma.inventoryMovement.create({
            data: {
              tenantInventoryId: inventory.id,
              type: 'ENTRY',
              quantity: entryAmount,
              reason: 'Reposición de stock',
              notes: `Compra a proveedor`,
              createdBy: adminUser.id,
              tenantId: tenant.id,
              createdAt: entryDate
            }
          })
          movementsCount++
        }
      }

      console.log(`   ✅ ${movementsCount} movimientos de inventario creados`)
      stats.totalMovements += movementsCount

      // 4. Crear ventas (junio 2025 - noviembre 2025)
      console.log(`   💰 Creando ventas...`)
      let salesCount = 0
      let tenantRevenue = 0

      const months = [
        { start: new Date('2025-06-01'), end: new Date('2025-06-30'), sales: getRandomInt(20, 40) },
        { start: new Date('2025-07-01'), end: new Date('2025-07-31'), sales: getRandomInt(25, 45) },
        { start: new Date('2025-08-01'), end: new Date('2025-08-31'), sales: getRandomInt(25, 45) },
        { start: new Date('2025-09-01'), end: new Date('2025-09-30'), sales: getRandomInt(30, 50) },
        { start: new Date('2025-10-01'), end: new Date('2025-10-31'), sales: getRandomInt(30, 50) },
        { start: new Date('2025-11-01'), end: new Date('2025-11-13'), sales: getRandomInt(15, 25) }
      ]

      // Obtener el último número de venta para este tenant
      const lastSale = await prisma.sale.findFirst({
        where: { tenantId: tenant.id },
        orderBy: { saleNumber: 'desc' },
        select: { saleNumber: true }
      })

      let saleNumber = 1
      if (lastSale && lastSale.saleNumber) {
        const match = lastSale.saleNumber.match(/\d+/)
        if (match) {
          saleNumber = parseInt(match[0]) + 1
        }
      }

      for (const month of months) {
        for (let i = 0; i < month.sales; i++) {
          const saleDate = randomDate(month.start, month.end)
          const itemsCount = getRandomInt(1, 5)
          const paymentMethod = getRandomElement(['CASH', 'DEBIT', 'CREDIT', 'TRANSFER']) as PaymentMethod
          const saleStatus = Math.random() < 0.95 ? 'COMPLETED' : (Math.random() < 0.5 ? 'PENDING' : 'CANCELLED') as SaleStatus

          // Seleccionar productos aleatorios
          const selectedProducts = []
          for (let j = 0; j < itemsCount; j++) {
            selectedProducts.push(getRandomElement(createdProducts))
          }

          // Calcular totales
          let subtotal = 0
          const saleItems = selectedProducts.map(({ inventory, product }) => {
            const quantity = getRandomInt(1, 3)
            const unitPrice = Number(inventory.salePrice)
            const unitCost = Number(inventory.costPrice)
            const itemSubtotal = unitPrice * quantity

            subtotal += itemSubtotal

            return {
              quantity,
              unitPrice,
              unitCost,
              subtotal: itemSubtotal,
              tenantInventoryId: inventory.id,
              tenantId: tenant.id
            }
          })

          const tax = 0 // Sin IVA por ahora
          const total = subtotal + tax

          // Crear venta
          const sale = await prisma.sale.create({
            data: {
              saleNumber: `${tenant.businessName.substring(0, 3).toUpperCase()}-${saleNumber.toString().padStart(6, '0')}`,
              subtotal,
              tax,
              total,
              paymentMethod,
              status: saleStatus,
              userId: adminUser.id,
              tenantId: tenant.id,
              createdAt: saleDate,
              updatedAt: saleDate,
              items: {
                create: saleItems
              }
            }
          })

          // Actualizar stock si la venta está completada
          if (saleStatus === 'COMPLETED') {
            for (const item of saleItems) {
              // Registrar salida de inventario
              await prisma.inventoryMovement.create({
                data: {
                  tenantInventoryId: item.tenantInventoryId,
                  type: 'EXIT',
                  quantity: -item.quantity,
                  reason: 'Venta',
                  notes: `Venta ${sale.saleNumber}`,
                  createdBy: adminUser.id,
                  tenantId: tenant.id,
                  createdAt: saleDate
                }
              })

              // Actualizar stock en TenantInventory
              await prisma.tenantInventory.update({
                where: { id: item.tenantInventoryId },
                data: { 
                  stock: { decrement: item.quantity },
                  updatedAt: saleDate
                }
              })
            }

            tenantRevenue += Number(total)
          }

          salesCount++
          saleNumber++
        }
      }

      console.log(`   ✅ ${salesCount} ventas creadas`)
      console.log(`   💵 Ingresos totales: CLP $${tenantRevenue.toLocaleString('es-CL')}`)

      stats.totalSales += salesCount
      stats.totalRevenue += tenantRevenue
      stats.tenantStats.push({
        name: tenant.businessName,
        type: businessType.name,
        products: createdProducts.length,
        movements: movementsCount,
        sales: salesCount,
        revenue: tenantRevenue
      })
    }

    console.log('\n\n✨ ¡Población de datos completada!\n')
    console.log('📊 RESUMEN GLOBAL:')
    console.log(`   Tenants procesados: ${stats.tenantStats.length}`)
    console.log(`   Total de productos: ${stats.totalProducts}`)
    console.log(`   Total de movimientos: ${stats.totalMovements}`)
    console.log(`   Total de ventas: ${stats.totalSales}`)
    console.log(`   Ingresos totales: CLP $${stats.totalRevenue.toLocaleString('es-CL')}`)

    return stats
  } catch (error) {
    console.error('❌ Error durante la población:', error)
    throw error
  }
}

// Ejecutar
populateRealisticData()
  .then((stats) => {
    console.log('\n✅ Proceso completado exitosamente')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ Error fatal:', error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
