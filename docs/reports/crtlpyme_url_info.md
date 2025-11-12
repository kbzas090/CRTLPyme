# URL de Acceso al Sistema CRTLPyme

## ✅ Servicio Desplegado y Operativo

### URL Principal de Acceso
```
https://crtlpyme-app-399088129827.us-central1.run.app/
```

---

## 📋 Información del Despliegue

| Parámetro | Valor |
|-----------|-------|
| **Servicio** | crtlpyme-app |
| **Región** | us-central1 |
| **Proyecto GCP** | crtlpyme-477300 |
| **Estado** | ✅ Activo (HTTP 200) |
| **Plataforma** | Google Cloud Run |

---

## 🔗 URLs Principales del Sistema

### Página Principal
- **Landing Page**: https://crtlpyme-app-399088129827.us-central1.run.app/

### Autenticación
- **Login**: https://crtlpyme-app-399088129827.us-central1.run.app/auth/login
- **Registro**: https://crtlpyme-app-399088129827.us-central1.run.app/auth/register

### Demo y Onboarding
- **Demo Gratuita**: https://crtlpyme-app-399088129827.us-central1.run.app/demo
- **Onboarding**: https://crtlpyme-app-399088129827.us-central1.run.app/onboarding

### Centro de Reportería (Admin)
- **Dashboard de Reportes**: https://crtlpyme-app-399088129827.us-central1.run.app/admin/reports
- **Reporte de Ventas**: https://crtlpyme-app-399088129827.us-central1.run.app/admin/reports/sales
- **Reporte de Productos**: https://crtlpyme-app-399088129827.us-central1.run.app/admin/reports/products
- **Reporte de Clientes**: https://crtlpyme-app-399088129827.us-central1.run.app/admin/reports/customers

---

## 🔌 APIs de Reportería

### Ventas
```bash
curl -X GET "https://crtlpyme-app-399088129827.us-central1.run.app/api/reports/sales?startDate=2025-11-01&endDate=2025-11-07" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Productos
```bash
curl -X GET "https://crtlpyme-app-399088129827.us-central1.run.app/api/reports/products" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Clientes
```bash
curl -X GET "https://crtlpyme-app-399088129827.us-central1.run.app/api/reports/customers" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Exportación
```bash
curl -X GET "https://crtlpyme-app-399088129827.us-central1.run.app/api/reports/export?type=sales&format=excel" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 🎯 Verificación del Servicio

### Estado Actual
```bash
# Verificado el 10 de noviembre de 2025
curl -I https://crtlpyme-app-399088129827.us-central1.run.app/
# Respuesta: HTTP/2 200
```

### Características del Despliegue
- ✅ Acceso público habilitado (`--allow-unauthenticated`)
- ✅ Memoria: 2Gi
- ✅ CPU: 2 cores
- ✅ Timeout: 300 segundos
- ✅ Auto-scaling: 0-10 instancias
- ✅ Puerto: 3000

---

## 🔐 Consolas de Administración GCP

- **Cloud Run Console**: https://console.cloud.google.com/run?project=crtlpyme-477300
- **Secret Manager**: https://console.cloud.google.com/security/secret-manager?project=crtlpyme-477300
- **Logs**: https://console.cloud.google.com/logs?project=crtlpyme-477300
- **IAM & Service Accounts**: https://console.cloud.google.com/iam-admin/serviceaccounts?project=crtlpyme-477300
- **Facturación**: https://console.cloud.google.com/billing?project=crtlpyme-477300

---

## 📝 Notas Adicionales

1. **Título del Sistema**: "CRTLPyme - Control Total para PYMEs"
2. **Descripción**: Sistema POS-SaaS completo para tiendas de abarrotes, kioscos y pequeños comercios
3. **Versión**: v1.0
4. **Framework**: Next.js (React)
5. **Ambiente**: Producción (NODE_ENV=production)

---

## 🚀 Próximos Pasos

Para acceder al sistema:
1. Visita: https://crtlpyme-app-399088129827.us-central1.run.app/
2. Haz clic en "Prueba Gratis 14 Días" o "Iniciar Sesión"
3. Si no tienes cuenta, regístrate en: https://crtlpyme-app-399088129827.us-central1.run.app/auth/register

---

**Fecha de verificación**: 10 de noviembre de 2025  
**Estado del servicio**: ✅ Operativo
