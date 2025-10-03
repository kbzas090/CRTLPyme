
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import * as fs from 'fs'
import * as path from 'path'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Iniciando seed de la base de datos...')

  // Leer productos chilenos del JSON
  const productosPath = path.join(process.cwd(), 'data', 'productos_chilenos.json')
  const productosData = JSON.parse(fs.readFileSync(productosPath, 'utf-8'))
  const productos = productosData.productos_chilenos

  console.log(`📦 Encontrados ${productos.length} productos en el JSON`)

  // Crear tenant demo
  console.log('🏢 Creando tenant demo...')
  const tenant = await prisma.tenant.upsert({
    where: { rut: '76123456-7' },
    update: {},
    create: {
      businessName: 'Demo Chile SpA',
      rut: '76123456-7',
      email: 'admin@demo.cl',
      phone: '+56912345678',
      address: 'Av. Providencia 1234, Santiago',
      isActive: true,
      planType: 'BASIC',
      maxCashiers: 2,
      extraCashiers: 0,
    },
  })
  console.log(`✅ Tenant creado: ${tenant.businessName}`)

  // Crear usuario admin demo
  console.log('👤 Creando usuario admin demo...')
  const hashedPassword = await bcrypt.hash('Demo123!', 10)
  const user = await prisma.user.upsert({
    where: { email: 'admin@demo.cl' },
    update: {},
    create: {
      email: 'admin@demo.cl',
      password: hashedPassword,
      firstName: 'Admin',
      lastName: 'Demo',
      role: 'ADMIN',
      isActive: true,
      tenantId: tenant.id,
    },
  })
  console.log(`✅ Usuario creado: ${user.email}`)

  // Importar productos
  console.log('📦 Importando productos...')
  let importedCount = 0
  
  for (let i = 0; i < productos.length; i++) {
    const producto = productos[i]
    
    // Generar SKU automático
    const sku = `SKU-${String(i + 1).padStart(3, '0')}`
    
    // Calcular precio de costo (60% del precio de venta para margen del 40%)
    const salePrice = producto.price_clp
    const costPrice = Math.round(salePrice * 0.6)
    
    // Stock aleatorio entre 10 y 100
    const stock = Math.floor(Math.random() * 91) + 10
    
    try {
      await prisma.product.create({
        data: {
          sku: sku,
          barcode: producto.ean13,
          name: producto.name,
          description: `${producto.brand} - ${producto.category}`,
          category: producto.category,
          brand: producto.brand,
          costPrice: costPrice,
          salePrice: salePrice,
          stock: stock,
          minStock: 5,
          isActive: true,
          tenantId: tenant.id,
        },
      })
      importedCount++
      
      // Mostrar progreso cada 10 productos
      if ((i + 1) % 10 === 0) {
        console.log(`   Importados ${i + 1}/${productos.length} productos...`)
      }
    } catch (error) {
      console.error(`❌ Error al importar producto ${producto.name}:`, error)
    }
  }

  console.log(`✅ ${importedCount} productos importados exitosamente`)

  // Resumen final
  console.log('\n📊 Resumen del seed:')
  console.log(`   - Tenant: ${tenant.businessName}`)
  console.log(`   - Usuario: ${user.email}`)
  console.log(`   - Contraseña: Demo123!`)
  console.log(`   - Productos: ${importedCount}`)
  console.log('\n✨ Seed completado exitosamente!')
}

main()
  .catch((e) => {
    console.error('❌ Error en seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
