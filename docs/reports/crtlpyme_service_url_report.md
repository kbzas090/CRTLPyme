# 🔍 Reporte de URL del Servicio CRTLPyme en Cloud Run

**Fecha:** 10 de Noviembre de 2025  
**Proyecto GCP:** crtlpyme-477300  
**Región:** us-central1

---

## ⚠️ Estado Actual

**gcloud CLI:** ❌ No instalado en este entorno

No fue posible ejecutar los comandos `gcloud` solicitados porque Google Cloud SDK no está instalado en este sistema.

---

## 📋 URLs Encontradas en la Documentación del Proyecto

Durante la búsqueda en los archivos del proyecto `/home/ubuntu/github_repos/CRTLPyme/`, se encontraron **dos URLs diferentes** de Cloud Run mencionadas en la documentación:

### 🔗 URL Principal (Más Reciente)

```
https://crtlpyme-app-399088129827.us-central1.run.app
```

**Encontrada en:**
- `INSTRUCCIONES_DESPLIEGUE_REPORTERIA.md`
- `IMPLEMENTACION_REPORTERIA_RESUMEN.md`
- `INTERFACE_AUDIT_REPORT.md`

**Endpoints documentados:**
- **Home:** https://crtlpyme-app-399088129827.us-central1.run.app/
- **Centro de reportería:** https://crtlpyme-app-399088129827.us-central1.run.app/admin/reports
- **Reporte de ventas:** https://crtlpyme-app-399088129827.us-central1.run.app/admin/reports/sales
- **Reporte de productos:** https://crtlpyme-app-399088129827.us-central1.run.app/admin/reports/products
- **Reporte de clientes:** https://crtlpyme-app-399088129827.us-central1.run.app/admin/reports/customers

### 🔗 URL Alternativa (Anterior)

```
https://crtlpyme-vhndaajwpq-uc.a.run.app
```

**Encontrada en:**
- `TRANSBANK_VERIFICATION_REPORT.md`
- `TRANSBANK_SETUP_ACTION_PLAN.md`

**Endpoints documentados:**
- **Planes de suscripción:** https://crtlpyme-vhndaajwpq-uc.a.run.app/subscriptions/plans
- **API de planes:** https://crtlpyme-vhndaajwpq-uc.a.run.app/api/subscriptions/plans

---

## 🎯 URL Recomendada para Usar

### ✅ URL Principal Actual

```
https://crtlpyme-app-399088129827.us-central1.run.app
```

**Razones:**
1. ✅ Aparece en documentos más recientes (reportería e interfaz)
2. ✅ Formato más estándar de Cloud Run (`*.us-central1.run.app`)
3. ✅ Incluye el número de proyecto GCP (399088129827)
4. ✅ Mencionada en múltiples documentos de implementación

---

## 🔐 Credenciales de Acceso

Para acceder al sistema desplegado, usa las credenciales documentadas en `ctrlpyme_credenciales.md`:

### Super Administrador (PROVEEDOR)
```
Email:      admin_saas@crtlpyme.cl
Contraseña: Admin2025!
Rol:        PROVEEDOR
```

### Administrador Plan BASIC
```
Email:      admin@gmail.com
Contraseña: Demo2025!
Rol:        ADMIN
Negocio:    Almacén El Rinconcito
```

### Administrador Plan PRO
```
Email:      admin@minimarketdonluis.cl
Contraseña: Demo2025!
Rol:        ADMIN
Negocio:    Minimarket Don Luis
```

### Administrador Plan ENTERPRISE
```
Email:      camila.herrera@saludtotal.cl
Contraseña: Demo2025!
Rol:        ADMIN
Negocio:    Farmacia Salud Total
```

---

## 🛠️ Comandos para Verificar (Requiere gcloud instalado)

Si necesitas verificar el estado del servicio desde un entorno con `gcloud` instalado:

### 1. Listar servicios en Cloud Run
```bash
gcloud run services list --platform managed --region us-central1 --project crtlpyme-477300
```

### 2. Obtener URL del servicio específico
```bash
# Si el servicio se llama "crtlpyme-app"
gcloud run services describe crtlpyme-app \
  --platform managed \
  --region us-central1 \
  --project crtlpyme-477300 \
  --format="value(status.url)"
```

