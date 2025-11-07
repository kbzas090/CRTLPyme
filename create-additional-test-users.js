const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

async function createAdditionalTestUsers() {
  const prisma = new PrismaClient();
  const testPassword = 'Test123!';
  const hashedPassword = await bcrypt.hash(testPassword, 10);
  
  try {
    console.log('🔐 CREANDO USUARIOS DE PRUEBA ADICIONALES\n');
    console.log('='.repeat(70));
    
    // Obtener algunos tenants para pruebas
    const testTenants = await prisma.tenant.findMany({
      where: {
        businessName: {
          in: [
            'Minimarket Don Luis',
            'Supermercado Familiar',
            'Tienda La Esquina'
          ]
        }
      }
    });
    
    const createdUsers = [];
    
    for (const tenant of testTenants) {
      console.log(`\n📍 Tenant: ${tenant.businessName}`);
      console.log(`   ID: ${tenant.id}\n`);
      
      const testUsers = [
        {
          email: `admin.test@${tenant.email.split('@')[1]}`,
          firstName: 'Admin',
          lastName: 'Test',
          role: 'ADMIN'
        },
        {
          email: `caja.test@${tenant.email.split('@')[1]}`,
          firstName: 'Caja',
          lastName: 'Test',
          role: 'CAJA'
        }
      ];
      
      for (const userData of testUsers) {
        try {
          const existingUser = await prisma.user.findUnique({
            where: { email: userData.email }
          });
          
          if (existingUser) {
            await prisma.user.update({
              where: { email: userData.email },
              data: { 
                password: hashedPassword,
                isActive: true 
              }
            });
            console.log(`   ✅ ${userData.email} - Contraseña actualizada`);
            createdUsers.push({
              tenant: tenant.businessName,
              ...userData,
              id: existingUser.id,
              status: 'UPDATED'
            });
          } else {
            const newUser = await prisma.user.create({
              data: {
                email: userData.email,
                firstName: userData.firstName,
                lastName: userData.lastName,
                role: userData.role,
                password: hashedPassword,
                isActive: true,
                tenantId: tenant.id
              }
            });
            console.log(`   ✅ ${userData.email} - Usuario creado`);
            createdUsers.push({
              tenant: tenant.businessName,
              ...userData,
              id: newUser.id,
              status: 'CREATED'
            });
          }
        } catch (error) {
          console.error(`   ❌ Error con ${userData.email}:`, error.message);
        }
      }
    }
    
    console.log('\n' + '='.repeat(70));
    console.log('✅ USUARIOS ADICIONALES COMPLETADOS');
    console.log('='.repeat(70));
    
    return createdUsers;
    
  } catch (error) {
    console.error('❌ Error general:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdditionalTestUsers();
