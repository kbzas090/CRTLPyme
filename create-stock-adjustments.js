const { PrismaClient, AdjustmentType } = require('@prisma/client');
const prisma = new PrismaClient();

function fechaAleatoria(diasAtras) {
  const now = new Date();
  const randomDays = Math.floor(Math.random() * diasAtras);
  const randomHours = Math.floor(Math.random() * 24);
  const randomMinutes = Math.floor(Math.random() * 60);
  
  const date = new Date(now);
  date.setDate(date.getDate() - randomDays);
  date.setHours(randomHours, randomMinutes, 0, 0);
  
  return date;
}

async function crearMovimientosInventario() {
  console.log('📊 Creando movimientos de inventario...\n');
  
  const tenants = await prisma.tenant.findMany();
  const movimientos = [];
  
  for (const tenant of tenants) {
    // Obtener usuarios del tenant
    const usuariosTenant = await prisma.user.findMany({
      where: { tenantId: tenant.id }
    });
    
    if (usuariosTenant.length === 0) continue;
    
    // Obtener inventario del tenant
    const inventario = await prisma.tenantInventory.findMany({
      where: { tenantId: tenant.id, isActive: true }
    });
    
    if (inventario.length === 0) continue;
    
    // Crear 5-15 movimientos de inventario por tenant
    const numMovimientos = Math.floor(Math.random() * 10) + 5;
    
    for (let i = 0; i < numMovimientos; i++) {
      const producto = inventario[Math.floor(Math.random() * inventario.length)];
      const usuario = usuariosTenant[Math.floor(Math.random() * usuariosTenant.length)];
      const fechaMovimiento = fechaAleatoria(90);
      
      // Tipo de movimiento
      const tipos = [
        { type: AdjustmentType.PURCHASE, quantity: Math.floor(Math.random() * 50) + 10, reason: 'Compra a proveedor' },
        { type: AdjustmentType.LOSS, quantity: -(Math.floor(Math.random() * 5) + 1), reason: 'Producto vencido' },
        { type: AdjustmentType.CORRECTION, quantity: Math.floor(Math.random() * 10) - 5, reason: 'Corrección de inventario' },
        { type: AdjustmentType.RETURN, quantity: Math.floor(Math.random() * 5) + 1, reason: 'Devolución de cliente' }
      ];
      
      const movimiento = tipos[Math.floor(Math.random() * tipos.length)];
      
      const adjustment = await prisma.stockAdjustment.create({
        data: {
          tenantInventoryId: producto.id,
          quantity: movimiento.quantity,
          type: movimiento.type,
          reason: movimiento.reason,
          userId: usuario.id,
          tenantId: tenant.id,
          createdAt: fechaMovimiento
        }
      });
      
      movimientos.push(adjustment);
      
      // Actualizar stock
      await prisma.tenantInventory.update({
        where: { id: producto.id },
        data: { stock: { increment: movimiento.quantity } }
      });
    }
    
    console.log(`   ✓ ${tenant.businessName}: ${numMovimientos} movimientos`);
  }
  
  console.log(`\n✅ ${movimientos.length} movimientos de inventario creados\n`);
  return movimientos;
}

async function main() {
  try {
    await crearMovimientosInventario();
  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main();