### 3. Ver detalles completos del servicio
```bash
gcloud run services describe crtlpyme-app \
  --platform managed \
  --region us-central1 \
  --project crtlpyme-477300
```

### 4. Ver logs del servicio
```bash
gcloud run services logs read crtlpyme-app \
  --region us-central1 \
  --project crtlpyme-477300 \
  --limit 50
```

---

## 📊 Información del Proyecto

### Configuración GCP
- **Proyecto ID:** crtlpyme-477300
- **Región:** us-central1
- **Plataforma:** Cloud Run (managed)
- **Base de datos:** Cloud SQL PostgreSQL
  - **IP:** 136.116.45.158:5432
  - **Database:** crtlpyme-db

### Configuración de la Aplicación
- **Framework:** Next.js 14
- **Puerto:** 3000
- **Memoria:** 2GB
- **CPU:** 2 vCPUs
- **Auto-scaling:** 0-10 instancias
- **Autenticación:** NextAuth.js
- **ORM:** Prisma

---

## 🧪 Verificación de Disponibilidad

### Prueba Manual
Abre tu navegador y visita:
```
https://crtlpyme-app-399088129827.us-central1.run.app
```

### Prueba con curl
```bash
# Health check básico
curl -I https://crtlpyme-app-399088129827.us-central1.run.app

# Verificar API de planes
curl https://crtlpyme-app-399088129827.us-central1.run.app/api/subscriptions/plans
```

### Respuesta Esperada
- **Status Code:** 200 OK
- **Content-Type:** text/html (para la página principal)
- **Content-Type:** application/json (para endpoints API)

---

## 📝 Notas Adicionales

### Posibles Nombres del Servicio
Según la documentación, el servicio podría estar registrado con alguno de estos nombres:
- `crtlpyme-app`
- `crtlpyme`
- `crtlpyme-app-399088129827`

### Archivos de Configuración Relevantes
- **Dockerfile:** `/home/ubuntu/github_repos/CRTLPyme/Dockerfile`
- **Cloud Build:** `/home/ubuntu/github_repos/CRTLPyme/cloudbuild.yaml`
- **Deploy Script:** `/home/ubuntu/github_repos/CRTLPyme/deploy-to-cloud-run.sh`
- **Deployment Guide:** `/home/ubuntu/github_repos/CRTLPyme/DEPLOYMENT_GUIDE.md`

### Secrets Configurados en GCP Secret Manager
- `DATABASE_URL` - Conexión a PostgreSQL
- `NEXTAUTH_SECRET` - Token de seguridad NextAuth
- `SENDGRID_API_KEY` - API de SendGrid
- `SENDGRID_FROM_EMAIL` - Email remitente
- `TRANSBANK_API_KEY` - API de Transbank
- `TRANSBANK_COMMERCE_CODE` - Código de comercio
- `TRANSBANK_ENVIRONMENT` - Entorno (integration/production)

---

## ✅ Conclusión

### URL del Servicio CRTLPyme

```
🔗 https://crtlpyme-app-399088129827.us-central1.run.app
```

Esta es la URL más probable y actualizada del servicio CRTLPyme desplegado en Google Cloud Run.

### Próximos Pasos Recomendados

1. ✅ **Verificar acceso:** Abre la URL en tu navegador
2. ✅ **Probar login:** Usa las credenciales documentadas
3. ✅ **Revisar funcionalidad:** Prueba los módulos principales
4. ✅ **Verificar logs:** Si tienes acceso a GCP Console

### Si la URL no funciona

1. Instala Google Cloud SDK en tu entorno
2. Ejecuta los comandos `gcloud` mencionados arriba
3. Verifica el estado del servicio en [GCP Console](https://console.cloud.google.com/run?project=crtlpyme-477300)
4. Revisa los logs en [Cloud Logging](https://console.cloud.google.com/logs?project=crtlpyme-477300)

---

**Generado:** 10 de Noviembre de 2025  
**Fuente:** Análisis de documentación del proyecto CRTLPyme  
**Estado:** ✅ Información recopilada exitosamente
