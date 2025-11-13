const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function checkDatabase() {
  console.log('🔍 ESTADO ACTUAL DE LA BASE DE DATOS\n')
  console.log('='.repeat(80))
  
  try {
    // TENANTS
    const tenants = await prisma.tenant.findMany({
      include: {
        subscriptions: {
          include: { plan: true },
          orderBy: { createdAt: 'desc' },
          take: 1
        },
        users: { select: { email: true, role: true } }
      }
    })
    console.log(`\n📊 Total Tenants: ${tenants.length}`)
    
    // MASTER PRODUCTS
    const masterProducts = await prisma.masterProduct.findMany()
    const categories = Array.from(new Set(masterProducts.map(p => p.category)))
    console.log(`\n📦 Catálogo Global Master Products: ${masterProducts.length}`)
    console.log(`   Categorías: ${categories.join(', ')}`)
    
    // TENANT INVENTORY
    const tenantInventoryCount = await prisma.tenantInventory.count()
    console.log(`\n🏪 Productos en Inventarios de Tenants: ${tenantInventoryCount}`)
    
    // SALES
    const totalSales = await prisma.sale.count()
    const salesWithItems = await prisma.sale.findMany({
      include: {
        items: true
      }
    })
    console.log(`\n💰 Total Ventas: ${totalSales}`)
    console.log(`   Total Items Vendidos: ${salesWithItems.reduce((sum, s) => sum + s.items.length, 0)}`)
    
    // SUBSCRIPTION PLANS
    const plans = await prisma.subscriptionPlan.findMany({
      where: { isActive: true, isVisible: true },
      orderBy: { sortOrder: 'asc' }
    })
    console.log(`\n💎 Planes de Suscripción Activos: ${plans.length}`)
    const monthly = plans.filter(p => p.billingCycle === 'MONTHLY')
    const annual = plans.filter(p => p.billingCycle === 'ANNUAL')
    console.log(`   Mensuales: ${monthly.length}, Anuales: ${annual.length}`)
    
    // PAYMENTS
    const payments = await prisma.subscriptionPayment.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5
    })
    console.log(`\n💳 Total Pagos: ${await prisma.subscriptionPayment.count()}`)
    
    console.log('\n' + '='.repeat(80))
    console.log('\n👥 DETALLE POR TENANT:\n')
    
    // Detalle de todos los tenants
    for (const tenant of tenants) {
      console.log(`\n🏢 ${tenant.businessName}`)
      console.log(`   📧 ${tenant.email}`)
      console.log(`   📊 Estado: ${tenant.accountStatus}`)
      
      const sub = tenant.subscriptions[0]
      if (sub) {
        console.log(`   💎 Plan: ${sub.plan.name} (${sub.billingCycle}) - ${sub.status}`)
      }
      
      const inv = await prisma.tenantInventory.count({ where: { tenantId: tenant.id } })
      const sales = await prisma.sale.count({ where: { tenantId: tenant.id } })
      
      console.log(`   📦 Productos: ${inv}`)
      console.log(`   💰 Ventas: ${sales}`)
      console.log(`   👤 Usuarios: ${tenant.users.length}`)
    }
    
    console.log('\n' + '='.repeat(80))
    console.log('\n✅ Análisis completado\n')
    
  } catch (error) {
    console.error('❌ Error:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

checkDatabase()
