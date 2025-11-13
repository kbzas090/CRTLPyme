import { PrismaClient, PaymentMethod, SaleStatus } from '@prisma/client'

const prisma = new PrismaClient()

// Definición de productos para minimarket
const MINIMARKET_PRODUCTS = [
  { name: 'Coca Cola 500ml', category: 'Bebidas', brand: 'Coca Cola', costPrice: 600, salePrice: 900, initialStock: 50 },
  { name: 'Pan de molde', category: 'Panadería', brand: 'Ideal', costPrice: 800, salePrice: 1200, initialStock: 30 },
  { name: 'Leche 1L', category: 'Lácteos', brand: 'Colun', costPrice: 700, salePrice: 1100, initialStock: 40 },
  { name: 'Arroz 1kg', category: 'Abarrotes', brand: 'Tucapel', costPrice: 900, salePrice: 1400, initialStock: 25 },
  { name: 'Aceite 1L', category: 'Abarrotes', brand: 'Chef', costPrice: 1500, salePrice: 2300, initialStock: 20 },
  { name: 'Huevos docena', category: 'Lácteos', brand: 'Los Colonos', costPrice: 2000, salePrice: 2800, initialStock: 35 },
  { name: 'Jabón en barra', category: 'Aseo', brand: 'Noble', costPrice: 500, salePrice: 800, initialStock: 45 },
  { name: 'Papel higiénico 4 rollos', category: 'Aseo', brand: 'Elite', costPrice: 1200, salePrice: 1800, initialStock: 40 },
  { name: 'Fideos 400g', category: 'Abarrotes', brand: 'Carozzi', costPrice: 600, salePrice: 1000, initialStock: 50 },
  { name: 'Café instantáneo 170g', category: 'Bebidas', brand: 'Nescafé', costPrice: 3500, salePrice: 4800, initialStock: 15 },
  { name: 'Azúcar 1kg', category: 'Abarrotes', brand: 'Iansa', costPrice: 800, salePrice: 1300, initialStock: 30 },
  { name: 'Sal 1kg', category: 'Abarrotes', brand: 'Lobos', costPrice: 300, salePrice: 600, initialStock: 25 },
  { name: 'Mantequilla 250g', category: 'Lácteos', brand: 'Soprole', costPrice: 1800, salePrice: 2500, initialStock: 20 },
  { name: 'Galletas surtidas', category: 'Snacks', brand: 'McKay', costPrice: 800, salePrice: 1300, initialStock: 40 },
  { name: 'Jugo en polvo', category: 'Bebidas', brand: 'Zuko', costPrice: 400, salePrice: 700, initialStock: 50 },
  { name: 'Atún en lata', category: 'Conservas', brand: 'San José', costPrice: 1200, salePrice: 1800, initialStock: 35 },
  { name: 'Mayonesa 500g', category: 'Salsas', brand: 'Hellmanns', costPrice: 1600, salePrice: 2400, initialStock: 20 },
  { name: 'Ketchup 400g', category: 'Salsas', brand: 'Maggi', costPrice: 1200, salePrice: 1900, initialStock: 25 },
  { name: 'Cerveza lata', category: 'Bebidas', brand: 'Cristal', costPrice: 700, salePrice: 1100, initialStock: 60 },
  { name: 'Pañales pack 30', category: 'Bebé', brand: 'Huggies', costPrice: 8000, salePrice: 11000, initialStock: 15 },
]

// Utilidades
function randomDate(start: Date, end: Date): Date {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()))
}

function getRandomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)]
}

function getRandomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

