const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function importProducts() {
  console.log('\n🚀 Importando productos al catálogo maestro (MasterProduct)...\n');
  
  try {
    // Ruta del archivo de productos
    const productosPath = path.join(__dirname, 'productos_chilenos.json');
    
    if (!fs.existsSync(productosPath)) {
      console.error(`❌ No se encontró el archivo ${productosPath}`);
      return;
    }
    
    // Leer archivo
    const data = JSON.parse(fs.readFileSync(productosPath, 'utf-8'));
    const productosChilenos = data.productos_chilenos || [];
    
    console.log(`📦 Archivo cargado con ${productosChilenos.length} productos`);
    console.log('⏳ Importando productos al catálogo maestro...\n');
    
    let imported = 0;
    let skipped = 0;
    
    for (const producto of productosChilenos) {
      // Crear SKU único basado en el EAN13 o generar uno nuevo
      const sku = producto.ean13 || `SKU-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      try {
        // Usar upsert para evitar duplicados
        await prisma.masterProduct.upsert({
          where: { sku: sku },
          update: {
            name: producto.name,
            barcode: producto.ean13 || null,
            category: producto.category || 'General',
            brand: producto.brand || 'Sin marca',
            suggestedPrice: producto.price_clp || 0,
            unit: 'unidad',
            isActive: true
          },
          create: {
            sku: sku,
            barcode: producto.ean13 || null,
            name: producto.name,
            category: producto.category || 'General',
            brand: producto.brand || 'Sin marca',
            suggestedPrice: producto.price_clp || 0,
            unit: 'unidad',
            isActive: true
          }
        });
        
        imported++;
        
        // Mostrar progreso cada 10 productos
        if (imported % 10 === 0) {
          console.log(`   ✓ ${imported} productos importados...`);
        }
        
      } catch (error) {
        console.error(`   ❌ Error importando ${producto.name}:`, error.message);
        skipped++;
      }
    }
    
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`✅ Importación completada:`);
    console.log(`   - Productos importados: ${imported}`);
    console.log(`   - Productos con errores: ${skipped}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
  } catch (error) {
    console.error('❌ Error durante la importación:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

importProducts()
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
