# 🧪 INSTRUCCIONES DE PRUEBAS EXHAUSTIVAS
## Sistema de Movimientos de Inventario - CRTLPyme

**Fecha de Implementación:** 21 de Noviembre de 2025  
**Commit:** `6084d4c` - feat: implementar sistema completo de movimientos de inventario  
**URL de Despliegue:** En progreso (GitHub Actions)

---

## ⏰ ANTES DE COMENZAR

### Verificar que el despliegue esté completado
1. Accede a: https://github.com/kbzas090/CRTLPyme/actions
2. Verifica que el último workflow esté ✅ **Completado exitosamente**
3. Espera aproximadamente **5-10 minutos** desde el push
4. Solo cuando veas el estado ✅ GREEN, procede con las pruebas

---

## 📋 FASE 1: PRUEBA DE VENTA COMPLETA

### Objetivo
Verificar que el sistema de ventas funcione correctamente con el registro de movimientos de inventario.

### Pasos Detallados

#### 1.1 Preparación
```
✓ Abre el navegador en modo Incógnito/Privado
✓ Abre las DevTools (F12)
✓ Ve a la pestaña "Console"
✓ Ve a la pestaña "Network" también
```

#### 1.2 Acceso al POS
```
1. Accede a: https://crtlpyme-ear57io77a-uc.a.run.app/admin/pos
2. Inicia sesión con tus credenciales
3. Si hay una caja abierta, perfecto. Si no, abre una nueva caja
```

#### 1.3 Crear una Venta
```
1. Selecciona productos para agregar al carrito
2. Agrega al menos 2 productos diferentes
3. Verifica que los productos se agreguen correctamente
4. Verifica que el total se calcule correctamente
5. Haz clic en "Confirmar Venta" o "Finalizar Venta"
```

#### 1.4 Verificación Inmediata
```
✓ ¿Se generó el recibo correctamente?
✓ ¿Aparece el botón "Ver Detalle" o similar?
✓ ¿La consola muestra errores? (Debe estar LIMPIA sin errores rojos)
✓ En Network, verifica que POST /api/sales devuelva 201 (Created)
```

#### 1.5 Captura de Evidencia
```
📸 Toma captura de pantalla de:
1. La venta completada con el recibo visible
2. La consola del navegador (debe estar sin errores)
3. La pestaña Network con el request POST /api/sales exitoso
```

### ✅ Criterio de Éxito
- ✅ La venta se crea sin errores
- ✅ El recibo se muestra correctamente
- ✅ La consola NO tiene errores rojos
- ✅ POST /api/sales devuelve 201

### ❌ Si Falla
```
🚨 CAPTURA TODO:
1. Consola completa (copia todo el texto)
2. Network tab > Request Headers y Response
3. Cualquier mensaje de error visible en pantalla
4. Comparte TODO conmigo para diagnóstico
```

---

## 📊 FASE 2: VERIFICAR MOVIMIENTOS DE INVENTARIO

### Objetivo
Confirmar que los movimientos de inventario se registraron correctamente.

### Pasos Detallados

#### 2.1 Acceso a la API de Movimientos
```
En las DevTools, ve a la pestaña "Console" y ejecuta:
```

```javascript
// Obtener todos los movimientos de inventario
fetch('/api/inventory/movements?limit=10')
  .then(r => r.json())
  .then(data => {
    console.log('📦 MOVIMIENTOS DE INVENTARIO:');
    console.log('Total de movimientos:', data.movements.length);
    console.log('Estadísticas:', data.stats);
    console.table(data.movements.map(m => ({
      ID: m.id.substring(0, 8),
      Tipo: m.type,
      Cantidad: m.quantity,
      Motivo: m.reason,
      Producto: m.tenantInventory.masterProduct.name,
      Fecha: new Date(m.createdAt).toLocaleString('es-CL')
    })));
  })
  .catch(err => console.error('❌ Error:', err));
```

