# Diagrama de Clases del Dominio Completo - Sistema CRTLPyme
## Plataforma POS-SaaS para Pequeños Comercios
## Incluye: Control de Punto de Equilibrio + Mantenedor de Clientes Frecuentes (Opcional)

---

## Introducción

Este documento presenta el **Diagrama de Clases del Dominio Completo** del sistema CRTLPyme, incluyendo:

1. **Módulos Core:** Multi-tenancy, Usuarios, Inventario, Ventas (POS), Clientes, Gastos, Auditoría
2. **Módulo de Análisis Financiero:** Control de Punto de Equilibrio con gastos fijos y variables
3. **Módulo Opcional:** Mantenedor de Clientes Frecuentes con sistema de descuentos por tramos

El diagrama utiliza colores vibrantes para facilitar la identificación de los diferentes módulos funcionales.

---

## Leyenda de Colores

- 🟦 **Azul (#1976D2)**: Gestión de Usuarios y Multi-tenancy
- 🟩 **Verde (#388E3C)**: Gestión de Inventario y Productos
- 🟨 **Amarillo (#FBC02D)**: Gestión de Ventas (POS)
- 🟪 **Morado (#7B1FA2)**: Gestión de Clientes y Suscripciones
- 🟧 **Naranja (#F57C00)**: Análisis Financiero y Punto de Equilibrio
- 🟥 **Rojo (#D32F2F)**: Auditoría y Control
- 🟫 **Café (#795548)**: Clientes Frecuentes (OPCIONAL)

---

## Diagrama de Clases Completo

```mermaid
classDiagram
    %% =============================================
    %% MULTI-TENANCY Y USUARIOS (AZUL)
    %% =============================================
    class Tenant {
        <<Entity>>
        +String id
        +String businessName
        +String rut
        +String email
        +String phone
        +String address
        +Boolean isActive
        +PlanType planType
        +Int maxCashiers
        +Int extraCashiers
        +DateTime createdAt
        +DateTime updatedAt
        +getUsers() User[]
        +getProducts() Product[]
        +getSales() Sale[]
        +calculateBreakeven() BreakevenCalculation
        +getFrequentCustomerConfig() ConfiguracionClienteFrecuente
    }
    
    class User {
        <<Entity>>
        +String id
        +String email
        +String password
        +String firstName
        +String lastName
        +UserRole role
        +Boolean isActive
        +String tenantId
        +DateTime createdAt
        +DateTime updatedAt
        +can(permission) Boolean
        +getTenant() Tenant
        +hasRole(roles) Boolean
    }
    
    %% =============================================
    %% GESTIÓN DE INVENTARIO (VERDE)
    %% =============================================
    class Product {
        <<Entity>>
        +String id
        +String sku
        +String barcode
        +String name
        +String description
        +String category
        +String brand
        +Decimal costPrice
        +Decimal salePrice
        +Int stock
        +Int minStock
        +Boolean isActive
        +String tenantId
        +DateTime createdAt
        +DateTime updatedAt
        +calculateMargin() Decimal
        +isLowStock() Boolean
        +updateStock(quantity) void
    }
    
    class StockAdjustment {
        <<Entity>>
        +String id
        +String productId
        +Int quantity
        +AdjustmentType type
        +String reason
        +String userId
        +String tenantId
        +DateTime createdAt
        +getProduct() Product
        +getUser() User
    }
    
    %% =============================================
    %% GESTIÓN DE VENTAS / POS (AMARILLO)
    %% =============================================
    class Sale {
        <<Aggregate Root>>
        +String id
        +String saleNumber
        +Decimal subtotal
        +Decimal tax
        +Decimal total
        +PaymentMethod paymentMethod
        +Decimal cashReceived
        +Decimal change
        +SaleStatus status
        +String userId
        +String tenantId
        +String cashSessionId
        +String customerId
        +Decimal frequentCustomerDiscount
        +String frequentCustomerTierId
        +DateTime createdAt
        +DateTime updatedAt
        +addItem(product, quantity) void
        +calculateTotal() void
        +applyFrequentCustomerDiscount() void
        +complete() void
    }
    
    class SaleItem {
        <<Entity>>
        +String id
        +String saleId
        +String productId
        +Int quantity
        +Decimal unitPrice
        +Decimal unitCost
        +Decimal subtotal
        +String tenantId
        +calculateSubtotal() Decimal
        +calculateMargin() Decimal
    }
    
    class CashSession {
        <<Entity>>
        +String id
        +Decimal initialAmount
        +Decimal finalAmount
        +Decimal expectedAmount
        +Decimal difference
        +CashSessionStatus status
        +DateTime openedAt
        +DateTime closedAt
        +String userId
        +String tenantId
        +open(initialAmount) void
        +close(finalAmount) void
        +calculateExpectedAmount() Decimal
    }
    
    %% =============================================
    %% GESTIÓN DE CLIENTES Y SUSCRIPCIONES (MORADO)
    %% =============================================
    class Customer {
        <<Entity>>
        +String id
        +String name
        +String phone
        +String email
        +String tenantId
        +Boolean frequentCustomerEnabled
        +DateTime frequentCustomerSince
        +Decimal totalLifetimePurchases
        +ContactMethod preferredContactMethod
        +DateTime createdAt
        +DateTime updatedAt
        +getSubscriptions() Subscription[]
        +getTotalDebt() Decimal
        +enrollInFrequentProgram() void
        +unenrollFromFrequentProgram() void
        +getCurrentPeriodHistory() HistorialComprasCliente
        +getAvailableDiscount() Decimal
        +getCurrentTier() TramoDescuento
        +getFrequentCustomerStats() FrequentCustomerStats
        +recordPurchase(amount, discount) void
    }
    
    class Subscription {
        <<Entity>>
        +String id
        +String customerId
        +String tenantId
        +SubscriptionType type
        +Decimal amount
        +Date startDate
        +Date nextPaymentDate
        +SubscriptionStatus status
        +processPayment() SubscriptionPayment
        +calculateNextPayment() Date
    }
    
    class SubscriptionPayment {
        <<Entity>>
        +String id
        +String subscriptionId
        +Decimal amount
        +DateTime paymentDate
        +PaymentStatus status
        +String transactionId
    }
    
    %% =============================================
    %% ANÁLISIS FINANCIERO Y PUNTO DE EQUILIBRIO (NARANJA)
    %% =============================================
    class FixedExpense {
        <<Entity>>
        +String id
        +String name
        +Decimal amount
        +ExpenseFrequency frequency
        +DateTime startDate
        +DateTime endDate
        +String notes
        +Boolean isActive
        +String tenantId
        +DateTime createdAt
        +DateTime updatedAt
        +normalizeToMonthly() Decimal
    }
    
    class VariableExpense {
        <<Entity>>
        +String id
        +String concept
        +Decimal amount
        +DateTime date
        +ExpenseCategory category
        +String description
        +String productId
        +String saleId
        +String userId
        +String tenantId
        +DateTime createdAt
        +DateTime updatedAt
        +getMonthlyTotal(period) Decimal
        +getProductExpenses(productId) VariableExpense[]
    }
    
    class BreakevenCalculation {
        <<Entity>>
        +String id
        +String tenantId
        +String period
        +DateTime calculationDate
        +Decimal totalFixedCosts
        +Decimal totalVariableCosts
        +Decimal totalSales
        +Decimal totalCosts
        +Decimal grossMargin
        +Decimal grossMarginPercentage
        +Decimal breakevenPoint
        +Int breakevenDays
        +Decimal currentProgress
        +DateTime breakevenDate
        +Decimal remainingAmount
        +Boolean isAchieved
        +JSON metadata
        +DateTime createdAt
        +calculateBreakeven() void
        +willAchieveBreakeven() Boolean
        +generateRecommendations() String[]
    }
    
    %% =============================================
    %% CLIENTES FRECUENTES - MÓDULO OPCIONAL (CAFÉ)
    %% =============================================
    class ConfiguracionClienteFrecuente {
        <<Entity - OPCIONAL>>
        +String id
        +String tenantId
        +Boolean isEnabled
        +PeriodType periodType
        +Int resetDay
        +String description
        +DateTime createdAt
        +DateTime updatedAt
        +isActive() Boolean
        +shouldResetAccumulation(date) Boolean
        +getActiveTiers() TramoDescuento[]
        +calculateApplicableDiscount(amount) Decimal
    }
    
    class TramoDescuento {
        <<Entity - OPCIONAL>>
        +String id
        +String configId
        +String tenantId
        +Int tierLevel
        +String tierName
        +Decimal minAmount
        +Decimal maxAmount
        +Decimal discountPercentage
        +String color
        +Boolean isActive
        +DateTime createdAt
        +DateTime updatedAt
        +isInRange(amount) Boolean
        +calculateDiscount(saleAmount) Decimal
        +amountToReach(currentAmount) Decimal
        +getNextTier() TramoDescuento
    }
    
    class HistorialComprasCliente {
        <<Entity - OPCIONAL>>
        +String id
        +String customerId
        +String tenantId
        +String period
        +Decimal accumulatedAmount
        +Int purchaseCount
        +String currentTierId
        +Decimal currentDiscount
        +Decimal totalSavings
        +DateTime lastPurchaseDate
        +DateTime createdAt
        +DateTime updatedAt
        +addPurchase(amount, discount) void
        +updateCurrentTier() void
        +getCurrentTier() TramoDescuento
        +amountToNextTier() Decimal
        +calculatePotentialSavings() Decimal
        +resetPeriod() void
        +isActivePeriod() Boolean
    }
    
    %% =============================================
    %% AUDITORÍA Y CONTROL (ROJO)
    %% =============================================
    class AuditLog {
        <<Entity>>
        +String id
        +String action
        +String entity
        +String entityId
        +JSON oldValues
        +JSON newValues
        +String userId
        +String tenantId
        +DateTime createdAt
    }
    
    %% =============================================
    %% ENUMERACIONES
    %% =============================================
    class UserRole {
        <<enumeration>>
        PROVEEDOR
        ADMIN
        CAJA
        INVENTARIO
        SOPORTE
    }
    
    class PaymentMethod {
        <<enumeration>>
        CASH
        DEBIT
        CREDIT
        TRANSFER
    }
    
    class SaleStatus {
        <<enumeration>>
        PENDING
        COMPLETED
        CANCELLED
    }
    
    class AdjustmentType {
        <<enumeration>>
        PURCHASE
        LOSS
        CORRECTION
        RETURN
    }
    
    class CashSessionStatus {
        <<enumeration>>
        OPEN
        CLOSED
    }
    
    class SubscriptionType {
        <<enumeration>>
        DAILY
        WEEKLY
        MONTHLY
    }
    
    class SubscriptionStatus {
        <<enumeration>>
        ACTIVE
        SUSPENDED
        CANCELLED
    }
    
    class PaymentStatus {
        <<enumeration>>
        PENDING
        COMPLETED
        FAILED
    }
    
    class ExpenseFrequency {
        <<enumeration>>
        DAILY
        WEEKLY
        MONTHLY
        YEARLY
    }
    
    class ExpenseCategory {
        <<enumeration>>
        PRODUCT_COST
        COMMISSION
        TRANSPORT
        PACKAGING
        OTHER
    }
    
    class PlanType {
        <<enumeration>>
        BASIC
        PRO
        ENTERPRISE
    }
    
    class PeriodType {
        <<enumeration>>
        MONTHLY
        QUARTERLY
        CUSTOM
    }
    
    class ContactMethod {
        <<enumeration>>
        EMAIL
        SMS
        WHATSAPP
    }
    
    %% =============================================
    %% RELACIONES - MULTI-TENANCY Y USUARIOS
    %% =============================================
    
    Tenant "1" --> "*" User : has
    Tenant "1" --> "*" Product : manages
    Tenant "1" --> "*" Sale : records
    Tenant "1" --> "*" Customer : serves
    Tenant "1" --> "*" FixedExpense : has
    Tenant "1" --> "*" VariableExpense : has
    Tenant "1" --> "*" BreakevenCalculation : calculates
    Tenant "1" --> "*" CashSession : operates
    Tenant "1" --> "*" StockAdjustment : registers
    Tenant "1" --> "*" AuditLog : audits
    Tenant "1" --> "0..1" ConfiguracionClienteFrecuente : configures
    
    User "*" --> "1" Tenant : belongs to
    User "1" --> "*" Sale : creates
    User "1" --> "*" CashSession : operates
    User "1" --> "*" StockAdjustment : registers
    User "1" --> "*" VariableExpense : registers
    User "1" --> "*" AuditLog : generates
    User --> UserRole : has role
    
    %% =============================================
    %% RELACIONES - INVENTARIO
    %% =============================================
    
    Product "*" --> "1" Tenant : belongs to
    Product "1" --> "*" SaleItem : sold in
    Product "1" --> "*" StockAdjustment : adjusted by
    Product "1" --> "*" VariableExpense : may have
    
    StockAdjustment "*" --> "1" Product : adjusts
    StockAdjustment "*" --> "1" User : registered by
    StockAdjustment "*" --> "1" Tenant : belongs to
    StockAdjustment --> AdjustmentType : type
    
    %% =============================================
    %% RELACIONES - VENTAS / POS
    %% =============================================
    
    Sale "*" --> "1" Tenant : belongs to
    Sale "*" --> "1" User : created by
    Sale "*" --> "0..1" CashSession : in session
    Sale "*" --> "0..1" Customer : for customer
    Sale "1" --> "*" SaleItem : contains
    Sale "1" --> "*" VariableExpense : may have
    Sale "*" --> "0..1" TramoDescuento : applies tier discount
    Sale --> PaymentMethod : uses
    Sale --> SaleStatus : has status
    
    SaleItem "*" --> "1" Sale : part of
    SaleItem "*" --> "1" Product : references
    
    CashSession "*" --> "1" User : operated by
    CashSession "*" --> "1" Tenant : belongs to
    CashSession "1" --> "*" Sale : groups
    CashSession --> CashSessionStatus : status
    
    %% =============================================
    %% RELACIONES - CLIENTES Y SUSCRIPCIONES
    %% =============================================
    
    Customer "*" --> "1" Tenant : belongs to
    Customer "1" --> "*" Subscription : has
    Customer "1" --> "*" Sale : makes purchases
    Customer "1" --> "*" HistorialComprasCliente : has purchase history
    Customer --> ContactMethod : preferred contact
    
    Subscription "*" --> "1" Customer : belongs to
    Subscription "1" --> "*" SubscriptionPayment : generates
    Subscription --> SubscriptionType : type
    Subscription --> SubscriptionStatus : status
    
    SubscriptionPayment "*" --> "1" Subscription : for subscription
    SubscriptionPayment --> PaymentStatus : status
    
    %% =============================================
    %% RELACIONES - ANÁLISIS FINANCIERO
    %% =============================================
    
    FixedExpense "*" --> "1" Tenant : belongs to
    FixedExpense --> ExpenseFrequency : frequency
    
    VariableExpense "*" --> "1" Tenant : belongs to
    VariableExpense "*" --> "0..1" Product : optionally relates to
    VariableExpense "*" --> "0..1" Sale : optionally relates to
    VariableExpense "*" --> "1" User : registered by
    VariableExpense --> ExpenseCategory : category
    
    BreakevenCalculation "*" --> "1" Tenant : belongs to
    
    %% =============================================
    %% RELACIONES - CLIENTES FRECUENTES (OPCIONAL)
    %% =============================================
    
    ConfiguracionClienteFrecuente "0..1" --> "1" Tenant : belongs to
    ConfiguracionClienteFrecuente "1" --> "3" TramoDescuento : has tiers
    ConfiguracionClienteFrecuente --> PeriodType : period type
    
    TramoDescuento "*" --> "1" ConfiguracionClienteFrecuente : belongs to config
    TramoDescuento "*" --> "1" Tenant : belongs to
    TramoDescuento "1" --> "*" HistorialComprasCliente : applied to history
    TramoDescuento "1" --> "*" Sale : applied to sales
    
    HistorialComprasCliente "*" --> "1" Customer : belongs to
    HistorialComprasCliente "*" --> "1" Tenant : belongs to
    HistorialComprasCliente "*" --> "0..1" TramoDescuento : has current tier
    
    %% =============================================
    %% RELACIONES - AUDITORÍA
    %% =============================================
    
    AuditLog "*" --> "1" User : performed by
    AuditLog "*" --> "1" Tenant : belongs to
    
    %% =============================================
    %% RELACIONES - PLAN
    %% =============================================
    
    Tenant --> PlanType : plan
    
    %% =============================================
    %% ESTILOS Y COLORES
    %% =============================================
    
    %% Multi-tenancy y Usuarios (Azul)
    style Tenant fill:#1976D2,stroke:#0D47A1,stroke-width:3px,color:#FFFFFF
    style User fill:#1976D2,stroke:#0D47A1,stroke-width:2px,color:#FFFFFF
    style UserRole fill:#42A5F5,stroke:#0D47A1,stroke-width:2px,color:#000000
    
    %% Inventario (Verde)
    style Product fill:#388E3C,stroke:#1B5E20,stroke-width:3px,color:#FFFFFF
    style StockAdjustment fill:#66BB6A,stroke:#2E7D32,stroke-width:2px,color:#000000
    style AdjustmentType fill:#81C784,stroke:#2E7D32,stroke-width:2px,color:#000000
    
    %% Ventas/POS (Amarillo/Dorado)
    style Sale fill:#FBC02D,stroke:#F57F17,stroke-width:3px,color:#000000
    style SaleItem fill:#FDD835,stroke:#F57F17,stroke-width:2px,color:#000000
    style CashSession fill:#FFEB3B,stroke:#F57F17,stroke-width:2px,color:#000000
    style PaymentMethod fill:#FFEE58,stroke:#F57F17,stroke-width:2px,color:#000000
    style SaleStatus fill:#FFF176,stroke:#F57F17,stroke-width:2px,color:#000000
    style CashSessionStatus fill:#FFF59D,stroke:#F57F17,stroke-width:2px,color:#000000
    
    %% Clientes y Suscripciones (Morado)
    style Customer fill:#7B1FA2,stroke:#4A148C,stroke-width:3px,color:#FFFFFF
    style Subscription fill:#9C27B0,stroke:#4A148C,stroke-width:2px,color:#FFFFFF
    style SubscriptionPayment fill:#BA68C8,stroke:#6A1B9A,stroke-width:2px,color:#000000
    style SubscriptionType fill:#CE93D8,stroke:#6A1B9A,stroke-width:2px,color:#000000
    style SubscriptionStatus fill:#E1BEE7,stroke:#6A1B9A,stroke-width:2px,color:#000000
    style PaymentStatus fill:#F3E5F5,stroke:#6A1B9A,stroke-width:2px,color:#000000
    style ContactMethod fill:#E1BEE7,stroke:#6A1B9A,stroke-width:2px,color:#000000
    
    %% Análisis Financiero (Naranja)
    style FixedExpense fill:#F57C00,stroke:#E65100,stroke-width:3px,color:#FFFFFF
    style VariableExpense fill:#FF9800,stroke:#E65100,stroke-width:3px,color:#000000
    style BreakevenCalculation fill:#FFB74D,stroke:#EF6C00,stroke-width:3px,color:#000000
    style ExpenseFrequency fill:#FFCC80,stroke:#EF6C00,stroke-width:2px,color:#000000
    style ExpenseCategory fill:#FFE0B2,stroke:#EF6C00,stroke-width:2px,color:#000000
    
    %% Clientes Frecuentes - OPCIONAL (Café/Marrón)
    style ConfiguracionClienteFrecuente fill:#795548,stroke:#3E2723,stroke-width:3px,color:#FFFFFF
    style TramoDescuento fill:#8D6E63,stroke:#4E342E,stroke-width:3px,color:#FFFFFF
    style HistorialComprasCliente fill:#A1887F,stroke:#5D4037,stroke-width:2px,color:#000000
    style PeriodType fill:#BCAAA4,stroke:#5D4037,stroke-width:2px,color:#000000
    
    %% Auditoría (Rojo)
    style AuditLog fill:#D32F2F,stroke:#B71C1C,stroke-width:3px,color:#FFFFFF
    
    %% Otros
    style PlanType fill:#00ACC1,stroke:#006064,stroke-width:2px,color:#000000
```

---

## Descripción de Módulos

### 🟦 Módulo de Multi-tenancy y Usuarios

**Entidades:**
- **Tenant**: Entidad raíz que representa un negocio cliente
- **User**: Usuarios del sistema con roles específicos (ADMIN, CAJA, INVENTARIO, etc.)

**Responsabilidades:**
- Aislamiento de datos por organización
- Gestión de usuarios y roles (RBAC)
- Control de acceso y permisos
- Gestión de planes y suscripciones al servicio SaaS

---

### 🟩 Módulo de Gestión de Inventario

**Entidades:**
- **Product**: Productos vendibles del negocio con control de stock
- **StockAdjustment**: Movimientos de inventario (compras, mermas, correcciones)

**Responsabilidades:**
- Control de stock en tiempo real
- Alertas de stock bajo
- Trazabilidad de movimientos
- Cálculo de márgenes (precio venta - costo)

---

### 🟨 Módulo de Gestión de Ventas (POS)

**Entidades:**
- **Sale**: Transacción de venta (Aggregate Root)
- **SaleItem**: Líneas de venta individuales
- **CashSession**: Sesiones de caja para control de efectivo

**Responsabilidades:**
- Registro de ventas atómico y transaccional
- Actualización automática de inventario
- Control de efectivo en caja
- Conciliación de ventas al cierre
- Aplicación de descuentos de clientes frecuentes

**Nota:** Sale ahora incluye campos para descuentos de clientes frecuentes.

---

### 🟪 Módulo de Clientes y Suscripciones

**Entidades:**
- **Customer**: Clientes del negocio (con extensiones para clientes frecuentes)
- **Subscription**: Suscripciones recurrentes de productos
- **SubscriptionPayment**: Pagos de suscripciones

**Responsabilidades:**
- Gestión de clientes frecuentes
- Suscripciones con cobros automáticos
- Control de deudas
- Integración con pasarela de pagos
- Gestión de inscripción en programa de clientes frecuentes

**Extensiones:** Customer ahora incluye atributos y métodos para el programa de clientes frecuentes.

---

### 🟧 Módulo de Análisis Financiero y Punto de Equilibrio

**Entidades:**
- **FixedExpense**: Gastos fijos recurrentes del negocio (arriendo, servicios, sueldos)
- **VariableExpense**: Gastos variables (comisiones, transporte, embalaje)
- **BreakevenCalculation**: Cálculos mensuales del punto de equilibrio

**Responsabilidades:**
- Registro de todos los gastos fijos y variables
- Cálculo automático diario del punto de equilibrio
- Determinar día del mes en que se alcanza el equilibrio
- Proyecciones financieras
- Generación de recomendaciones
- Análisis de tendencias mensual

**Funcionalidad clave:** Este módulo permite a los comercios saber exactamente cuándo comienzan a generar ganancias cada mes.

---

### 🟫 Módulo de Clientes Frecuentes (OPCIONAL)

**Entidades:**
- **ConfiguracionClienteFrecuente**: Configuración del módulo por tenant
- **TramoDescuento**: Tres niveles de descuento según compras acumuladas
- **HistorialComprasCliente**: Registro mensual de compras por cliente

**Responsabilidades:**
- Configurar sistema de descuentos por tramos
- Registrar automáticamente compras de clientes inscritos
- Calcular tramo actual según monto acumulado mensual
- Aplicar descuentos en ventas
- Resetear acumulaciones mensualmente
- Notificar ascensos de tramo
- Generar reportes de fidelización

**Características:**
- **Módulo completamente opcional**: Se puede activar/desactivar sin perder datos
- **Sistema de 3 tramos**: Configurables por cada negocio (ej: Bronce 5%, Plata 10%, Oro 15%)
- **Acumulación mensual**: Se resetea automáticamente cada mes
- **Inscripción voluntaria**: Solo clientes inscritos participan
- **Integración transparente**: Se aplica automáticamente en el flujo de ventas

---

### 🟥 Módulo de Auditoría

**Entidades:**
- **AuditLog**: Registro inmutable de operaciones críticas

**Responsabilidades:**
- Trazabilidad completa de cambios
- Seguridad y cumplimiento
- Diagnóstico de problemas
- Análisis forense

---

## Cardinalidades Principales

### Relaciones Core

| Relación | Cardinalidad | Tipo |
|----------|--------------|------|
| Tenant → User | 1:N | Composición |
| Tenant → Product | 1:N | Composición |
| Tenant → Sale | 1:N | Composición |
| Tenant → Customer | 1:N | Composición |
| Tenant → FixedExpense | 1:N | Composición |
| Tenant → VariableExpense | 1:N | Composición |
| Tenant → BreakevenCalculation | 1:N | Composición |
| Sale → SaleItem | 1:N | Composición (Aggregate) |
| SaleItem → Product | N:1 | Referencia |

### Relaciones de Clientes Frecuentes (OPCIONAL)

| Relación | Cardinalidad | Tipo |
|----------|--------------|------|
| Tenant → ConfiguracionClienteFrecuente | 1:0..1 | Composición (opcional) |
| ConfiguracionClienteFrecuente → TramoDescuento | 1:3 | Composición (exactamente 3) |
| Customer → HistorialComprasCliente | 1:N | Composición |
| HistorialComprasCliente → TramoDescuento | N:0..1 | Referencia |
| Sale → TramoDescuento | N:0..1 | Referencia (descuento aplicado) |

**Nota:** La cardinalidad 1:3 en ConfiguracionClienteFrecuente → TramoDescuento indica que cada configuración debe tener **exactamente 3 tramos** activos.

---

## Patrones Aplicados

### 1. Multi-tenancy Pattern
- **Implementación**: Tenant como entidad raíz con tenantId en todas las entidades
- **Beneficio**: Aislamiento total de datos por cliente

### 2. Aggregate Root Pattern
- **Implementación**: Sale como agregado de SaleItems
- **Beneficio**: Consistencia transaccional garantizada

### 3. Repository Pattern
- **Implementación**: Interfaces de repositorio por entidad
- **Beneficio**: Abstracción del acceso a datos

### 4. Domain-Driven Design (DDD)
- **Implementación**: Entidades, Value Objects, Aggregates, Domain Services
- **Beneficio**: Modelo rico que refleja el negocio

### 5. Strategy Pattern
- **Implementación**: Cálculo de descuentos según tramo de cliente frecuente
- **Beneficio**: Algoritmos intercambiables y extensibles

### 6. Observer Pattern (implícito)
- **Implementación**: Notificaciones cuando cliente asciende de tramo
- **Beneficio**: Desacoplamiento entre lógica de negocio y notificaciones

---

## Validaciones y Reglas de Negocio Principales

### Reglas Generales

1. **RN-001**: Multi-tenancy estricto - Todas las queries incluyen tenantId
2. **RN-002**: Stock no negativo - Validación antes de cada venta
3. **RN-003**: Transaccionalidad - Venta + Actualización stock = Atómica
4. **RN-004**: Punto de equilibrio diario - Cálculo automático cada día
5. **RN-005**: Gastos variables asociables - A productos o ventas específicas
6. **RN-006**: Histórico inmutable - Cálculos y auditorías no se modifican

### Reglas de Clientes Frecuentes (OPCIONAL)

7. **RN-FREQ-001**: Configuración única por Tenant - Solo una config activa
8. **RN-FREQ-002**: Exactamente tres tramos - Siempre 3 niveles de descuento
9. **RN-FREQ-003**: Descuentos ascendentes - Tramo1 < Tramo2 < Tramo3
10. **RN-FREQ-004**: Inscripción voluntaria - Cliente debe inscribirse explícitamente
11. **RN-FREQ-005**: Acumulación solo de ventas completadas - Status = COMPLETED
12. **RN-FREQ-006**: Reseteo automático mensual - Día configurable (por defecto día 1)
13. **RN-FREQ-007**: Cálculo automático del tramo - Después de cada compra
14. **RN-FREQ-008**: Desactivación sin pérdida de datos - Se mantiene historial

---

## Ejemplos de Uso

### Ejemplo 1: Flujo Completo de Venta con Cliente Frecuente

```typescript
// 1. Cliente inscrito con tramo Plata (10%)
const customer = await getCustomer("customer123");
// customer.frequentCustomerEnabled = true
// customer.currentTier = "Plata" (10% descuento)

// 2. Crear venta
const sale = {
  items: [
    { productId: "prod1", quantity: 2, unitPrice: 5000 },
    { productId: "prod2", quantity: 1, unitPrice: 10000 }
  ],
  customerId: "customer123"
};

// 3. Calcular subtotal
const subtotal = 20000; // (2*5000 + 1*10000)

// 4. Aplicar descuento de cliente frecuente
const discount = subtotal * 0.10; // 2000 (10%)
const subtotalWithDiscount = 18000;

// 5. Calcular total con IVA
const tax = subtotalWithDiscount * 0.19; // 3420
const total = 21420;

// 6. Guardar venta
const savedSale = await saveSale({
  ...sale,
  subtotal: subtotal,
  frequentCustomerDiscount: discount,
  frequentCustomerTierId: customer.currentTierId,
  tax: tax,
  total: total
});

// 7. Actualizar historial del cliente
const history = await getOrCreateHistory(customer.id, "2025-10");
await history.addPurchase(subtotal, discount);
// Nuevo acumulado: history.accumulatedAmount += 20000
// Nuevo ahorro: history.totalSavings += 2000

// 8. Verificar si ascendió de tramo
if (history.accumulatedAmount >= 200001 && previousTier === "Plata") {
  // ¡Ascenso a Oro!
  await notifyTierUpgrade(customer, "Oro", 15);
}
```

---

## Notas de Implementación

### Prioridad de Implementación

**Fase 1 - MVP Core (Completo):**
- ✅ Multi-tenancy
- ✅ Usuarios y autenticación
- ✅ Inventario
- ✅ Ventas (POS)
- ✅ Clientes básicos
- ✅ Gastos fijos y variables
- ✅ Punto de equilibrio

**Fase 2 - Módulo Opcional (Siguiente sprint):**
- 🔄 ConfiguracionClienteFrecuente
- 🔄 TramoDescuento
- 🔄 HistorialComprasCliente
- 🔄 Extensiones a Customer
- 🔄 Extensiones a Sale
- 🔄 Notificaciones de ascenso

### Consideraciones Técnicas

**Base de Datos:**
- Índices compuestos en (customerId, period) para HistorialComprasCliente
- Índice en (tenantId, isEnabled) para ConfiguracionClienteFrecuente
- Constraint UNIQUE en (tenantId, tierLevel) para TramoDescuento
- Check constraint: TramoDescuento.discountPercentage <= 50

**Caching:**
- Cachear configuración de clientes frecuentes por tenant
- Cachear tramos activos para evitar queries repetidas
- Invalidar cache al modificar configuración

**Performance:**
- Usar transacciones para mantener consistencia
- Batch updates para reseteo mensual
- Jobs programados para procesamiento asíncrono

---

## Conclusión

Este diagrama representa la arquitectura completa del dominio de CRTLPyme, diseñado para:

- ✅ **Escalabilidad**: Multi-tenancy con miles de clientes
- ✅ **Integridad**: Transacciones ACID y validaciones estrictas
- ✅ **Trazabilidad**: Auditoría completa de operaciones
- ✅ **Análisis**: Punto de equilibrio y métricas financieras
- ✅ **Fidelización**: Sistema opcional de clientes frecuentes
- ✅ **Flexibilidad**: Módulos opcionales activables según necesidad
- ✅ **Mantenibilidad**: Código organizado por módulos funcionales

El uso de colores vibrantes facilita la identificación rápida de los diferentes módulos y sus responsabilidades, mejorando la comunicación entre los stakeholders del proyecto.

El **Módulo de Clientes Frecuentes** es completamente opcional y puede activarse solo cuando el negocio lo necesite, sin afectar el funcionamiento core del sistema.

---

**Última actualización:** Octubre 2025  
**Versión:** 3.0  
**Incluye:** 
- ✅ Módulo de Punto de Equilibrio (Completo)
- ✅ Módulo de Clientes Frecuentes (OPCIONAL - Diseñado)

---
