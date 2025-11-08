# 🚀 Guía de Configuración CI/CD - CRTLPyme

**Fecha:** 8 de Noviembre, 2025  
**Objetivo:** Configurar despliegue automático desde GitHub a Google Cloud Run

---

## 📋 Estado Actual

### ✅ Ya Completado
- [x] GitHub Actions workflow creado (`.github/workflows/deploy.yml`)
- [x] Dockerfile optimizado para Cloud Run
- [x] Scripts de configuración preparados
- [x] Documentación completa

### ⏳ Pendiente (Requiere Acción)
- [ ] Verificar/corregir permisos del Service Account
- [ ] Configurar secreto `GCP_SA_KEY` en GitHub
- [ ] Probar el primer deployment

---

## 🔧 Solución al Problema Actual

### Diagnóstico
El último deployment falló en el paso **"Push image to GCR"** porque el Service Account no tiene los permisos correctos para subir imágenes a Google Container Registry.

### Solución en 3 Pasos

---

## 📝 PASO 1: Verificar y Corregir Permisos

### Opción A: Usar Script Automático (Recomendado)

1. **Abrir Google Cloud Shell:**
   ```
   https://console.cloud.google.com/?cloudshell=true&project=crtlpyme-477300
   ```

2. **Clonar el repositorio:**
   ```bash
   git clone https://github.com/kbzas090/CRTLPyme.git
   cd CRTLPyme
   ```

3. **Ejecutar script de corrección:**
   ```bash
   chmod +x scripts/fix-sa-permissions.sh
   ./scripts/fix-sa-permissions.sh
   ```

   Este script:
   - ✅ Verifica que el Service Account existe
   - ✅ Habilita todas las APIs necesarias
   - ✅ Asigna los permisos correctos:
     - `roles/run.admin` - Para deployar a Cloud Run
     - `roles/iam.serviceAccountUser` - Para usar el SA
     - `roles/storage.admin` - Para subir imágenes a GCR
     - `roles/secretmanager.secretAccessor` - Para acceder a secrets
     - `roles/artifactregistry.writer` - Para Artifact Registry

### Opción B: Manual (Si prefieres hacerlo paso a paso)

```bash
# 1. Configurar proyecto
gcloud config set project crtlpyme-477300

# 2. Asignar permisos
SA_EMAIL="github-actions@crtlpyme-477300.iam.gserviceaccount.com"

gcloud projects add-iam-policy-binding crtlpyme-477300 \
  --member="serviceAccount:${SA_EMAIL}" \
  --role="roles/run.admin"

gcloud projects add-iam-policy-binding crtlpyme-477300 \
  --member="serviceAccount:${SA_EMAIL}" \
  --role="roles/storage.admin"

gcloud projects add-iam-policy-binding crtlpyme-477300 \
  --member="serviceAccount:${SA_EMAIL}" \
  --role="roles/iam.serviceAccountUser"

gcloud projects add-iam-policy-binding crtlpyme-477300 \
  --member="serviceAccount:${SA_EMAIL}" \
  --role="roles/secretmanager.secretAccessor"

# 3. Verificar permisos
gcloud projects get-iam-policy crtlpyme-477300 \
  --flatten="bindings[].members" \
  --filter="bindings.members:serviceAccount:${SA_EMAIL}" \
  --format="table(bindings.role)"
```

---

## 🔑 PASO 2: Configurar GitHub Secret

### Si Ya Tienes el Service Account JSON:

1. **Ir a GitHub Secrets:**
   ```
   https://github.com/kbzas090/CRTLPyme/settings/secrets/actions
   ```

2. **Verificar si existe `GCP_SA_KEY`:**
   - Si existe: Click en "Update" y pega el nuevo JSON
   - Si no existe: Click en "New repository secret"

3. **Configurar el secret:**
   - **Nombre:** `GCP_SA_KEY`
   - **Valor:** Todo el contenido del JSON (incluyendo `{` y `}`)
   - Click en "Add secret" o "Update secret"

### Si NO Tienes el Service Account JSON:

**Generar nueva clave desde Cloud Shell:**

```bash
# 1. Abrir Cloud Shell
# https://console.cloud.google.com/?cloudshell=true&project=crtlpyme-477300

# 2. Clonar repo (si no lo has hecho)
git clone https://github.com/kbzas090/CRTLPyme.git
cd CRTLPyme

# 3. Ejecutar script de setup
chmod +x scripts/setup-github-actions-sa.sh
./scripts/setup-github-actions-sa.sh

# 4. Ver la clave generada
cat ~/gcp-sa-key-github-actions.json

# 5. Copiar TODO el contenido y pegarlo en GitHub Secrets
```

---

## 🧪 PASO 3: Probar el Deployment

### Opción 1: Deployment Manual (Recomendado para primera vez)

1. **Ir a GitHub Actions:**
   ```
   https://github.com/kbzas090/CRTLPyme/actions
   ```

2. **Ejecutar workflow manualmente:**
   - Click en "Deploy to Cloud Run"
   - Click en "Run workflow"
   - Seleccionar branch "main"
   - Click en "Run workflow" (verde)

3. **Monitorear el progreso:**
   - Verás los pasos ejecutándose en tiempo real
   - Debería tomar ~8-10 minutos

### Opción 2: Push a Main (Automático)

```bash
# Hacer un pequeño cambio para trigger el workflow
cd /ruta/a/tu/CRTLPyme

# Crear un commit de prueba
echo "CI/CD configured - $(date)" >> .github/CICD_STATUS.txt
git add .github/CICD_STATUS.txt
git commit -m "test: Trigger CI/CD pipeline"
git push origin main

# Ver el workflow ejecutándose
# https://github.com/kbzas090/CRTLPyme/actions
```

