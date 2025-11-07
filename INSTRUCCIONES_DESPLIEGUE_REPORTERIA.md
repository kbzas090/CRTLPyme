# 🚀 Instrucciones de Despliegue - Sistema de Reportería

## ✅ Estado Actual

Todos los cambios del sistema de reportería han sido:
- ✅ Implementados completamente
- ✅ Commiteados a GitHub
- ✅ Pusheados a la rama `main`
- ⏳ Pendiente: Despliegue en GCP Cloud Run

## 📋 Commits Realizados

1. **Commit b4a54d3**: Sistema de reportería completo
   - 9 archivos nuevos
   - ~2,600 líneas de código

2. **Commit 032f8a2**: Documentación de implementación
   - Resumen completo de cambios

## 🔧 Opciones de Despliegue

### Opción 1: Despliegue Automático via Console GCP

La forma más sencilla si no tienes gcloud CLI configurado:

1. Ir a https://console.cloud.google.com/
2. Seleccionar proyecto: **crtlpyme-477300**
3. Navegar a **Cloud Run** > **Services** > **crtlpyme**
4. Hacer click en **EDIT & DEPLOY NEW REVISION**
5. En la sección **Source**, seleccionar:
   - **Deploy from source repository**
   - Repository: **kbzas090/CRTLPyme**
   - Branch: **main**
6. Click en **DEPLOY**
7. Esperar a que el despliegue termine (~5-10 minutos)

### Opción 2: Despliegue con gcloud CLI

Si tienes gcloud CLI instalado y configurado:

```bash
# 1. Autenticar con GCP
gcloud auth login

# 2. Configurar proyecto
gcloud config set project crtlpyme-477300

# 3. Ir al directorio del proyecto
cd /home/ubuntu/github_repos/CRTLPyme

# 4. Ejecutar script de deployment
./deploy-to-cloud-run.sh

# O desplegar manualmente:
gcloud run deploy crtlpyme \
  --source . \
  --region us-central1 \
  --platform managed \
  --allow-unauthenticated \
  --set-cloudsql-instances crtlpyme-477300:us-central1:crtlpyme-db \
  --set-env-vars DATABASE_URL="postgresql://postgres:CRTLPyme2025!@/crtlpyme?host=/cloudsql/crtlpyme-477300:us-central1:crtlpyme-db"
```

### Opción 3: Trigger Manual en Cloud Build (si está configurado)

1. Ir a https://console.cloud.google.com/cloud-build/triggers
2. Buscar el trigger para CRTLPyme
3. Hacer click en **RUN**
4. Seleccionar branch: **main**
5. Click en **RUN TRIGGER**

## 🔍 Validación Post-Despliegue

Una vez completado el despliegue, validar las nuevas funcionalidades:

### 1. Verificar Acceso Básico

```bash
# Verificar que el servicio esté corriendo
curl https://crtlpyme-app-399088129827.us-central1.run.app/

# Debería responder con la página principal
```

### 2. Probar Rutas de Reportería

Acceder desde el navegador (con sesión iniciada como ADMIN):

- **Centro de reportería**: https://crtlpyme-app-399088129827.us-central1.run.app/admin/reports
- **Reporte de ventas**: https://crtlpyme-app-399088129827.us-central1.run.app/admin/reports/sales
- **Reporte de productos**: https://crtlpyme-app-399088129827.us-central1.run.app/admin/reports/products
- **Reporte de clientes**: https://crtlpyme-app-399088129827.us-central1.run.app/admin/reports/customers

### 3. Probar APIs de Reportería

Con Postman, curl o desde el navegador (necesitas autenticación):

```bash
# Reporte de ventas
curl -X GET "https://crtlpyme-app-399088129827.us-central1.run.app/api/reports/sales?startDate=2025-11-01&endDate=2025-11-07" \
  -H "Cookie: your-session-cookie"

# Reporte de productos
curl -X GET "https://crtlpyme-app-399088129827.us-central1.run.app/api/reports/products" \
  -H "Cookie: your-session-cookie"

# Reporte de clientes
curl -X GET "https://crtlpyme-app-399088129827.us-central1.run.app/api/reports/customers" \
  -H "Cookie: your-session-cookie"

# Exportar a Excel
curl -X GET "https://crtlpyme-app-399088129827.us-central1.run.app/api/reports/export?type=sales&format=excel" \
  -H "Cookie: your-session-cookie" \
  -o reporte-ventas.xlsx
```

### 4. Checklist de Validación Manual

- [ ] Login exitoso con usuario ADMIN
- [ ] Navegar a /admin/reports
- [ ] Ver las 3 tarjetas de tipos de reportes
- [ ] Click en "Reportes de Ventas"
- [ ] Verificar que se carguen los datos
- [ ] Verificar que se muestren los gráficos
- [ ] Cambiar filtros de fecha
- [ ] Click en "Descargar Excel" - verificar descarga
- [ ] Click en "Descargar CSV" - verificar descarga
- [ ] Volver y probar "Reportes de Productos"
- [ ] Volver y probar "Reportes de Clientes"

