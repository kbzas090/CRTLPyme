# Documento de Requerimientos de Software
**Proyecto:** CRTLPyme  
**Versión:** 1.0  
**Fecha:** Septiembre 2025

## 1. Introducción
### 1.1 Propósito
Este documento especifica los requerimientos funcionales y no funcionales del sistema CRTLPyme.

### 1.2 Alcance
Sistema POS SaaS para PYMEs chilenas con funcionalidades de:
- Gestión de ventas
- Control de inventario
- Reportes y analytics
- Gestión de clientes

## 2. Requerimientos Funcionales

### RF-001: Gestión de Productos
- El sistema debe permitir crear, editar y eliminar productos
- Debe incluir código, nombre, precio y stock
- Debe soportar categorías de productos

### RF-002: Procesamiento de Ventas
- El sistema debe procesar ventas en tiempo real
- Debe calcular totales, impuestos y descuentos
- Debe generar boletas y facturas

### RF-003: Control de Inventario
- El sistema debe actualizar stock automáticamente
- Debe alertar sobre stock bajo
- Debe permitir ajustes manuales de inventario

### RF-004: Reportes
- El sistema debe generar reportes de ventas
- Debe mostrar analytics en tiempo real
- Debe exportar datos en formatos estándar

## 3. Requerimientos No Funcionales

### RNF-001: Performance
- Tiempo de respuesta < 2 segundos
- Soporte para 100 usuarios concurrentes

### RNF-002: Seguridad
- Autenticación de usuarios
- Encriptación de datos sensibles
- Backup automático

### RNF-003: Usabilidad
- Interfaz intuitiva para usuarios no técnicos
- Soporte responsive para tablets y móviles