#### 2.2 Verificación de Resultados
```
✓ ¿Aparecen movimientos en la tabla?
✓ ¿El último movimiento corresponde a la venta que acabas de hacer?
✓ ¿El tipo es "EXIT"?
✓ ¿La cantidad es negativa? (ej: -1, -2)
✓ ¿El motivo menciona el número de venta?
```

#### 2.3 Verificar Movimientos de un Producto Específico
```javascript
// Reemplaza 'PRODUCT_ID' con el ID del producto que vendiste
fetch('/api/inventory/movements?tenantInventoryId=PRODUCT_ID')
  .then(r => r.json())
  .then(data => {
    console.log('📦 Movimientos del producto:', data);
  });
```

### ✅ Criterio de Éxito
- ✅ La API devuelve movimientos
- ✅ El movimiento más reciente es tipo "EXIT"
- ✅ La cantidad es negativa
- ✅ El motivo incluye el número de venta

### ❌ Si Falla
```
🚨 Captura:
1. La respuesta completa de la API
2. El código de estado HTTP
3. Cualquier error en consola
```

---

## 📈 FASE 3: VERIFICAR REPORTES DE VENTAS

### Objetivo
Confirmar que la venta aparece correctamente en los reportes.

### Pasos Detallados

#### 3.1 Acceso a Reportes de Ventas
```
1. En el menú principal, ve a "Reportes" > "Ventas"
2. Selecciona el rango de fechas de HOY
3. Aplica el filtro
```

#### 3.2 Verificación
```
✓ ¿Aparece la venta que acabas de crear?
✓ ¿El número de venta es correcto?
✓ ¿El monto total coincide?
✓ ¿La fecha y hora son correctas?
✓ ¿El usuario que registró la venta es correcto?
```

#### 3.3 Acceso a Reportes de Productos
```
1. Ve a "Reportes" > "Productos" o "Inventario"
2. Busca el producto que vendiste
3. Verifica el stock actual
```

#### 3.4 Verificación de Stock
```
✓ ¿El stock disminuyó correctamente?
✓ Si vendiste 2 unidades, ¿el stock bajó en 2?
✓ ¿El historial de movimientos muestra la salida?
```

### ✅ Criterio de Éxito
- ✅ La venta aparece en los reportes
- ✅ El stock se actualizó correctamente
- ✅ Los movimientos se registraron

---

## 📊 FASE 4: VERIFICAR INDICADORES DEL DASHBOARD

### Objetivo
Confirmar que los indicadores principales reflejan la nueva venta.

### Pasos Detallados

#### 4.1 Acceso al Dashboard
```
1. Ve al Dashboard principal (usualmente /admin o /admin/dashboard)
2. Observa los indicadores principales
```

#### 4.2 Verificación
```
✓ ¿El indicador de "Ventas del Día" aumentó?
✓ ¿El indicador de "Productos Vendidos" aumentó?
✓ ¿El indicador de "Ingresos" refleja la venta?
✓ ¿Los gráficos muestran la nueva venta?
```

### ✅ Criterio de Éxito
- ✅ Los indicadores se actualizaron
- ✅ Los números son coherentes

---

## 🔄 FASE 5: PRUEBA DE CREACIÓN MANUAL DE MOVIMIENTO (OPCIONAL)

### Objetivo
Verificar que la API de movimientos funcione para entradas manuales.

### Pasos Detallados

#### 5.1 Crear un Movimiento Manual de Entrada
```javascript
// En la consola del navegador, ejecuta:
fetch('/api/inventory/movements', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    tenantInventoryId: 'REEMPLAZA_CON_ID_REAL',
    type: 'ENTRY',
    quantity: 10,
    reason: 'Reposición de stock - Prueba manual',
    notes: 'Prueba del sistema de movimientos'
  })
})
  .then(r => r.json())
  .then(data => console.log('✅ Movimiento creado:', data))
  .catch(err => console.error('❌ Error:', err));
```

