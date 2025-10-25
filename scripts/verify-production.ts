/**
 * Script de verificación para producción
 * Verifica el estado de las tablas y datos después de la migración
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function verifyProduction() {
  try {
    console.log('🔍 Verificando estado de la base de datos de producción...\n')

    // 1. Verificar tablas existentes
    console.log('📋 1. Verificando existencia de tablas...')
    const tables = await prisma.$queryRaw<{ table_name: string }[]>`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('master_products', 'tenant_inventory', 'products_legacy', 'tenants', 'sale_items', 'stock_adjustments')
      ORDER BY table_name;
    `
    
    console.log('   Tablas encontradas:')
    tables.forEach(t => console.log(`   ✅ ${t.table_name}`))
    console.log('')

    // 2. Verificar productos maestros
    console.log('📦 2. Verificando productos maestros...')
    const masterProductsCount = await prisma.masterProduct.count()
    console.log(`   Total de productos maestros: ${masterProductsCount}`)
    
    if (masterProductsCount === 0) {
      console.log('   ⚠️  No hay productos maestros. Ejecuta: npm run seed:master-products')
    } else {
      console.log('   ✅ Productos maestros poblados')
      
      // Mostrar algunos productos de ejemplo
      const sampleProducts = await prisma.masterProduct.findMany({
        take: 5,
        select: { sku: true, name: true, category: true, suggestedPrice: true }
      })
      
      console.log('\n   Ejemplos de productos:')
      sampleProducts.forEach(p => {
        console.log(`   - ${p.sku}: ${p.name} (${p.category}) - $${p.suggestedPrice}`)
      })
    }
    console.log('')

    // 3. Verificar inventario por tenant
    console.log('🏪 3. Verificando inventario por tenant...')
    const inventoryCount = await prisma.tenantInventory.count()
    console.log(`   Total de items en inventarios: ${inventoryCount}`)
    
    const inventoryByTenant = await prisma.$queryRaw<{ tenant_name: string, products_count: number }[]>`
      SELECT 
        t.name as tenant_name,
        COUNT(ti.id)::int as products_count
      FROM tenants t
      LEFT JOIN tenant_inventory ti ON t.id = ti."tenantId"
      GROUP BY t.id, t.name
      ORDER BY products_count DESC;
    `
    
    console.log('\n   Productos por tenant:')
    inventoryByTenant.forEach(t => {
      console.log(`   - ${t.tenant_name}: ${t.products_count} productos`)
    })
    console.log('')

    // 4. Verificar datos legacy
    console.log('📜 4. Verificando datos legacy...')
    try {
      const legacyCount = await prisma.$queryRaw<{ count: bigint }[]>`
        SELECT COUNT(*)::bigint as count FROM products_legacy;
      `
      console.log(`   Productos legacy preservados: ${legacyCount[0].count}`)
      console.log('   ✅ Datos históricos conservados\n')
    } catch (error) {
      console.log('   ⚠️  Tabla products_legacy no encontrada (esto es normal si fue eliminada)\n')
    }

    // 5. Verificar integridad de sale_items
    console.log('💰 5. Verificando ventas...')
    const salesCount = await prisma.saleItem.count()
    console.log(`   Total de items de venta: ${salesCount}`)
    
    const salesWithInventory = await prisma.$queryRaw<{ count: bigint }[]>`
      SELECT COUNT(*)::bigint as count 
      FROM sale_items 
      WHERE "tenantInventoryId" IS NOT NULL;
    `
    console.log(`   Items vinculados a inventario: ${salesWithInventory[0].count}`)
    
    if (Number(salesWithInventory[0].count) === salesCount) {
      console.log('   ✅ Todas las ventas están correctamente vinculadas\n')
    } else {
      console.log('   ⚠️  Hay ventas sin vincular al inventario\n')
    }

    // 6. Verificar stock_adjustments
    console.log('📊 6. Verificando ajustes de stock...')
    const adjustmentsCount = await prisma.stockAdjustment.count()
    console.log(`   Total de ajustes: ${adjustmentsCount}`)
    
    const adjustmentsWithInventory = await prisma.$queryRaw<{ count: bigint }[]>`
      SELECT COUNT(*)::bigint as count 
      FROM stock_adjustments 
      WHERE "tenantInventoryId" IS NOT NULL;
    `
    console.log(`   Ajustes vinculados a inventario: ${adjustmentsWithInventory[0].count}`)
    
    if (Number(adjustmentsWithInventory[0].count) === adjustmentsCount) {
      console.log('   ✅ Todos los ajustes están correctamente vinculados\n')
    } else {
      console.log('   ⚠️  Hay ajustes sin vincular al inventario\n')
    }

    // 7. Verificar categorías únicas
    console.log('📁 7. Verificando categorías...')
    const categories = await prisma.$queryRaw<{ category: string, count: bigint }[]>`
      SELECT category, COUNT(*)::bigint as count
      FROM master_products
      GROUP BY category
      ORDER BY count DESC;
    `
    
    console.log(`   Categorías disponibles: ${categories.length}`)
    categories.forEach(c => {
      console.log(`   - ${c.category}: ${c.count} productos`)
    })
    console.log('')

    // Resumen final
    console.log('═══════════════════════════════════════════════')
    console.log('✨ RESUMEN DE VERIFICACIÓN')
    console.log('═══════════════════════════════════════════════')
    console.log(`✅ Productos maestros: ${masterProductsCount}`)
    console.log(`✅ Items en inventarios: ${inventoryCount}`)
    console.log(`✅ Ventas registradas: ${salesCount}`)
    console.log(`✅ Ajustes de stock: ${adjustmentsCount}`)
    console.log(`✅ Categorías: ${categories.length}`)
    console.log('═══════════════════════════════════════════════\n')

    if (masterProductsCount === 0) {
      console.log('⚠️  ACCIÓN REQUERIDA:')
      console.log('   Ejecuta el seed de productos maestros:')
      console.log('   npm run seed:master-products\n')
    } else {
      console.log('🎉 ¡Todo se ve bien! La base de datos está lista para producción.\n')
    }

  } catch (error: any) {
    console.error('❌ Error al verificar la base de datos:')
    console.error(error.message)
    
    if (error.code === 'P2021') {
      console.error('\n⚠️  Parece que las tablas no existen.')
      console.error('   Asegúrate de ejecutar las migraciones primero:')
      console.error('   npx prisma migrate deploy\n')
    }
    
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

verifyProduction()
