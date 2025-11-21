import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function verificarProductos() {
  console.log('='.repeat(80));
  console.log('VERIFICACIÓN DE PRODUCTOS MAESTROS Y INVENTARIO');
  console.log('='.repeat(80));
  console.log('');

  try {
    // 1. Verificar MasterProduct
    console.log('1. TABLA MasterProduct:');
    console.log('-'.repeat(80));
    
    const totalMasterProducts = await prisma.masterProduct.count();
    console.log(`✓ Total de Productos Maestros: ${totalMasterProducts}`);
    console.log('');

    if (totalMasterProducts > 0) {
      console.log('Primeros 10 productos maestros:');
      const masterProducts = await prisma.masterProduct.findMany({
        take: 10,
        select: {
          id: true,
          name: true,
          sku: true,
          category: true,
          price: true,
          isActive: true
        }
      });
      console.table(masterProducts);
    }
    console.log('');

    // 2. Verificar TenantInventory
    console.log('2. TABLA TenantInventory:');
    console.log('-'.repeat(80));
    
    const totalTenantInventory = await prisma.tenantInventory.count();
    console.log(`✓ Total de Items en Inventario de Tenants: ${totalTenantInventory}`);
    console.log('');

    if (totalTenantInventory > 0) {
      console.log('Primeros 20 items de inventario:');
      const inventoryItems = await prisma.tenantInventory.findMany({
        take: 20,
        select: {
          id: true,
          tenantId: true,
          masterProductId: true,
          stock: true,
          minStock: true
        }
      });
      console.table(inventoryItems);
    }
    console.log('');

    // 3. Verificar tabla Product (si existe)
    console.log('3. TABLA Product (si existe):');
    console.log('-'.repeat(80));
    try {
      const totalProducts = await prisma.product.count();
      console.log(`✓ Total de Productos: ${totalProducts}`);
      console.log('');
    } catch (error: any) {
      console.log('⚠ La tabla Product no existe o no está accesible');
      console.log('');
    }

    // 4. Buscar tenant Minimarket Don Luis
    console.log('4. PRODUCTOS DEL TENANT "Minimarket Don Luis":');
    console.log('-'.repeat(80));
    
    const minimarketTenant = await prisma.tenant.findFirst({
      where: {
        OR: [
          { name: { contains: 'Minimarket', mode: 'insensitive' } },
          { name: { contains: 'Don Luis', mode: 'insensitive' } }
        ]
      }
    });

    if (minimarketTenant) {
      console.log(`✓ Tenant encontrado: ${minimarketTenant.name} (ID: ${minimarketTenant.id})`);
      console.log('');

      const minimarketInventory = await prisma.tenantInventory.findMany({
        where: { tenantId: minimarketTenant.id },
        take: 10,
        include: {
          masterProduct: {
            select: {
              name: true,
              sku: true,
              category: true,
              price: true
            }
          }
        }
      });

      console.log(`✓ Items en inventario de ${minimarketTenant.name}: ${minimarketInventory.length}`);
      if (minimarketInventory.length > 0) {
        console.log('');
        console.log('Detalles del inventario:');
        minimarketInventory.forEach((item, index) => {
          console.log(`${index + 1}. ${item.masterProduct.name} (SKU: ${item.masterProduct.sku})`);
          console.log(`   - Stock: ${item.stock}, Precio: $${item.masterProduct.price}`);
        });
      }
    } else {
      console.log('⚠ No se encontró el tenant Minimarket Don Luis');
    }
    console.log('');

    // 5. Distribución de inventario por tenant
    console.log('5. DISTRIBUCIÓN DE INVENTARIO POR TENANT:');
    console.log('-'.repeat(80));
    
    const tenants = await prisma.tenant.findMany({
      select: {
        id: true,
        name: true,
        _count: {
          select: {
            inventory: true
          }
        }
      }
    });

    console.log('Tenants y sus productos en inventario:');
    tenants.forEach(tenant => {
      console.log(`- ${tenant.name}: ${tenant._count.inventory} productos`);
    });
    console.log('');

    // 6. Categorías de productos maestros
    console.log('6. CATEGORÍAS DE PRODUCTOS MAESTROS:');
    console.log('-'.repeat(80));
    
    const categories = await prisma.masterProduct.groupBy({
      by: ['category'],
      _count: {
        category: true
      }
    });

    console.log('Distribución por categoría:');
    categories.forEach(cat => {
      console.log(`- ${cat.category}: ${cat._count.category} productos`);
    });
    console.log('');

    console.log('='.repeat(80));
    console.log('VERIFICACIÓN COMPLETADA');
    console.log('='.repeat(80));

  } catch (error) {
    console.error('Error durante la verificación:', error);
  } finally {
    await prisma.$disconnect();
  }
}

verificarProductos();
