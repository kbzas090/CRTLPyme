/**
 * Script de población de datos para CRTLPyme - PRODUCCIÓN
 * 
 * Este script crea datos de PRODUCCIÓN con:
 * - 500 productos del catálogo maestro
 * - Usuario administrador de plataforma
 * - 10-15 negocios PyME chilenos
 * - 2-3 usuarios por negocio
 * - Inventario para cada negocio
 * - Ventas históricas de los últimos 3 meses
 * - Movimientos de inventario
 * - Suscripciones activas
 * 
 * IMPORTANTE: Este script usa contraseñas de PRODUCCIÓN seguras
 */

import { PrismaClient, UserRole, PaymentMethod, PlanType, SubscriptionStatus, BillingCycle, AccountStatus, AdjustmentType } from '@prisma/client'
import bcrypt from 'bcryptjs'
import * as fs from 'fs'
import * as path from 'path'

const prisma = new PrismaClient()

// Flag para limpiar datos existentes (usar con precaución)
const CLEAN_DATABASE = process.argv.includes('--clean')

// Datos de negocios chilenos realistas
const negociosChilenos = [
  {
    businessName: 'Minimarket Don Luis',
    rut: '76.123.456-7',
    email: 'contacto@minimarketdonluis.cl',
    phone: '+56912345678',
    address: 'Av. Providencia 1234, Providencia, Santiago',
    planType: PlanType.PRO
  },
  {
    businessName: 'Almacén El Rinconcito',
    rut: '76.234.567-8',
    email: 'elrinconcito@gmail.com',
    phone: '+56923456789',
    address: 'Calle Los Carrera 567, Maipú, Santiago',
    planType: PlanType.BASIC
  },
  {
    businessName: 'Supermercado Familiar',
    rut: '76.345.678-9',
    email: 'info@superfamiliar.cl',
    phone: '+56934567890',
    address: 'Av. Grecia 890, Ñuñoa, Santiago',
    planType: PlanType.PRO
  },
  {
    businessName: 'Tienda La Esquina',
    rut: '76.456.789-0',
    email: 'laesquina@hotmail.com',
    phone: '+56945678901',
    address: 'Pasaje Los Aromos 123, La Florida, Santiago',
    planType: PlanType.BASIC
  },
  {
    businessName: 'Abarrotes San José',
    rut: '76.567.890-1',
    email: 'sanjose.abarrotes@gmail.com',
    phone: '+56956789012',
    address: 'Av. Los Pajaritos 456, Estación Central, Santiago',
    planType: PlanType.BASIC
  },
  {
    businessName: 'Minimarket Express 24/7',
    rut: '76.678.901-2',
    email: 'express247@gmail.com',
    phone: '+56967890123',
    address: 'Av. Vicuña Mackenna 789, La Reina, Santiago',
    planType: PlanType.PRO
  },
  {
    businessName: 'Almacén Doña Rosa',
    rut: '76.789.012-3',
    email: 'almacendonarosa@outlook.com',
    phone: '+56978901234',
    address: 'Calle Santa Rosa 234, San Bernardo, Santiago',
    planType: PlanType.BASIC
  },
  {
    businessName: 'Supermercado Los Andes',
    rut: '76.890.123-4',
    email: 'contacto@losandessupermarket.cl',
    phone: '+56989012345',
    address: 'Av. Apoquindo 1567, Las Condes, Santiago',
    planType: PlanType.ENTERPRISE
  },
  {
    businessName: 'Tienda Don Pedro',
    rut: '76.901.234-5',
    email: 'donpedro.tienda@gmail.com',
    phone: '+56990123456',
    address: 'Calle O\'Higgins 678, Puente Alto, Santiago',
    planType: PlanType.BASIC
  },
  {
    businessName: 'Minimarket Central',
    rut: '77.012.345-6',
    email: 'minimarketcentral@yahoo.com',
    phone: '+56901234567',
    address: 'Av. Libertador Bernardo O\'Higgins 2345, Santiago Centro, Santiago',
    planType: PlanType.PRO
  },
  {
    businessName: 'Almacén El Buen Vecino',
    rut: '77.123.456-7',
    email: 'buenvecino@gmail.com',
    phone: '+56912345670',
    address: 'Pasaje Los Olivos 89, Quilicura, Santiago',
    planType: PlanType.BASIC
  },
  {
    businessName: 'Supermercado La Familia',
    rut: '77.234.567-8',
    email: 'superfamilia@outlook.com',
    phone: '+56923456701',
    address: 'Av. Pajaritos 3456, Maipú, Santiago',
    planType: PlanType.PRO
  },
  {
    businessName: 'Minimarket Nuevo Amanecer',
    rut: '77.345.678-9',
    email: 'nuevoamanecer.mm@gmail.com',
    phone: '+56934567012',
    address: 'Calle Los Cerezos 567, Cerrillos, Santiago',
    planType: PlanType.BASIC
  }
]

