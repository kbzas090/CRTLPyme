/**
 * Script de seed para productos maestros
 * Crea 30 productos en el catálogo compartido
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Productos chilenos típicos para negocios de barrio
const masterProducts = [
  // Bebidas
  { sku: 'BEB-001', barcode: '7804688000019', name: 'Coca Cola 1.5L', category: 'Bebidas', brand: 'Coca Cola', suggestedPrice: 1500, unit: 'unidad' },
  { sku: 'BEB-002', barcode: '7804688000026', name: 'Coca Cola 2L', category: 'Bebidas', brand: 'Coca Cola', suggestedPrice: 1990, unit: 'unidad' },
  { sku: 'BEB-003', barcode: '7804320000013', name: 'Sprite 1.5L', category: 'Bebidas', brand: 'Sprite', suggestedPrice: 1450, unit: 'unidad' },
  { sku: 'BEB-004', barcode: '7804320000020', name: 'Fanta 1.5L', category: 'Bebidas', brand: 'Fanta', suggestedPrice: 1450, unit: 'unidad' },
  { sku: 'BEB-005', barcode: '7801620000017', name: 'Agua Mineral Cachantún 1.6L', category: 'Bebidas', brand: 'Cachantún', suggestedPrice: 900, unit: 'unidad' },
  { sku: 'BEB-006', barcode: '7801620000024', name: 'Agua Mineral sin Gas 500ml', category: 'Bebidas', brand: 'Cachantún', suggestedPrice: 600, unit: 'unidad' },
  { sku: 'BEB-007', barcode: '7804650000014', name: 'Cerveza Cristal 350ml', category: 'Bebidas', brand: 'Cristal', suggestedPrice: 850, unit: 'unidad' },
  { sku: 'BEB-008', barcode: '7804650000021', name: 'Cerveza Escudo 350ml', category: 'Bebidas', brand: 'Escudo', suggestedPrice: 850, unit: 'unidad' },
  
  // Lácteos
  { sku: 'LAC-001', barcode: '7802420000011', name: 'Leche Entera 1L', category: 'Lácteos', brand: 'Colun', suggestedPrice: 950, unit: 'unidad' },
  { sku: 'LAC-002', barcode: '7802420000028', name: 'Leche Descremada 1L', category: 'Lácteos', brand: 'Colun', suggestedPrice: 980, unit: 'unidad' },
  { sku: 'LAC-003', barcode: '7802420000035', name: 'Yogurt Natural 1L', category: 'Lácteos', brand: 'Colun', suggestedPrice: 1200, unit: 'unidad' },
  { sku: 'LAC-004', barcode: '7802420000042', name: 'Mantequilla 250g', category: 'Lácteos', brand: 'Colun', suggestedPrice: 2100, unit: 'unidad' },
  { sku: 'LAC-005', barcode: '7801230000015', name: 'Queso Laminado 200g', category: 'Lácteos', brand: 'Surlat', suggestedPrice: 2500, unit: 'unidad' },
  
  // Panadería y snacks
  { sku: 'PAN-001', barcode: '7803210000012', name: 'Pan de Molde Integral', category: 'Panadería', brand: 'Ideal', suggestedPrice: 1500, unit: 'unidad' },
  { sku: 'PAN-002', barcode: '7803210000029', name: 'Pan de Molde Blanco', category: 'Panadería', brand: 'Ideal', suggestedPrice: 1400, unit: 'unidad' },
  { sku: 'SNK-001', barcode: '7804320100016', name: 'Papas Fritas 150g', category: 'Snacks', brand: 'Marco Polo', suggestedPrice: 1200, unit: 'unidad' },
  { sku: 'SNK-002', barcode: '7804320100023', name: 'Ramitas 100g', category: 'Snacks', brand: 'Carozzi', suggestedPrice: 800, unit: 'unidad' },
  { sku: 'SNK-003', barcode: '7804320100030', name: 'Super 8 Chocolate 27g', category: 'Snacks', brand: 'Costa', suggestedPrice: 450, unit: 'unidad' },
  
  // Abarrotes
  { sku: 'ABA-001', barcode: '7802910000018', name: 'Arroz Grado 2 1kg', category: 'Abarrotes', brand: 'Miraflores', suggestedPrice: 1100, unit: 'kg' },
  { sku: 'ABA-002', barcode: '7802910000025', name: 'Fideos Spaguetti 400g', category: 'Abarrotes', brand: 'Carozzi', suggestedPrice: 890, unit: 'unidad' },
  { sku: 'ABA-003', barcode: '7802910000032', name: 'Aceite Vegetal 900ml', category: 'Abarrotes', brand: 'Chef', suggestedPrice: 2100, unit: 'unidad' },
  { sku: 'ABA-004', barcode: '7802910000049', name: 'Azúcar Granulada 1kg', category: 'Abarrotes', brand: 'Iansa', suggestedPrice: 1200, unit: 'kg' },
  { sku: 'ABA-005', barcode: '7802910000056', name: 'Sal Fina 1kg', category: 'Abarrotes', brand: 'Lobos', suggestedPrice: 600, unit: 'kg' },
  { sku: 'ABA-006', barcode: '7802910000063', name: 'Harina sin Polvos 1kg', category: 'Abarrotes', brand: 'Selecta', suggestedPrice: 950, unit: 'kg' },
  
  // Aseo
  { sku: 'ASE-001', barcode: '7803540000017', name: 'Papel Higiénico 4 rollos', category: 'Aseo', brand: 'Elite', suggestedPrice: 2200, unit: 'pack' },
  { sku: 'ASE-002', barcode: '7803540000024', name: 'Detergente en Polvo 1kg', category: 'Aseo', brand: 'Popeye', suggestedPrice: 2500, unit: 'kg' },
  { sku: 'ASE-003', barcode: '7803540000031', name: 'Cloro 1L', category: 'Aseo', brand: 'Clorox', suggestedPrice: 1200, unit: 'unidad' },
  { sku: 'ASE-004', barcode: '7803540000048', name: 'Lavalozas 500ml', category: 'Aseo', brand: 'Quix', suggestedPrice: 1500, unit: 'unidad' },
  { sku: 'ASE-005', barcode: '7803540000055', name: 'Desodorante Ambiental', category: 'Aseo', brand: 'Glade', suggestedPrice: 1800, unit: 'unidad' },
  
  // Congelados
  { sku: 'CON-001', barcode: '7804210000019', name: 'Helado Vainilla 1L', category: 'Congelados', brand: 'Savory', suggestedPrice: 3500, unit: 'unidad' },
]

async function seedMasterProducts() {
  console.log('🌱 Iniciando seed de productos maestros...')
  
  try {
    // Verificar si ya existen productos maestros
    const existingCount = await prisma.masterProduct.count()
    
    if (existingCount > 0) {
      console.log(`⚠️  Ya existen ${existingCount} productos maestros en la base de datos.`)
      console.log('   Si deseas recrearlos, elimina los productos existentes primero.')
      return
    }

    // Crear productos maestros
    let createdCount = 0
    for (const product of masterProducts) {
      try {
        await prisma.masterProduct.create({
          data: {
            ...product,
            description: `${product.name} - Producto de calidad para tu negocio`,
          },
        })
        createdCount++
        console.log(`✅ Producto creado: ${product.name}`)
      } catch (error: any) {
        if (error.code === 'P2002') {
          console.log(`⚠️  Producto duplicado (SKU o Barcode): ${product.name}`)
        } else {
          console.error(`❌ Error al crear producto ${product.name}:`, error.message)
        }
      }
    }

    console.log(`\n🎉 Seed completado: ${createdCount}/${masterProducts.length} productos maestros creados.`)
    
    // Mostrar resumen por categoría
    const productsByCategory = await prisma.masterProduct.groupBy({
      by: ['category'],
      _count: true,
    })
    
    console.log('\n📊 Resumen por categoría:')
    productsByCategory.forEach(({ category, _count }) => {
      console.log(`   - ${category}: ${_count} productos`)
    })
    
  } catch (error) {
    console.error('❌ Error durante el seed:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Ejecutar seed
seedMasterProducts()
  .catch((error) => {
    console.error('❌ Error fatal:', error)
    process.exit(1)
  })
