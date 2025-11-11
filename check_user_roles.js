const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function checkUsers() {
  try {
    console.log('👤 Verificando usuarios de prueba...\n');
    
    // Usuarios regulares
    const users = await prisma.user.findMany({
      where: {
        email: {
          in: ['admin@crtlpyme.cl', 'usuario@crtlpyme.cl']
        }
      },
      select: {
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        tenant: {
          select: {
            businessName: true,
            rut: true
          }
        }
      }
    });
    
    console.log('📋 Usuarios regulares:');
    users.forEach((user, i) => {
      console.log(`   ${i+1}. ${user.firstName} ${user.lastName} (${user.email})`);
      console.log(`      Rol: ${user.role} | Tenant: ${user.tenant.businessName}`);
      console.log(`      Estado: ${user.isActive ? '✓ Activo' : '✗ Inactivo'}`);
      console.log(`      ⚠️  ${user.role === 'PROVEEDOR' ? 'TIENE acceso a Admin SaaS' : 'NO tiene acceso a Admin SaaS (necesita rol PROVEEDOR)'}`);
      console.log('');
    });
    
    // Verificar si hay admins con rol PROVEEDOR
    const proveedorCount = await prisma.user.count({
      where: { role: 'PROVEEDOR' }
    });
    
    console.log(`\n📊 Total usuarios con rol PROVEEDOR: ${proveedorCount}`);
    
    if (proveedorCount > 0) {
      const proveedores = await prisma.user.findMany({
        where: { role: 'PROVEEDOR' },
        select: {
          email: true,
          firstName: true,
          lastName: true,
          isActive: true
        }
      });
      
      console.log('\n✅ Usuarios PROVEEDOR (con acceso a Admin SaaS):');
      proveedores.forEach((p, i) => {
        console.log(`   ${i+1}. ${p.firstName} ${p.lastName} (${p.email})`);
      });
    } else {
      console.log('\n⚠️  NO hay usuarios con rol PROVEEDOR');
      console.log('   Se necesita crear un usuario PROVEEDOR para acceder a /admin-saas');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkUsers();
