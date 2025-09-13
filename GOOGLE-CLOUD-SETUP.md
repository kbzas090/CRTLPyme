# Configuración de Google Cloud Platform para CRTLPyme

## Descripción General

Esta guía proporciona instrucciones detalladas para configurar la infraestructura de Google Cloud Platform (GCP) necesaria para el despliegue y operación del sistema CRTLPyme. La configuración está optimizada para un proyecto académico con consideraciones de costos y escalabilidad futura.

## Prerrequisitos

### Cuenta de Google Cloud
- Cuenta de Google Cloud Platform activa
- Créditos educativos o de prueba gratuita disponibles
- Acceso a la consola de GCP (console.cloud.google.com)

### Herramientas Locales
- Google Cloud CLI (gcloud) instalado
- Docker instalado (para desarrollo local)
- Node.js 18+ instalado
- Git configurado

## Configuración Inicial del Proyecto

### 1. Creación del Proyecto GCP

```bash
# Autenticarse en Google Cloud
gcloud auth login

# Crear nuevo proyecto
gcloud projects create crtlpyme-2025 --name="CRTLPyme Sistema POS"

# Configurar proyecto como predeterminado
gcloud config set project crtlpyme-2025

# Verificar configuración
gcloud config list
```

### 2. Habilitación de APIs Necesarias

```bash
# APIs esenciales para CRTLPyme
gcloud services enable cloudbuild.googleapis.com
gcloud services enable run.googleapis.com
gcloud services enable sql-component.googleapis.com
gcloud services enable sqladmin.googleapis.com
gcloud services enable storage-component.googleapis.com
gcloud services enable secretmanager.googleapis.com
gcloud services enable cloudresourcemanager.googleapis.com
gcloud services enable iam.googleapis.com
gcloud services enable firebase.googleapis.com
gcloud services enable firestore.googleapis.com
```

### 3. Configuración de Facturación

```bash
# Listar cuentas de facturación disponibles
gcloud billing accounts list

# Vincular proyecto con cuenta de facturación
gcloud billing projects link crtlpyme-2025 --billing-account=BILLING_ACCOUNT_ID
```

## Configuración de Base de Datos

### 1. Creación de Instancia Cloud SQL (PostgreSQL)

```bash
# Crear instancia PostgreSQL para desarrollo
gcloud sql instances create crtlpyme-db-dev \
    --database-version=POSTGRES_14 \
    --tier=db-f1-micro \
    --region=us-central1 \
    --storage-type=SSD \
    --storage-size=10GB \
    --backup-start-time=03:00 \
    --maintenance-window-day=SUN \
    --maintenance-window-hour=04 \
    --maintenance-release-channel=production

# Crear instancia PostgreSQL para producción
gcloud sql instances create crtlpyme-db-prod \
    --database-version=POSTGRES_14 \
    --tier=db-g1-small \
    --region=us-central1 \
    --storage-type=SSD \
    --storage-size=20GB \
    --backup-start-time=02:00 \
    --maintenance-window-day=SUN \
    --maintenance-window-hour=03 \
    --maintenance-release-channel=production \
    --deletion-protection
```

### 2. Configuración de Usuarios y Bases de Datos

```bash
# Establecer contraseña para usuario root
gcloud sql users set-password root \
    --host=% \
    --instance=crtlpyme-db-dev \
    --password=SECURE_ROOT_PASSWORD

# Crear usuario específico para la aplicación
gcloud sql users create crtlpyme_app \
    --instance=crtlpyme-db-dev \
    --password=SECURE_APP_PASSWORD

# Crear base de datos principal
gcloud sql databases create crtlpyme_main \
    --instance=crtlpyme-db-dev

# Crear base de datos para testing
gcloud sql databases create crtlpyme_test \
    --instance=crtlpyme-db-dev
```

### 3. Configuración de Conexión Segura

```bash
# Obtener información de conexión
gcloud sql instances describe crtlpyme-db-dev

# Configurar proxy de Cloud SQL para desarrollo local
gcloud sql instances patch crtlpyme-db-dev \
    --authorized-networks=0.0.0.0/0 \
    --backup-start-time=03:00

# Descargar certificados SSL
gcloud sql ssl-certs create client-cert client-key.pem \
    --instance=crtlpyme-db-dev

gcloud sql ssl-certs describe client-cert \
    --instance=crtlpyme-db-dev \
    --format="get(cert)" > client-cert.pem

gcloud sql instances describe crtlpyme-db-dev \
    --format="get(serverCaCert.cert)" > server-ca.pem
```

