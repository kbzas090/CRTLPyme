# 🚀 Guía de Despliegue - CRTLPyme Fase 1 MVP en Google Cloud Run

Esta guía te llevará paso a paso a través del proceso completo de despliegue de la aplicación CRTLPyme a Google Cloud Platform (GCP) usando Cloud Run.

## 📋 Prerrequisitos

Antes de comenzar, asegúrate de tener:

- [x] Cuenta de GCP activa con facturación habilitada
- [x] Proyecto GCP creado: `crtlpyme-442414`
- [x] Cloud SQL PostgreSQL configurado (IP: `136.116.45.158`)
- [x] Google Cloud SDK instalado localmente o acceso a Cloud Shell
- [x] Repositorio clonado localmente
- [x] Node.js 18+ instalado (para ejecutar migraciones localmente)

## 🔧 Configuración Inicial

### 1. Autenticación en GCP

```bash
# Autenticarse en GCP
gcloud auth login

# Configurar el proyecto
gcloud config set project crtlpyme-442414

# Verificar configuración
gcloud config list
```

## 🔐 Paso 1: Configurar Secrets en GCP Secret Manager

Los secrets son necesarios para que la aplicación funcione correctamente en producción. Tienes dos opciones:

### Opción A: Usar el script automático (Recomendado)

```bash
cd /ruta/a/CRTLPyme
./setup-gcp-secrets.sh
```

Este script creará o actualizará los siguientes secrets:
- `SENDGRID_FROM_EMAIL`: kbzas090@gmail.com
- `NEXTAUTH_SECRET`: Token de seguridad para NextAuth
- `TRANSBANK_COMMERCE_CODE`: 597055555532 (código de integración)
- `TRANSBANK_ENVIRONMENT`: integration

### Opción B: Configurar secrets manualmente