// Nombres chilenos comunes para usuarios
const nombresChilenos = ['Juan', 'María', 'Pedro', 'Carmen', 'José', 'Ana', 'Luis', 'Patricia', 'Carlos', 'Rosa', 'Jorge', 'Isabel', 'Miguel', 'Claudia', 'Ricardo']
const apellidosChilenos = ['González', 'Muñoz', 'Rojas', 'Díaz', 'Pérez', 'Soto', 'Contreras', 'Silva', 'Martínez', 'Sepúlveda', 'Morales', 'Rodríguez', 'López', 'Fuentes', 'Hernández']

// Métodos de pago con distribución realista
const metodoPagoDistribucion = [
  { method: PaymentMethod.CASH, weight: 50 },
  { method: PaymentMethod.DEBIT, weight: 30 },
  { method: PaymentMethod.CREDIT, weight: 15 },
  { method: PaymentMethod.TRANSFER, weight: 5 }
]

/**
 * Genera un nombre aleatorio chileno
 */
function generarNombreAleatorio(): { firstName: string, lastName: string } {
  const firstName = nombresChilenos[Math.floor(Math.random() * nombresChilenos.length)]
  const lastName = apellidosChilenos[Math.floor(Math.random() * apellidosChilenos.length)] + ' ' + apellidosChilenos[Math.floor(Math.random() * apellidosChilenos.length)]
  return { firstName, lastName }
}

/**
 * Selecciona un método de pago basado en pesos
 */
function seleccionarMetodoPago(): PaymentMethod {
  const total = metodoPagoDistribucion.reduce((sum, item) => sum + item.weight, 0)
  let random = Math.random() * total
  
  for (const item of metodoPagoDistribucion) {
    random -= item.weight
    if (random <= 0) return item.method
  }
  
  return PaymentMethod.CASH
}

/**
 * Genera una fecha aleatoria en los últimos N días
 */
function fechaAleatoria(diasAtras: number): Date {
  const now = new Date()
  const randomDays = Math.floor(Math.random() * diasAtras)
  const randomHours = Math.floor(Math.random() * 24)
  const randomMinutes = Math.floor(Math.random() * 60)
  
  const date = new Date(now)
  date.setDate(date.getDate() - randomDays)
  date.setHours(randomHours, randomMinutes, 0, 0)
  
  return date
}

/**
 * Limpia la base de datos (usar con precaución)
 */
async function limpiarBaseDatos() {
  console.log('⚠️  Limpiando base de datos...')
  
  // Eliminar en orden correcto para respetar foreign keys
  await prisma.saleItem.deleteMany()
  await prisma.sale.deleteMany()
  await prisma.stockAdjustment.deleteMany()
  await prisma.tenantInventory.deleteMany()
  await prisma.masterProduct.deleteMany()
  await prisma.cashSession.deleteMany()
  await prisma.subscriptionPayment.deleteMany()
  await prisma.subscription.deleteMany()
  await prisma.subscriptionPlan.deleteMany()
  await prisma.user.deleteMany()
  await prisma.tenant.deleteMany()
  
  console.log('✅ Base de datos limpiada\n')
}

/**
 * Crea los planes de suscripción
 */
