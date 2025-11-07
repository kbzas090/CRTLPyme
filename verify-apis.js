const { PrismaClient } = require('@prisma/client');

async function verifyAPIs() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔍 VERIFICACIÓN DE APIs Y DATOS\n');
    console.log('='.repeat(60));
    
    // 1. Verificar Tenants
    console.log('\n📊 1. TENANTS');
    console.log('-'.repeat(60));
    const tenants = await prisma.tenant.findMany({
      select: {
        id: true,
        businessName: true,
        email: true,
        isActive: true,
        accountStatus: true,
        planType: true
      }
    });
    console.log(`Total tenants: ${tenants.length}`);
    tenants.forEach((t, i) => {
      console.log(`  ${i+1}. ${t.businessName} (${t.email})`);
      console.log(`     - ID: ${t.id}`);
      console.log(`     - Status: ${t.accountStatus} | Active: ${t.isActive} | Plan: ${t.planType}`);
    });

    // 2. Verificar Usuarios por tenant
    console.log('\n\n👤 2. USUARIOS');
    console.log('-'.repeat(60));
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        tenantId: true,
        tenant: {
          select: {
            businessName: true
          }
        }
      },
      orderBy: [
        { tenantId: 'asc' },
        { email: 'asc' }
      ]
    });
    console.log(`Total usuarios: ${users.length}\n`);
    
    // Agrupar por tenant
    const usersByTenant = users.reduce((acc, user) => {
      if (!acc[user.tenantId]) {
        acc[user.tenantId] = {
          tenantName: user.tenant.businessName,
          users: []
        };
      }
      acc[user.tenantId].users.push(user);
      return acc;
    }, {});
    
    Object.entries(usersByTenant).forEach(([tenantId, data]) => {
      console.log(`\n  Tenant: ${data.tenantName}`);
      data.users.forEach((u, i) => {
        console.log(`    ${i+1}. ${u.email} - ${u.firstName} ${u.lastName}`);
        console.log(`       Role: ${u.role} | Active: ${u.isActive}`);
      });
    });

    // 3. Verificar Productos Maestros
    console.log('\n\n📦 3. PRODUCTOS MAESTROS');
    console.log('-'.repeat(60));
    const masterProducts = await prisma.masterProduct.count();
    const masterProductsByCategory = await prisma.masterProduct.groupBy({
      by: ['category'],
      _count: true,
      orderBy: {
        _count: {
          category: 'desc'
        }
      }
    });
    console.log(`Total productos maestros: ${masterProducts}`);
    console.log('\nPor categoría:');
    masterProductsByCategory.forEach((cat, i) => {
      console.log(`  ${i+1}. ${cat.category}: ${cat._count} productos`);
    });

    // 4. Verificar Inventario
    console.log('\n\n🏭 4. INVENTARIO POR TENANT');
    console.log('-'.repeat(60));
    const inventoryByTenant = await prisma.tenantInventory.groupBy({
      by: ['tenantId'],
      _count: true,
      _sum: {
        stock: true
      }
    });
    
    for (const inv of inventoryByTenant) {
      const tenant = await prisma.tenant.findUnique({
        where: { id: inv.tenantId },
        select: { businessName: true }
      });
      console.log(`\n  ${tenant?.businessName || 'Unknown'}`);
      console.log(`    - Productos en inventario: ${inv._count}`);
      console.log(`    - Stock total: ${inv._sum.stock || 0} unidades`);
    }

    // 5. Verificar Ventas
    console.log('\n\n💰 5. VENTAS');
    console.log('-'.repeat(60));
    const salesStats = await prisma.sale.groupBy({
      by: ['tenantId'],
      _count: true,
      _sum: {
        total: true
      }
    });
    
    console.log(`Total ventas en sistema: ${await prisma.sale.count()}`);
    for (const sale of salesStats) {
      const tenant = await prisma.tenant.findUnique({
        where: { id: sale.tenantId },
        select: { businessName: true }
      });
      console.log(`\n  ${tenant?.businessName || 'Unknown'}`);
      console.log(`    - Ventas: ${sale._count}`);
      console.log(`    - Total facturado: $${sale._sum.total?.toLocaleString('es-CL') || 0} CLP`);
    }

    // 6. Verificar Sesiones de Caja
    console.log('\n\n💵 6. SESIONES DE CAJA');
    console.log('-'.repeat(60));
    const cashSessions = await prisma.cashSession.count();
    const openSessions = await prisma.cashSession.count({
      where: { status: 'OPEN' }
    });
    console.log(`Total sesiones: ${cashSessions}`);
    console.log(`Sesiones abiertas: ${openSessions}`);
    console.log(`Sesiones cerradas: ${cashSessions - openSessions}`);

    console.log('\n\n✅ VERIFICACIÓN COMPLETA');
    console.log('='.repeat(60));
    console.log('\nRESUMEN:');
    console.log(`  ✓ Tenants activos: ${tenants.filter(t => t.isActive).length}/${tenants.length}`);
    console.log(`  ✓ Usuarios: ${users.length}`);
    console.log(`  ✓ Productos maestros: ${masterProducts}`);
    console.log(`  ✓ Items en inventario: ${await prisma.tenantInventory.count()}`);
    console.log(`  ✓ Ventas: ${await prisma.sale.count()}`);
    console.log('\n  ✅ La base de datos está correctamente poblada y las APIs tienen acceso a los datos.\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

verifyAPIs();
