const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function checkDatabase() {
  console.log('🔍 ANÁLISIS COMPLETO DE BASE DE DATOS CRTLPyme\n')
  console.log('='.repeat(80))
  
  try {
    // 1. TENANTS
    const tenants = await prisma.tenant.findMany({
      include: {
        subscriptions: {
          include: { plan: true },
          orderBy: { createdAt: 'desc' },
          take: 1
        },
        users: { take: 1 }
      }
    })
    console.log('\n📊 TENANTS:')
    console.log(`   Total: ${tenants.length}`)
    
    // 2. MASTER PRODUCTS (catálogo global)
    const masterProducts = await prisma.masterProduct.findMany()
    console.log('\n📦 MASTER PRODUCTS (Catálogo Global):')
    console.log(`   Total: ${masterProducts.length}`)
    if (masterProducts.length > 0) {
      const categories = Array.from(new Set(masterProducts.map(p => p.category)))
      console.log('   Categorías:', categories.join(', '))
    }
    
    // 3. TENANT INVENTORY (productos por tenant)
    const tenantInventoryCount = await prisma.tenantInventory.count()
    console.log('\n🏪 TENANT INVENTORY (Productos por Tenant):')
    console.log(`   Total: ${tenantInventoryCount}`)
    
    // 4. LEGACY PRODUCTS (tabla antigua)
    const legacyProducts = await prisma.product.count()
    console.log('\n📋 LEGACY PRODUCTS (Tabla Antigua):')
    console.log(`   Total: ${legacyProducts}`)
    
    // 5. SALES
    const totalSales = await prisma.sale.count()
    const salesByTenant = await prisma.sale.groupBy({
      by: ['tenantId'],
      _count: true
    })
    console.log('\n💰 SALES:')
    console.log(`   Total: ${totalSales}`)
    console.log(`   Tenants con ventas: ${salesByTenant.length}`)
    
    // 6. SALE ITEMS
    const saleItems = await prisma.saleItem.count()
    console.log('\n🛒 SALE ITEMS:')
    console.log(`   Total: ${saleItems}`)
    
    // 7. INVENTORY MOVEMENTS
    const movements = await prisma.inventoryMovement.count()
    const movementsByType = await prisma.inventoryMovement.groupBy({
      by: ['type'],
      _count: true
    })
    console.log('\n📦 INVENTORY MOVEMENTS:')
    console.log(`   Total: ${movements}`)
    movementsByType.forEach(m => {
      console.log(`   ${m.type}: ${m._count}`)
    })
    
    // 8. SUBSCRIPTION PLANS
    const plans = await prisma.subscriptionPlan.findMany({
      orderBy: { sortOrder: 'asc' }
    })
    console.log('\n💎 SUBSCRIPTION PLANS:')
    console.log(`   Total: ${plans.length}`)
    plans.forEach(p => {
      console.log(`   - ${p.name} (${p.billingCycle}): $${p.price}`)
    })
    
    // 9. SUBSCRIPTION PAYMENTS
    const payments = await prisma.subscriptionPayment.count()
    const paymentsByStatus = await prisma.subscriptionPayment.groupBy({
      by: ['status'],
      _count: true,
      _sum: { amount: true }
    })
    console.log('\n💳 SUBSCRIPTION PAYMENTS:')
    console.log(`   Total: ${payments}`)
    paymentsByStatus.forEach(p => {
      console.log(`   ${p.status}: ${p._count} (Total: $${p._sum.amount || 0})`)
    })
    
    // 10. DETALLE POR TENANT (primeros 3)
    console.log('\n' + '='.repeat(80))
    console.log('\n👥 DETALLE POR TENANT (primeros 3):\n')
    
    for (const tenant of tenants.slice(0, 3)) {
      console.log(`\n🏢 ${tenant.businessName}`)
      console.log(`   Email: ${tenant.email}`)
      console.log(`   Estado: ${tenant.accountStatus}`)
      
      const subscription = tenant.subscriptions[0]
      if (subscription) {
        console.log(`   Plan: ${subscription.plan.name} (${subscription.status})`)
      }
      
      const tenantInv = await prisma.tenantInventory.count({
        where: { tenantId: tenant.id }
      })
      console.log(`   Productos en inventario: ${tenantInv}`)
      
      const tenantSales = await prisma.sale.count({
        where: { tenantId: tenant.id }
      })
      console.log(`   Ventas registradas: ${tenantSales}`)
      
      const tenantMovements = await prisma.inventoryMovement.count({
        where: { tenantId: tenant.id }
      })
      console.log(`   Movimientos de inventario: ${tenantMovements}`)
    }
    
    console.log('\n' + '='.repeat(80))
    console.log('\n✅ Análisis completado')
    
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkDatabase()
