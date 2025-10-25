# Configuración de Vercel para CRTLPyme

## 🔍 Verificación de Configuración Actual

La configuración de Vercel está correcta en `vercel.json`, pero si los cambios de GitHub no se reflejan, sigue estos pasos:

## ✅ Pasos para Verificar y Corregir

### 1. Verificar Integración con GitHub

1. Ve a [Vercel Dashboard](https://vercel.com/dashboard)
2. Selecciona el proyecto `crtlpyme-mvp-temp`
3. Ve a **Settings** → **Git**
4. Verifica que:
   - ✅ El repositorio conectado es: `kbzas090/CRTLPyme`
   - ✅ La rama de producción es: `main` (o la rama principal)
   - ✅ Auto-deployment está habilitado

### 2. Configurar Variables de Entorno

Ve a **Settings** → **Environment Variables** y asegúrate de tener:

```
DATABASE_URL=postgresql://postgres:CrtlPyme_2025@db.bxfetsflhxhigacuqtfe.supabase.co:5432/postgres
NEXTAUTH_URL=https://[tu-dominio].vercel.app
NEXTAUTH_SECRET=[tu-secret-actual]
NODE_ENV=production
```

⚠️ **IMPORTANTE**: Después de agregar variables de entorno, debes hacer un nuevo deployment.

### 3. Forzar un Nuevo Deployment

Si los cambios no se reflejan automáticamente:

**Opción A: Desde Vercel Dashboard**
1. Ve a la pestaña **Deployments**
2. Haz clic en los tres puntos (...) del último deployment
3. Selecciona **Redeploy**
4. Marca la opción "Use existing Build Cache" (desmarcada) para un build limpio
5. Haz clic en **Redeploy**

**Opción B: Desde Git**
```bash
git commit --allow-empty -m "Trigger Vercel deployment"
git push origin main
```

### 4. Verificar Build Logs

1. Ve a la pestaña **Deployments**
2. Haz clic en el deployment más reciente
3. Revisa los **Build Logs** para ver si hay errores

Errores comunes:
- ❌ Prisma schema sin migrar → Ejecuta migraciones manualmente
- ❌ Variables de entorno faltantes → Agrégalas en Settings
- ❌ Error de dependencias → Verifica package.json

### 5. Ejecutar Migraciones en Producción

**Importante**: Las migraciones NO se ejecutan automáticamente en Vercel.

Necesitas ejecutarlas manualmente usando uno de estos métodos:

**Método 1: Desde tu máquina local**
```bash
DATABASE_URL="postgresql://postgres:CrtlPyme_2025@db.bxfetsflhxhigacuqtfe.supabase.co:5432/postgres" npx prisma migrate deploy
```

**Método 2: Desde Vercel CLI**
```bash
vercel env pull .env.production
npx prisma migrate deploy
```

**Método 3: Script SQL directo en Supabase**
Ve a Supabase SQL Editor y ejecuta manualmente el script de migración ubicado en:
`prisma/migrations/20251025141836_add_master_products_and_tenant_inventory/migration.sql`

### 6. Poblar Datos de Producción

Una vez que las migraciones estén aplicadas, ejecuta el seed:

```bash
DATABASE_URL="postgresql://postgres:CrtlPyme_2025@db.bxfetsflhxhigacuqtfe.supabase.co:5432/postgres" npm run seed:master-products
```

## 🔧 Configuración Recomendada

### Build Settings en Vercel

- **Framework Preset**: Next.js
- **Build Command**: `prisma generate && next build` (ya configurado)
- **Output Directory**: `.next` (default)
- **Install Command**: `npm install --legacy-peer-deps` (ya configurado)

### Branch Protection

Configura deployment automático solo desde la rama principal:
- **Production Branch**: `main`
- **Preview Branches**: Todas las demás ramas (opcional)

## 🐛 Troubleshooting

### Problema: "Los cambios no se reflejan"

**Causa 1**: Auto-deployment deshabilitado
- **Solución**: Habilita auto-deployment en Settings → Git

**Causa 2**: Push a rama incorrecta
- **Solución**: Verifica que estás haciendo push a la rama configurada en Vercel
```bash
git branch  # Ver rama actual
git checkout main  # Cambiar a main si es necesario
```

**Causa 3**: Build fallando silenciosamente
- **Solución**: Revisa los Build Logs en Deployments

**Causa 4**: Cache de build antiguo
- **Solución**: Redeploy sin cache (ver paso 3, Opción A)

### Problema: "Error de Prisma en producción"

**Causa**: Cliente de Prisma no generado o migraciones no aplicadas
- **Solución**: 
  1. Verifica que `prisma generate` esté en el build command
  2. Aplica migraciones manualmente (ver paso 5)
  3. Redeploy

### Problema: "Error de conexión a base de datos"

**Causa**: DATABASE_URL incorrecta o no accesible
- **Solución**: 
  1. Verifica que la URL sea accesible desde internet
  2. En Supabase, usa la Connection String con pgBouncer para Vercel:
     `postgresql://postgres.bxfetsflhxhigacuqtfe:[PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true`

## 📝 Checklist Final

Antes de considerar que todo está funcionando:

- [ ] Variables de entorno configuradas en Vercel
- [ ] Auto-deployment habilitado
- [ ] Migraciones aplicadas en base de datos de producción
- [ ] Datos de seed poblados
- [ ] Build exitoso visible en Deployments
- [ ] Cambios recientes de GitHub desplegados
- [ ] Aplicación accesible y funcionando en la URL de Vercel

## 🆘 Soporte Adicional

Si después de seguir estos pasos los cambios aún no se reflejan:

1. Verifica que el commit más reciente en GitHub coincide con el deployment en Vercel
2. Revisa los logs completos del deployment
3. Considera desconectar y reconectar el repositorio de GitHub en Vercel

---

**Última actualización**: 2025-10-25
