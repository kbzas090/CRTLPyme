const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

async function createTestUsers() {
  const prisma = new PrismaClient();
  const testPassword = 'Test123!';
  const hashedPassword = await bcrypt.hash(testPassword, 10);
  
  try {
    console.log('🔐 CREANDO USUARIOS DE PRUEBA\n');
    console.log('='.repeat(70));
    console.log(`Contraseña para todos: ${testPassword}`);
    console.log('='.repeat(70));
    
    // Obtener tenant principal
    const mainTenant = await prisma.tenant.findFirst({
      where: {
        email: 'plataforma@crtlpyme.com'
      }
    });
    
    if (!mainTenant) {
      console.error('❌ No se encontró el tenant principal');
      return;
    }
    
    console.log(`\n📍 Usando tenant: ${mainTenant.businessName} (${mainTenant.id})\n`);
    
    // Definir usuarios de prueba
    const testUsers = [
      {
        email: 'admin.test@crtlpyme.cl',
        firstName: 'Admin',
        lastName: 'Test',
        role: 'ADMIN',
        description: 'Usuario administrador de prueba'
      },
      {
        email: 'caja.test@crtlpyme.cl',
        firstName: 'Caja',
        lastName: 'Test',
        role: 'CAJA',
        description: 'Usuario cajero de prueba'
      },
      {
        email: 'inventario.test@crtlpyme.cl',
        firstName: 'Inventario',
        lastName: 'Test',
        role: 'INVENTARIO',
        description: 'Usuario inventario de prueba'
      },
      {
        email: 'proveedor.test@crtlpyme.cl',
        firstName: 'Proveedor',
        lastName: 'Test',
        role: 'PROVEEDOR',
        description: 'Usuario proveedor de prueba'
      },
      {
        email: 'soporte.test@crtlpyme.cl',
        firstName: 'Soporte',
        lastName: 'Test',
        role: 'SOPORTE',
        description: 'Usuario soporte de prueba'
      }
    ];
    
    console.log('Creando usuarios de prueba...\n');
    
    const createdUsers = [];
    
    for (const userData of testUsers) {
      try {
        // Verificar si el usuario ya existe
        const existingUser = await prisma.user.findUnique({
          where: { email: userData.email }
        });
        
        if (existingUser) {
          console.log(`⚠️  Usuario ya existe: ${userData.email}`);
          // Actualizar la contraseña
          await prisma.user.update({
            where: { email: userData.email },
            data: { 
              password: hashedPassword,
              isActive: true 
            }
          });
          console.log(`   ✅ Contraseña actualizada a: ${testPassword}\n`);
          createdUsers.push({
            ...userData,
            id: existingUser.id,
            status: 'UPDATED'
          });
        } else {
          // Crear nuevo usuario
          const newUser = await prisma.user.create({
            data: {
              email: userData.email,
              firstName: userData.firstName,
              lastName: userData.lastName,
              role: userData.role,
              password: hashedPassword,
              isActive: true,
              tenantId: mainTenant.id
            }
          });
          
          console.log(`✅ Usuario creado: ${userData.email}`);
          console.log(`   Nombre: ${userData.firstName} ${userData.lastName}`);
          console.log(`   Role: ${userData.role}`);
          console.log(`   ID: ${newUser.id}\n`);
          
          createdUsers.push({
            ...userData,
            id: newUser.id,
            status: 'CREATED'
          });
        }
      } catch (error) {
        console.error(`❌ Error al crear ${userData.email}:`, error.message);
      }
    }
    
    // Mostrar resumen
    console.log('\n');
    console.log('='.repeat(70));
    console.log('📋 RESUMEN DE USUARIOS DE PRUEBA');
    console.log('='.repeat(70));
    console.log(`\nTenant: ${mainTenant.businessName}`);
    console.log(`Tenant ID: ${mainTenant.id}`);
    console.log(`\nContraseña para todos: ${testPassword}`);
    console.log('\nUsuarios:\n');
    
    createdUsers.forEach((user, i) => {
      console.log(`${i + 1}. ${user.email}`);
      console.log(`   - Nombre: ${user.firstName} ${user.lastName}`);
      console.log(`   - Role: ${user.role}`);
      console.log(`   - Estado: ${user.status}`);
      console.log(`   - ID: ${user.id}`);
      console.log('');
    });
    
    console.log('='.repeat(70));
    console.log('✅ PROCESO COMPLETADO\n');
    
    return createdUsers;
    
  } catch (error) {
    console.error('❌ Error general:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestUsers();
