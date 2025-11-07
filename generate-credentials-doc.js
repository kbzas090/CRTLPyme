const { PrismaClient } = require('@prisma/client');
const fs = require('fs');

async function generateCredentialsDoc() {
  const prisma = new PrismaClient();
  
  try {
    console.log('📝 Generando documento de credenciales...\n');
    
    // Obtener todos los usuarios de prueba
    const testUsers = await prisma.user.findMany({
      where: {
        email: {
          contains: '.test@'
        }
      },
      include: {
        tenant: true
      },
      orderBy: [
        { tenantId: 'asc' },
        { role: 'asc' }
      ]
    });
    
    // Obtener estadísticas de la base de datos
    const stats = {
      tenants: await prisma.tenant.count(),
      users: await prisma.user.count(),
      masterProducts: await prisma.masterProduct.count(),
      inventory: await prisma.tenantInventory.count(),
      sales: await prisma.sale.count()
    };
    
    // Obtener URLs de APIs principales
    const apiRoutes = [
      { path: '/api/auth/[...nextauth]', description: 'Autenticación NextAuth' },
      { path: '/api/auth/register', description: 'Registro de usuarios' },
      { path: '/api/products', description: 'Gestión de productos' },
      { path: '/api/inventory', description: 'Gestión de inventario' },
      { path: '/api/sales', description: 'Gestión de ventas' },
      { path: '/api/admin-saas/tenants', description: 'Administración de tenants' },
      { path: '/api/admin-saas/master-products', description: 'Catálogo maestro de productos' },
      { path: '/api/subscriptions', description: 'Gestión de suscripciones' },
      { path: '/api/payments', description: 'Procesamiento de pagos' }
    ];
    
    // Generar contenido del documento
    let content = `# 🔐 Credenciales y Acceso - CRTLPyme

**Generado:** ${new Date().toLocaleString('es-CL', { timeZone: 'America/Santiago' })}

---

## 📋 Índice

1. [Información General](#información-general)
2. [Base de Datos Cloud SQL](#base-de-datos-cloud-sql)
3. [Credenciales de Acceso GCP](#credenciales-de-acceso-gcp)
4. [Usuarios de Prueba](#usuarios-de-prueba)
5. [APIs Principales](#apis-principales)
6. [Configuración del Backend](#configuración-del-backend)
7. [Estadísticas de la Base de Datos](#estadísticas-de-la-base-de-datos)
8. [Instrucciones de Acceso](#instrucciones-de-acceso)
9. [Troubleshooting](#troubleshooting)

---

## 🎯 Información General

### Proyecto
- **Nombre:** CRTLPyme - Sistema POS Multi-Tenant SaaS
- **Descripción:** Plataforma de punto de venta para pequeñas y medianas empresas en Chile
- **Stack:** Next.js 14, Prisma, PostgreSQL, NextAuth, Transbank
- **Ubicación del código:** \`/home/ubuntu/github_repos/CRTLPyme\`

### Estado del Sistema
- ✅ Base de datos poblada y operativa
- ✅ ${stats.tenants} tenants activos
- ✅ ${stats.users} usuarios registrados
- ✅ ${stats.masterProducts} productos en catálogo maestro
- ✅ ${stats.inventory} items en inventarios de tenants
- ✅ ${stats.sales} ventas registradas

---

## 🗄️ Base de Datos Cloud SQL

### Información de Conexión

\`\`\`
Proveedor:      Google Cloud Platform (GCP)
Instancia:      crtlpyme-db
Motor:          PostgreSQL 15
IP:             136.116.45.158
Puerto:         5432
Base de Datos:  crtlpyme
Usuario:        postgres
Contraseña:     CRTLPyme2025!
\`\`\`

### String de Conexión

\`\`\`
postgresql://postgres:CRTLPyme2025%21@136.116.45.158:5432/crtlpyme?schema=public&sslmode=require
\`\`\`

### Conexión Directa (psql)

\`\`\`bash
psql "postgresql://postgres:CRTLPyme2025!@136.116.45.158:5432/crtlpyme?sslmode=require"
\`\`\`

---

## ☁️ Credenciales de Acceso GCP

### Cuenta Google Cloud

\`\`\`
Email:          crtlpyme@gmail.com
Contraseña:     Duoc_2025
Proyecto:       [Nombre del proyecto en GCP]
\`\`\`

### Acceso a GCP Console
1. Ir a: https://console.cloud.google.com
2. Iniciar sesión con las credenciales de arriba
3. Seleccionar el proyecto CRTLPyme
4. Navegar a "SQL" para administrar la base de datos

---

## 👥 Usuarios de Prueba

### ⚠️ IMPORTANTE
**Contraseña para TODOS los usuarios de prueba:** \`Test123!\`

### Tenant Principal: CRTLPyme - Plataforma

`;

    // Agrupar usuarios por tenant
    const usersByTenant = {};
    testUsers.forEach(user => {
      const tenantName = user.tenant.businessName;
      if (!usersByTenant[tenantName]) {
        usersByTenant[tenantName] = [];
      }
      usersByTenant[tenantName].push(user);
    });
    
    // Generar tabla de usuarios por tenant
    Object.entries(usersByTenant).forEach(([tenantName, users]) => {
      content += `\n#### ${tenantName}\n\n`;
      content += `| Email | Nombre | Role | ID |\n`;
      content += `|-------|--------|------|----|\n`;
      users.forEach(user => {
        content += `| ${user.email} | ${user.firstName} ${user.lastName} | ${user.role} | \`${user.id}\` |\n`;
      });
    });
    
    content += `

### Roles Disponibles

| Role | Descripción | Permisos |
|------|-------------|----------|
| **PROVEEDOR** | Administrador de Plataforma | Acceso completo al sistema, gestión de tenants |
| **ADMIN** | Administrador de Tenant | Gestión completa del negocio, usuarios, productos |
| **CAJA** | Cajero/Vendedor | Realizar ventas, abrir/cerrar caja |
| **INVENTARIO** | Gestor de Inventario | Gestión de productos y stock |
| **SOPORTE** | Soporte Técnico | Acceso de lectura, asistencia a usuarios |

---

## 🔌 APIs Principales

### URL Base (Local Development)
\`\`\`
http://localhost:3000
\`\`\`

### Endpoints Principales

`;

    apiRoutes.forEach(route => {
      content += `#### ${route.path}\n`;
      content += `**Descripción:** ${route.description}\n\n`;
      content += `\`\`\`\nGET/POST http://localhost:3000${route.path}\n\`\`\`\n\n`;
    });
    
    content += `

### Autenticación

Las APIs utilizan **NextAuth** con estrategia JWT. Para autenticarse:

1. **Login:**
   \`\`\`
   POST /api/auth/callback/credentials
   Content-Type: application/json
   
   {
     "email": "admin.test@crtlpyme.cl",
     "password": "Test123!"
   }
   \`\`\`

2. **Obtener Sesión:**
   \`\`\`
   GET /api/auth/session
   \`\`\`

---

## ⚙️ Configuración del Backend

### Archivo .env

El proyecto utiliza las siguientes variables de entorno:

\`\`\`env
# Base de Datos
DATABASE_URL="postgresql://postgres:CRTLPyme2025%21@136.116.45.158:5432/crtlpyme?schema=public&sslmode=require"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your_nextauth_secret_here"

# SendGrid (Email)
SENDGRID_API_KEY="your_sendgrid_api_key_here"
SENDGRID_FROM_EMAIL="kbzas090@gmail.com"

# Transbank (Pagos)
TRANSBANK_API_KEY="your_transbank_api_key_here"
TRANSBANK_COMMERCE_CODE="597055555532"
TRANSBANK_ENVIRONMENT="integration"
\`\`\`

### Prisma Schema

- **Ubicación:** \`/prisma/schema.prisma\`
- **Modelos principales:**
  - \`Tenant\` - Multi-tenancy
  - \`User\` - Usuarios
  - \`MasterProduct\` - Catálogo maestro
  - \`TenantInventory\` - Inventario por tenant
  - \`Sale\` - Ventas
  - \`CashSession\` - Sesiones de caja
  - \`Subscription\` - Suscripciones
  - \`SubscriptionPayment\` - Pagos

---

## 📊 Estadísticas de la Base de Datos

### Resumen General

\`\`\`
Tenants:               ${stats.tenants}
Usuarios:              ${stats.users}
Productos Maestros:    ${stats.masterProducts}
Items en Inventario:   ${stats.inventory}
Ventas Registradas:    ${stats.sales}
\`\`\`

### Desglose por Categorías (Productos)

Principales categorías de productos:
- Alimentos y Abarrotes: ~120 productos
- Bebidas: ~80 productos
- Limpieza y Hogar: ~70 productos
- Snacks y Confitería: ~60 productos
- Cuidado Personal: ~60 productos
- Lácteos y Refrigerados: ~50 productos
- Electrónica y Accesorios: ~40 productos
- Otros: ~20 productos

---

## 🚀 Instrucciones de Acceso

### 1. Iniciar el Servidor de Desarrollo

\`\`\`bash
cd /home/ubuntu/github_repos/CRTLPyme
npm install
npm run dev
\`\`\`

El servidor estará disponible en: http://localhost:3000

### 2. Acceder a la Plataforma

1. Abrir navegador en: http://localhost:3000
2. Click en "Iniciar Sesión" o ir a: http://localhost:3000/auth/login
3. Usar cualquiera de los usuarios de prueba listados arriba
4. Contraseña: \`Test123!\`

### 3. Navegar por Módulos

Según el rol del usuario, tendrás acceso a:

- **ADMIN/PROVEEDOR:**
  - Dashboard general
  - Gestión de productos
  - Gestión de inventario
  - Reportes de ventas
  - Administración de usuarios
  - Configuración

- **CAJA:**
  - Punto de venta
  - Historial de ventas
  - Apertura/Cierre de caja

- **INVENTARIO:**
  - Gestión de inventario
  - Ajustes de stock
  - Alertas de stock bajo

### 4. Probar Funcionalidades

#### Login
\`\`\`bash
# Ejemplo con curl
curl -X POST http://localhost:3000/api/auth/callback/credentials \\
  -H "Content-Type: application/json" \\
  -d '{"email":"admin.test@crtlpyme.cl","password":"Test123!"}'
\`\`\`

#### Listar Productos
\`\`\`bash
# Requiere sesión activa
curl http://localhost:3000/api/products \\
  -H "Cookie: next-auth.session-token=YOUR_TOKEN"
\`\`\`

---

## 🔧 Troubleshooting

### Problema: No puedo conectarme a la base de datos

**Solución:**
1. Verificar que la IP de Cloud SQL sea accesible
2. Verificar credenciales en \`.env\`
3. Probar conexión directa:
   \`\`\`bash
   cd /home/ubuntu/github_repos/CRTLPyme
   node -e "const {PrismaClient} = require('@prisma/client'); const p = new PrismaClient(); p.\\$connect().then(() => console.log('✅ Conexión OK')).catch(e => console.error('❌', e))"
   \`\`\`

### Problema: Login falla con usuario de prueba

**Solución:**
1. Verificar que la contraseña sea exactamente: \`Test123!\`
2. Verificar que el usuario esté activo en la base de datos
3. Revisar logs del servidor (consola donde corre \`npm run dev\`)
4. Intentar resetear la contraseña del usuario

### Problema: APIs devuelven 401 Unauthorized

**Solución:**
1. Verificar que la sesión esté activa
2. Verificar que el token JWT sea válido
3. Verificar que el usuario tenga permisos para la acción
4. Revisar configuración de NEXTAUTH_SECRET en \`.env\`

### Problema: Prisma no encuentra la base de datos

**Solución:**
1. Regenerar el cliente de Prisma:
   \`\`\`bash
   cd /home/ubuntu/github_repos/CRTLPyme
   npx prisma generate
   \`\`\`

2. Verificar la migración:
   \`\`\`bash
   npx prisma migrate status
   \`\`\`

---

## 📞 Información de Soporte

### Recursos del Proyecto

- **Repositorio:** \`/home/ubuntu/github_repos/CRTLPyme\`
- **Documentación:** Ver archivos \`*.md\` en el directorio del proyecto
- **Logs:** Console del navegador (F12) y terminal donde corre el servidor

### Scripts Útiles

\`\`\`bash
# Verificar estado de la base de datos
cd /home/ubuntu/github_repos/CRTLPyme
node test-db-connection.js

# Ver información detallada
node verify-apis.js

# Crear más usuarios de prueba
node create-test-users.js
\`\`\`

---

## ✅ Checklist de Verificación

Antes de comenzar pruebas, verificar que:

- [ ] La base de datos Cloud SQL esté accesible
- [ ] El archivo \`.env\` tenga las credenciales correctas
- [ ] Prisma Client esté generado (\`npx prisma generate\`)
- [ ] El servidor de desarrollo esté corriendo (\`npm run dev\`)
- [ ] Al menos un usuario de prueba funcione para login
- [ ] Las APIs principales respondan correctamente

---

**Fin del documento** | Generado automáticamente por el sistema CRTLPyme
`;

    // Guardar el documento
    const outputPath = '/home/ubuntu/credenciales_crtlpyme.md';
    fs.writeFileSync(outputPath, content);
    
    console.log(`✅ Documento generado exitosamente:`);
    console.log(`   ${outputPath}`);
    console.log(`\n📄 Tamaño: ${(content.length / 1024).toFixed(2)} KB`);
    console.log(`📝 Líneas: ${content.split('\n').length}`);
    
  } catch (error) {
    console.error('❌ Error al generar documento:', error);
  } finally {
    await prisma.$disconnect();
  }
}

generateCredentialsDoc();
