import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const planes = await prisma.subscriptionPlan.count()
  const productos = await prisma.masterProduct.count()
  const negocios = await prisma.tenant.count()
  const usuarios = await prisma.user.count()
  const inventario = await prisma.tenantInventory.count()
  const suscripciones = await prisma.subscription.count()
  const ventas = await prisma.sale.count()
  
  console.log('\n📊 ESTADO ACTUAL DE LA BASE DE DATOS:\n')
  console.log('=' .repeat(50))
  console.log(`   📦 Planes de suscripción: ${planes}`)
  console.log(`   🛒 Productos en catálogo: ${productos}`)
  console.log(`   🏢 Negocios (tenants): ${negocios}`)
  console.log(`   👥 Usuarios totales: ${usuarios}`)
  console.log(`   📦 Productos en inventario: ${inventario}`)
  console.log(`   💳 Suscripciones: ${suscripciones}`)
  console.log(`   💰 Ventas: ${ventas}`)
  console.log('=' .repeat(50))
  
  // Verificar usuario PROVEEDOR
  const proveedor = await prisma.user.findUnique({
    where: { email: 'CRTLPyme_Admin@gmail.com' }
  })
  
  console.log('\n🔑 CUENTA PROVEEDOR:')
  if (proveedor) {
    console.log('   ✅ Email: CRTLPyme_Admin@gmail.com')
    console.log('   ✅ Rol:', proveedor.role)
    console.log('   ✅ Activo:', proveedor.isActive)
  } else {
    console.log('   ❌ No encontrada')
  }
  
  // Verificar planes mensuales y anuales
  const planesMonthly = await prisma.subscriptionPlan.count({
    where: { billingCycle: 'MONTHLY' }
  })
  const planesAnnual = await prisma.subscriptionPlan.count({
    where: { billingCycle: 'ANNUAL' }
  })
  
  console.log('\n📅 PLANES POR CICLO:')
  console.log(`   📆 Mensuales: ${planesMonthly}`)
  console.log(`   📆 Anuales: ${planesAnnual}`)
  
  // Verificar algunos usuarios con el nuevo formato
  const usuariosFormato = await prisma.user.findMany({
    where: {
      email: {
        contains: '_Admin@gmail.com'
      }
    },
    take: 5,
    select: {
      email: true,
      role: true
    }
  })
  
  console.log('\n👤 MUESTRA DE USUARIOS (nuevo formato):')
  usuariosFormato.forEach(u => {
    console.log(`   • ${u.email} - ${u.role}`)
  })
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