#### 5.2 Verificación
```
✓ ¿Se creó el movimiento exitosamente?
✓ ¿El stock del producto aumentó?
✓ ¿Aparece en el historial de movimientos?
```

### ✅ Criterio de Éxito
- ✅ El movimiento se crea correctamente
- ✅ El stock se actualiza

---

## 📝 REPORTE DE RESULTADOS

### Plantilla de Reporte

```markdown
## RESULTADOS DE PRUEBAS - Sistema de Movimientos de Inventario

**Fecha de Pruebas:** [COMPLETAR]
**Usuario que probó:** [COMPLETAR]

### ✅ FASE 1: Venta Completa
- [ ] Venta creada exitosamente
- [ ] Recibo generado correctamente
- [ ] Sin errores en consola
- [ ] POST /api/sales devuelve 201

**Observaciones:**
[COMPLETAR]

### ✅ FASE 2: Movimientos de Inventario
- [ ] Movimientos registrados correctamente
- [ ] Tipo EXIT aplicado
- [ ] Cantidad negativa correcta
- [ ] Motivo incluye número de venta

**Observaciones:**
[COMPLETAR]

### ✅ FASE 3: Reportes
- [ ] Venta aparece en reportes
- [ ] Stock actualizado correctamente
- [ ] Datos coherentes

**Observaciones:**
[COMPLETAR]

### ✅ FASE 4: Dashboard
- [ ] Indicadores actualizados
- [ ] Números coherentes

**Observaciones:**
[COMPLETAR]

### ✅ FASE 5: Movimiento Manual (Opcional)
- [ ] Movimiento manual creado
- [ ] Stock actualizado

**Observaciones:**
[COMPLETAR]

### 🏆 RESULTADO GENERAL
- [ ] ✅ TODAS LAS PRUEBAS PASARON
- [ ] ⚠️ ALGUNAS PRUEBAS FALLARON (especificar abajo)
- [ ] ❌ PRUEBAS FALLARON CRÍTICAMENTE

**Problemas Encontrados:**
[COMPLETAR]

**Capturas de Pantalla Adjuntas:**
1. [Descripción de captura 1]
2. [Descripción de captura 2]
3. ...
```

---

## 🚨 SOLUCIÓN DE PROBLEMAS

### Si las ventas fallan
```
1. Verifica la consola del navegador
2. Busca el error específico
3. Verifica la pestaña Network
4. Captura TODO y compártelo conmigo
```

### Si los movimientos no aparecen
```
1. Verifica que POST /api/sales haya sido exitoso (201)
2. Ejecuta la consulta de movimientos en la consola
3. Verifica que estés consultando con el tenantId correcto
4. Comparte los logs de la consola
```

### Si el stock no se actualiza
```
1. Refresca la página y verifica nuevamente
2. Consulta directamente el producto en la API
3. Verifica los movimientos de ese producto específico
```

---

## 📞 SOPORTE

Si encuentras cualquier problema durante las pruebas:

1. **NO ENTRES EN PÁNICO** 😊
2. Captura TODA la información posible:
   - Consola completa del navegador
   - Network requests y responses
   - Capturas de pantalla
   - Cualquier mensaje de error
3. Comparte TODO conmigo en un mensaje
4. Describe exactamente qué estabas haciendo cuando ocurrió el error

**Trabajaremos juntos para solucionarlo rápidamente.** 💪

---

## ✅ CHECKLIST FINAL

Antes de reportar que todo funciona, verifica:

- [ ] El despliegue en GitHub Actions está ✅ completado
- [ ] Realicé todas las fases de prueba
- [ ] Capturé evidencia (screenshots)
- [ ] Llené el reporte de resultados
- [ ] No hay errores en consola
- [ ] Las ventas se crean correctamente
- [ ] Los movimientos se registran correctamente
- [ ] Los reportes muestran datos correctos
- [ ] El stock se actualiza correctamente

---

**¡Éxito en las pruebas!** 🚀