// Función principal
async function populateRealisticData() {
  console.log('🚀 Iniciando población de datos realistas...\n')

  try {
    // 1. Obtener tenants activos (excluyendo demos)
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

    const globalStats = {
      totalProducts: 0,
      totalSales: 0,
      totalRevenue: 0,
      tenantStats: [] as any[]
    }

    for (const tenant of tenants) {
      console.log(`\n📦 Procesando: ${tenant.businessName}`)

      const adminUser = tenant.users[0]
      if (!adminUser) {
        console.log(`   ⚠️  No hay usuario admin, saltando...`)
        continue
      }

      // 2. Crear/obtener productos
      console.log(`   📝 Creando productos...`)
      const tenantProducts = []

      for (const productData of MINIMARKET_PRODUCTS) {
        // Crear o buscar MasterProduct
        let masterProduct = await prisma.masterProduct.findFirst({
          where: {
            name: productData.name,
            category: productData.category
          }
        })

        if (!masterProduct) {
          masterProduct = await prisma.masterProduct.create({
            data: {
              sku: `SKU-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              name: productData.name,
              description: `${productData.name} - ${productData.category}`,
              category: productData.category,
              brand: productData.brand,
              suggestedPrice: productData.salePrice,
              unit: 'unidad',
              isActive: true
            }
          })
        }

        // Verificar si ya existe inventario para este tenant
        let inventory = await prisma.tenantInventory.findFirst({
          where: {
            tenantId: tenant.id,
            masterProductId: masterProduct.id
          }
        })

        if (!inventory) {
          // Crear inventario con stock alto (compensaremos con ventas)
          const totalStock = productData.initialStock + getRandomInt(100, 200)
          inventory = await prisma.tenantInventory.create({
            data: {
              tenantId: tenant.id,
              masterProductId: masterProduct.id,
              costPrice: productData.costPrice,
              salePrice: productData.salePrice,
              stock: totalStock,
              minStock: 5,
              isActive: true
            }
          })
        }

        tenantProducts.push({ inventory, masterProduct, initialStock: productData.initialStock })
      }

      console.log(`   ✅ ${tenantProducts.length} productos disponibles`)
      globalStats.totalProducts += tenantProducts.length

      // 3. Crear ventas históricas
      console.log(`   💰 Creando ventas históricas...`)
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

      // Verificar si ya existen ventas
      const existingSalesCount = await prisma.sale.count({
        where: { tenantId: tenant.id }
      })

      if (existingSalesCount > 0) {
        console.log(`   ⚠️  Ya existen ${existingSalesCount} ventas, saltando creación de ventas...`)
        globalStats.tenantStats.push({
          name: tenant.businessName,
          products: tenantProducts.length,
          sales: existingSalesCount,
          revenue: 0
        })
        continue
      }

      // Obtener último número de venta
      let saleNumber = 1

      const totalStockReduction: Record<string, number> = {}

      for (const month of months) {
        for (let i = 0; i < month.sales; i++) {
          const saleDate = randomDate(month.start, month.end)
          const itemsCount = getRandomInt(1, 5)
          const paymentMethod = getRandomElement(['CASH', 'DEBIT', 'CREDIT', 'TRANSFER']) as PaymentMethod
          const saleStatus = Math.random() < 0.95 ? 'COMPLETED' : (Math.random() < 0.5 ? 'PENDING' : 'CANCELLED') as SaleStatus

          // Seleccionar productos aleatorios
          const selectedProducts = []
          for (let j = 0; j < itemsCount; j++) {
            selectedProducts.push(getRandomElement(tenantProducts))
          }

          // Calcular totales
          let subtotal = 0
          const saleItems = selectedProducts.map(({ inventory, masterProduct }) => {
            const quantity = getRandomInt(1, 3)
            const unitPrice = Number(inventory.salePrice)
            const unitCost = Number(inventory.costPrice)
            const itemSubtotal = unitPrice * quantity

            subtotal += itemSubtotal

            // Rastrear reducción de stock
            if (saleStatus === 'COMPLETED') {
              if (!totalStockReduction[inventory.id]) {
                totalStockReduction[inventory.id] = 0
              }
              totalStockReduction[inventory.id] += quantity
            }

            return {
              quantity,
              unitPrice,
              unitCost,
              subtotal: itemSubtotal,
              tenantInventoryId: inventory.id,
              tenantId: tenant.id
            }
          })

          const tax = 0
          const total = subtotal + tax

          // Crear venta
          await prisma.sale.create({
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

          if (saleStatus === 'COMPLETED') {
            tenantRevenue += Number(total)
          }

          salesCount++
          saleNumber++
        }
      }

      // 4. Actualizar stock final
      console.log(`   📊 Actualizando stock...`)
      for (const [inventoryId, reduction] of Object.entries(totalStockReduction)) {
        await prisma.tenantInventory.update({
          where: { id: inventoryId },
          data: { stock: { decrement: reduction } }
        })
      }

      console.log(`   ✅ ${salesCount} ventas creadas`)
      console.log(`   💵 Ingresos: CLP $${tenantRevenue.toLocaleString('es-CL')}`)

      globalStats.totalSales += salesCount
      globalStats.totalRevenue += tenantRevenue
      globalStats.tenantStats.push({
        name: tenant.businessName,
        products: tenantProducts.length,
        sales: salesCount,
        revenue: tenantRevenue
      })
    }

    console.log('\n\n✨ ¡Población completada!\n')
    console.log('📊 RESUMEN GLOBAL:')
    console.log(`   Tenants procesados: ${globalStats.tenantStats.length}`)
    console.log(`   Total de productos: ${globalStats.totalProducts}`)
    console.log(`   Total de ventas: ${globalStats.totalSales}`)
    console.log(`   Ingresos totales: CLP $${globalStats.totalRevenue.toLocaleString('es-CL')}\n`)

    return globalStats
  } catch (error) {
    console.error('❌ Error:', error)
    throw error
  }
}

// Ejecutar
populateRealisticData()
  .then(() => {
    console.log('✅ Proceso completado')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Error fatal:', error)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