async function crearPlanesSuscripcion() {
  console.log('📦 Creando planes de suscripción...')
  
  const planes = [
    {
      name: 'Plan Básico',
      description: 'Perfecto para emprendedores y pequeños negocios',
      price: 9990,
      billingCycle: BillingCycle.MONTHLY,
      trialDays: 15,
      isVisible: true,
      sortOrder: 1,
      features: JSON.stringify([
        '2 usuarios incluidos',
        'Hasta 500 productos',
        'Reportes básicos',
        'Soporte por email',
        'App móvil'
      ]),
      maxUsers: 2,
      maxProducts: 500,
      maxSales: null,
      isActive: true
    },
    {
      name: 'Plan Pro',
      description: 'Para negocios en crecimiento que necesitan más',
      price: 19990,
      billingCycle: BillingCycle.MONTHLY,
      trialDays: 15,
      isVisible: true,
      sortOrder: 2,
      features: JSON.stringify([
        '5 usuarios incluidos',
        'Productos ilimitados',
        'Reportes avanzados',
        'Soporte prioritario',
        'App móvil',
        'Integración con Transbank'
      ]),
      maxUsers: 5,
      maxProducts: null,
      maxSales: null,
      isActive: true
    },
    {
      name: 'Plan Enterprise',
      description: 'Solución completa para cadenas y grandes negocios',
      price: 49990,
      billingCycle: BillingCycle.MONTHLY,
      trialDays: 30,
      isVisible: true,
      sortOrder: 3,
      features: JSON.stringify([
        'Usuarios ilimitados',
        'Productos ilimitados',
        'Reportes personalizados',
        'Soporte 24/7',
        'App móvil',
        'Integración con Transbank',
        'API personalizada',
        'Gestor de cuenta dedicado'
      ]),
      maxUsers: null,
      maxProducts: null,
      maxSales: null,
      isActive: true
    }
  ]
  
  // Verificar si ya existen planes
  const existingPlans = await prisma.subscriptionPlan.findMany()
  
  if (existingPlans.length === 0) {
    // Solo crear planes si no existen
    for (const plan of planes) {
      await prisma.subscriptionPlan.create({
        data: plan
      })
    }
  } else {
    console.log('   ℹ️  Planes ya existen, omitiendo creación...')
  }
  
  console.log(`✅ ${planes.length} planes de suscripción creados\n`)
  return prisma.subscriptionPlan.findMany()
}

/**
 * Importa productos desde el archivo JSON
 */