## Configuración de Cloud Storage

### 1. Creación de Buckets

```bash
# Bucket para archivos estáticos (desarrollo)
gsutil mb -p crtlpyme-2025 -c STANDARD -l us-central1 gs://crtlpyme-static-dev

# Bucket para archivos estáticos (producción)
gsutil mb -p crtlpyme-2025 -c STANDARD -l us-central1 gs://crtlpyme-static-prod

# Bucket para backups de base de datos
gsutil mb -p crtlpyme-2025 -c COLDLINE -l us-central1 gs://crtlpyme-backups

# Bucket para logs y analytics
gsutil mb -p crtlpyme-2025 -c NEARLINE -l us-central1 gs://crtlpyme-logs
```

### 2. Configuración de Permisos

```bash
# Configurar acceso público para archivos estáticos
gsutil iam ch allUsers:objectViewer gs://crtlpyme-static-prod

# Configurar CORS para el bucket de archivos estáticos
cat > cors-config.json << EOF
[
  {
    "origin": ["https://crtlpyme.com", "https://*.crtlpyme.com"],
    "method": ["GET", "HEAD"],
    "responseHeader": ["Content-Type", "Access-Control-Allow-Origin"],
    "maxAgeSeconds": 3600
  }
]
EOF

gsutil cors set cors-config.json gs://crtlpyme-static-prod
```

## Configuración de Cloud Run

### 1. Preparación del Contenedor

```dockerfile
# Dockerfile para CRTLPyme
FROM node:18-alpine AS base

# Instalar dependencias necesarias
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copiar archivos de configuración
COPY package.json package-lock.json* ./
RUN npm ci --only=production

# Copiar código fuente
COPY . .

# Construir aplicación
RUN npm run build

# Configurar usuario no-root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["npm", "start"]
```

### 2. Construcción y Despliegue

```bash
# Construir imagen con Cloud Build
gcloud builds submit --tag gcr.io/crtlpyme-2025/crtlpyme-app:latest

# Desplegar en Cloud Run (desarrollo)
gcloud run deploy crtlpyme-dev \
    --image gcr.io/crtlpyme-2025/crtlpyme-app:latest \
    --platform managed \
    --region us-central1 \
    --allow-unauthenticated \
    --memory 512Mi \
    --cpu 1 \
    --min-instances 0 \
    --max-instances 10 \
    --set-env-vars NODE_ENV=development

# Desplegar en Cloud Run (producción)
gcloud run deploy crtlpyme-prod \
    --image gcr.io/crtlpyme-2025/crtlpyme-app:latest \
    --platform managed \
    --region us-central1 \
    --allow-unauthenticated \
    --memory 1Gi \
    --cpu 2 \
    --min-instances 1 \
    --max-instances 50 \
    --set-env-vars NODE_ENV=production
```

## Configuración de Firebase

### 1. Inicialización del Proyecto Firebase

```bash
# Instalar Firebase CLI
npm install -g firebase-tools

# Autenticarse en Firebase
firebase login

# Inicializar proyecto Firebase
firebase init

# Seleccionar servicios:
# - Firestore Database
# - Authentication
# - Storage
# - Hosting (opcional)
```

### 2. Configuración de Firestore

```javascript
// firestore.rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Reglas para tenants
    match /tenants/{tenantId} {
      allow read, write: if request.auth != null && 
        request.auth.token.tenant_id == tenantId;
    }
    
    // Reglas para productos
    match /tenants/{tenantId}/products/{productId} {
      allow read, write: if request.auth != null && 
        request.auth.token.tenant_id == tenantId;
    }
    
    // Reglas para ventas
    match /tenants/{tenantId}/sales/{saleId} {
      allow read, write: if request.auth != null && 
        request.auth.token.tenant_id == tenantId;
    }
  }
}
```

### 3. Configuración de Authentication

```javascript
// firebase-config.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
```

## Gestión de Secretos

### 1. Configuración de Secret Manager

```bash
# Crear secretos para variables de entorno
gcloud secrets create database-url --data-file=-
# Ingresar: postgresql://user:password@host:port/database

gcloud secrets create nextauth-secret --data-file=-
# Ingresar: random-secret-key-for-nextauth

gcloud secrets create firebase-admin-key --data-file=firebase-admin-key.json

gcloud secrets create transbank-api-key --data-file=-
# Ingresar: transbank-api-key-for-sandbox
```

