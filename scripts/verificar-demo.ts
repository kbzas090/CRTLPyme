import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🔍 VERIFICANDO ESTADO DE LA BASE DE DATOS PARA DEMOSTRACIÓN\n');
  console.log('='.repeat(70));

  try {
    // 1. Verificar conexión
    console.log('\n1️⃣ Verificando conexión a la base de datos...');
    await prisma.$connect();
    console.log('✅ Conexión exitosa a Cloud SQL PostgreSQL');

    // 2. Contar registros en tablas principales
    console.log('\n2️⃣ Estado de las tablas principales:');
    const tenantCount = await prisma.tenant.count();
    const userCount = await prisma.user.count();
    const productCount = await prisma.product.count();
    const saleCount = await prisma.sale.count();

    console.log(`   📊 Tenants: ${tenantCount}`);
    console.log(`   👤 Usuarios: ${userCount}`);
    console.log(`   📦 Productos: ${productCount}`);
    console.log(`   💰 Ventas: ${saleCount}`);

    // 3. Listar todos los usuarios
    console.log('\n3️⃣ Usuarios existentes:');
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        tenantId: true,
      },
    });

    if (users.length === 0) {
      console.log('   ⚠️  No hay usuarios en la base de datos');
    } else {
      users.forEach((user, idx) => {
        console.log(`\n   Usuario ${idx + 1}:`);
        console.log(`   - Email: ${user.email}`);
        console.log(`   - Nombre: ${user.firstName} ${user.lastName}`);
        console.log(`   - Rol: ${user.role}`);
        console.log(`   - Activo: ${user.isActive ? 'Sí' : 'No'}`);
        console.log(`   - TenantID: ${user.tenantId}`);
      });
    }

    // 4. Verificar usuario "inventario"
    console.log('\n4️⃣ Verificando usuario "inventario":');
    const inventarioUser = await prisma.user.findFirst({
      where: {
        email: 'inventario@crtlpyme.cl',
      },
    });

    if (inventarioUser) {
      console.log('   ✅ Usuario "inventario" encontrado');
      console.log(`   - Email: ${inventarioUser.email}`);
      console.log(`   - Nombre: ${inventarioUser.firstName} ${inventarioUser.lastName}`);
      console.log(`   - Rol: ${inventarioUser.role}`);
      console.log(`   - Activo: ${inventarioUser.isActive}`);
    } else {
      console.log('   ⚠️  Usuario "inventario" NO encontrado');
      console.log('   ℹ️  Se debe crear este usuario para la demostración');
    }

    // 5. Listar productos
    console.log('\n5️⃣ Productos en inventario:');
    const products = await prisma.product.findMany({
      take: 10,
      select: {
        id: true,
        sku: true,
        name: true,
        category: true,
        salePrice: true,
        stock: true,
        isActive: true,
      },
    });

    if (products.length === 0) {
      console.log('   ⚠️  No hay productos en el inventario');
    } else {
      console.log(`   📦 Total de productos (primeros 10): ${products.length}`);
      products.forEach((product, idx) => {
        console.log(`\n   Producto ${idx + 1}:`);
        console.log(`   - SKU: ${product.sku}`);
        console.log(`   - Nombre: ${product.name}`);
        console.log(`   - Categoría: ${product.category}`);
        console.log(`   - Precio: $${product.salePrice}`);
        console.log(`   - Stock: ${product.stock} unidades`);
        console.log(`   - Activo: ${product.isActive ? 'Sí' : 'No'}`);
      });
    }

    // 6. Listar tenants
    console.log('\n6️⃣ Tenants existentes:');
    const tenants = await prisma.tenant.findMany({
      select: {
        id: true,
        businessName: true,
        rut: true,
        email: true,
        isActive: true,
        planType: true,
      },
    });

    if (tenants.length === 0) {
      console.log('   ⚠️  No hay tenants en la base de datos');
    } else {
      tenants.forEach((tenant, idx) => {
        console.log(`\n   Tenant ${idx + 1}:`);
        console.log(`   - ID: ${tenant.id}`);
        console.log(`   - Empresa: ${tenant.businessName}`);
        console.log(`   - RUT: ${tenant.rut}`);
        console.log(`   - Email: ${tenant.email}`);
        console.log(`   - Plan: ${tenant.planType}`);
        console.log(`   - Activo: ${tenant.isActive ? 'Sí' : 'No'}`);
      });
    }

    console.log('\n' + '='.repeat(70));
    console.log('✅ Verificación completada exitosamente');

  } catch (error) {
    console.error('\n❌ Error durante la verificación:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch((error) => {
    console.error('Error fatal:', error);
    process.exit(1);
  });
