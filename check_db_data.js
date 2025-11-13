const { PrismaClient } = require('@prisma/client')

async function checkDatabase() {
  const prisma = new PrismaClient()

  try {
    console.log('📊 VERIFICANDO POBLACIÓN DE DATOS EN LA BASE DE DATOS...\n')
    
    const counts = {}
    
    // Check SubscriptionPlan
    counts.SubscriptionPlan = await prisma.subscriptionPlan.count()
    
    // Check Subscription
    counts.Subscription = await prisma.subscription.count()
    
    // Check Tenant
    counts.Tenant = await prisma.tenant.count()
    
    // Check User
    counts.User = await prisma.user.count()
    
    // Check MasterProduct
    counts.MasterProduct = await prisma.masterProduct.count()
    
    // Check Product (tenant products)
    counts.Product = await prisma.product.count()
    
    // Check TenantInventory
    counts.TenantInventory = await prisma.tenantInventory.count()
    
    // Check Sale
    counts.Sale = await prisma.sale.count()
    
    // Check SaleItem
    counts.SaleItem = await prisma.saleItem.count()
    
    // Check FixedExpense
    counts.FixedExpense = await prisma.fixedExpense.count()
    
    // Check CashSession
    counts.CashSession = await prisma.cashSession.count()
    
    // Check SubscriptionPayment
    counts.SubscriptionPayment = await prisma.subscriptionPayment.count()
    
    // Print results
    Object.keys(counts).forEach(table => {
      console.log(`${table}: ${counts[table]} registros`)
    })
    
    console.log('\n' + '='.repeat(50))
    
    // Summary
    const total = Object.values(counts).reduce((a, b) => a + b, 0)
    
    console.log(`\n📈 TOTAL REGISTROS: ${total}`)
    
  } catch (error) {
    console.error('Error al verificar la base de datos:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkDatabase()