### 2. Configuración de Acceso a Secretos

```bash
# Crear cuenta de servicio para la aplicación
gcloud iam service-accounts create crtlpyme-app \
    --display-name="CRTLPyme Application Service Account"

# Otorgar permisos necesarios
gcloud projects add-iam-policy-binding crtlpyme-2025 \
    --member="serviceAccount:crtlpyme-app@crtlpyme-2025.iam.gserviceaccount.com" \
    --role="roles/secretmanager.secretAccessor"

gcloud projects add-iam-policy-binding crtlpyme-2025 \
    --member="serviceAccount:crtlpyme-app@crtlpyme-2025.iam.gserviceaccount.com" \
    --role="roles/cloudsql.client"
```

## Configuración de Monitoreo

### 1. Cloud Logging

```bash
# Configurar sink de logs para análisis
gcloud logging sinks create crtlpyme-app-logs \
    bigquery.googleapis.com/projects/crtlpyme-2025/datasets/app_logs \
    --log-filter='resource.type="cloud_run_revision" AND resource.labels.service_name="crtlpyme-prod"'
```

### 2. Cloud Monitoring

```bash
# Crear política de alertas para errores
gcloud alpha monitoring policies create --policy-from-file=alert-policy.yaml
```

```yaml
# alert-policy.yaml
displayName: "CRTLPyme High Error Rate"
conditions:
  - displayName: "Error rate too high"
    conditionThreshold:
      filter: 'resource.type="cloud_run_revision" resource.label.service_name="crtlpyme-prod"'
      comparison: COMPARISON_GREATER_THAN
      thresholdValue: 0.1
      duration: 300s
notificationChannels:
  - projects/crtlpyme-2025/notificationChannels/EMAIL_CHANNEL_ID
```

## Configuración de CI/CD

### 1. Cloud Build Configuration

```yaml
# cloudbuild.yaml
steps:
  # Instalar dependencias
  - name: 'node:18'
    entrypoint: 'npm'
    args: ['ci']

  # Ejecutar tests
  - name: 'node:18'
    entrypoint: 'npm'
    args: ['run', 'test']

  # Construir aplicación
  - name: 'node:18'
    entrypoint: 'npm'
    args: ['run', 'build']

  # Construir imagen Docker
  - name: 'gcr.io/cloud-builders/docker'
    args: ['build', '-t', 'gcr.io/$PROJECT_ID/crtlpyme-app:$COMMIT_SHA', '.']

  # Subir imagen a Container Registry
  - name: 'gcr.io/cloud-builders/docker'
    args: ['push', 'gcr.io/$PROJECT_ID/crtlpyme-app:$COMMIT_SHA']

  # Desplegar a Cloud Run
  - name: 'gcr.io/cloud-builders/gcloud'
    args:
      - 'run'
      - 'deploy'
      - 'crtlpyme-prod'
      - '--image'
      - 'gcr.io/$PROJECT_ID/crtlpyme-app:$COMMIT_SHA'
      - '--region'
      - 'us-central1'
      - '--platform'
      - 'managed'

images:
  - 'gcr.io/$PROJECT_ID/crtlpyme-app:$COMMIT_SHA'
```

### 2. Configuración de Triggers

```bash
# Crear trigger para despliegue automático
gcloud builds triggers create github \
    --repo-name=CRTLPyme \
    --repo-owner=kbzas090 \
    --branch-pattern="^main$" \
    --build-config=cloudbuild.yaml
```

## Variables de Entorno

### 1. Configuración para Desarrollo

```bash
# .env.local
DATABASE_URL="postgresql://crtlpyme_app:password@localhost:5432/crtlpyme_main"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="development-secret-key"
NEXT_PUBLIC_FIREBASE_API_KEY="firebase-api-key"
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="crtlpyme-2025.firebaseapp.com"
NEXT_PUBLIC_FIREBASE_PROJECT_ID="crtlpyme-2025"
TRANSBANK_API_KEY="sandbox-api-key"
TRANSBANK_ENVIRONMENT="sandbox"
```

### 2. Configuración para Producción

```bash
# Configurar variables de entorno en Cloud Run
gcloud run services update crtlpyme-prod \
    --set-env-vars="NODE_ENV=production" \
    --set-env-vars="NEXTAUTH_URL=https://crtlpyme.com" \
    --region=us-central1
```

## Configuración de Dominio Personalizado

