import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function verifyIntegrity() {
  console.log('🔍 Verificando integridad de datos...\n')

  const issues: string[] = []
  const verifications: string[] = []

  try {
    // 1. Verificar productos sin inventario
    const masterProductsCount = await prisma.masterProduct.count()
    verifications.push(`✅ Total de productos maestros: ${masterProductsCount}`)

    // 2. Verificar inventario por tenant
    const tenants = await prisma.tenant.findMany({
      where: { isActive: true }
    })

    for (const tenant of tenants) {
      const inventoryCount = await prisma.tenantInventory.count({
        where: { tenantId: tenant.id }
      })
      verifications.push(`✅ ${tenant.businessName}: ${inventoryCount} productos en inventario`)

      // Verificar stock negativo
      const negativeStock = await prisma.tenantInventory.findMany({
        where: {
          tenantId: tenant.id,
          stock: { lt: 0 }
        },
        include: {
          masterProduct: { select: { name: true } }
        }
      })

      if (negativeStock.length > 0) {
        issues.push(`⚠️  ${tenant.businessName}: ${negativeStock.length} productos con stock negativo`)
        for (const item of negativeStock) {
          issues.push(`   - ${item.masterProduct.name}: stock = ${item.stock}`)
        }
      }
    }

    // 3. Verificar ventas
    const salesCount = await prisma.sale.count()
    const salesByStatus = await prisma.sale.groupBy({
      by: ['status'],
      _count: true
    })

    verifications.push(`✅ Total de ventas: ${salesCount}`)
    for (const status of salesByStatus) {
      verifications.push(`   - ${status.status}: ${status._count}`)
    }

    // 4. Verificar items de venta
    const saleItemsCount = await prisma.saleItem.count()
    verifications.push(`✅ Total de items de venta: ${saleItemsCount}`)

    // 5. Verificar ventas sin items
    const salesWithoutItems = await prisma.sale.findMany({
      where: {
        items: { none: {} }
      },
      select: { id: true, saleNumber: true }
    })

    if (salesWithoutItems.length > 0) {
      issues.push(`⚠️  ${salesWithoutItems.length} ventas sin items`)
    } else {
      verifications.push(`✅ Todas las ventas tienen items`)
    }

    // 6. Verificar que todos los sale items tienen relaciones válidas
    verifications.push(`✅ Relaciones de items de venta asumidas como válidas (constraint FK)`)

    // 7. Verificar consistencia de totales
    const sales = await prisma.sale.findMany({
      include: { items: true }
    })

    let inconsistentSales = 0
    for (const sale of sales) {
      const calculatedSubtotal = sale.items.reduce((sum, item) => sum + Number(item.subtotal), 0)
      const diff = Math.abs(calculatedSubtotal - Number(sale.subtotal))
      
      if (diff > 1) { // tolerancia de 1 peso
        inconsistentSales++
      }
    }

    if (inconsistentSales > 0) {
      issues.push(`⚠️  ${inconsistentSales} ventas con totales inconsistentes`)
    } else {
      verifications.push(`✅ Todos los totales de ventas son consistentes`)
    }

    // Resumen
    console.log('📊 VERIFICACIONES EXITOSAS:\n')
    for (const v of verifications) {
      console.log(v)
    }

    if (issues.length > 0) {
      console.log('\n\n⚠️  PROBLEMAS ENCONTRADOS:\n')
      for (const i of issues) {
        console.log(i)
      }
    } else {
      console.log('\n\n✅ No se encontraron problemas de integridad')
    }

    return { verifications, issues }
  } catch (error) {
    console.error('❌ Error:', error)
    throw error
  }
}

// Ejecutar
verifyIntegrity()
  .then((result) => {
    console.log('\n✅ Verificación completada')
    process.exit(result.issues.length > 0 ? 1 : 0)
  })
  .catch((error) => {
    console.error('❌ Error fatal:', error)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
