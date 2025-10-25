# 🚀 Instrucciones para Deployment en Producción

**Fecha**: 2025-10-25  
**Proyecto**: CRTLPyme MVP  
**Objetivo**: Aplicar migraciones y poblar productos maestros en producción

---

## 📋 Resumen de Cambios

Se implementó el **Sistema de Pool Compartido de Productos** que incluye:

- ✅ **Nueva arquitectura de datos**:
  - `master_products`: Catálogo compartido de productos
  - `tenant_inventory`: Inventario específico por tenant
  
- ✅ **Migración de datos existentes**: Los productos actuales se convierten en productos maestros
- ✅ **30 productos maestros**: Listos para poblar en producción
- ✅ **APIs y UI actualizadas**: Todo el código ya está en GitHub (commit `1316e21`)

---

## ⚠️ IMPORTANTE: Limitación de Conectividad

Por restricciones de red del entorno actual, **no es posible conectarse directamente a Supabase** desde aquí. Por lo tanto, la migración debe ejecutarse desde:

1. **Tu máquina local** (RECOMENDADO)
2. **Supabase SQL Editor** (alternativa manual)
3. **Vercel CLI** (alternativa desde deployment)

---

## 🎯 Opción 1: Ejecutar desde tu Máquina Local (RECOMENDADO)

Esta es la forma más sencilla y segura.

### Paso 1: Clonar el repositorio (si no lo tienes)

```bash
git clone https://github.com/kbzas090/CRTLPyme.git
cd CRTLPyme
```

### Paso 2: Asegurarte de tener los últimos cambios

```bash
git pull origin main
```

### Paso 3: Instalar dependencias

```bash
npm install --legacy-peer-deps
```

### Paso 4: Configurar la variable de entorno

```bash
export DATABASE_URL="postgresql://postgres:CrtlPyme_2025@db.bxfetsflhxhigacuqtfe.supabase.co:5432/postgres"
```

### Paso 5: Aplicar las migraciones

**Opción A - Usando el script automatizado:**
```bash
./scripts/apply-production-migration.sh
```

**Opción B - Manualmente con Prisma:**
```bash
npx prisma migrate deploy
```

### Paso 6: Verificar que la migración fue exitosa

```bash
npx prisma migrate status
```

Deberías ver algo como:
```
✅ All migrations have been applied.
```

### Paso 7: Poblar los productos maestros

```bash
npm run seed:master-products
```

Deberías ver:
```
✅ 30 productos maestros creados exitosamente
```

### Paso 8: Verificar en la base de datos

Puedes verificar desde Supabase SQL Editor:

```sql
-- Ver productos maestros
SELECT COUNT(*) FROM master_products;

-- Ver inventario de tenants
SELECT COUNT(*) FROM tenant_inventory;

-- Ver que products_legacy existe (datos históricos)
SELECT COUNT(*) FROM products_legacy;
```

---

## 🎯 Opción 2: Ejecutar en Supabase SQL Editor

Si prefieres ejecutar manualmente desde Supabase:

### Paso 1: Acceder a Supabase

