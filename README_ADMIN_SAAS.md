# 🚀 Módulo Administrador SaaS - Guía Rápida

## Inicio Rápido (5 minutos)

### 1️⃣ Configurar Base de Datos

```bash
# Asegurarse de que DATABASE_URL esté configurado en .env
echo "DATABASE_URL=postgresql://..." > .env
```

### 2️⃣ Instalar Dependencias

```bash
npm install
```

### 3️⃣ Generar Cliente Prisma

```bash
npx prisma generate
```

### 4️⃣ Ejecutar Seed (Crear Datos de Demo)

```bash
npm run seed:multitenancy
```

**Tiempo estimado:** ~30 segundos  
**Resultado:** 4 tenants, 13 usuarios, 29 productos

### 5️⃣ Iniciar Servidor

```bash
npm run dev
```

**URL:** http://localhost:3000

### 6️⃣ Login como Admin SaaS

```
URL:      http://localhost:3000/auth/login
Email:    admin_saas@crtlpyme.cl
Password: Admin2025!
```

### 7️⃣ Explorar el Dashboard

Automáticamente serás redirigido a: http://localhost:3000/admin-saas

---

## 📋 Credenciales de Acceso

### Administrador SaaS (Acceso Global)
- **Email:** `admin_saas@crtlpyme.cl`
- **Password:** `Admin2025!`
- **Dashboard:** `/admin-saas`

### Tenants Creados

#### 🏪 Minimarket Los Andes
- **Admin:** `admin@minimercadolosandes.cl` / `Admin123!`
- **Caja:** `caja@minimercadolosandes.cl` / `Caja123!`
- **Inventario:** `inventario@minimercadolosandes.cl` / `Inv123!`

#### 🔧 Ferretería El Tornillo
- **Admin:** `admin@ferreteriaeltornillo.cl` / `Admin123!`
- **Caja:** `caja@ferreteriaeltornillo.cl` / `Caja123!`
- **Inventario:** `inventario@ferreteriaeltornillo.cl` / `Inv123!`

#### 📚 Librería Papelito
- **Admin:** `admin@libreriapapelito.cl` / `Admin123!`
- **Caja:** `caja@libreriapapelito.cl` / `Caja123!`

#### 🏬 Almacén Don José
- **Admin:** `admin@almacendonjose.cl` / `Admin123!`
- **Caja:** `caja@almacendonjose.cl` / `Caja123!`
- **Inventario:** `inventario@almacendonjose.cl` / `Inv123!`

---

## 🎯 Funcionalidades Principales

### Dashboard Admin SaaS (`/admin-saas`)
- ✅ Métricas globales del sistema
- ✅ Distribución de planes y roles
- ✅ Top 5 clientes por ventas
- ✅ Estadísticas en tiempo real

### Gestión de Tenants (`/admin-saas/tenants`)
- ✅ Lista de todos los clientes
- ✅ Búsqueda y filtros
- ✅ Estadísticas por tenant
- ✅ Ver detalles completos

### Detalle de Tenant (`/admin-saas/tenants/[id]`)
- ✅ Información completa del negocio
- ✅ Usuarios del tenant
- ✅ Productos del catálogo
- ✅ Ventas recientes
- ✅ Gastos fijos

### Estadísticas (`/admin-saas/stats`)
- ✅ Métricas avanzadas
- ✅ Distribución de usuarios por rol
- ✅ Análisis de planes
- ✅ Top performers

---

## 🧪 Verificar Aislamiento de Datos

### Prueba 1: Admin de Minimarket
```bash
# Login con: admin@minimercadolosandes.cl
# Navegar a: /admin/inventory
# Resultado: Solo ve 8 productos (MM-001 a MM-008)
```

### Prueba 2: Admin de Ferretería
```bash
# Login con: admin@ferreteriaeltornillo.cl
# Navegar a: /admin/inventory
# Resultado: Solo ve 7 productos (FE-001 a FE-007)
```

### Prueba 3: Admin SaaS
```bash
# Login con: admin_saas@crtlpyme.cl
# Navegar a: /admin-saas/tenants
# Resultado: Ve todos los 4 tenants y sus datos
```

---

## 📡 APIs Disponibles

### Listar Tenants
```bash
GET /api/admin-saas/tenants
```

### Obtener Detalle de Tenant
```bash
GET /api/admin-saas/tenants/{id}
```

### Listar Usuarios de Tenant
```bash
GET /api/admin-saas/tenants/{id}/users
```

### Listar Productos de Tenant
```bash
GET /api/admin-saas/tenants/{id}/products
```

### Estadísticas Globales
```bash
GET /api/admin-saas/stats
```

**Nota:** Todas requieren autenticación con rol `PROVEEDOR`

---

## 📊 Estadísticas del Sistema

| Métrica | Valor |
|---------|-------|
| Tenants Creados | 4 |
| Usuarios Totales | 13 |
| Productos Totales | 29 |
| Administradores SaaS | 1 |
| Planes BASIC | 3 |
| Planes PRO | 1 |

---

## 🔧 Comandos Útiles

```bash
# Ver base de datos con Prisma Studio
npx prisma studio

# Reiniciar base de datos (⚠️ BORRA TODO)
npx prisma migrate reset

# Volver a ejecutar seed
npm run seed:multitenancy

# Ver logs del servidor
npm run dev | grep "admin-saas"

# Build para producción
npm run build
```

---

## 📚 Documentación Completa

Para documentación detallada, ver:
- **Archivo:** `Modulo_Admin_SaaS_CRTLPyme.md`
- **PDF:** `Modulo_Admin_SaaS_CRTLPyme.pdf`

---

## ⚠️ Notas Importantes

1. **Primera vez:** Siempre ejecutar `npm run seed:multitenancy` después de configurar la base de datos
2. **Producción:** Cambiar todas las contraseñas antes de desplegar
3. **Base de datos:** El seed puede ejecutarse múltiples veces (usa `upsert`)
4. **Permisos:** Solo usuarios con rol `PROVEEDOR` pueden acceder a `/admin-saas`

---

## 🐛 Troubleshooting

### Error: "Can't reach database server"
```bash
# Verificar DATABASE_URL en .env
cat .env | grep DATABASE_URL

# Verificar conexión
npx prisma db pull
```

### Error: "Prisma client not generated"
```bash
npx prisma generate
```

### Error: "User not found" al login
```bash
# Ejecutar seed de nuevo
npm run seed:multitenancy
```

### No aparecen datos en UI
```bash
# Verificar que el seed se ejecutó correctamente
npx prisma studio
# Contar registros en tablas: tenants, users, products
```

---

## 🎉 ¡Listo!

El módulo de Administrador SaaS está completamente funcional y listo para demostrar la capacidad multi-tenant del sistema CRTLPyme.

**Siguiente paso:** Explorar el dashboard en `/admin-saas` 🚀
