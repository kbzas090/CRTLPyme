import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function fixNegativeStock() {
  console.log('🔧 Corrigiendo stock negativo...\n')

  try {
    // Buscar productos con stock negativo
    const negativeStockItems = await prisma.tenantInventory.findMany({
      where: {
        stock: { lt: 0 }
      },
      include: {
        masterProduct: { select: { name: true } },
        tenant: { select: { businessName: true } }
      }
    })

    if (negativeStockItems.length === 0) {
      console.log('✅ No se encontraron productos con stock negativo')
      return
    }

    console.log(`📋 Encontrados ${negativeStockItems.length} productos con stock negativo:\n`)

    for (const item of negativeStockItems) {
      console.log(`   - ${item.tenant.businessName}: ${item.masterProduct.name} (stock: ${item.stock})`)
      
      // Actualizar a 0
      await prisma.tenantInventory.update({
        where: { id: item.id },
        data: { stock: 0 }
      })
    }

    console.log(`\n✅ ${negativeStockItems.length} productos actualizados a stock 0`)
  } catch (error) {
    console.error('❌ Error:', error)
    throw error
  }
}

// Ejecutar
fixNegativeStock()
  .then(() => {
    console.log('\n✅ Corrección completada')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Error fatal:', error)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