1. Ve a [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Selecciona tu proyecto
3. Ve a **SQL Editor**

### Paso 2: Ejecutar el script de migración

Copia y pega el contenido del archivo:
`prisma/migrations/20251025141836_add_master_products_and_tenant_inventory/migration.sql`

### Paso 3: Ejecutar el script de seed

Para poblar los productos maestros, necesitarás ejecutar el seed desde tu máquina local:

```bash
export DATABASE_URL="postgresql://postgres:CrtlPyme_2025@db.bxfetsflhxhigacuqtfe.supabase.co:5432/postgres"
npm run seed:master-products
```

---

## 🎯 Opción 3: Verificar Deployment Automático de Vercel

Vercel debería haber detectado automáticamente el commit `1316e21` y ejecutado un deployment.

### Verificar el deployment:

1. Ve a [Vercel Dashboard](https://vercel.com/dashboard)
2. Selecciona el proyecto `crtlpyme-mvp-temp`
3. Ve a la pestaña **Deployments**
4. Verifica que el último deployment incluya el commit `1316e21`

### Si el deployment no se ejecutó automáticamente:

**Opción A - Redeploy desde Vercel:**
1. En la pestaña **Deployments**
2. Haz clic en los tres puntos (...) del último deployment
3. Selecciona **Redeploy**
4. Desmarca "Use existing Build Cache"
5. Haz clic en **Redeploy**

**Opción B - Forzar desde Git:**
```bash
git commit --allow-empty -m "Trigger Vercel deployment"
git push origin main
```

### ⚠️ IMPORTANTE: Las migraciones NO se ejecutan automáticamente en Vercel

Aunque Vercel haga el deployment del código, **las migraciones de base de datos deben ejecutarse manualmente** usando la Opción 1 o 2 anterior.

---

## 🔍 Verificación Final

Una vez completados los pasos anteriores, verifica:

### 1. Base de datos

Ejecuta en Supabase SQL Editor:

```sql
-- Verificar tablas creadas
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('master_products', 'tenant_inventory', 'products_legacy');

-- Contar productos maestros
SELECT COUNT(*) as total_master_products FROM master_products;

-- Contar inventarios por tenant
SELECT 
    t.name as tenant_name,
    COUNT(ti.id) as products_count
FROM tenants t
LEFT JOIN tenant_inventory ti ON t.id = ti."tenantId"
GROUP BY t.id, t.name;
```

### 2. Deployment en Vercel

1. Accede a tu aplicación en Vercel: `https://[tu-dominio].vercel.app`
2. Inicia sesión como admin
3. Ve a **Productos** → **Catálogo Compartido**
4. Deberías ver los 30 productos maestros
5. Ve a **Productos** → **Mi Inventario**
6. Deberías poder agregar productos del pool compartido

### 3. Verificar Variables de Entorno en Vercel

Asegúrate de que Vercel tenga configuradas todas las variables:

1. Ve a **Settings** → **Environment Variables**
2. Verifica que existan:
   ```
   DATABASE_URL=postgresql://postgres:CrtlPyme_2025@db.bxfetsflhxhigacuqtfe.supabase.co:5432/postgres
   NEXTAUTH_URL=https://[tu-dominio].vercel.app
   NEXTAUTH_SECRET=[tu-secret]
   NODE_ENV=production
   ```

---

## 🐛 Troubleshooting

### Problema: "Can't reach database server"

**Solución**: Asegúrate de estar ejecutando desde una máquina con acceso a internet y que Supabase permita conexiones desde tu IP.

Para Vercel, usa la URL de Connection Pooling:
```
postgresql://postgres.bxfetsflhxhigacuqtfe:[PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres
```

### Problema: "Table already exists"

**Solución**: La migración ya fue aplicada. Verifica con:
```bash
npx prisma migrate status
```

### Problema: "No se ven los productos en la UI"

**Posibles causas**:
1. El seed no se ejecutó → Ejecuta `npm run seed:master-products`
2. El deployment de Vercel no se actualizó → Fuerza un redeploy
3. Caché del navegador → Presiona Ctrl+Shift+R para refrescar

### Problema: "Error en el build de Vercel"

**Solución**: Revisa los logs del deployment en Vercel. Errores comunes:
- Variables de entorno faltantes
- Prisma client no generado (debe estar en el build command)

---

## 📊 Estructura de Datos Resultante

Después de aplicar las migraciones:

```
┌─────────────────────┐
│  master_products    │  ← Pool compartido de productos
│  (30 productos)     │
└─────────────────────┘
         ↓ (FK)
┌─────────────────────┐
│  tenant_inventory   │  ← Inventario por tenant
│  (uno por tenant)   │     (precios, stock, SKU custom)
└─────────────────────┘
         ↓ (FK)
┌─────────────────────┐
│    sale_items       │  ← Ventas por tenant
└─────────────────────┘

┌─────────────────────┐
│  products_legacy    │  ← Datos históricos (NO SE USA)
└─────────────────────┘
```

---

## 📝 Checklist de Deployment

Marca cada item cuando lo completes:

- [ ] **1. Código actualizado en GitHub** (commit `1316e21`) ✅ YA HECHO
- [ ] **2. Migraciones aplicadas en producción**
  - [ ] Tabla `master_products` creada
  - [ ] Tabla `tenant_inventory` creada
  - [ ] Datos migrados de `products` → `products_legacy`
  - [ ] Referencias actualizadas en `sale_items` y `stock_adjustments`
- [ ] **3. Productos maestros poblados** (30 productos)
- [ ] **4. Deployment en Vercel actualizado**
  - [ ] Build exitoso
  - [ ] Variables de entorno configuradas
  - [ ] Aplicación accesible
- [ ] **5. Verificación funcional**
  - [ ] Login funciona
  - [ ] Se ven productos en Catálogo Compartido
  - [ ] Se pueden agregar productos al inventario
  - [ ] Se pueden realizar ventas

---

## 🆘 ¿Necesitas Ayuda?

Si encuentras algún problema durante el deployment:

1. **Revisa los logs** de Vercel en la sección Deployments
2. **Verifica las migraciones** con `npx prisma migrate status`
3. **Consulta la base de datos** directamente en Supabase SQL Editor
4. **Revisa las variables de entorno** en Vercel Settings

---

## 📞 Información de Contacto

**Proyecto**: CRTLPyme MVP  
**Repositorio**: https://github.com/kbzas090/CRTLPyme  
**Vercel Project**: crtlpyme-mvp-temp  
**Database**: Supabase (bxfetsflhxhigacuqtfe)

---

**Última actualización**: 2025-10-25  
**Versión**: 1.0
