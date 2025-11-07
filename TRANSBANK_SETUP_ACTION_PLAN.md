# 🚀 Plan de Acción: Configuración Transbank para CRTLPyme MVP

**Fecha:** 6 de Noviembre 2025  
**Estado:** ✅ Código Completo | ⚠️ Configuración GCP Pendiente  
**Tiempo Estimado Total:** 1 hora

---

## 📋 Resumen Ejecutivo

La integración de Transbank está **100% implementada en código** pero requiere **4 pasos de configuración** antes de poder usarse en producción.

### ✅ Lo que ya está listo:
- SDK de Transbank instalado
- 3 API endpoints implementados
- 4 componentes de frontend creados
- Build exitoso sin errores
- Documentación completa
- Credenciales de sandbox configuradas localmente

### ⚠️ Lo que falta (acciones de 1 hora):
1. Configurar secrets en GCP Secret Manager (15 min)
2. Dar permisos a Cloud Run (5 min)
3. Ejecutar seed de planes en BD (5 min)
4. Hacer deploy a Cloud Run (10 min)
5. Testing en producción (25 min)

---

## 🎯 Paso 1: Configurar Secrets en GCP (15 minutos)

### Acceso Necesario:
- ✅ Cuenta GCP: ctrlpyme@gmail.com
- ✅ Proyecto: crtlpyme-477300 (o ctrlpyme-679472948305)
- ✅ Rol requerido: Editor o Secret Manager Admin

### Opción A: Usar Google Cloud Console (Recomendado para principiantes)

1. **Abrir Cloud Console:**
   ```
   https://console.cloud.google.com/security/secret-manager?project=crtlpyme-477300
   ```

2. **Crear Secret: transbank-api-key**
   - Click en "CREATE SECRET"
   - Name: `transbank-api-key`
   - Secret value: `579B532A7440BB0C9079DED94D31EA1615BACEB56610332264630D42D0A36B1C`
   - Click "CREATE"

3. **Crear Secret: transbank-commerce-code**
   - Click en "CREATE SECRET"
   - Name: `transbank-commerce-code`
   - Secret value: `597055555532`
   - Click "CREATE"

4. **Crear Secret: TRANSBANK_ENVIRONMENT**
   - Click en "CREATE SECRET"
   - Name: `TRANSBANK_ENVIRONMENT`
   - Secret value: `integration`
   - Click "CREATE"

### Opción B: Usar Cloud Shell (Más rápido)

1. **Abrir Cloud Shell en GCP Console:**
   - Click en el icono ">_" arriba a la derecha

2. **Ejecutar comandos:**
   ```bash
   # Verificar proyecto activo
   gcloud config set project crtlpyme-477300
   
   # Crear los 3 secrets
   echo -n "579B532A7440BB0C9079DED94D31EA1615BACEB56610332264630D42D0A36B1C" | \
     gcloud secrets create transbank-api-key --data-file=-
   
   echo -n "597055555532" | \
     gcloud secrets create transbank-commerce-code --data-file=-
   
   echo -n "integration" | \
     gcloud secrets create TRANSBANK_ENVIRONMENT --data-file=-
   
   # Verificar que se crearon
   gcloud secrets list
   ```

3. **Salida esperada:**
   ```
   NAME                        CREATED              REPLICATION_POLICY  LOCATIONS
   transbank-api-key           2025-11-06...        automatic           -
   transbank-commerce-code     2025-11-06...        automatic           -
   TRANSBANK_ENVIRONMENT       2025-11-06...        automatic           -
   ```

✅ **Verificación:** Deberías ver los 3 secrets listados

---

## 🔐 Paso 2: Dar Permisos a Cloud Run (5 minutos)

Cloud Run necesita permiso para leer los secrets que acabas de crear.

### Opción A: Usar Cloud Console

