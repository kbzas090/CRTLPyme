# Guía de Configuración CI/CD - GitHub Actions para CRTLPyme

Esta guía explica cómo está configurado el pipeline de CI/CD automático para desplegar la aplicación CRTLPyme a Google Cloud Run usando GitHub Actions.

## 📋 Tabla de Contenidos
- [Descripción General](#descripción-general)
- [Arquitectura del Pipeline](#arquitectura-del-pipeline)
- [Configuración Inicial](#configuración-inicial)
- [Secretos de GitHub](#secretos-de-github)
- [Flujo de Trabajo](#flujo-de-trabajo)
- [Verificación y Monitoreo](#verificación-y-monitoreo)
- [Troubleshooting](#troubleshooting)

---

## 🎯 Descripción General

El pipeline de CI/CD automático está configurado para:
- ✅ Desplegar automáticamente cada vez que se hace push a la rama `main` o `master`
- ✅ Construir una imagen Docker de la aplicación Next.js
- ✅ Subir la imagen a Google Container Registry (GCR)
- ✅ Desplegar automáticamente a Cloud Run
- ✅ Configurar automáticamente todas las variables de entorno y secretos
- ✅ Verificar que el deployment sea exitoso

**Archivo del workflow:** `.github/workflows/deploy.yml`

---

## 🏗️ Arquitectura del Pipeline

```
┌─────────────────┐
│  Git Push       │
│  to main/master │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ GitHub Actions  │
│ Workflow Start  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Authenticate    │
│ with GCP        │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Build Docker    │
│ Image           │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Push to GCR     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Deploy to       │
│ Cloud Run       │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Verify          │
│ Deployment      │
└─────────────────┘
```

---

## ⚙️ Configuración Inicial

### 1. Crear Service Account en GCP

Primero, necesitas crear una Service Account con los permisos necesarios para desplegar a Cloud Run.

**Opción A: Desde la Consola de GCP**

1. Ve a [IAM & Admin > Service Accounts](https://console.cloud.google.com/iam-admin/serviceaccounts?project=crtlpyme-477300)
2. Click en "Create Service Account"
3. Nombre: `github-actions-deployer`
4. Descripción: `Service Account para despliegues automáticos desde GitHub Actions`
5. Click en "Create and Continue"
6. Asigna los siguientes roles:
   - `Cloud Run Admin` (roles/run.admin)
   - `Service Account User` (roles/iam.serviceAccountUser)
   - `Storage Admin` (roles/storage.admin) - para GCR
   - `Secret Manager Secret Accessor` (roles/secretmanager.secretAccessor)
7. Click en "Continue" y luego "Done"

**Opción B: Desde Cloud Shell**

```bash
# Crear la Service Account
gcloud iam service-accounts create github-actions-deployer \
    --description="Service Account para despliegues desde GitHub Actions" \
    --display-name="GitHub Actions Deployer" \
    --project=crtlpyme-477300

# Asignar roles necesarios
gcloud projects add-iam-policy-binding crtlpyme-477300 \
    --member="serviceAccount:github-actions-deployer@crtlpyme-477300.iam.gserviceaccount.com" \
    --role="roles/run.admin"

gcloud projects add-iam-policy-binding crtlpyme-477300 \
    --member="serviceAccount:github-actions-deployer@crtlpyme-477300.iam.gserviceaccount.com" \
    --role="roles/iam.serviceAccountUser"

gcloud projects add-iam-policy-binding crtlpyme-477300 \
    --member="serviceAccount:github-actions-deployer@crtlpyme-477300.iam.gserviceaccount.com" \
    --role="roles/storage.admin"

gcloud projects add-iam-policy-binding crtlpyme-477300 \
    --member="serviceAccount:github-actions-deployer@crtlpyme-477300.iam.gserviceaccount.com" \
    --role="roles/secretmanager.secretAccessor"
```

### 2. Crear y Descargar la Service Account Key

**Desde la Consola de GCP:**

1. Ve a la Service Account que acabas de crear
2. Ve a la pestaña "Keys"
3. Click en "Add Key" > "Create new key"
4. Selecciona "JSON"
5. Click en "Create"
6. Se descargará un archivo JSON - **guárdalo de forma segura**

**Desde Cloud Shell:**

```bash
gcloud iam service-accounts keys create ~/gcp-sa-key.json \
    --iam-account=github-actions-deployer@crtlpyme-477300.iam.gserviceaccount.com \
    --project=crtlpyme-477300

# Mostrar el contenido (cópialo completo)
cat ~/gcp-sa-key.json
```

---

## 🔐 Secretos de GitHub

Debes configurar el siguiente secreto en tu repositorio de GitHub:

### Configurar Secreto en GitHub

1. Ve a tu repositorio en GitHub: [https://github.com/kbzas090/CRTLPyme](https://github.com/kbzas090/CRTLPyme)
2. Click en "Settings" > "Secrets and variables" > "Actions"
3. Click en "New repository secret"
4. Crea el siguiente secreto:

#### GCP_SA_KEY
- **Nombre:** `GCP_SA_KEY`
- **Valor:** Contenido completo del archivo JSON de la Service Account Key que descargaste en el paso anterior
- **Descripción:** Service Account Key para autenticación con GCP

**IMPORTANTE:** El valor debe ser el JSON completo, incluyendo las llaves `{` `}`. Por ejemplo:

```json
{
  "type": "service_account",
  "project_id": "crtlpyme-477300",
  "private_key_id": "...",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
  "client_email": "github-actions-deployer@crtlpyme-477300.iam.gserviceaccount.com",
  "client_id": "...",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "..."
}
```

### Verificar Secretos en GCP Secret Manager

El pipeline utiliza los siguientes secretos de GCP Secret Manager:
- `DATABASE_URL` - URL de conexión a Cloud SQL PostgreSQL
- `NEXTAUTH_SECRET` - Secret para NextAuth.js
- `NEXTAUTH_URL` - URL pública de la aplicación
- `SENDGRID_API_KEY` - API Key de SendGrid
- `SENDGRID_FROM_EMAIL` - Email remitente de SendGrid
- `TRANSBANK_API_KEY` - API Key de Transbank (sandbox)
- `TRANSBANK_COMMERCE_CODE` - Código de comercio de Transbank
- `TRANSBANK_ENVIRONMENT` - Entorno de Transbank (integration/production)

Puedes verificar que existen en [Secret Manager](https://console.cloud.google.com/security/secret-manager?project=crtlpyme-477300).

---

## 🔄 Flujo de Trabajo

### Despliegue Automático

El despliegue se ejecuta automáticamente cuando:
1. Haces `git push` a la rama `main` o `master`
2. Ejecutas manualmente el workflow desde GitHub Actions

### Pasos del Pipeline

1. **Checkout del Código** - Descarga el código del repositorio
2. **Autenticación con GCP** - Autentica usando la Service Account Key
3. **Configuración de Cloud SDK** - Configura gcloud CLI
4. **Configuración de Docker** - Configura Docker para usar GCR
5. **Build de Imagen Docker** - Construye la imagen con tags:
   - `gcr.io/crtlpyme-477300/crtlpyme:latest`
   - `gcr.io/crtlpyme-477300/crtlpyme:<commit-sha>`
6. **Push a GCR** - Sube las imágenes a Google Container Registry
7. **Deploy a Cloud Run** - Despliega el servicio con:
   - Región: `us-central1`
   - Memoria: 2Gi
   - CPU: 2 vCPU
   - Timeout: 300s
   - Min instances: 0
   - Max instances: 10
   - Port: 3000
   - Todos los secretos configurados
8. **Verificación** - Verifica que el servicio responda correctamente

### Ejemplo de Despliegue

```bash
# En tu máquina local
git add .
git commit -m "feat: nueva funcionalidad"
git push origin main

# El pipeline se ejecutará automáticamente
# Puedes ver el progreso en:
# https://github.com/kbzas090/CRTLPyme/actions
```

---

## 📊 Verificación y Monitoreo

### Ver el Progreso del Deployment

1. Ve a [GitHub Actions](https://github.com/kbzas090/CRTLPyme/actions)
2. Verás el workflow en ejecución
3. Click en el workflow para ver los detalles de cada paso
4. Al finalizar, verás la URL del servicio en los logs

### Verificar en Cloud Run

1. Ve a [Cloud Run](https://console.cloud.google.com/run?project=crtlpyme-477300)
2. Busca el servicio `crtlpyme-app`
3. Verifica que esté "HEALTHY" y con tráfico al 100%
4. Click en el servicio para ver métricas y logs

### Verificar la Aplicación

```bash
# URL de producción (ejemplo)
curl https://crtlpyme-app-XXXXXXXXXX-uc.a.run.app

# O abre en el navegador
```

---

## 🔧 Troubleshooting

### Error: "Permission denied"

**Problema:** El Service Account no tiene los permisos necesarios.

**Solución:**
```bash
# Verificar roles asignados
gcloud projects get-iam-policy crtlpyme-477300 \
    --flatten="bindings[].members" \
    --filter="bindings.members:serviceAccount:github-actions-deployer@crtlpyme-477300.iam.gserviceaccount.com"

# Asignar rol faltante (ejemplo)
gcloud projects add-iam-policy-binding crtlpyme-477300 \
    --member="serviceAccount:github-actions-deployer@crtlpyme-477300.iam.gserviceaccount.com" \
    --role="roles/run.admin"
```

### Error: "Secret not found"

**Problema:** Algún secreto de GCP Secret Manager no existe o no tiene la versión "latest".

**Solución:**
```bash
# Listar secretos existentes
gcloud secrets list --project=crtlpyme-477300

# Crear secreto faltante
echo -n "valor-del-secreto" | gcloud secrets create NOMBRE_SECRETO \
    --data-file=- \
    --project=crtlpyme-477300

# Dar acceso al Service Account
gcloud secrets add-iam-policy-binding NOMBRE_SECRETO \
    --member="serviceAccount:github-actions-deployer@crtlpyme-477300.iam.gserviceaccount.com" \
    --role="roles/secretmanager.secretAccessor" \
    --project=crtlpyme-477300
```

### Error: "Docker build failed"

**Problema:** Error durante el build de la imagen Docker.

**Solución:**
1. Verifica que el `Dockerfile` esté correcto
2. Revisa los logs del workflow en GitHub Actions
3. Prueba el build localmente:
```bash
docker build -t crtlpyme-test .
```

### Error: "Service deployment failed"

**Problema:** Error al desplegar en Cloud Run.

**Solución:**
1. Verifica los logs en Cloud Run Console
2. Verifica que todos los secretos estén configurados correctamente
3. Verifica la cuota de recursos en tu proyecto GCP

### El servicio no responde (HTTP 500/502)

**Problema:** El servicio se desplegó pero no responde correctamente.

**Solución:**
1. Revisa los logs de Cloud Run:
```bash
gcloud run services logs read crtlpyme-app \
    --region=us-central1 \
    --project=crtlpyme-477300 \
    --limit=50
```

2. Verifica las variables de entorno:
```bash
gcloud run services describe crtlpyme-app \
    --region=us-central1 \
    --project=crtlpyme-477300 \
    --format="yaml(spec.template.spec.containers[0].env)"
```

3. Verifica la conexión a la base de datos

---

## 📝 Notas Importantes

1. **Seguridad:** Nunca commitees credenciales o secretos en el código. Usa siempre GitHub Secrets y GCP Secret Manager.

2. **Costos:** Cloud Run tiene un tier gratuito, pero verifica tu uso en la [consola de facturación](https://console.cloud.google.com/billing?project=crtlpyme-477300).

3. **Rollback:** Si un deployment falla, Cloud Run mantiene la versión anterior activa. Puedes hacer rollback desde la consola.

4. **Branches:** El workflow solo se ejecuta en `main` y `master`. Para testing, puedes modificar el trigger en `.github/workflows/deploy.yml`.

5. **Manual Deployment:** Puedes ejecutar el workflow manualmente desde GitHub Actions usando el botón "Run workflow".

---

## 🎉 Conclusión

Con esta configuración, cada vez que hagas push a `main`, tu aplicación se desplegará automáticamente a Cloud Run. El proceso típico toma entre 5-10 minutos.

**URL del proyecto:** [https://github.com/kbzas090/CRTLPyme](https://github.com/kbzas090/CRTLPyme)

**Consulta los workflows:** [https://github.com/kbzas090/CRTLPyme/actions](https://github.com/kbzas090/CRTLPyme/actions)

**Consola de Cloud Run:** [https://console.cloud.google.com/run?project=crtlpyme-477300](https://console.cloud.google.com/run?project=crtlpyme-477300)

---

## 📚 Referencias

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Cloud Run Documentation](https://cloud.google.com/run/docs)
- [Google Container Registry](https://cloud.google.com/container-registry/docs)
- [Secret Manager](https://cloud.google.com/secret-manager/docs)

---

**Última actualización:** Noviembre 8, 2025
**Versión:** 1.0.0