### 1. Configuración de Cloud DNS

```bash
# Crear zona DNS
gcloud dns managed-zones create crtlpyme-zone \
    --description="DNS zone for CRTLPyme" \
    --dns-name="crtlpyme.com"

# Obtener servidores de nombres
gcloud dns managed-zones describe crtlpyme-zone
```

### 2. Configuración de SSL

```bash
# Mapear dominio personalizado a Cloud Run
gcloud run domain-mappings create \
    --service=crtlpyme-prod \
    --domain=crtlpyme.com \
    --region=us-central1
```

## Backup y Recuperación

### 1. Configuración de Backups Automáticos

```bash
# Configurar backup automático de Cloud SQL
gcloud sql instances patch crtlpyme-db-prod \
    --backup-start-time=02:00 \
    --retained-backups-count=30 \
    --retained-transaction-log-days=7
```

### 2. Script de Backup Manual

```bash
#!/bin/bash
# backup-script.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="crtlpyme_backup_${DATE}.sql"

# Crear backup de base de datos
gcloud sql export sql crtlpyme-db-prod \
    gs://crtlpyme-backups/database/${BACKUP_FILE} \
    --database=crtlpyme_main

# Backup de archivos estáticos
gsutil -m rsync -r -d gs://crtlpyme-static-prod gs://crtlpyme-backups/static/${DATE}/

echo "Backup completado: ${DATE}"
```

## Costos y Optimización

### 1. Estimación de Costos Mensuales

```
Servicios de Desarrollo:
- Cloud SQL (db-f1-micro): $7-10/mes
- Cloud Run (512Mi, bajo tráfico): $0-5/mes
- Cloud Storage (10GB): $0.20/mes
- Firebase (plan Spark): Gratis
Total Desarrollo: ~$10-15/mes

Servicios de Producción:
- Cloud SQL (db-g1-small): $25-35/mes
- Cloud Run (1Gi, tráfico medio): $10-30/mes
- Cloud Storage (50GB): $1/mes
- Firebase (plan Blaze): $5-20/mes
Total Producción: ~$40-85/mes
```

### 2. Optimizaciones de Costo

```bash
# Configurar auto-scaling conservador
gcloud run services update crtlpyme-prod \
    --min-instances=0 \
    --max-instances=10 \
    --concurrency=100 \
    --cpu-throttling \
    --region=us-central1

# Configurar lifecycle de Storage
gsutil lifecycle set lifecycle-config.json gs://crtlpyme-logs
```

## Seguridad

### 1. Configuración de IAM

```bash
# Principio de menor privilegio
gcloud projects add-iam-policy-binding crtlpyme-2025 \
    --member="serviceAccount:crtlpyme-app@crtlpyme-2025.iam.gserviceaccount.com" \
    --role="roles/cloudsql.client"

# Auditoría de permisos
gcloud projects get-iam-policy crtlpyme-2025
```

### 2. Configuración de Firewall

```bash
# Configurar reglas de firewall para Cloud SQL
gcloud sql instances patch crtlpyme-db-prod \
    --authorized-networks=CLOUD_RUN_IP_RANGE \
    --require-ssl
```

## Troubleshooting

### 1. Problemas Comunes

#### Error de Conexión a Base de Datos
```bash
# Verificar estado de la instancia
gcloud sql instances describe crtlpyme-db-prod

# Verificar conectividad
gcloud sql connect crtlpyme-db-prod --user=crtlpyme_app
```

#### Problemas de Despliegue en Cloud Run
```bash
# Verificar logs de despliegue
gcloud run services logs read crtlpyme-prod --region=us-central1

# Verificar configuración del servicio
gcloud run services describe crtlpyme-prod --region=us-central1
```

### 2. Comandos de Diagnóstico

```bash
# Verificar cuotas del proyecto
gcloud compute project-info describe --project=crtlpyme-2025

# Verificar facturación
gcloud billing projects describe crtlpyme-2025

# Verificar APIs habilitadas
gcloud services list --enabled
```

## Conclusión

Esta configuración proporciona una infraestructura robusta y escalable para CRTLPyme, optimizada para un proyecto académico con consideraciones de costo y rendimiento. La arquitectura permite un desarrollo eficiente y un despliegue confiable, manteniendo las mejores prácticas de seguridad y operación en la nube.

Para soporte adicional, consultar la documentación oficial de Google Cloud Platform y los recursos académicos disponibles a través del programa educativo de Google Cloud.
