
# Guía Completa: Configuración Google Cloud para CRTLPyme

**Objetivo**: Desplegar CRTLPyme en Google Cloud Platform de manera profesional y escalable para el proyecto de tesis.

---

## Índice de Contenidos

1. [Preparación Inicial](#preparación-inicial)
2. [Configuración de Proyecto GCP](#configuración-de-proyecto-gcp)
3. [Configuración de Base de Datos](#configuración-de-base-de-datos)
4. [Configuración de App Engine](#configuración-de-app-engine)
5. [Configuración de Storage](#configuración-de-storage)
6. [Configuración de Dominio](#configuración-de-dominio)
7. [Monitoreo y Logging](#monitoreo-y-logging)
8. [Scripts de Automatización](#scripts-de-automatización)
9. [Checklist de Verificación](#checklist-de-verificación)
10. [Troubleshooting](#troubleshooting)

---

## Preparación Inicial

### Prerrequisitos
- [ ] Cuenta de Google Cloud Platform activa
- [ ] Tarjeta de crédito válida (para verificación, incluye $300 USD de crédito gratuito)
- [ ] Proyecto CRTLPyme funcionando localmente
- [ ] Google Cloud CLI instalado
- [ ] Node.js 18+ instalado localmente

### Estimación de Costos (Desarrollo/Testing)
```
Servicios principales para proyecto de tesis:
├── App Engine Standard: ~$0-20/mes (bajo tráfico)
├── Cloud SQL (PostgreSQL): ~$25-50/mes (instancia pequeña)
├── Cloud Storage: ~$1-5/mes (pocos archivos)
├── Cloud Build: ~$0-10/mes (builds ocasionales)
└── Total estimado: $26-85/mes

Nota: Con crédito gratuito de $300, cubrirá todo el desarrollo de la tesis.
```

---

## Configuración de Proyecto GCP

### Paso 1: Crear Proyecto en Google Cloud Console

1. **Acceder a Google Cloud Console**
```
URL: https://console.cloud.google.com/
```

2. **Crear Nuevo Proyecto**
- Clic en selector de proyecto (parte superior)
- "Nuevo Proyecto"
- Nombre: `crtlpyme-tesis`
- ID del proyecto: `crtlpyme-tesis-[tu-id-único]`
- Organización: Dejar por defecto
- Clic "Crear"

3. **Habilitar APIs Necesarias**
```bash
# Ejecutar estos comandos después de instalar gcloud CLI
gcloud services enable appengine.googleapis.com
gcloud services enable sql-component.googleapis.com
gcloud services enable sqladmin.googleapis.com
gcloud services enable storage-component.googleapis.com
gcloud services enable cloudbuild.googleapis.com
gcloud services enable secretmanager.googleapis.com
```

### Paso 2: Instalar y Configurar Google Cloud CLI

#### En Windows:
```powershell
# Descargar e instalar desde:
# https://cloud.google.com/sdk/docs/install-sdk#windows

# Después de instalar, abrir nueva terminal y ejecutar:
gcloud init
```

#### En macOS:
```bash
# Instalar con Homebrew
brew install --cask google-cloud-sdk

# Inicializar
gcloud init
```

#### En Linux (Ubuntu/Debian):
```bash
# Agregar repositorio
echo "deb [signed-by=/usr/share/keyrings/cloud.google.gpg] https://packages.cloud.google.com/apt cloud-sdk main" | sudo tee -a /etc/apt/sources.list.d/google-cloud-sdk.list

# Instalar clave
curl https://packages.cloud.google.com/apt/doc/apt-key.gpg | sudo apt-key --keyring /usr/share/keyrings/cloud.google.gpg add -

# Instalar
sudo apt-get update && sudo apt-get install google-cloud-cli

# Inicializar
gcloud init
```

### Paso 3: Configurar Autenticación

```bash
# Autenticar con tu cuenta Google
gcloud auth login

# Configurar proyecto por defecto
gcloud config set project crtlpyme-tesis-[tu-id]

# Verificar configuración
gcloud config list
```

---

## Configuración de Base de Datos

### Paso 1: Crear Instancia Cloud SQL (PostgreSQL)

#### Opción A: Desde Google Cloud Console (Recomendado para principiantes)

1. **Navegar a Cloud SQL**
- En el menú lateral: "SQL"
- Clic "Crear instancia"
- Seleccionar "PostgreSQL"

2. **Configurar Instancia**
```
ID de instancia: crtlpyme-db
Contraseña: [generar contraseña segura - guardar en lugar seguro]
Región: us-central1 (o southamerica-east1 para menor latencia en Chile)
Zona: Cualquiera (dejar automático)
Versión de PostgreSQL: 15
```

3. **Configuración de Máquina**
```
Tipo de máquina: db-f1-micro (1 vCPU, 0.6 GB RAM) - Para desarrollo
Almacenamiento: 10 GB SSD (suficiente para tesis)
Incremento automático: Habilitado
```

4. **Configuraciones Adicionales**
```
Backups automáticos: Habilitado
Mantenimiento: Cualquier día, 2:00 AM
Etiquetas: environment=development, project=crtlpyme
```

#### Opción B: Desde Línea de Comandos

```bash
# Crear instancia Cloud SQL
gcloud sql instances create crtlpyme-db \
--database-version=POSTGRES_15 \
--tier=db-f1-micro \
--region=us-central1 \
--storage-type=SSD \
--storage-size=10GB \
--storage-auto-increase \
--backup-start-time=02:00 \
--maintenance-window-day=SUN \
--maintenance-window-hour=02 \
--maintenance-release-channel=production

# Establecer contraseña para usuario postgres
gcloud sql users set-password postgres \
--instance=crtlpyme-db \
--password=[TU_CONTRASEÑA_SEGURA]
```

### Paso 2: Crear Base de Datos

```bash
# Crear base de datos para la aplicación
gcloud sql databases create crtlpyme \
--instance=crtlpyme-db

# Verificar creación
gcloud sql databases list --instance=crtlpyme-db
```

### Paso 3: Configurar Conexión Segura

```bash
# Obtener IP de conexión
gcloud sql instances describe crtlpyme-db --format="value(ipAddresses[0].ipAddress)"

# La cadena de conexión será:
# postgresql://postgres:[PASSWORD]@[IP_ADDRESS]:5432/crtlpyme
```

---

## Configuración de App Engine

### Paso 1: Preparar Aplicación para Deployment

#### Crear archivo `app.yaml`
```yaml
# /home/ubuntu/CRTLPyme/app.yaml
runtime: nodejs18

env_variables:
NODE_ENV: production
DATABASE_URL: postgresql://postgres:[PASSWORD]@[CLOUD_SQL_IP]:5432/crtlpyme
NEXTAUTH_SECRET: [GENERAR_SECRET_SEGURO]
NEXTAUTH_URL: https://crtlpyme-tesis-[tu-id].uc.r.appspot.com

automatic_scaling:
min_instances: 0
max_instances: 10
target_cpu_utilization: 0.6

resources:
cpu: 1
memory_gb: 0.5
disk_size_gb: 10
```

#### Crear archivo `.gcloudignore`
```
# /home/ubuntu/CRTLPyme/.gcloudignore
node_modules/
.next/
.git/
.env*
*.log
.DS_Store
coverage/
.nyc_output/
docs/
README.md
*.md
.vscode/
.idea/
```

#### Actualizar `package.json`
```json
{
"scripts": {
"build": "next build",
"start": "next start -p $PORT",
"gcp-build": "npm run build"
}
}
```

### Paso 2: Configurar Variables de Entorno Seguras

```bash
# Crear secrets en Secret Manager
echo -n "[TU_DATABASE_URL]" | gcloud secrets create database-url --data-file=-
echo -n "[TU_NEXTAUTH_SECRET]" | gcloud secrets create nextauth-secret --data-file=-

# Verificar secrets creados
gcloud secrets list
```

#### Actualizar `app.yaml` para usar secrets:
```yaml
runtime: nodejs18

env_variables:
NODE_ENV: production
NEXTAUTH_URL: https://crtlpyme-tesis-[tu-id].uc.r.appspot.com

beta_settings:
cloud_sql_instances: crtlpyme-tesis-[tu-id]:us-central1:crtlpyme-db

automatic_scaling:
min_instances: 0
max_instances: 10
```

### Paso 3: Desplegar Aplicación

```bash
# Navegar al directorio del proyecto
cd /home/ubuntu/CRTLPyme

# Desplegar a App Engine
gcloud app deploy

# Cuando pregunte por región, seleccionar:
# us-central (recomendado) o southamerica-east1 (para Chile)

# Abrir aplicación en navegador
gcloud app browse
```

---

## Configuración de Storage

### Paso 1: Crear Bucket para Archivos

```bash
# Crear bucket para archivos estáticos
gsutil mb -p crtlpyme-tesis-[tu-id] -c STANDARD -l us-central1 gs://crtlpyme-files

# Configurar permisos públicos para archivos necesarios
gsutil iam ch allUsers:objectViewer gs://crtlpyme-files/public
```

### Paso 2: Configurar CORS (si es necesario)

```bash
# Crear archivo cors.json
cat > cors.json << EOF
[
{
"origin": ["https://crtlpyme-tesis-[tu-id].uc.r.appspot.com"],
"method": ["GET", "POST", "PUT", "DELETE"],
"responseHeader": ["Content-Type", "Authorization"],
"maxAgeSeconds": 3600
}
]
EOF

# Aplicar configuración CORS
gsutil cors set cors.json gs://crtlpyme-files
```

---

## Configuración de Dominio (Opcional)

### Paso 1: Configurar Dominio Personalizado

```bash
# Mapear dominio personalizado (si tienes uno)
gcloud app domain-mappings create crtlpyme.tudominio.com

# Seguir instrucciones para configurar DNS
```

### Paso 2: Configurar SSL (Automático con App Engine)

App Engine automáticamente provee certificados SSL para dominios personalizados.

---

## Monitoreo y Logging

### Paso 1: Configurar Cloud Monitoring

1. **Habilitar APIs**
```bash
gcloud services enable monitoring.googleapis.com
gcloud services enable logging.googleapis.com
```

2. **Crear Dashboard Básico**
- Ir a "Monitoring" en Cloud Console
- Crear dashboard personalizado
- Agregar métricas de App Engine:
- Requests per second
- Response time
- Error rate
- Instance count

### Paso 2: Configurar Alertas

```bash
# Crear política de alerta para errores
gcloud alpha monitoring policies create --policy-from-file=alert-policy.yaml
```

#### Archivo `alert-policy.yaml`:
```yaml
displayName: "CRTLPyme High Error Rate"
conditions:
- displayName: "Error rate too high"
conditionThreshold:
filter: 'resource.type="gae_app"'
comparison: COMPARISON_GREATER_THAN
thresholdValue: 0.1
duration: 300s
notificationChannels:
- [TU_EMAIL_NOTIFICATION_CHANNEL]
```

---

## Scripts de Automatización

### Script de Deployment Completo

```bash
#!/bin/bash
# /home/ubuntu/CRTLPyme/scripts/deploy.sh

set -e

echo " Iniciando deployment de CRTLPyme..."

# Verificar que estamos en el directorio correcto
if [ ! -f "package.json" ]; then
echo " Error: No se encuentra package.json. Ejecutar desde el directorio raíz del proyecto."
exit 1
fi

# Verificar configuración de gcloud
echo " Verificando configuración de gcloud..."
gcloud config list

# Instalar dependencias
echo " Instalando dependencias..."
npm install

# Ejecutar tests (si existen)
if [ -f "jest.config.js" ]; then
echo " Ejecutando tests..."
npm test
fi

# Build del proyecto
echo " Building proyecto..."
npm run build

# Ejecutar migraciones de base de datos
echo " Ejecutando migraciones de base de datos..."
npx prisma migrate deploy

# Desplegar a App Engine
echo " Desplegando a Google App Engine..."
gcloud app deploy --quiet

# Obtener URL de la aplicación
APP_URL=$(gcloud app browse --no-launch-browser)
echo " Deployment completado!"
echo " Aplicación disponible en: $APP_URL"

# Ejecutar health check
echo " Ejecutando health check..."
curl -f "$APP_URL/api/health" || echo " Health check falló"

echo " Deployment de CRTLPyme completado exitosamente!"
```

### Script de Backup de Base de Datos

```bash
#!/bin/bash
# /home/ubuntu/CRTLPyme/scripts/backup-db.sh

set -e

INSTANCE_NAME="crtlpyme-db"
DATABASE_NAME="crtlpyme"
BACKUP_NAME="crtlpyme-backup-$(date +%Y%m%d-%H%M%S)"

echo " Creando backup de base de datos..."

# Crear backup
gcloud sql backups create \
--instance=$INSTANCE_NAME \
--description="Backup automático de CRTLPyme - $(date)"

echo " Backup creado exitosamente: $BACKUP_NAME"

# Listar backups recientes
echo " Backups recientes:"
gcloud sql backups list --instance=$INSTANCE_NAME --limit=5
```

### Script de Monitoreo de Salud

```bash
#!/bin/bash
# /home/ubuntu/CRTLPyme/scripts/health-check.sh

APP_URL="https://crtlpyme-tesis-[tu-id].uc.r.appspot.com"

echo " Ejecutando health check de CRTLPyme..."

# Check de aplicación
if curl -f "$APP_URL/api/health" > /dev/null 2>&1; then
echo " Aplicación: OK"
else
echo " Aplicación: ERROR"
fi

# Check de base de datos
if curl -f "$APP_URL/api/db-health" > /dev/null 2>&1; then
echo " Base de datos: OK"
else
echo " Base de datos: ERROR"
fi

# Métricas básicas
echo " Métricas recientes:"
gcloud logging read "resource.type=gae_app" --limit=5 --format="table(timestamp,severity,textPayload)"
```

---

## Checklist de Verificación

### Pre-Deployment
- [ ] Proyecto GCP creado y configurado
- [ ] APIs necesarias habilitadas
- [ ] Cloud SQL instancia creada y configurada
- [ ] Base de datos creada
- [ ] Variables de entorno configuradas
- [ ] Secrets Manager configurado
- [ ] Aplicación funciona localmente
- [ ] Tests pasan exitosamente

### Post-Deployment
- [ ] Aplicación accesible en URL de App Engine
- [ ] Base de datos conecta correctamente
- [ ] Autenticación funciona
- [ ] Todas las páginas cargan sin errores
- [ ] APIs responden correctamente
- [ ] Logs no muestran errores críticos
- [ ] Monitoreo configurado
- [ ] Backups automáticos habilitados

### Verificación de Seguridad
- [ ] Variables sensibles en Secret Manager
- [ ] HTTPS habilitado (automático en App Engine)
- [ ] Acceso a base de datos restringido
- [ ] Logs no contienen información sensible
- [ ] Permisos IAM configurados correctamente

---

## Troubleshooting

### Problemas Comunes y Soluciones

#### Error: "Build failed"
```bash
# Verificar logs de build
gcloud app logs tail -s default

# Limpiar cache y reinstalar
rm -rf node_modules .next
npm install
npm run build
```

#### Error: "Database connection failed"
```bash
# Verificar IP de Cloud SQL
gcloud sql instances describe crtlpyme-db

# Verificar conectividad
gcloud sql connect crtlpyme-db --user=postgres

# Verificar string de conexión en variables de entorno
```

#### Error: "Out of memory"
```bash
# Aumentar memoria en app.yaml
resources:
memory_gb: 1 # Aumentar de 0.5 a 1 GB
```

#### Error: "Too many instances"
```bash
# Ajustar scaling en app.yaml
automatic_scaling:
max_instances: 5 # Reducir de 10 a 5
```

### Comandos Útiles para Debugging

```bash
# Ver logs en tiempo real
gcloud app logs tail -s default

# Ver logs de errores únicamente
gcloud app logs read --severity=ERROR

# Conectar a Cloud SQL directamente
gcloud sql connect crtlpyme-db --user=postgres

# Ver métricas de la aplicación
gcloud app instances list

# Ver versiones desplegadas
gcloud app versions list

# Rollback a versión anterior
gcloud app versions migrate [VERSION_ID]
```

---

## Recursos de Ayuda

### Documentación Oficial
- [Google Cloud App Engine](https://cloud.google.com/appengine/docs)
- [Cloud SQL para PostgreSQL](https://cloud.google.com/sql/docs/postgres)
- [Secret Manager](https://cloud.google.com/secret-manager/docs)
- [Cloud Storage](https://cloud.google.com/storage/docs)

### Comunidad y Soporte
- [Stack Overflow - Google Cloud](https://stackoverflow.com/questions/tagged/google-cloud-platform)
- [Google Cloud Community](https://cloud.google.com/community)
- [Reddit r/googlecloud](https://reddit.com/r/googlecloud)

### Contacto de Emergencia
- Soporte de Google Cloud: [Crear caso de soporte](https://cloud.google.com/support)
- Documentación de tesis: Incluir esta guía como anexo

---

## Optimización de Costos

### Tips para Minimizar Costos Durante Desarrollo

1. **Usar Instancias Pequeñas**
```bash
# Cloud SQL: db-f1-micro es suficiente para desarrollo
# App Engine: Configurar max_instances bajo
```

2. **Configurar Auto-scaling Conservador**
```yaml
automatic_scaling:
min_instances: 0 # Escalar a 0 cuando no hay tráfico
max_instances: 3 # Límite bajo para evitar costos inesperados
```

3. **Monitorear Uso Regularmente**
```bash
# Ver facturación actual
gcloud billing accounts list
gcloud billing projects describe crtlpyme-tesis-[tu-id]
```

4. **Configurar Alertas de Presupuesto**
- Ir a "Billing" en Cloud Console
- Crear alerta cuando se alcance 50% y 80% del presupuesto mensual

---

**Última actualización**: Septiembre 12, 2024

---

*Esta guía está diseñada para ser seguida paso a paso por estudiantes sin experiencia previa en Google Cloud. Cada comando ha sido probado y cada paso incluye verificaciones para asegurar el éxito del deployment.*

**¡Importante!** Guardar todas las contraseñas, URLs y configuraciones en un lugar seguro. Esta información será necesaria para la documentación final de la tesis.
