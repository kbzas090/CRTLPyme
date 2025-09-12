
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import fs from 'fs'
import path from 'path'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Iniciando seed de la base de datos...')

  // Limpiar datos existentes (orden importante por las relaciones)
  console.log('🗑️  Limpiando datos existentes...')
  await prisma.auditLog.deleteMany()
  await prisma.saleItem.deleteMany()
  await prisma.sale.deleteMany() 
  await prisma.cashSession.deleteMany()
  await prisma.stockAdjustment.deleteMany()
  await prisma.fixedExpense.deleteMany()
  await prisma.product.deleteMany()
  await prisma.user.deleteMany()
  await prisma.tenant.deleteMany()

  // 1. Crear Tenants de ejemplo
  console.log('🏢 Creando tenants...')
  const tenant1 = await prisma.tenant.create({
    data: {
      businessName: 'Almacén San Juan',
      rut: '76.123.456-7',
      email: 'contacto@almacensanjuan.cl',
      phone: '+56912345678',
      address: 'San Juan #1234, Santiago Centro',
      planType: 'BASIC',
      maxCashiers: 2,
      extraCashiers: 1,
    }
  })

  const tenant2 = await prisma.tenant.create({
    data: {
      businessName: 'Minimarket Los Aromos',
      rut: '76.234.567-8', 
      email: 'info@minimartketaromos.cl',
      phone: '+56987654321',
      address: 'Los Aromos #567, Providencia',
      planType: 'PRO',
      maxCashiers: 3,
    }
  })

  const tenant3 = await prisma.tenant.create({
    data: {
      businessName: 'Tienda Doña María',
      rut: '76.345.678-9',
      email: 'maria@tiendamaria.cl', 
      phone: '+56911223344',
      address: 'Maipú #890, Maipú',
      planType: 'BASIC',
    }
  })

  // 2. Crear Usuarios de prueba
  console.log('👥 Creando usuarios...')
  
  // Usuario SaaS Admin (john@doe.com - cuenta de prueba requerida)
  const hashedPassword = await bcrypt.hash('johndoe123', 12)
  
  const saasAdmin = await prisma.user.create({
    data: {
      email: 'john@doe.com',
      password: hashedPassword,
      firstName: 'John',
      lastName: 'Doe',
      role: 'PROVEEDOR',
      tenantId: tenant1.id, // Asignado a un tenant pero con rol PROVEEDOR tiene acceso global
    }
  })

  // Usuarios para Tenant 1 (Almacén San Juan)
  const admin1 = await prisma.user.create({
    data: {
      email: 'admin@almacensanjuan.cl',
      password: await bcrypt.hash('admin123', 12),
      firstName: 'Carlos',
      lastName: 'González',
      role: 'ADMIN',
      tenantId: tenant1.id,
    }
  })

  const cajero1 = await prisma.user.create({
    data: {
      email: 'maria@almacensanjuan.cl',
      password: await bcrypt.hash('cajero123', 12),
      firstName: 'María',
      lastName: 'Rodríguez',
      role: 'CAJA',
      tenantId: tenant1.id,
    }
  })

  const inventario1 = await prisma.user.create({
    data: {
      email: 'inventario@almacensanjuan.cl',
      password: await bcrypt.hash('inventario123', 12),
      firstName: 'Pedro',
      lastName: 'Martínez',
      role: 'INVENTARIO', 
      tenantId: tenant1.id,
    }
  })

  // Usuarios para Tenant 2
  const admin2 = await prisma.user.create({
    data: {
      email: 'admin@minimarketaromos.cl',
      password: await bcrypt.hash('admin123', 12),
      firstName: 'Ana',
      lastName: 'Silva',
      role: 'ADMIN',
      tenantId: tenant2.id,
    }
  })

  // Usuario de soporte
  const soporte = await prisma.user.create({
    data: {
      email: 'soporte@possaaschile.cl',
      password: await bcrypt.hash('soporte123', 12),
      firstName: 'Luis',
      lastName: 'Morales', 
      role: 'SOPORTE',
      tenantId: tenant1.id, // Asignado pero tiene acceso a todos los tenants
    }
  })

  // 3. Cargar productos chilenos desde el archivo JSON
  console.log('📦 Cargando productos chilenos...')
  
  const productosPath = path.join(process.cwd(), 'productos_chilenos.json')
  let productosChilenos: any[] = []
  
  try {
    const productosData = fs.readFileSync(productosPath, 'utf-8')
    const productosJSON = JSON.parse(productosData)
    const productosRaw = productosJSON.productos_chilenos || []
    
    // Transformar formato del JSON a formato esperado por el seed
    productosChilenos = productosRaw.map((producto: any, index: number) => ({
      sku: `P${String(index + 1).padStart(3, '0')}`,
      barcode: producto.ean13,
      name: producto.name,
      category: producto.category.charAt(0).toUpperCase() + producto.category.slice(1),
      brand: producto.brand,
      cost_price: Math.round(producto.price_clp * 0.7), // Asumimos 30% de margen
      sale_price: producto.price_clp,
      description: producto.description || `${producto.brand} - ${producto.name}`
    }))
    
    console.log(`   ✅ Cargados ${productosChilenos.length} productos desde JSON`)
  } catch (error) {
    console.warn('⚠️  No se pudo cargar productos chilenos, usando datos hardcodeados')
    // Fallback con productos básicos
    productosChilenos = [
      {
        sku: 'COCA500',
        barcode: '7802820004632',
        name: 'Coca-Cola 500ml',
        category: 'Bebidas',
        brand: 'Coca-Cola',
        cost_price: 800,
        sale_price: 1200
      },
      {
        sku: 'PAN001',
        barcode: '7804123456789',
        name: 'Pan Hallulla',
        category: 'Panadería', 
        brand: 'Panadería Local',
        cost_price: 150,
        sale_price: 250
      }
    ]
  }

  // Crear productos para cada tenant
  const tenantsForProducts = [tenant1, tenant2, tenant3]
  
  for (const tenant of tenantsForProducts) {
    console.log(`   Creando productos para ${tenant.businessName}...`)
    
    for (const producto of productosChilenos.slice(0, 30)) { // Limitar a 30 productos por tenant
      await prisma.product.create({
        data: {
          sku: `${producto.sku}-T${tenant.id.slice(-3)}`, // SKU único por tenant
          barcode: producto.barcode,
          name: producto.name,
          description: producto.description || `${producto.brand} - ${producto.name}`,
          category: producto.category,
          brand: producto.brand,
          costPrice: producto.cost_price,
          salePrice: producto.sale_price,
          stock: Math.floor(Math.random() * 50) + 10, // Stock aleatorio entre 10-60
          minStock: Math.floor(Math.random() * 10) + 3, // Stock mínimo entre 3-13
          tenantId: tenant.id,
        }
      })
    }
  }

  // 4. Crear gastos fijos para tenants
  console.log('💰 Creando gastos fijos...')
  
  // Gastos para Almacén San Juan  
  await prisma.fixedExpense.createMany({
    data: [
      {
        name: 'Arriendo local',
        amount: 800000,
        frequency: 'MONTHLY',
        tenantId: tenant1.id,
      },
      {
        name: 'Luz y agua',
        amount: 120000,
        frequency: 'MONTHLY',
        tenantId: tenant1.id,
      },
      {
        name: 'Sueldo empleados',
        amount: 650000,
        frequency: 'MONTHLY',
        tenantId: tenant1.id,
      },
      {
        name: 'Internet y teléfono',
        amount: 45000,
        frequency: 'MONTHLY',
        tenantId: tenant1.id,
      }
    ]
  })

  // Gastos para Minimarket Los Aromos
  await prisma.fixedExpense.createMany({
    data: [
      {
        name: 'Arriendo local',
        amount: 1200000,
        frequency: 'MONTHLY', 
        tenantId: tenant2.id,
      },
      {
        name: 'Servicios básicos',
        amount: 180000,
        frequency: 'MONTHLY',
        tenantId: tenant2.id,
      }
    ]
  })

  // 5. Crear sesiones de caja y ventas de ejemplo
  console.log('🛒 Creando ventas de ejemplo...')
  
  // Sesión de caja para tenant1
  const cashSession1 = await prisma.cashSession.create({
    data: {
      initialAmount: 50000,
      status: 'OPEN',
      userId: cajero1.id,
      tenantId: tenant1.id,
    }
  })

  // Obtener algunos productos para crear ventas
  const productsT1 = await prisma.product.findMany({
    where: { tenantId: tenant1.id },
    take: 10
  })

  // Crear ventas del día
  for (let i = 1; i <= 15; i++) {
    const randomProducts = productsT1.slice(0, Math.floor(Math.random() * 4) + 1)
    let subtotal = 0
    
    const sale = await prisma.sale.create({
      data: {
        saleNumber: `V-${String(i).padStart(4, '0')}`,
        subtotal: 0, // Se calculará después
        tax: 0,
        total: 0, // Se calculará después  
        paymentMethod: ['CASH', 'DEBIT', 'CREDIT'][Math.floor(Math.random() * 3)] as any,
        status: 'COMPLETED',
        userId: cajero1.id,
        tenantId: tenant1.id,
        cashSessionId: cashSession1.id,
        createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000), // Últimos 7 días
      }
    })

    // Crear items de venta
    for (const product of randomProducts) {
      const quantity = Math.floor(Math.random() * 3) + 1
      const itemSubtotal = Number(product.salePrice) * quantity
      
      await prisma.saleItem.create({
        data: {
          quantity,
          unitPrice: product.salePrice,
          unitCost: product.costPrice,
          subtotal: itemSubtotal,
          saleId: sale.id,
          productId: product.id,
          tenantId: tenant1.id,
        }
      })

      subtotal += itemSubtotal

      // Descontar del stock
      await prisma.product.update({
        where: { id: product.id },
        data: {
          stock: {
            decrement: quantity
          }
        }
      })
    }

    // Actualizar totales de la venta
    await prisma.sale.update({
      where: { id: sale.id },
      data: {
        subtotal,
        total: subtotal,
      }
    })
  }

  // 6. Crear algunos ajustes de stock
  console.log('📋 Creando ajustes de inventario...')
  
  const someProducts = await prisma.product.findMany({
    where: { tenantId: tenant1.id },
    take: 5
  })

  for (const product of someProducts) {
    await prisma.stockAdjustment.create({
      data: {
        productId: product.id,
        quantity: Math.floor(Math.random() * 20) + 10, // Compra de 10-30 unidades
        type: 'PURCHASE',
        reason: 'Reposición semanal',
        userId: inventario1.id,
        tenantId: tenant1.id,
      }
    })

    // Actualizar stock del producto
    await prisma.product.update({
      where: { id: product.id },
      data: {
        stock: {
          increment: Math.floor(Math.random() * 20) + 10
        }
      }
    })
  }

  console.log('✅ Seed completado exitosamente!')
  
  console.log('\n📊 Resumen:')
  console.log(`   • ${await prisma.tenant.count()} tenants creados`)
  console.log(`   • ${await prisma.user.count()} usuarios creados`)
  console.log(`   • ${await prisma.product.count()} productos cargados`) 
  console.log(`   • ${await prisma.sale.count()} ventas simuladas`)
  console.log(`   • ${await prisma.fixedExpense.count()} gastos fijos configurados`)
  
  console.log('\n🔑 Credenciales de prueba:')
  console.log('   👑 Admin SaaS: john@doe.com / johndoe123')
  console.log('   🏪 Admin Almacén: admin@almacensanjuan.cl / admin123')
  console.log('   💰 Cajero: maria@almacensanjuan.cl / cajero123') 
  console.log('   📦 Inventario: inventario@almacensanjuan.cl / inventario123')
  console.log('   🔧 Soporte: soporte@possaaschile.cl / soporte123')
  console.log('')
}

main()
  .catch((e) => {
    console.error('❌ Error durante el seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
