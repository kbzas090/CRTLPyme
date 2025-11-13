import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkTenants() {
  const tenants = await prisma.tenant.findMany({
    where: { isActive: true },
    select: {
      id: true,
      businessName: true,
      rut: true,
      email: true,
      planType: true,
      createdAt: true
    },
    orderBy: { createdAt: 'asc' }
  })

  console.log(`\n✅ Encontrados ${tenants.length} tenants activos:\n`)
  
  tenants.forEach((tenant, index) => {
    console.log(`${index + 1}. ${tenant.businessName}`)
    console.log(`   ID: ${tenant.id}`)
    console.log(`   RUT: ${tenant.rut}`)
    console.log(`   Email: ${tenant.email}`)
    console.log(`   Plan: ${tenant.planType}`)
    console.log(`   Creado: ${tenant.createdAt.toISOString().split('T')[0]}`)
    console.log('')
  })
}

checkTenants()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Error:', error)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