Puedes acceder a [GCP Secret Manager](https://console.cloud.google.com/security/secret-manager?project=crtlpyme-442414) y crear los secrets manualmente:

| Secret Name | Valor |
|-------------|-------|
| `SENDGRID_FROM_EMAIL` | `kbzas090@gmail.com` |
| `NEXTAUTH_SECRET` | `fe1ed7667875163c5fec73728bfa468aa33e24452ceac33891427172ca11c2b3` |
| `TRANSBANK_COMMERCE_CODE` | `597055555532` |
| `TRANSBANK_ENVIRONMENT` | `integration` |

### Secrets ya configurados

Estos secrets ya deben estar configurados desde la configuración inicial:
- ✅ `DATABASE_URL`: Conexión a Cloud SQL PostgreSQL
- ✅ `SENDGRID_API_KEY`: API key de SendGrid
- ✅ `transbank`: API key de Transbank

## 🗄️ Paso 2: Ejecutar Migraciones de Base de Datos

Las migraciones crearán todas las tablas necesarias en la base de datos.

```bash
# Configurar la URL de la base de datos
export DATABASE_URL="postgresql://postgres:kkE[8SyJ@G_IyF@136.116.45.158:5432/crtlpyme-db?schema=public"

# Ejecutar el script de migraciones
./run-migrations.sh
```

Esto ejecutará:
1. `npx prisma generate` - Genera el cliente de Prisma
2. `npx prisma migrate deploy` - Aplica todas las migraciones pendientes
3. `npx prisma migrate status` - Muestra el estado de las migraciones

### Verificar migraciones manualmente

```bash
# Ver el estado de las migraciones
npx prisma migrate status

# Si necesitas resetear la base de datos (¡CUIDADO! Esto borra todos los datos)
# npx prisma migrate reset --force
```

## 🌱 Paso 3: Crear Planes de Suscripción (Seeder)

El seeder creará los 8 planes de suscripción iniciales (4 mensuales + 4 anuales).

```bash
# Asegúrate de que DATABASE_URL esté configurada
export DATABASE_URL="postgresql://postgres:kkE[8SyJ@G_IyF@136.116.45.158:5432/crtlpyme-db?schema=public"

# Ejecutar el seeder
./run-seeder.sh
```

Los planes que se crearán son:

**Planes Mensuales:**
1. Plan Gratuito - $0/mes
2. Plan Básico - $19,990/mes
3. Plan Profesional - $39,990/mes
4. Plan Empresarial - $79,990/mes

**Planes Anuales (con 20% de descuento):**
5. Plan Básico Anual - $191,904/año
6. Plan Profesional Anual - $383,904/año
7. Plan Empresarial Anual - $767,904/año
8. Plan Premium Anual - $1,199,904/año

## 🏗️ Paso 4: Construir y Desplegar a Cloud Run

### Opción A: Usar Cloud Build (Recomendado)

Cloud Build construirá automáticamente la imagen Docker y la desplegará en Cloud Run:

```bash
# Commit de cambios pendientes
git add .
git commit -m "chore: Prepare for Cloud Run deployment"
git push origin main

# Ejecutar Cloud Build
gcloud builds submit --config cloudbuild.yaml --project=crtlpyme-442414
```

El archivo `cloudbuild.yaml` está configurado para:
- ✅ Construir la imagen Docker
- ✅ Pushear a Container Registry
- ✅ Desplegar a Cloud Run con todos los secrets configurados
- ✅ Configurar 2GB RAM, 2 CPUs
- ✅ Habilitar auto-scaling (0-10 instancias)

### Opción B: Despliegue manual con Docker

Si prefieres construir y desplegar manualmente:

```bash
# Construir la imagen
docker build -t gcr.io/crtlpyme-442414/crtlpyme:latest .

# Autenticar Docker con GCR
gcloud auth configure-docker

# Push de la imagen
docker push gcr.io/crtlpyme-442414/crtlpyme:latest

# Desplegar a Cloud Run
gcloud run deploy crtlpyme \
  --image=gcr.io/crtlpyme-442414/crtlpyme:latest \
  --region=us-central1 \
  --platform=managed \
  --allow-unauthenticated \
  --memory=2Gi \
  --cpu=2 \
  --port=3000 \
  --set-secrets=DATABASE_URL=DATABASE_URL:latest,NEXTAUTH_SECRET=NEXTAUTH_SECRET:latest,SENDGRID_API_KEY=SENDGRID_API_KEY:latest,SENDGRID_FROM_EMAIL=SENDGRID_FROM_EMAIL:latest,TRANSBANK_API_KEY=transbank:latest,TRANSBANK_COMMERCE_CODE=TRANSBANK_COMMERCE_CODE:latest,TRANSBANK_ENVIRONMENT=TRANSBANK_ENVIRONMENT:latest \
  --set-env-vars=NODE_ENV=production,NEXT_PUBLIC_APP_NAME=CRTLPyme
```

## ✅ Paso 5: Verificar el Despliegue

### Obtener la URL del servicio

```bash
gcloud run services describe crtlpyme --region=us-central1 --format='value(status.url)'
```

La URL debería ser algo como: `https://crtlpyme-XXXXXXXX-uc.a.run.app`

### Verificar que la aplicación esté funcionando

1. **Página principal**: Abre la URL en tu navegador
2. **Health check**: Prueba `https://tu-url/api/health`
3. **Dashboard admin**: `https://tu-url/admin`

### Ver logs en tiempo real

```bash
# Ver logs del servicio
gcloud run services logs read crtlpyme --region=us-central1 --limit=50

# Seguir logs en tiempo real
gcloud run services logs tail crtlpyme --region=us-central1
```

También puedes ver los logs en la [Consola de GCP](https://console.cloud.google.com/logs?project=crtlpyme-442414).

## 🚀 Script de Despliegue Automatizado

Para tu comodidad, hemos creado un script que ejecuta todos los pasos automáticamente:

```bash
./deploy-to-cloud-run.sh
```

Este script te guiará interactivamente por todos los pasos y te permitirá elegir qué ejecutar.

## 🔍 Troubleshooting

### Error: "Secret not found"

Si ves errores relacionados con secrets faltantes:

```bash
# Listar todos los secrets
gcloud secrets list --project=crtlpyme-442414

# Crear un secret manualmente
echo -n "valor-del-secret" | gcloud secrets create NOMBRE_SECRET \
  --data-file=- \
  --replication-policy="automatic" \
  --project=crtlpyme-442414
```

### Error: "Migration failed"

Si las migraciones fallan:

```bash
# Ver el estado actual
npx prisma migrate status

# Forzar la aplicación de una migración específica
npx prisma migrate resolve --applied "nombre-de-la-migracion"

# En último caso, resetear (¡CUIDADO!)
# npx prisma migrate reset --force
```

### Error: "Container failed to start"

Si el contenedor no inicia:

1. Verifica los logs: `gcloud run services logs read crtlpyme --region=us-central1 --limit=100`
2. Verifica que todos los secrets estén configurados
3. Verifica que DATABASE_URL sea accesible desde Cloud Run
4. Verifica que el puerto 3000 esté expuesto en el Dockerfile

### Error de conexión a la base de datos

Si hay problemas de conexión:

```bash
# Verificar que Cloud SQL esté corriendo
gcloud sql instances list

# Verificar la IP pública
gcloud sql instances describe crtlpyme-db --format="get(ipAddresses)"

# Probar conexión desde tu máquina local
psql "postgresql://postgres:kkE[8SyJ@G_IyF@136.116.45.158:5432/crtlpyme-db"
```

## 📊 Configuración Post-Despliegue

### 1. Configurar dominio personalizado (Opcional)

```bash
gcloud run services update-traffic crtlpyme \
  --region=us-central1 \
  --update-env-vars NEXTAUTH_URL=https://tu-dominio.com
```

### 2. Configurar SendGrid

1. Verifica el email `kbzas090@gmail.com` en SendGrid
2. Configura los dominios de autenticación (SPF, DKIM)

### 3. Configurar Transbank para Producción

Cuando estés listo para producción:

```bash
# Actualizar el secret de Transbank Environment
echo -n "production" | gcloud secrets versions add TRANSBANK_ENVIRONMENT \
  --data-file=- \
  --project=crtlpyme-442414

# Actualizar el código de comercio con el de producción
echo -n "TU_CODIGO_PRODUCCION" | gcloud secrets versions add TRANSBANK_COMMERCE_CODE \
  --data-file=- \
  --project=crtlpyme-442414
```

### 4. Configurar backups automáticos

Los backups de Cloud SQL deberían estar configurados, pero verifica:

```bash
gcloud sql instances describe crtlpyme-db --format="get(backupConfiguration)"
```

## 📚 Recursos Adicionales

- [Documentación de Cloud Run](https://cloud.google.com/run/docs)
- [Documentación de Cloud SQL](https://cloud.google.com/sql/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)

## 🆘 Soporte

Si encuentras problemas durante el despliegue:

1. Revisa los logs en GCP Console
2. Verifica que todos los secrets estén configurados correctamente
3. Asegúrate de que las migraciones se hayan ejecutado exitosamente
4. Verifica la conectividad a Cloud SQL

---

**¡Listo!** Tu aplicación CRTLPyme Fase 1 MVP debería estar desplegada y funcionando en Cloud Run. 🎉
