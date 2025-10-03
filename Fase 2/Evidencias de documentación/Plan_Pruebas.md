# Plan de Pruebas - CRTLPyme
**Versión:** 1.0  
**Fecha:** Septiembre 2025

## 1. Objetivos
- Verificar que el sistema cumple con los requerimientos
- Identificar y corregir defectos antes del despliegue
- Asegurar la calidad del producto final

## 2. Alcance de las Pruebas
### 2.1 Funcionalidades a Probar
- Gestión de productos
- Procesamiento de ventas
- Control de inventario
- Generación de reportes
- Autenticación de usuarios

### 2.2 Tipos de Pruebas
- Pruebas unitarias
- Pruebas de integración
- Pruebas de sistema
- Pruebas de aceptación de usuario

## 3. Estrategia de Pruebas
### 3.1 Pruebas Unitarias
- Framework: Jest
- Cobertura objetivo: 80%
- Responsable: Desarrolladores

### 3.2 Pruebas de Integración
- Herramienta: Postman/Newman
- Enfoque: API endpoints
- Responsable: Equipo de desarrollo

### 3.3 Pruebas de Sistema
- Herramienta: Cypress
- Enfoque: End-to-end testing
- Responsable: Equipo completo

## 4. Casos de Prueba Principales
### CP-001: Login de Usuario
- Precondición: Usuario registrado existe
- Pasos: Ingresar credenciales válidas
- Resultado esperado: Acceso al sistema

### CP-002: Crear Producto
- Precondición: Usuario autenticado
- Pasos: Completar formulario de producto
- Resultado esperado: Producto creado exitosamente

### CP-003: Procesar Venta
- Precondición: Productos disponibles en inventario
- Pasos: Seleccionar productos, procesar pago
- Resultado esperado: Venta registrada, stock actualizado

## 5. Criterios de Aceptación
- Todas las pruebas críticas deben pasar
- Cobertura de código > 80%
- Performance dentro de parámetros establecidos
- Cero defectos críticos pendientes