1. **Para cada secret** (transbank-api-key, transbank-commerce-code, TRANSBANK_ENVIRONMENT):
   
   a. Click en el nombre del secret
   
   b. Tab "PERMISSIONS"
   
   c. Click "GRANT ACCESS"
   
   d. New principals: `[PROJECT_NUMBER]-compute@developer.gserviceaccount.com`
      - Para encontrar PROJECT_NUMBER: https://console.cloud.google.com/home/dashboard
      - O usar: `679472948305-compute@developer.gserviceaccount.com`
   
   e. Role: "Secret Manager Secret Accessor"
   
   f. Click "SAVE"

### Opción B: Usar Cloud Shell (Más rápido)

```bash
# En Cloud Shell, ejecutar:

# Obtener el PROJECT_NUMBER
PROJECT_NUMBER=$(gcloud projects describe crtlpyme-477300 --format="value(projectNumber)")
SERVICE_ACCOUNT="${PROJECT_NUMBER}-compute@developer.gserviceaccount.com"

echo "Service Account: $SERVICE_ACCOUNT"

# Dar permisos para cada secret
gcloud secrets add-iam-policy-binding transbank-api-key \
  --member="serviceAccount:${SERVICE_ACCOUNT}" \
  --role="roles/secretmanager.secretAccessor"

gcloud secrets add-iam-policy-binding transbank-commerce-code \
  --member="serviceAccount:${SERVICE_ACCOUNT}" \
  --role="roles/secretmanager.secretAccessor"

gcloud secrets add-iam-policy-binding TRANSBANK_ENVIRONMENT \
  --member="serviceAccount:${SERVICE_ACCOUNT}" \
  --role="roles/secretmanager.secretAccessor"

echo "✅ Permisos configurados"
```

✅ **Verificación:** No deberías ver errores en los comandos

---

## 💾 Paso 3: Ejecutar Seed de Planes (5 minutos)

Necesitas crear los 8 planes de suscripción en la base de datos.

### Opción A: Desde tu máquina local (si tienes acceso a la BD)

```bash
# En tu terminal local (no en este ambiente)
cd /ruta/a/CRTLPyme

# Asegurarte que .env tiene la DATABASE_URL correcta
cat .env | grep DATABASE_URL

# Ejecutar seed
npm run seed:plans
```

**Salida esperada:**
```
🌱 Iniciando seed de planes de suscripción...
✅ Plan creado: Plan Gratuito
✅ Plan creado: Plan Básico - Mensual
✅ Plan creado: Plan Profesional - Mensual
✅ Plan creado: Plan Empresarial - Mensual
✅ Plan creado: Plan Básico - Anual
✅ Plan creado: Plan Profesional - Anual
✅ Plan creado: Plan Empresarial - Anual
✅ Plan creado: Plan Premium - Anual
✅ Seed completado: 8 planes creados
```

### Opción B: Ejecutar SQL directamente en Cloud SQL

Si no puedes ejecutar el seed, puedes insertar los planes manualmente:

1. **Conectarse a Cloud SQL:**
   ```
   https://console.cloud.google.com/sql/instances
   ```

2. **Seleccionar tu instancia** (crtlpyme-db)

3. **Click en "Cloud Shell SQL"**

4. **Ejecutar el script SQL de seed:**
   - Archivo: `/prisma/seed-subscription-plans.ts` 
   - Convertir a SQL INSERT statements o usar Prisma Studio

### Opción C: Usar Prisma Studio

```bash
# En tu máquina local
npx prisma studio

# Abrir en navegador: http://localhost:5555
# Crear los planes manualmente usando la UI
```

✅ **Verificación:** Deberías ver 8 planes en la tabla `subscription_plans`

---

## 🚀 Paso 4: Deploy a Cloud Run (10 minutos)

### Opción A: Usando Cloud Build (Recomendado)

```bash
# En tu máquina local con el código
cd /ruta/a/CRTLPyme

# Asegurarse de que los últimos cambios están commiteados
git status
git log --oneline -1  # Debería mostrar: "feat: Implement complete Transbank..."

# Hacer push a GitHub
git push origin main

# Si hay Cloud Build trigger configurado, se deployará automáticamente
# Si no, ejecutar manualmente:
gcloud builds submit --config=cloudbuild.yaml --project=crtlpyme-477300
```

**Tiempo de build:** ~5-10 minutos

