# Instrucciones de Despliegue - Fase 1 MVP SaaS
## CRTLPyme - Sistema de Gestión Multi-Tenant

Este documento proporciona instrucciones detalladas para desplegar la Fase 1 del MVP SaaS de CRTLPyme en Google Cloud Run.

---

## Índice

1. [Requisitos Previos](#requisitos-previos)
2. [Configuración de Secrets en GCP](#configuración-de-secrets-en-gcp)
3. [Configuración de SendGrid](#configuración-de-sendgrid)
4. [Configuración de Transbank](#configuración-de-transbank)
5. [Migración de Base de Datos](#migración-de-base-de-datos)
6. [Seed de Datos Iniciales](#seed-de-datos-iniciales)
7. [Despliegue a Cloud Run](#despliegue-a-cloud-run)
8. [Verificación del Despliegue](#verificación-del-despliegue)
9. [Troubleshooting](#troubleshooting)

---

## Requisitos Previos

Antes de comenzar, asegúrate de tener:

- ✅ Cuenta de Google Cloud Platform (GCP) activa
- ✅ Proyecto GCP creado: `crtlpyme-project` (o tu ID de proyecto)
- ✅ Cloud SQL PostgreSQL configurado (IP: 136.116.45.158)
- ✅ Base de datos creada: `crtlpyme-db`
- ✅ Repositorio GitHub: https://github.com/kbzas090/CRTLPyme
- ✅ SendGrid API Key (para emails)
- ✅ Credenciales de Transbank (sandbox para desarrollo, producción para producción)
- ✅ Cloud Build habilitado en GCP
- ✅ Cloud Run habilitado en GCP

---

## Configuración de Secrets en GCP

### 1. Acceder a Secret Manager

```bash
# Navegar a Secret Manager en GCP Console
https://console.cloud.google.com/security/secret-manager
```

### 2. Crear los siguientes secrets:

#### A. DATABASE_URL
```bash
gcloud secrets create DATABASE_URL \
  --replication-policy="automatic" \
  --data-file=- <<EOF
postgresql://postgres:admin123@136.116.45.158:5432/crtlpyme-db?schema=public
EOF
```

#### B. NEXTAUTH_SECRET
```bash
# Generar un secret aleatorio
openssl rand -base64 32

# Crear el secret
gcloud secrets create NEXTAUTH_SECRET \
  --replication-policy="automatic" \
  --data-file=- <<EOF
[TU-SECRET-GENERADO-AQUI]
EOF
```

#### C. SENDGRID_API_KEY
```bash
gcloud secrets create SENDGRID_API_KEY \
  --replication-policy="automatic" \
  --data-file=- <<EOF
SG.tu-api-key-de-sendgrid-aqui
EOF
```

#### D. SENDGRID_FROM_EMAIL
```bash
gcloud secrets create SENDGRID_FROM_EMAIL \
  --replication-policy="automatic" \
  --data-file=- <<EOF
noreply@crtlpyme.cl
EOF
```

#### E. TRANSBANK_API_KEY
```bash
# Para sandbox/integración:
gcloud secrets create TRANSBANK_API_KEY \
  --replication-policy="automatic" \
  --data-file=- <<EOF
579B532A7440BB0C9079DED94D31EA1615BACEB56610332264630D42D0A36B1C
EOF

# Para producción, reemplazar con tu API key real de Transbank
```

#### F. TRANSBANK_COMMERCE_CODE
```bash
# Para sandbox/integración:
gcloud secrets create TRANSBANK_COMMERCE_CODE \
  --replication-policy="automatic" \
  --data-file=- <<EOF
597055555532
EOF

# Para producción, reemplazar con tu commerce code real de Transbank
```

#### G. TRANSBANK_ENVIRONMENT
```bash
# Para sandbox/integración:
gcloud secrets create TRANSBANK_ENVIRONMENT \
  --replication-policy="automatic" \
  --data-file=- <<EOF
integration
EOF

# Para producción, cambiar a "production"
```

### 3. Verificar que todos los secrets están creados

```bash
gcloud secrets list
```

Deberías ver:
- DATABASE_URL
- NEXTAUTH_SECRET
- SENDGRID_API_KEY
- SENDGRID_FROM_EMAIL
- TRANSBANK_API_KEY
- TRANSBANK_COMMERCE_CODE
- TRANSBANK_ENVIRONMENT

---

## Configuración de SendGrid

### 1. Crear cuenta en SendGrid

Si no tienes una cuenta:
1. Ir a https://signup.sendgrid.com/
2. Registrarse con un plan gratuito (hasta 100 emails/día)

### 2. Crear API Key

1. Iniciar sesión en SendGrid
2. Ir a Settings > API Keys
3. Crear nueva API Key con permisos completos
4. Copiar la API Key (solo se muestra una vez)
5. Guardar en Secret Manager (ver paso anterior)

### 3. Verificar dominio (Opcional pero recomendado)

1. Ir a Settings > Sender Authentication
2. Verificar dominio crtlpyme.cl
3. Agregar registros DNS requeridos

### 4. Crear plantillas de email (Opcional)

Si deseas usar plantillas dinámicas de SendGrid en lugar de las plantillas HTML del código:
1. Ir a Email API > Dynamic Templates
2. Crear plantillas para:
   - Bienvenida
   - Pago exitoso
   - Pago fallido
   - Recordatorio de renovación
   - Cambio de plan
   - Cuenta suspendida
   - Cuenta reactivada

---

## Configuración de Transbank

### Para Ambiente de Integración (Sandbox)

Ya está configurado en el código con las credenciales de integración:
- Commerce Code: `597055555532`
- API Key: `579B532A7440BB0C9079DED94D31EA1615BACEB56610332264630D42D0A36B1C`
- Environment: `integration`

**Tarjetas de prueba:**
- Número: `4051 8856 0012 3993`
- CVV: `123`
- Fecha: Cualquier fecha futura

### Para Ambiente de Producción

1. Registrarse en Transbank: https://www.transbankdevelopers.cl/
2. Solicitar credenciales de producción
3. Una vez aprobado, actualizar los secrets en GCP:
   ```bash
   gcloud secrets versions add TRANSBANK_COMMERCE_CODE --data-file=- <<EOF
   [TU-COMMERCE-CODE-PRODUCCION]
   EOF
   
   gcloud secrets versions add TRANSBANK_API_KEY --data-file=- <<EOF
   [TU-API-KEY-PRODUCCION]
   EOF
   
   gcloud secrets versions add TRANSBANK_ENVIRONMENT --data-file=- <<EOF
   production
   EOF
   ```

---

## Migración de Base de Datos

### 1. Conectar a Cloud SQL

```bash
# Opción A: Usar gcloud sql connect
gcloud sql connect crtlpyme-db --user=postgres

# Opción B: Usar conexión directa
psql "postgresql://postgres:admin123@136.116.45.158:5432/crtlpyme-db"
```

### 2. Ejecutar migraciones de Prisma

Desde tu máquina local o Cloud Shell:

```bash
# Clonar el repositorio
git clone https://github.com/kbzas090/CRTLPyme.git
cd CRTLPyme

# Instalar dependencias
npm install

# Configurar DATABASE_URL
export DATABASE_URL="postgresql://postgres:admin123@136.116.45.158:5432/crtlpyme-db?schema=public"

# Ejecutar migraciones
npx prisma migrate deploy

# Generar cliente Prisma
npx prisma generate
```

### 3. Verificar que las tablas se crearon correctamente

```bash
npx prisma studio
```

O conectar con psql y verificar:

```sql
\dt

-- Deberías ver todas las tablas del schema
```

---

## Seed de Datos Iniciales

### 1. Seed de planes de suscripción

```bash
npm run seed:subscription-plans
```

Esto creará 8 planes predefinidos:
- Básico Mensual ($9,990)
- Profesional Mensual ($19,990)
- Enterprise Mensual ($39,990)
- Básico Trimestral ($26,970 - 10% desc)
- Profesional Trimestral ($53,973 - 10% desc)
- Básico Anual ($95,904 - 20% desc)
- Profesional Anual ($191,904 - 20% desc)
- Enterprise Anual ($383,904 - 20% desc)

### 2. Verificar planes creados

```bash
npx prisma studio
# O usando la API:
curl http://localhost:3000/api/subscription-plans
```

### 3. Crear usuario admin SaaS (PROVEEDOR)

Ejecutar script manual o usar la API de registro:

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@crtlpyme.cl",
    "password": "AdminSecure123!",
    "firstName": "Admin",
    "lastName": "CRTLPyme",
    "role": "PROVEEDOR"
  }'
```

---

## Despliegue a Cloud Run

### Opción A: Despliegue Automático con Cloud Build

El proyecto ya tiene configurado `cloudbuild.yaml`.

#### 1. Configurar Cloud Build

```bash
# Habilitar Cloud Build API
gcloud services enable cloudbuild.googleapis.com

# Dar permisos a Cloud Build para acceder a secrets
gcloud projects add-iam-policy-binding crtlpyme-project \
  --member=serviceAccount:PROJECT_NUMBER@cloudbuild.gserviceaccount.com \
  --role=roles/secretmanager.secretAccessor
```

#### 2. Ejecutar build y deploy

```bash
gcloud builds submit --config cloudbuild.yaml
```

### Opción B: Despliegue Manual

#### 1. Construir la imagen Docker

```bash
docker build -t gcr.io/crtlpyme-project/crtlpyme:latest .
```

#### 2. Subir la imagen a GCR

```bash
docker push gcr.io/crtlpyme-project/crtlpyme:latest
```

#### 3. Desplegar en Cloud Run

```bash
gcloud run deploy crtlpyme \
  --image gcr.io/crtlpyme-project/crtlpyme:latest \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars NODE_ENV=production \
  --set-env-vars NEXTAUTH_URL=https://crtlpyme-service-url.run.app \
  --set-secrets DATABASE_URL=DATABASE_URL:latest \
  --set-secrets NEXTAUTH_SECRET=NEXTAUTH_SECRET:latest \
  --set-secrets SENDGRID_API_KEY=SENDGRID_API_KEY:latest \
  --set-secrets SENDGRID_FROM_EMAIL=SENDGRID_FROM_EMAIL:latest \
  --set-secrets TRANSBANK_API_KEY=TRANSBANK_API_KEY:latest \
  --set-secrets TRANSBANK_COMMERCE_CODE=TRANSBANK_COMMERCE_CODE:latest \
  --set-secrets TRANSBANK_ENVIRONMENT=TRANSBANK_ENVIRONMENT:latest \
  --cpu=2 \
  --memory=2Gi \
  --timeout=300 \
  --max-instances=10
```

---

## Verificación del Despliegue

### 1. Verificar que el servicio está corriendo

```bash
gcloud run services describe crtlpyme --region us-central1
```

### 2. Obtener la URL del servicio

```bash
gcloud run services describe crtlpyme --region us-central1 --format='value(status.url)'
```

### 3. Probar endpoints básicos

```bash
# Health check
curl https://tu-servicio-url.run.app/

# Listar planes de suscripción
curl https://tu-servicio-url.run.app/api/subscription-plans

# Obtener métricas (requiere autenticación)
curl https://tu-servicio-url.run.app/api/admin-saas/metrics \
  -H "Cookie: next-auth.session-token=TU_TOKEN"
```

### 4. Verificar logs

```bash
gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=crtlpyme" \
  --limit 50 \
  --format json
```

### 5. Probar flujo completo de pago

1. Iniciar sesión como PROVEEDOR
2. Crear un tenant de prueba
3. Crear una suscripción para el tenant
4. Iniciar un pago de prueba
5. Completar el pago en Transbank (sandbox)
6. Verificar que el pago se registró correctamente
7. Verificar que se envió el email de confirmación

---

## Troubleshooting

### Error: No se puede conectar a la base de datos

**Solución:**
1. Verificar que Cloud SQL está activo
2. Verificar que la IP de Cloud SQL es correcta
3. Verificar credenciales de base de datos
4. Verificar que Cloud Run tiene permisos para acceder a Cloud SQL

```bash
# Verificar conexión desde Cloud Shell
gcloud sql connect crtlpyme-db --user=postgres
```

### Error: Secrets no encontrados

**Solución:**
1. Verificar que todos los secrets existen en Secret Manager
2. Verificar permisos de Cloud Run para acceder a secrets

```bash
# Listar secrets
gcloud secrets list

# Dar permisos a Cloud Run
gcloud run services add-iam-policy-binding crtlpyme \
  --region=us-central1 \
  --member=serviceAccount:SERVICE_ACCOUNT_EMAIL \
  --role=roles/secretmanager.secretAccessor
```

### Error: SendGrid no envía emails

**Solución:**
1. Verificar API Key de SendGrid
2. Verificar que el dominio está verificado en SendGrid
3. Verificar logs de SendGrid: https://app.sendgrid.com/email_activity
4. Verificar que no se excedió el límite de emails del plan

### Error: Transbank rechaza pagos

**Solución:**
1. Verificar que se están usando las credenciales correctas (sandbox vs producción)
2. Verificar que el environment está configurado correctamente
3. Usar tarjetas de prueba correctas para sandbox
4. Verificar logs de Transbank en el dashboard

### Error: Build falla en Cloud Build

**Solución:**
1. Verificar que `cloudbuild.yaml` está correcto
2. Verificar que todas las dependencias se instalan correctamente
3. Verificar logs de Cloud Build:

```bash
gcloud builds list --limit=5
gcloud builds log [BUILD_ID]
```

### Error: Servicio se reinicia constantemente

**Solución:**
1. Verificar logs para identificar el error
2. Aumentar CPU/memoria del servicio
3. Verificar que todas las variables de entorno están configuradas
4. Verificar que el puerto está configurado correctamente (8080)

---

## Comandos Útiles

### Ver logs en tiempo real

```bash
gcloud logging tail "resource.type=cloud_run_revision AND resource.labels.service_name=crtlpyme"
```

### Actualizar variables de entorno

```bash
gcloud run services update crtlpyme \
  --region us-central1 \
  --set-env-vars "NEW_VAR=value"
```

### Actualizar un secret

```bash
gcloud secrets versions add SECRET_NAME --data-file=- <<EOF
nuevo-valor-del-secret
EOF
```

### Escalar el servicio

```bash
gcloud run services update crtlpyme \
  --region us-central1 \
  --min-instances=1 \
  --max-instances=20
```

### Rollback a versión anterior

```bash
# Listar revisiones
gcloud run revisions list --service crtlpyme --region us-central1

# Hacer rollback
gcloud run services update-traffic crtlpyme \
  --region us-central1 \
  --to-revisions REVISION_NAME=100
```

---

## Próximos Pasos

Después de completar el despliegue:

1. ✅ Configurar dominio personalizado en Cloud Run
2. ✅ Configurar SSL/TLS
3. ✅ Configurar monitoreo y alertas
4. ✅ Configurar backups automáticos de base de datos
5. ✅ Implementar CI/CD automático con GitHub Actions
6. ✅ Configurar ambiente de staging separado
7. ✅ Implementar tests automatizados
8. ✅ Configurar CDN para assets estáticos
9. ✅ Implementar cron jobs para tareas programadas (renovaciones, recordatorios)
10. ✅ Configurar logging y monitoring avanzado

---

## Soporte

Para soporte o preguntas:
- Email: kbzas090@gmail.com
- GitHub Issues: https://github.com/kbzas090/CRTLPyme/issues
- Documentación API: Ver `FASE1_MVP_SAAS_API_DOCUMENTATION.md`

---

## Changelog

### Versión 1.0.0 - Fase 1 MVP SaaS (Noviembre 2024)

- ✅ Sistema de suscripciones con planes
- ✅ Integración de pagos con Transbank
- ✅ Sistema de notificaciones por email con SendGrid
- ✅ Panel de administrador SaaS con métricas completas
- ✅ Gestión completa de tenants
- ✅ API REST completa documentada
- ✅ Despliegue en Cloud Run con secrets configurados