async function importarProductos(limite: number = 500) {
  console.log(`📦 Importando ${limite} productos desde archivo JSON...`)
  
  const productosPath = path.join('/home/ubuntu', 'productos_chile.json')
  
  if (!fs.existsSync(productosPath)) {
    console.error(`❌ No se encontró el archivo ${productosPath}`)
    return []
  }
  
  const data = JSON.parse(fs.readFileSync(productosPath, 'utf-8'))
  const productosSeleccionados = data.slice(0, limite)
  
  const productos = []
  
  for (const producto of productosSeleccionados) {
    // Crear SKU único si no tiene barcode
    const sku = producto.ean13 || `SKU-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    
    const masterProduct = await prisma.masterProduct.upsert({
      where: { sku: sku },
      update: {
        name: producto.nombre,
        barcode: producto.ean13 || null,
        category: producto.categoria || 'General',
        brand: producto.marca || 'Sin marca',
        suggestedPrice: producto.precio_venta || producto.precio_compra * 1.5,
        unit: 'unidad',
        isActive: true
      },
      create: {
        sku: sku,
        barcode: producto.ean13 || null,
        name: producto.nombre,
        category: producto.categoria || 'General',
        brand: producto.marca || 'Sin marca',
        suggestedPrice: producto.precio_venta || producto.precio_compra * 1.5,
        unit: 'unidad',
        isActive: true
      }
    })
    
    productos.push(masterProduct)
  }
  
  console.log(`✅ ${productos.length} productos importados\n`)
  return productos
}

/**
 * Crea negocios PyME
 */
async function crearNegocios() {
  console.log('🏢 Creando negocios PyME chilenos...')
  
  const tenants = []
  const now = new Date()
  
  for (const negocio of negociosChilenos) {
    // Verificar si el tenant ya existe
    let tenant = await prisma.tenant.findUnique({ where: { rut: negocio.rut } })
    
    if (!tenant) {
      tenant = await prisma.tenant.create({
        data: {
          businessName: negocio.businessName,
          rut: negocio.rut,
          email: negocio.email,
          phone: negocio.phone,
          address: negocio.address,
          isActive: true,
          planType: negocio.planType,
          maxCashiers: negocio.planType === PlanType.ENTERPRISE ? 10 : negocio.planType === PlanType.PRO ? 5 : 2,
          accountStatus: AccountStatus.ACTIVE,
          onboardingCompleted: true,
          lastActivityAt: now
        }
      })
    } else {
      console.log(`   ⚠️  Negocio ${negocio.businessName} (${negocio.rut}) ya existe, omitiendo...`)
    }
    
    tenants.push(tenant)
  }
  
  console.log(`✅ ${tenants.length} negocios creados\n`)
  return tenants
}

/**
 * Crea usuario administrador de plataforma
 */
async function crearAdminPlataforma() {
  console.log('👨‍💼 Creando usuario administrador de plataforma...')
  
  const hashedPassword = await bcrypt.hash('CRTLPyme2025!Admin', 10)
  
  // Primero necesitamos un tenant "plataforma" para el admin
  const platformTenant = await prisma.tenant.upsert({
    where: { rut: '99.999.999-9' },
    update: {},
    create: {
      businessName: 'CRTLPyme - Plataforma',
      rut: '99.999.999-9',
      email: 'plataforma@crtlpyme.com',
      phone: '+56900000000',
      address: 'Santiago, Chile',
      isActive: true,
      planType: PlanType.ENTERPRISE,
      accountStatus: AccountStatus.ACTIVE
    }
  })
  
  const admin = await prisma.user.upsert({
    where: { email: 'admin@crtlpyme.cl' },
    update: {
      password: hashedPassword,
      firstName: 'Administrador',
      lastName: 'Sistema',
      role: UserRole.PROVEEDOR,
      isActive: true
    },
    create: {
      email: 'admin@crtlpyme.cl',
      password: hashedPassword,
      firstName: 'Administrador',
      lastName: 'Sistema',
      role: UserRole.PROVEEDOR,
      isActive: true,
      tenantId: platformTenant.id
    }
  })
  
  console.log('✅ Usuario administrador creado:')
  console.log('   Email: admin@crtlpyme.cl')
  console.log('   Contraseña: CRTLPyme2025!Admin')
  console.log('   Rol: PROVEEDOR (Super Admin)\n')
  
  return { admin, platformTenant }
}

/**
 * Crea usuarios para cada negocio
 */
async function crearUsuariosNegocios(tenants: any[]) {
  console.log('👥 Creando usuarios para cada negocio...')
  
  const hashedPassword = await bcrypt.hash('CRTLPyme2025!User', 10)
  const usuarios = []
  
  for (const tenant of tenants) {
    // Número de usuarios: 2-3 por negocio
    const numUsuarios = Math.random() > 0.4 ? 3 : 2
    
    // Crear usuario administrador del negocio
    const { firstName: adminFirstName, lastName: adminLastName } = generarNombreAleatorio()
    const emailDomain = tenant.email.split('@')[1]
    const adminEmail = `admin@${emailDomain}`
    
    // Verificar si el usuario ya existe
    let admin = await prisma.user.findUnique({ where: { email: adminEmail } })
    
    if (!admin) {
      admin = await prisma.user.create({
        data: {
          email: adminEmail,
          password: hashedPassword,
          firstName: adminFirstName,
          lastName: adminLastName,
          role: UserRole.ADMIN,
          isActive: true,
          tenantId: tenant.id
        }
      })
      usuarios.push(admin)
    } else {
      console.log(`   ⚠️  Usuario ${adminEmail} ya existe, omitiendo...`)
    }
    
    // Crear usuarios adicionales (cajeros/inventario)
    for (let i = 1; i < numUsuarios; i++) {
      const { firstName, lastName } = generarNombreAleatorio()
      const role = Math.random() > 0.5 ? UserRole.CAJA : UserRole.INVENTARIO
      const userName = firstName.toLowerCase() + i
      const userEmail = `${userName}@${emailDomain}`
      
      // Verificar si el usuario ya existe
      const existingUser = await prisma.user.findUnique({ where: { email: userEmail } })
      
      if (!existingUser) {
        const user = await prisma.user.create({
          data: {
            email: userEmail,
            password: hashedPassword,
            firstName,
            lastName,
            role,
            isActive: true,
            tenantId: tenant.id
          }
        })
        usuarios.push(user)
      } else {
        console.log(`   ⚠️  Usuario ${userEmail} ya existe, omitiendo...`)
      }
    }
  }
  
  console.log(`✅ ${usuarios.length} usuarios creados`)
  console.log('   Contraseña para todos: CRTLPyme2025!User\n')
  
  return usuarios
}

/**
 * Crea inventario para cada negocio
 */
async function crearInventario(tenants: any[], productos: any[]) {
  console.log('📦 Creando inventario para cada negocio...')
  
  const inventarios = []
  
  for (const tenant of tenants) {
    // Cada negocio tiene entre 50-200 productos en su inventario
    const numProductos = Math.floor(Math.random() * 150) + 50
    const productosSeleccionados = productos
      .sort(() => Math.random() - 0.5)
      .slice(0, numProductos)
    
    for (const masterProduct of productosSeleccionados) {
      // Precio de costo con variación del -10% a +10% del precio sugerido
      const costoBase = Number(masterProduct.suggestedPrice) * 0.6
      const variacion = (Math.random() * 0.2 - 0.1) // -10% a +10%
      const costPrice = Math.round(costoBase * (1 + variacion))
      
      // Precio de venta con margen del 30% al 60%
      const margen = 0.3 + Math.random() * 0.3
      const salePrice = Math.round(costPrice * (1 + margen))
      
      // Stock inicial entre 5 y 100 unidades
      const stock = Math.floor(Math.random() * 95) + 5
      
      // Verificar si el producto ya existe en el inventario
      let inventario = await prisma.tenantInventory.findFirst({
        where: {
          tenantId: tenant.id,
          masterProductId: masterProduct.id
        }
      })
      
      if (!inventario) {
        inventario = await prisma.tenantInventory.create({
          data: {
            tenantId: tenant.id,
            masterProductId: masterProduct.id,
            costPrice,
            salePrice,
            stock,
            minStock: 5 + Math.floor(Math.random() * 10),
            isActive: true
          }
        })
      }
      
      inventarios.push(inventario)
    }
  }
  
  console.log(`✅ ${inventarios.length} productos en inventario creados\n`)
  return inventarios
}

/**
 * Crea suscripciones para cada negocio
 */
async function crearSuscripciones(tenants: any[], planes: any[]) {
  console.log('💳 Creando suscripciones para cada negocio...')
  
  const suscripciones = []
  const now = new Date()
  
  for (const tenant of tenants) {
    // Encontrar el plan correspondiente
    let planName = 'Plan Básico'
    if (tenant.planType === PlanType.PRO) planName = 'Plan Pro'
    if (tenant.planType === PlanType.ENTERPRISE) planName = 'Plan Enterprise'
    
    const plan = planes.find(p => p.name === planName)
    
    if (!plan) continue
    
    // Fecha de inicio: hace 1-6 meses
    const monthsAgo = Math.floor(Math.random() * 6) + 1
    const startDate = new Date(now)
    startDate.setMonth(startDate.getMonth() - monthsAgo)
    
    // Próxima fecha de facturación
    const nextBillingDate = new Date(startDate)
    nextBillingDate.setMonth(nextBillingDate.getMonth() + monthsAgo + 1)
    
    const subscription = await prisma.subscription.create({
      data: {
        tenantId: tenant.id,
        planId: plan.id,
        status: SubscriptionStatus.ACTIVE,
        startDate,
        billingCycle: BillingCycle.MONTHLY,
        nextBillingDate,
        lastBillingDate: new Date(nextBillingDate.getTime() - 30 * 24 * 60 * 60 * 1000),
        autoRenew: true,
        lifetimeValue: Number(plan.price) * monthsAgo
      }
    })
    
    suscripciones.push(subscription)
    
    // Crear pagos históricos
    for (let i = 0; i < monthsAgo; i++) {
      const paymentDate = new Date(startDate)
      paymentDate.setMonth(paymentDate.getMonth() + i)
      
      await prisma.subscriptionPayment.create({
        data: {
          subscriptionId: subscription.id,
          tenantId: tenant.id,
          amount: plan.price,
          currency: 'CLP',
          status: 'APPROVED',
          paymentMethod: 'CREDIT',
          paymentDate,
          cardLast4: '****',
          cardType: Math.random() > 0.5 ? 'Visa' : 'Mastercard'
        }
      })
    }
  }
  
  console.log(`✅ ${suscripciones.length} suscripciones creadas\n`)
  return suscripciones
}

/**
 * Crea ventas históricas para cada negocio
 */
async function crearVentasHistoricas(tenants: any[], usuarios: any[]) {
  console.log('💰 Creando ventas históricas (últimos 3 meses)...')
  
  const ventas = []
  const diasHistoricos = 90 // 3 meses
  
  for (const tenant of tenants) {
    // Obtener usuarios del tenant
    const usuariosTenant = usuarios.filter(u => u.tenantId === tenant.id)
    if (usuariosTenant.length === 0) continue
    
    // Obtener inventario del tenant
    const inventario = await prisma.tenantInventory.findMany({
      where: { tenantId: tenant.id, isActive: true },
      include: { masterProduct: true }
    })
    
    if (inventario.length === 0) continue
    
    // Obtener el último número de venta para este tenant
    const lastSale = await prisma.sale.findFirst({
      where: { tenantId: tenant.id },
      orderBy: { saleNumber: 'desc' }
    })
    
    // Número de ventas por negocio: 50-300 en 3 meses
    const numVentas = Math.floor(Math.random() * 250) + 50
    let saleNumber = lastSale ? parseInt(lastSale.saleNumber) + 1 : 1
    
    for (let i = 0; i < numVentas; i++) {
      const fechaVenta = fechaAleatoria(diasHistoricos)
      const usuario = usuariosTenant[Math.floor(Math.random() * usuariosTenant.length)]
      const paymentMethod = seleccionarMetodoPago()
      
      // Número de productos en la venta: 1-8
      const numProductos = Math.floor(Math.random() * 7) + 1
      const productosVenta = inventario
        .sort(() => Math.random() - 0.5)
        .slice(0, numProductos)
      
      let subtotal = 0
      const items = []
      
      for (const producto of productosVenta) {
        const quantity = Math.floor(Math.random() * 4) + 1 // 1-5 unidades
        const unitPrice = Number(producto.salePrice)
        const unitCost = Number(producto.costPrice)
        const itemSubtotal = unitPrice * quantity
        
        subtotal += itemSubtotal
        
        items.push({
          tenantInventoryId: producto.id,
          quantity,
          unitPrice,
          unitCost,
          subtotal: itemSubtotal,
          tenantId: tenant.id
        })
      }
      
      const tax = Math.round(subtotal * 0.19) // IVA 19%
      const total = subtotal + tax
      
      // Calcular vuelto si es efectivo
      const cashReceived = paymentMethod === PaymentMethod.CASH 
        ? Math.ceil(total / 1000) * 1000 // Redondear a mil más cercano
        : null
      const change = cashReceived ? cashReceived - total : null
      
      const sale = await prisma.sale.create({
        data: {
          saleNumber: `${String(saleNumber).padStart(6, '0')}`,
          subtotal,
          tax,
          total,
          paymentMethod,
          cashReceived,
          change,
          status: 'COMPLETED',
          userId: usuario.id,
          tenantId: tenant.id,
          createdAt: fechaVenta,
          updatedAt: fechaVenta,
          items: {
            create: items
          }
        }
      })
      
      ventas.push(sale)
      saleNumber++
      
      // Actualizar stock (restar del inventario)
      for (const item of items) {
        await prisma.tenantInventory.update({
          where: { id: item.tenantInventoryId },
          data: { stock: { decrement: item.quantity } }
        })
      }
    }
  }
  
  console.log(`✅ ${ventas.length} ventas históricas creadas\n`)
  return ventas
}

/**
 * Crea movimientos de inventario (compras, mermas, correcciones)
 */
async function crearMovimientosInventario(tenants: any[], usuarios: any[]) {
  console.log('📊 Creando movimientos de inventario...')
  
  const movimientos = []
  
  for (const tenant of tenants) {
    // Obtener usuarios del tenant
    const usuariosTenant = usuarios.filter(u => u.tenantId === tenant.id)
    if (usuariosTenant.length === 0) continue
    
    // Obtener inventario del tenant
    const inventario = await prisma.tenantInventory.findMany({
      where: { tenantId: tenant.id, isActive: true }
    })
    
    if (inventario.length === 0) continue
    
    // Crear 5-15 movimientos de inventario por tenant
    const numMovimientos = Math.floor(Math.random() * 10) + 5
    
    for (let i = 0; i < numMovimientos; i++) {
      const producto = inventario[Math.floor(Math.random() * inventario.length)]
      const usuario = usuariosTenant[Math.floor(Math.random() * usuariosTenant.length)]
      const fechaMovimiento = fechaAleatoria(90)
      
      // Tipo de movimiento
      const tipos = [
        { type: AdjustmentType.PURCHASE, quantity: Math.floor(Math.random() * 50) + 10, reason: 'Compra a proveedor' },
        { type: AdjustmentType.LOSS, quantity: -(Math.floor(Math.random() * 5) + 1), reason: 'Producto vencido' },
        { type: AdjustmentType.CORRECTION, quantity: Math.floor(Math.random() * 10) - 5, reason: 'Corrección de inventario' },
        { type: AdjustmentType.RETURN, quantity: Math.floor(Math.random() * 5) + 1, reason: 'Devolución de cliente' }
      ]
      
      const movimiento = tipos[Math.floor(Math.random() * tipos.length)]
      
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
      })
      
      movimientos.push(adjustment)
      
      // Actualizar stock
      await prisma.tenantInventory.update({
        where: { id: producto.id },
        data: { stock: { increment: movimiento.quantity } }
      })
    }
  }
  
  console.log(`✅ ${movimientos.length} movimientos de inventario creados\n`)
  return movimientos
}

/**
 * Función principal
 */
async function main() {
  console.log('\n🚀 Iniciando población completa de datos para CRTLPyme\n')
  console.log('=' .repeat(60))
  console.log('\n')
  
  try {
    // 1. Limpiar base de datos si se especifica
    if (CLEAN_DATABASE) {
      await limpiarBaseDatos()
    }
    
    // 2. Crear planes de suscripción
    const planes = await crearPlanesSuscripcion()
    
    // 3. Importar productos
    const productos = await importarProductos(500)
    
    // 4. Crear usuario administrador
    const { admin, platformTenant } = await crearAdminPlataforma()
    
    // 5. Crear negocios
    const tenants = await crearNegocios()
    
    // 6. Crear usuarios para negocios
    const usuarios = await crearUsuariosNegocios(tenants)
    
    // 7. Crear inventario
    const inventarios = await crearInventario(tenants, productos)
    
    // 8. Crear suscripciones
    const suscripciones = await crearSuscripciones(tenants, planes)
    
    // 9. Crear ventas históricas
    const ventas = await crearVentasHistoricas(tenants, usuarios)
    
    // 10. Crear movimientos de inventario
    const movimientos = await crearMovimientosInventario(tenants, usuarios)
    
    // Resumen
    console.log('\n' + '=' .repeat(60))
    console.log('\n✨ POBLACIÓN DE DATOS COMPLETADA EXITOSAMENTE ✨\n')
    console.log('=' .repeat(60))
    console.log('\n📊 RESUMEN:\n')
    console.log(`   ✓ Planes de suscripción: ${planes.length}`)
    console.log(`   ✓ Productos en catálogo maestro: ${productos.length}`)
    console.log(`   ✓ Negocios PyME: ${tenants.length}`)
    console.log(`   ✓ Usuarios totales: ${usuarios.length + 1} (incluye admin)`)
    console.log(`   ✓ Productos en inventario: ${inventarios.length}`)
    console.log(`   ✓ Suscripciones activas: ${suscripciones.length}`)
    console.log(`   ✓ Ventas históricas: ${ventas.length}`)
    console.log(`   ✓ Movimientos de inventario: ${movimientos.length}`)
    console.log('\n' + '=' .repeat(60))
    console.log('\n🔐 CREDENCIALES DE ACCESO - PRODUCCIÓN:\n')
    console.log('   👨‍💼 Administrador de Plataforma:')
    console.log('      Email: admin@crtlpyme.cl')
    console.log('      Contraseña: CRTLPyme2025!Admin')
    console.log('      Rol: PROVEEDOR (Super Admin)')
    console.log('\n   👥 Usuarios de Negocios:')
    console.log('      Contraseña para todos: CRTLPyme2025!User')
    console.log('      Email: admin@[dominio-del-negocio]')
    console.log('\n' + '=' .repeat(60))
    console.log('\n💡 PRÓXIMOS PASOS:\n')
    console.log('   1. Ejecutar migraciones: npm run prisma migrate dev')
    console.log('   2. Iniciar la aplicación: npm run dev')
    console.log('   3. Acceder a http://localhost:3000')
    console.log('   4. Iniciar sesión con las credenciales del administrador')
    console.log('\n' + '=' .repeat(60) + '\n')
    
  } catch (error) {
    console.error('\n❌ Error durante la población de datos:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Ejecutar script
main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