### Opción B: Deploy manual desde Cloud Console

1. **Ir a Cloud Run:**
   ```
   https://console.cloud.google.com/run?project=crtlpyme-477300
   ```

2. **Click en el servicio existente** (crtlpyme) o "CREATE SERVICE"

3. **Configurar:**
   - Container image: `gcr.io/crtlpyme-477300/crtlpyme:latest`
   - Region: us-central1
   - CPU: 2
   - Memory: 2Gi
   - Port: 3000
   - Allow unauthenticated invocations: ✅

4. **Variables y Secrets:**
   - En "Variables & Secrets" tab
   - Agregar referencias a los 3 secrets:
     - `TRANSBANK_API_KEY` → transbank-api-key:latest
     - `TRANSBANK_COMMERCE_CODE` → transbank-commerce-code:latest
     - `TRANSBANK_ENVIRONMENT` → TRANSBANK_ENVIRONMENT:latest

5. **Click DEPLOY**

✅ **Verificación:** 
```bash
# Ver el status del servicio
gcloud run services describe crtlpyme \
  --region=us-central1 \
  --project=crtlpyme-477300 \
  --format="value(status.url)"

# Debería retornar URL como:
# https://crtlpyme-vhndaajwpq-uc.a.run.app
```

---

## 🧪 Paso 5: Testing en Producción (25 minutos)

### A. Verificar que el servicio está corriendo (5 min)

```bash
# Obtener URL del servicio
CLOUD_RUN_URL=$(gcloud run services describe crtlpyme \
  --region=us-central1 \
  --project=crtlpyme-477300 \
  --format="value(status.url)")

echo "URL: $CLOUD_RUN_URL"

# Test 1: Verificar que el servicio responde
curl $CLOUD_RUN_URL

# Test 2: Verificar API de planes
curl $CLOUD_RUN_URL/api/subscriptions/plans

# Debería retornar JSON con los 8 planes
```

### B. Testing del flujo completo en navegador (20 min)

#### 1. Preparación (2 min)
- Abrir navegador en modo incógnito
- Ir a la URL de Cloud Run: `https://crtlpyme-vhndaajwpq-uc.a.run.app`

#### 2. Login (2 min)
- Navegar a `/auth/login`
- Iniciar sesión con una cuenta válida
- ⚠️ **Importante:** Necesitas un usuario con tenant activo

#### 3. Ver planes (2 min)
- Navegar a: `/subscriptions/plans`
- ✅ Verificar: Aparecen 8 planes
- ✅ Verificar: Toggle mensual/anual funciona
- ✅ Verificar: Precios se muestran correctamente

#### 4. Test con Tarjeta APROBADA (7 min)

**a. Seleccionar Plan:**
- Click en "Seleccionar Plan" en "Plan Básico - Mensual" ($19,990)
- Debería redirigir a Transbank

**b. Llenar Formulario de Transbank:**
```
Número de tarjeta: 4051885600446623
CVV: 123
Fecha expiración: 12/25 (cualquier fecha futura)
RUT: 11.111.111-1
Nombre: Test User
Email: test@example.com
```

**c. Confirmar Pago:**
- Click "Pagar"
- Esperar procesamiento (~5 segundos)

**d. Verificar Resultado:**
- ✅ Debería redirigir a `/subscriptions/payment/success`
- ✅ Mensaje: "¡Pago exitoso!"
- ✅ Detalle de la suscripción
- ✅ Estado: ACTIVE

**e. Verificar en Base de Datos:**
```sql
-- Verificar suscripción creada
SELECT id, tenant_id, plan_id, status, current_period_start, current_period_end
FROM subscriptions 
WHERE status = 'ACTIVE'
ORDER BY created_at DESC 
LIMIT 1;

-- Verificar pago registrado
SELECT id, subscription_id, amount, status, payment_method, transbank_buy_order
FROM subscription_payments
WHERE status = 'COMPLETED'
ORDER BY created_at DESC
LIMIT 1;
```

#### 5. Test con Tarjeta RECHAZADA (7 min)