---

## ✅ Verificación del Deployment

### 1. Verificar que el workflow completó exitosamente

Todos estos pasos deben mostrar ✅:
- [x] Checkout code
- [x] Authenticate to Google Cloud
- [x] Set up Cloud SDK
- [x] Configure Docker for GCR
- [x] Build Docker image
- [x] **Push image to GCR** ← Este era el que fallaba
- [x] Deploy to Cloud Run
- [x] Show service URL
- [x] Verify deployment

### 2. Verificar la aplicación en Cloud Run

```bash
# Obtener URL del servicio
gcloud run services describe crtlpyme-app \
  --region us-central1 \
  --format 'value(status.url)'
```

O visitar directamente:
```
https://console.cloud.google.com/run?project=crtlpyme-477300
```

### 3. Probar la aplicación

Abrir la URL del servicio y verificar que:
- La aplicación carga correctamente
- No hay errores en la consola
- Las funciones básicas funcionan

---

## 🔍 Troubleshooting

### Error: "Permission denied" al subir a GCR

**Causa:** Service Account no tiene `roles/storage.admin`

**Solución:**
```bash
gcloud projects add-iam-policy-binding crtlpyme-477300 \
  --member="serviceAccount:github-actions@crtlpyme-477300.iam.gserviceaccount.com" \
  --role="roles/storage.admin"
```

### Error: "Secret GCP_SA_KEY not found"

**Causa:** El secret no está configurado en GitHub

**Solución:** Seguir PASO 2 de esta guía

### Error: "Service account does not exist"

**Causa:** El Service Account no fue creado

**Solución:** Ejecutar `./scripts/setup-github-actions-sa.sh`

### Deployment exitoso pero la app no funciona

**Verificar:**
1. **Secrets en GCP Secret Manager:**
   ```
   https://console.cloud.google.com/security/secret-manager?project=crtlpyme-477300
   ```
   
   Deben existir:
   - `DATABASE_URL`
   - `NEXTAUTH_SECRET`
   - `NEXTAUTH_URL`
   - `SENDGRID_API_KEY`
   - `SENDGRID_FROM_EMAIL`
   - `transbank-api-key`
   - `transbank-commerce-code`
   - `TRANSBANK_ENVIRONMENT`

2. **Logs de Cloud Run:**
   ```bash
   gcloud run services logs read crtlpyme-app \
     --region us-central1 \
     --limit 50
   ```

3. **Variables de entorno:**
   ```bash
   gcloud run services describe crtlpyme-app \
     --region us-central1 \
     --format yaml | grep -A 20 env:
   ```

---

## 📊 Arquitectura del CI/CD

```
┌─────────────────┐
│   GitHub        │
│   (Push to main)│
└────────┬────────┘
         │
         ▼
┌─────────────────────────────┐
│   GitHub Actions            │
│   - Build Docker Image      │
│   - Run Tests              │
│   - Security Scan          │
└────────┬────────────────────┘
         │
         ▼
┌─────────────────────────────┐
│   Google Container Registry │
│   - Store Docker Images     │
└────────┬────────────────────┘
         │
         ▼
┌─────────────────────────────┐
│   Google Cloud Run          │
│   - Deploy Container        │
│   - Auto-scale             │
│   - HTTPS Endpoint         │
└─────────────────────────────┘
```

---

## 📚 Referencias

### URLs Importantes
- **GitHub Repository:** https://github.com/kbzas090/CRTLPyme
- **GitHub Actions:** https://github.com/kbzas090/CRTLPyme/actions
- **Cloud Run Console:** https://console.cloud.google.com/run?project=crtlpyme-477300
- **Secret Manager:** https://console.cloud.google.com/security/secret-manager?project=crtlpyme-477300
- **IAM & Admin:** https://console.cloud.google.com/iam-admin/iam?project=crtlpyme-477300
- **Cloud Shell:** https://console.cloud.google.com/?cloudshell=true&project=crtlpyme-477300

### Documentación
- **GitHub Actions:** `.github/workflows/deploy.yml`
- **Dockerfile:** `Dockerfile`
- **Setup Script:** `scripts/setup-github-actions-sa.sh`
- **Fix Permissions:** `scripts/fix-sa-permissions.sh`

---

## 🎯 Checklist de Completado

### Configuración
- [ ] Service Account tiene permisos correctos
- [ ] APIs habilitadas en GCP
- [ ] Secret `GCP_SA_KEY` configurado en GitHub
- [ ] Secrets de aplicación configurados en Secret Manager

### Testing
- [ ] Workflow ejecutado manualmente con éxito
- [ ] Imagen subida correctamente a GCR
- [ ] Servicio desplegado en Cloud Run
- [ ] Aplicación responde correctamente
- [ ] Push automático funciona

### Validación Final
- [ ] URL de Cloud Run accesible
- [ ] Login funciona
- [ ] Base de datos conectada
- [ ] Variables de entorno correctas
- [ ] No hay errores en logs

---

## 🎉 Siguiente Paso

Una vez completados todos los pasos de esta guía, tendrás:

✅ **Deployment automático** - Cada push a `main` despliega automáticamente  
✅ **Ambiente de producción** - Aplicación corriendo en Cloud Run  
✅ **Escalabilidad** - Auto-scaling según demanda  
✅ **Seguridad** - Secrets manejados correctamente  
✅ **Monitoreo** - Logs y métricas disponibles  

---

**Última actualización:** 8 de Noviembre, 2025  
**Versión:** 2.0  
**Estado:** ✅ Listo para implementar
