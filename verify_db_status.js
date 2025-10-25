const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasourceUrl: "postgresql://postgres.bxfetsflhxhigacuqtfe:Pyme_2025@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1"
});

async function main() {
  console.log("================================================================================");
  console.log("VERIFICACIÓN REAL DEL ESTADO DE LA BASE DE DATOS");
  console.log("================================================================================");
  
  try {
    // 1. Verificar Tenants
    console.log("\n1. VERIFICACIÓN DE TENANTS:");
    console.log("--------------------------------------------------------------------------------");
    const tenantCount = await prisma.tenant.count();
    console.log(`✅ Tabla 'tenants' existe`);
    console.log(`📊 Total de Tenants: ${tenantCount}`);
    
    if (tenantCount > 0) {
      const tenants = await prisma.tenant.findMany({
        select: { id: true, businessName: true, rut: true, planType: true, isActive: true }
      });
      console.log("\nTenants existentes:");
      tenants.forEach(t => {
        console.log(`  - ${t.businessName} (${t.rut}) - Plan: ${t.planType} - Activo: ${t.isActive}`);
      });
    }
    
    // 2. Verificar Productos Legacy
    console.log("\n\n2. VERIFICACIÓN DE PRODUCTOS LEGACY:");
    console.log("--------------------------------------------------------------------------------");
    try {
      const legacyProductCount = await prisma.product.count();
      console.log(`✅ Tabla 'products_legacy' existe`);
      console.log(`📦 Total de Productos Legacy: ${legacyProductCount}`);
      
      if (legacyProductCount > 0) {
        const sampleProducts = await prisma.product.findMany({
          take: 5,
          select: { id: true, sku: true, name: true, salePrice: true, stock: true, tenantId: true }
        });
        console.log("\nPrimeros 5 productos legacy:");
        sampleProducts.forEach(p => {
          console.log(`  - ${p.name} (SKU: ${p.sku}) - Precio: ${p.salePrice} - Stock: ${p.stock} - TenantID: ${p.tenantId}`);
        });
        
        // Agrupar por tenant
        const byTenant = await prisma.product.groupBy({
          by: ['tenantId'],
          _count: { id: true }
        });
        console.log("\nDistribución de productos por tenant:");
        byTenant.forEach(t => {
          console.log(`  - Tenant ${t.tenantId}: ${t._count.id} productos`);
        });
      }
    } catch (e) {
      console.log(`❌ Error al acceder a productos legacy: ${e.message}`);
    }
    
    // 3. Verificar Master Products
    console.log("\n\n3. VERIFICACIÓN DE MASTER PRODUCTS:");
    console.log("--------------------------------------------------------------------------------");
    try {
      const masterProductCount = await prisma.masterProduct.count();
      console.log(`✅ Tabla 'master_products' existe`);
      console.log(`📦 Total de Master Products: ${masterProductCount}`);
      
      if (masterProductCount > 0) {
        const sampleMaster = await prisma.masterProduct.findMany({
          take: 5,
          select: { id: true, sku: true, name: true, suggestedPrice: true, category: true }
        });
        console.log("\nPrimeros 5 master products:");
        sampleMaster.forEach(p => {
          console.log(`  - ${p.name} (SKU: ${p.sku}) - Precio Sug: ${p.suggestedPrice} - Categoría: ${p.category}`);
        });
      }
    } catch (e) {
      console.log(`❌ Error al acceder a master products: ${e.message}`);
    }
    
    // 4. Verificar Tenant Inventory
    console.log("\n\n4. VERIFICACIÓN DE TENANT INVENTORY:");
    console.log("--------------------------------------------------------------------------------");
    try {
      const inventoryCount = await prisma.tenantInventory.count();
      console.log(`✅ Tabla 'tenant_inventory' existe`);
      console.log(`📦 Total de Registros en Tenant Inventory: ${inventoryCount}`);
      
      if (inventoryCount > 0) {
        const sampleInventory = await prisma.tenantInventory.findMany({
          take: 5,
          include: { masterProduct: true }
        });
        console.log("\nPrimeros 5 items en tenant inventory:");
        sampleInventory.forEach(p => {
          console.log(`  - ${p.masterProduct.name} (SKU: ${p.masterProduct.sku}) - Precio: ${p.salePrice} - Stock: ${p.stock} - TenantID: ${p.tenantId}`);
        });
      }
    } catch (e) {
      console.log(`❌ Error al acceder a tenant inventory: ${e.message}`);
    }
    
    // 5. Verificar Usuarios
    console.log("\n\n5. VERIFICACIÓN DE USUARIOS:");
    console.log("--------------------------------------------------------------------------------");
    try {
      const userCount = await prisma.user.count();
      console.log(`✅ Tabla 'users' existe`);
      console.log(`👥 Total de Usuarios: ${userCount}`);
      
      if (userCount > 0) {
        const users = await prisma.user.findMany({
          select: { id: true, email: true, firstName: true, lastName: true, role: true, tenantId: true }
        });
        console.log("\nUsuarios existentes:");
        users.forEach(u => {
          console.log(`  - ${u.firstName} ${u.lastName} (${u.email}) - Rol: ${u.role} - TenantID: ${u.tenantId}`);
        });
      }
    } catch (e) {
      console.log(`❌ Error al acceder a usuarios: ${e.message}`);
    }
    
    // 6. Verificar Ventas
    console.log("\n\n6. VERIFICACIÓN DE VENTAS:");
    console.log("--------------------------------------------------------------------------------");
    try {
      const salesCount = await prisma.sale.count();
      console.log(`✅ Tabla 'sales' existe`);
      console.log(`💰 Total de Ventas: ${salesCount}`);
    } catch (e) {
      console.log(`❌ Error al acceder a ventas: ${e.message}`);
    }
    
    console.log("\n================================================================================");
    console.log("VERIFICACIÓN COMPLETADA");
    console.log("================================================================================");
    
  } catch (error) {
    console.error("\n❌ ERROR GENERAL:", error.message);
    console.error("\nStack trace:", error.stack);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch(console.error);