**a. Seleccionar Otro Plan:**
- Volver a `/subscriptions/plans`
- Click en "Seleccionar Plan" en "Plan Profesional - Mensual" ($39,990)

**b. Llenar Formulario con Tarjeta de Rechazo:**
```
Número de tarjeta: 5186059559590568
CVV: 123
Fecha expiración: 12/25
RUT: 11.111.111-1
```

**c. Confirmar Pago:**
- Click "Pagar"

**d. Verificar Resultado:**
- ✅ Debería redirigir a `/subscriptions/payment/error`
- ✅ Mensaje: "Pago rechazado"
- ✅ Opciones: Reintentar / Contactar soporte

**e. Verificar en Base de Datos:**
```sql
-- Verificar que el pago está marcado como fallido
SELECT id, status, transbank_response
FROM subscription_payments
WHERE status = 'FAILED'
ORDER BY created_at DESC
LIMIT 1;

-- Verificar que la suscripción está cancelada
SELECT id, status
FROM subscriptions
WHERE status = 'CANCELLED'
ORDER BY created_at DESC
LIMIT 1;
```

### C. Verificar Logs (2 min)

```bash
# Ver logs recientes de Cloud Run
gcloud run services logs read crtlpyme \
  --region=us-central1 \
  --project=crtlpyme-477300 \
  --limit=50

# Buscar líneas con:
# ✅ "Transacción creada exitosamente"
# ✅ "Transacción confirmada"
# ✅ "Transacción APROBADA"
# ❌ "Transacción RECHAZADA"
```

---

## ✅ Checklist de Validación Final

### Configuración GCP
- [ ] Secret `transbank-api-key` creado
- [ ] Secret `transbank-commerce-code` creado
- [ ] Secret `TRANSBANK_ENVIRONMENT` creado
- [ ] Permisos de Cloud Run configurados
- [ ] Secrets listados correctamente con `gcloud secrets list`

### Base de Datos
- [ ] 8 planes de suscripción creados
- [ ] Query `SELECT COUNT(*) FROM subscription_plans;` retorna 8
- [ ] Planes visibles en Prisma Studio o SQL

### Deployment
- [ ] Build de Cloud Run exitoso
- [ ] Servicio `crtlpyme` corriendo en Cloud Run
- [ ] URL pública accesible
- [ ] Variables de entorno configuradas
- [ ] Logs sin errores críticos

### Testing - Flujo Aprobado
- [ ] Página de planes carga correctamente
- [ ] Planes se muestran con información completa
- [ ] Click en "Seleccionar" redirige a Transbank
- [ ] Formulario de Transbank se carga
- [ ] Pago con tarjeta aprobada funciona
- [ ] Redirección a página de éxito exitosa
- [ ] Suscripción creada con status ACTIVE en BD
- [ ] Pago registrado con status COMPLETED en BD

### Testing - Flujo Rechazado
- [ ] Pago con tarjeta rechazada maneja error
- [ ] Redirección a página de error exitosa
- [ ] Mensaje de error apropiado
- [ ] Suscripción marcada como CANCELLED en BD
- [ ] Pago registrado con status FAILED en BD

### Documentación
- [ ] Revisada `TRANSBANK_VERIFICATION_REPORT.md`
- [ ] Revisada `TRANSBANK_QUICKSTART.md`
- [ ] Comprendido flujo de pago completo

---

## 🚨 Troubleshooting Común

### Error: "Secret not found"
```
Problema: Cloud Run no puede encontrar los secrets
Solución:
1. Verificar que los nombres en cloudbuild.yaml coincidan
2. Verificar que los secrets existen: gcloud secrets list
3. Verificar el nombre del proyecto
```

### Error: "Permission denied"
```
Problema: Cloud Run no tiene permisos para leer secrets
Solución:
1. Ejecutar comandos de IAM policy binding (Paso 2)
2. Verificar service account correcto
3. Esperar 1-2 minutos para que permisos se propaguen
```

### Error: "No plans found"
```
Problema: Seed de planes no se ha ejecutado
Solución:
1. Ejecutar: npm run seed:plans
2. Verificar conexión a base de datos
3. Revisar logs por errores
```

