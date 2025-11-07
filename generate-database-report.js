const { PrismaClient } = require('@prisma/client');
const fs = require('fs');

const prisma = new PrismaClient();

async function generateReport() {
  console.log('\n📊 Generando reporte completo de la base de datos CRTLPyme...\n');
  
  try {
    // 1. Conteo de registros por tabla
    const counts = {
      subscriptionPlans: await prisma.subscriptionPlan.count(),
      tenants: await prisma.tenant.count(),
      users: await prisma.user.count(),
      masterProducts: await prisma.masterProduct.count(),
      tenantInventories: await prisma.tenantInventory.count(),
      sales: await prisma.sale.count(),
      stockAdjustments: await prisma.stockAdjustment.count(),
      subscriptions: await prisma.subscription.count(),
      subscriptionPayments: await prisma.subscriptionPayment.count(),
    };
    
    // 2. Obtener todos los usuarios organizados por rol y tenant
    const users = await prisma.user.findMany({
      include: {
        tenant: {
          select: {
            businessName: true,
            email: true,
            planType: true
          }
        }
      },
      orderBy: [
        { role: 'asc' },
        { tenantId: 'asc' }
      ]
    });
    
    // 3. Obtener todos los tenants con información de suscripciones
    const tenants = await prisma.tenant.findMany({
      include: {
        subscriptions: {
          where: { status: 'ACTIVE' },
          include: {
            plan: true
          }
        },
        users: {
          select: {
            email: true,
            role: true,
            firstName: true,
            lastName: true
          }
        }
      },
      orderBy: { businessName: 'asc' }
    });
    
    // 4. Obtener planes de suscripción
    const plans = await prisma.subscriptionPlan.findMany({
      orderBy: { price: 'asc' }
    });
    
    // 5. Obtener algunos productos de muestra
    const sampleProducts = await prisma.masterProduct.findMany({
      take: 10,
      orderBy: { name: 'asc' }
    });
    
    // Crear el reporte
    let report = '';
    
    report += '═══════════════════════════════════════════════════════════════════════\n';
    report += '              REPORTE COMPLETO DE BASE DE DATOS CRTLPYME\n';
    report += '═══════════════════════════════════════════════════════════════════════\n\n';
    
    report += '📊 RESUMEN GENERAL DE LA BASE DE DATOS\n';
    report += '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n';
    report += `   • Planes de Suscripción:        ${counts.subscriptionPlans}\n`;
    report += `   • Negocios (Tenants):           ${counts.tenants}\n`;
    report += `   • Usuarios Totales:             ${counts.users}\n`;
    report += `   • Productos en Catálogo Maestro: ${counts.masterProducts}\n`;
    report += `   • Items en Inventario:          ${counts.tenantInventories}\n`;
    report += `   • Ventas Registradas:           ${counts.sales}\n`;
    report += `   • Ajustes de Stock:             ${counts.stockAdjustments}\n`;
    report += `   • Suscripciones Activas:        ${counts.subscriptions}\n`;
    report += `   • Pagos de Suscripción:         ${counts.subscriptionPayments}\n\n`;
    
    // Planes de suscripción
    report += '═══════════════════════════════════════════════════════════════════════\n';
    report += '📦 PLANES DE SUSCRIPCIÓN DISPONIBLES\n';
    report += '═══════════════════════════════════════════════════════════════════════\n\n';
    
    plans.forEach((plan, index) => {
      report += `${index + 1}. ${plan.name}\n`;
      report += `   • Precio: $${plan.price.toLocaleString('es-CL')} CLP/${plan.billingCycle === 'MONTHLY' ? 'mes' : 'año'}\n`;
      report += `   • Días de prueba: ${plan.trialDays} días\n`;
      report += `   • Descripción: ${plan.description}\n`;
      const features = JSON.parse(plan.features || '[]');
      if (features.length > 0) {
        report += `   • Características:\n`;
        features.forEach(f => report += `     - ${f}\n`);
      }
      report += '\n';
    });
    
    // Usuarios por rol
    report += '═══════════════════════════════════════════════════════════════════════\n';
    report += '🔐 CREDENCIALES DE USUARIOS\n';
    report += '═══════════════════════════════════════════════════════════════════════\n\n';
    report += '⚠️  CONTRASEÑAS ESTÁNDAR:\n';
    report += '   • Administrador de Plataforma: Admin2025!\n';
    report += '   • Todos los demás usuarios:    Demo2025!\n\n';
    report += '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n';
    
    // Agrupar usuarios por rol
    const usersByRole = {
      PROVEEDOR: [],
      ADMIN: [],
      CAJA: [],
      INVENTARIO: []
    };
    
    users.forEach(user => {
      if (usersByRole[user.role]) {
        usersByRole[user.role].push(user);
      }
    });
    
    // Administrador de Plataforma (Super Admin)
    if (usersByRole.PROVEEDOR.length > 0) {
      report += '👨‍💼 ADMINISTRADOR DE PLATAFORMA (Super Admin / Proveedor)\n';
      report += '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n';
      usersByRole.PROVEEDOR.forEach(user => {
        report += `Email:      ${user.email}\n`;
        report += `Contraseña: Admin2025!\n`;
        report += `Nombre:     ${user.firstName} ${user.lastName}\n`;
        report += `Rol:        PROVEEDOR (Acceso total al sistema)\n`;
        report += `Negocio:    ${user.tenant.businessName}\n\n`;
      });
    }
    
    // Administradores de Negocios
    if (usersByRole.ADMIN.length > 0) {
      report += '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n';
      report += '👥 ADMINISTRADORES DE NEGOCIOS (Business Owners)\n';
      report += '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n';
      
      // Agrupar por tenant
      const adminsByTenant = {};
      usersByRole.ADMIN.forEach(user => {
        const tenantName = user.tenant.businessName;
        if (!adminsByTenant[tenantName]) {
          adminsByTenant[tenantName] = [];
        }
        adminsByTenant[tenantName].push(user);
      });
      
      Object.keys(adminsByTenant).sort().forEach(tenantName => {
        report += `📋 ${tenantName}\n`;
        report += `   Plan: ${adminsByTenant[tenantName][0].tenant.planType}\n\n`;
        adminsByTenant[tenantName].forEach(user => {
          report += `   • Email:      ${user.email}\n`;
          report += `     Contraseña: Demo2025!\n`;
          report += `     Nombre:     ${user.firstName} ${user.lastName}\n`;
          report += `     Rol:        ADMIN (Administrador del negocio)\n\n`;
        });
      });
    }
    
    // Cajeros
    if (usersByRole.CAJA.length > 0) {
      report += '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n';
      report += '💰 CAJEROS (Sellers / Cashiers)\n';
      report += '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n';
      
      // Agrupar por tenant
      const cashiersByTenant = {};
      usersByRole.CAJA.forEach(user => {
        const tenantName = user.tenant.businessName;
        if (!cashiersByTenant[tenantName]) {
          cashiersByTenant[tenantName] = [];
        }
        cashiersByTenant[tenantName].push(user);
      });
      
      Object.keys(cashiersByTenant).sort().forEach(tenantName => {
        report += `📋 ${tenantName}\n\n`;
        cashiersByTenant[tenantName].forEach(user => {
          report += `   • Email:      ${user.email}\n`;
          report += `     Contraseña: Demo2025!\n`;
          report += `     Nombre:     ${user.firstName} ${user.lastName}\n`;
          report += `     Rol:        CAJA (Cajero/Vendedor)\n\n`;
        });
      });
    }
    
    // Gestores de Inventario
    if (usersByRole.INVENTARIO.length > 0) {
      report += '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n';
      report += '📦 GESTORES DE INVENTARIO (Inventory Managers)\n';
      report += '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n';
      
      // Agrupar por tenant
      const inventoryByTenant = {};
      usersByRole.INVENTARIO.forEach(user => {
        const tenantName = user.tenant.businessName;
        if (!inventoryByTenant[tenantName]) {
          inventoryByTenant[tenantName] = [];
        }
        inventoryByTenant[tenantName].push(user);
      });
      
      Object.keys(inventoryByTenant).sort().forEach(tenantName => {
        report += `📋 ${tenantName}\n\n`;
        inventoryByTenant[tenantName].forEach(user => {
          report += `   • Email:      ${user.email}\n`;
          report += `     Contraseña: Demo2025!\n`;
          report += `     Nombre:     ${user.firstName} ${user.lastName}\n`;
          report += `     Rol:        INVENTARIO (Gestor de Inventario)\n\n`;
        });
      });
    }
    
    // Información de negocios
    report += '═══════════════════════════════════════════════════════════════════════\n';
    report += '🏢 INFORMACIÓN DE NEGOCIOS (TENANTS)\n';
    report += '═══════════════════════════════════════════════════════════════════════\n\n';
    
    tenants.forEach((tenant, index) => {
      report += `${index + 1}. ${tenant.businessName}\n`;
      report += `   • RUT:           ${tenant.rut}\n`;
      report += `   • Email:         ${tenant.email}\n`;
      report += `   • Teléfono:      ${tenant.phone || 'N/A'}\n`;
      report += `   • Dirección:     ${tenant.address || 'N/A'}\n`;
      report += `   • Plan:          ${tenant.planType}\n`;
      report += `   • Estado:        ${tenant.accountStatus}\n`;
      report += `   • Activo:        ${tenant.isActive ? 'Sí' : 'No'}\n`;
      report += `   • Usuarios:      ${tenant.users.length}\n`;
      
      if (tenant.subscriptions.length > 0) {
        const sub = tenant.subscriptions[0];
        report += `   • Suscripción:   ${sub.plan.name} - ${sub.status}\n`;
      }
      report += '\n';
    });
    
    // Muestra de productos
    report += '═══════════════════════════════════════════════════════════════════════\n';
    report += '🛍️  MUESTRA DE PRODUCTOS EN CATÁLOGO MAESTRO\n';
    report += '═══════════════════════════════════════════════════════════════════════\n\n';
    report += `Total de productos: ${counts.masterProducts}\n`;
    report += `Mostrando los primeros 10 productos:\n\n`;
    
    sampleProducts.forEach((product, index) => {
      report += `${index + 1}. ${product.name}\n`;
      report += `   • SKU:      ${product.sku}\n`;
      report += `   • Barcode:  ${product.barcode || 'N/A'}\n`;
      report += `   • Marca:    ${product.brand || 'Sin marca'}\n`;
      report += `   • Categoría: ${product.category}\n`;
      report += `   • Precio Sugerido: $${product.suggestedPrice.toLocaleString('es-CL')} CLP\n\n`;
    });
    
    report += '═══════════════════════════════════════════════════════════════════════\n';
    report += '📝 NOTAS IMPORTANTES\n';
    report += '═══════════════════════════════════════════════════════════════════════\n\n';
    report += '1. Este es un entorno de DEMOSTRACIÓN/DESARROLLO\n';
    report += '2. Las contraseñas son simples para facilitar las pruebas\n';
    report += '3. En producción, las contraseñas deben ser seguras y únicas\n';
    report += '4. Los datos son ficticios para pruebas y desarrollo\n\n';
    
    report += '═══════════════════════════════════════════════════════════════════════\n';
    report += '🚀 PRÓXIMOS PASOS\n';
    report += '═══════════════════════════════════════════════════════════════════════\n\n';
    report += '1. Acceder a la aplicación en: http://localhost:3000\n';
    report += '2. Iniciar sesión con cualquiera de las credenciales listadas arriba\n';
    report += '3. Explorar las funcionalidades según el rol del usuario\n';
    report += '4. Para despliegue en producción:\n';
    report += '   - Cambiar todas las contraseñas\n';
    report += '   - Configurar variables de entorno de producción\n';
    report += '   - Revisar y ajustar configuraciones de seguridad\n\n';
    
    report += '═══════════════════════════════════════════════════════════════════════\n';
    report += `Reporte generado: ${new Date().toLocaleString('es-CL')}\n`;
    report += '═══════════════════════════════════════════════════════════════════════\n';
    
    // Guardar el reporte
    fs.writeFileSync('DATABASE_REPORT.txt', report);
    
    // Mostrar en consola
    console.log(report);
    
    console.log('✅ Reporte guardado en: DATABASE_REPORT.txt\n');
    
  } catch (error) {
    console.error('❌ Error generando reporte:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

generateReport()
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