## 🐛 Troubleshooting

### Problema: Error 404 en rutas de reportes

**Solución:**
1. Verificar que el despliegue se completó exitosamente
2. Ver logs: `gcloud run logs read crtlpyme --region us-central1 --limit 50`
3. Verificar que los archivos se subieron correctamente en el build

### Problema: "No autenticado" al acceder a reportes

**Solución:**
1. Verificar que estás logueado
2. Verificar que tu usuario tiene rol ADMIN o PROVEEDOR
3. Verificar en la base de datos:
```sql
SELECT id, email, role FROM users WHERE email = 'tu-email@example.com';
```

### Problema: Gráficos no se muestran

**Solución:**
1. Abrir consola del navegador (F12)
2. Ver errores JavaScript
3. Verificar que las dependencias se instalaron: `recharts`, `date-fns`
4. Verificar en el build log que las dependencias se instalaron

### Problema: Exportación no funciona

**Solución:**
1. Verificar logs del servidor
2. Verificar que la dependencia `xlsx` está instalada
3. Verificar permisos del usuario (ADMIN/PROVEEDOR)

### Problema: Build falla

**Posibles causas:**
1. **Error de dependencias**: Verificar que package.json tiene las nuevas dependencias
2. **Error de TypeScript**: Verificar tipos y imports
3. **Error de memoria**: Aumentar memoria en Cloud Run
4. **Error de timeout**: Aumentar timeout del build

**Soluciones:**
```bash
# Ver logs detallados del build
gcloud builds list --limit 5
gcloud builds log [BUILD_ID]

# Limpiar cache y rebuild
gcloud builds submit --no-cache

# Verificar configuración de Cloud Run
gcloud run services describe crtlpyme --region us-central1
```

## 📊 Verificar Métricas Post-Despliegue

Una vez desplegado, monitorear:

1. **Logs de errores:**
```bash
gcloud run logs read crtlpyme --region us-central1 --filter "severity>=ERROR"
```

2. **Latencia de las APIs:**
   - Ir a Cloud Console > Cloud Run > crtlpyme > METRICS
   - Verificar latencia de requests
   - Verificar rate de errores

3. **Uso de recursos:**
   - CPU utilization
   - Memory utilization
   - Request count

## 📝 Notas Importantes

1. **Primera carga puede ser lenta:** La primera vez que accedas a los reportes puede tomar más tiempo mientras se cargan las dependencias.

2. **Cache:** Los reportes NO tienen cache implementado en esta versión. Para grandes volúmenes de datos, considerar implementar cache en el futuro.

3. **Límites de plan:** El sistema respeta los límites del plan de suscripción. Si un tenant excede sus límites, no podrá generar reportes de ciertos datos.

4. **Permisos:** Solo usuarios con roles ADMIN, PROVEEDOR, e INVENTARIO (solo para productos) pueden acceder a los reportes.

## 🎯 Siguiente Paso Recomendado

Una vez validado el despliegue:

1. Crear datos de prueba si no existen
2. Probar todos los tipos de reportes
3. Validar exportación a Excel y CSV
4. Verificar que los gráficos se muestren correctamente
5. Probar con diferentes rangos de fechas y filtros

## 📞 Soporte

Si encuentras algún problema durante el despliegue:

1. Revisar logs de Cloud Run
2. Revisar documentación en el repositorio
3. Crear un issue en GitHub: https://github.com/kbzas090/CRTLPyme/issues

## 🔗 Enlaces Rápidos

- **Repositorio:** https://github.com/kbzas090/CRTLPyme
- **Cloud Run Console:** https://console.cloud.google.com/run?project=crtlpyme-477300
- **Cloud Build Console:** https://console.cloud.google.com/cloud-build?project=crtlpyme-477300
- **Cloud SQL Console:** https://console.cloud.google.com/sql?project=crtlpyme-477300
- **App URL:** https://crtlpyme-app-399088129827.us-central1.run.app/

---

## ✅ Confirmación Final

Antes de marcar como completo:

- [ ] Código pusheado a GitHub (main branch) ✅
- [ ] Despliegue ejecutado en GCP Cloud Run ⏳
- [ ] Pruebas de acceso a rutas de reportes ⏳
- [ ] Validación de funcionalidades de exportación ⏳
- [ ] Verificación de visualizaciones y gráficos ⏳
- [ ] Pruebas con diferentes roles de usuario ⏳
- [ ] Documentación actualizada ✅

**Estado del MVP:** 95% completado - Pendiente solo el despliegue y validación final.