### Error: "Database connection failed"
```
Problema: Cloud Run no puede conectar a Cloud SQL
Solución:
1. Verificar que DATABASE_URL secret está configurado
2. Verificar que Cloud SQL está corriendo
3. Verificar IP de Cloud SQL
4. Verificar que firewall permite conexiones
```

### Error en Callback: "Token not found"
```
Problema: Token de Transbank no se recibe correctamente
Solución:
1. Verificar que callback URL es accesible públicamente
2. Verificar logs de Transbank
3. Verificar que el pago existe en BD
4. Reintentar transacción
```

### Transbank no redirige de vuelta
```
Problema: Callback URL incorrecta o no accesible
Solución:
1. Verificar que NEXTAUTH_URL está configurado correctamente
2. Debe ser URL pública de Cloud Run, no localhost
3. Actualizar variable: gcloud run services update crtlpyme \
     --update-env-vars NEXTAUTH_URL=https://tu-url-de-cloud-run
```

---

## 📊 Tiempos Estimados por Perfil

### Usuario Experimentado con GCP:
- Paso 1: 5 min (usar Cloud Shell)
- Paso 2: 3 min (scripts automatizados)
- Paso 3: 2 min (seed directo)
- Paso 4: 5 min (Cloud Build)
- Paso 5: 15 min (testing rápido)
**Total: ~30 minutos**

### Usuario Intermedio:
- Paso 1: 15 min (usar Console UI)
- Paso 2: 5 min (copiar comandos)
- Paso 3: 5 min (troubleshooting)
- Paso 4: 10 min (verificar logs)
- Paso 5: 25 min (testing completo)
**Total: ~60 minutos**

### Usuario Principiante:
- Paso 1: 20 min (aprender Console)
- Paso 2: 10 min (comprender permisos)
- Paso 3: 10 min (aprender seed)
- Paso 4: 15 min (revisar deployment)
- Paso 5: 30 min (testing detallado)
**Total: ~85 minutos**

---

## 🎯 Criterios de Éxito

### MVP está listo cuando:
✅ Los 3 secrets están creados en GCP  
✅ Cloud Run tiene permisos para leer secrets  
✅ 8 planes de suscripción existen en BD  
✅ Servicio está deployed en Cloud Run  
✅ URL pública es accesible  
✅ Test con tarjeta aprobada funciona end-to-end  
✅ Test con tarjeta rechazada maneja error correctamente  
✅ Logs muestran flujo completo sin errores  

### Bonus para Demo:
✅ Email de SendGrid configurado para notificaciones  
✅ Dashboard muestra suscripción activa  
✅ Panel de admin puede ver suscripciones  

---

## 📞 Contacto y Soporte

**Proyecto:** CRTLPyme  
**Estudiantes:**
- Hernán Cabezas - hernan.c249@gmail.com
- Gricel Sanchez - gricelsanz@gmail.com

**Recursos:**
- Repositorio: https://github.com/kbzas090/CRTLPyme
- GCP Console: https://console.cloud.google.com/
- Transbank Docs: https://www.transbankdevelopers.cl/

**Soporte Transbank:**
- Email: ayuda@transbank.cl
- Tel: 600 638 6380

---

## 📚 Documentos Relacionados

**Para más detalles, consultar:**
1. `TRANSBANK_VERIFICATION_REPORT.md` - Reporte técnico completo
2. `TRANSBANK_QUICKSTART.md` - Inicio rápido de 5 minutos
3. `TRANSBANK_IMPLEMENTATION_GUIDE.md` - Guía técnica detallada
4. `DEPLOYMENT_GUIDE.md` - Guía de deployment en GCP
5. `GCP_SECRETS_SETUP.md` - Configuración de secrets

---

**Documento creado por:** DeepAgent - Abacus.AI  
**Fecha:** 6 de Noviembre 2025  
**Versión:** 1.0  
**Propósito:** Guía paso a paso para activar integración Transbank

---

**🎉 ¡Éxito en tu Demo del MVP!**
