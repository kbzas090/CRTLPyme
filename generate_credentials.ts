import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Obtener todos los usuarios ordenados por negocio
  const usuarios = await prisma.user.findMany({
    include: {
      tenant: {
        select: {
          businessName: true,
          rut: true
        }
      }
    },
    orderBy: [
      { tenant: { businessName: 'asc' } },
      { role: 'desc' }
    ]
  })
  
  console.log('\n' + '='.repeat(100))
  console.log('📋 TABLA DE CREDENCIALES - CRTLPyme')
  console.log('='.repeat(100))
  console.log('\n🔑 CUENTA PROVEEDOR (Super Admin):')
  console.log('-'.repeat(100))
  console.log('Email                              | Contraseña   | Rol        | Negocio')
  console.log('-'.repeat(100))
  
  const proveedor = usuarios.find(u => u.role === 'PROVEEDOR')
  if (proveedor) {
    const email = proveedor.email.padEnd(34)
    const pass = 'Admin2025!'.padEnd(12)
    const role = proveedor.role.padEnd(10)
    const negocio = proveedor.tenant?.businessName || 'CRTLPyme - Plataforma'
    console.log(`${email} | ${pass} | ${role} | ${negocio}`)
  }
  
  console.log('\n\n👥 USUARIOS DE NEGOCIOS:')
  console.log('-'.repeat(100))
  console.log('Email                              | Contraseña   | Rol        | Negocio')
  console.log('-'.repeat(100))
  
  let currentTenant = ''
  usuarios
    .filter(u => u.role !== 'PROVEEDOR')
    .forEach(u => {
      const tenantName = u.tenant?.businessName || 'Sin negocio'
      if (currentTenant !== tenantName) {
        if (currentTenant !== '') console.log('-'.repeat(100))
        currentTenant = tenantName
      }
      
      const email = u.email.padEnd(34)
      const pass = 'Demo2025!'.padEnd(12)
      const role = u.role.padEnd(10)
      const negocio = tenantName
      console.log(`${email} | ${pass} | ${role} | ${negocio}`)
    })
  
  console.log('='.repeat(100))
  console.log('\n📊 RESUMEN:')
  console.log(`   • Total de usuarios: ${usuarios.length}`)
  console.log(`   • Cuentas PROVEEDOR: ${usuarios.filter(u => u.role === 'PROVEEDOR').length}`)
  console.log(`   • Cuentas de negocios: ${usuarios.filter(u => u.role !== 'PROVEEDOR').length}`)
  console.log(`   • Formato de correos: NombreNegocio_Perfil@gmail.com`)
  console.log('='.repeat(100) + '\n')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
