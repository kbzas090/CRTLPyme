"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var client_1 = require("@prisma/client");
var prisma = new client_1.PrismaClient();
// Definición de tipos de negocio y sus productos
var BUSINESS_CATALOG = {
    minimarket: {
        name: 'Minimarket/Almacén',
        products: [
            { name: 'Coca Cola 500ml', category: 'Bebidas', brand: 'Coca Cola', costPrice: 600, salePrice: 900, stock: 50 },
            { name: 'Pan de molde', category: 'Panadería', brand: 'Ideal', costPrice: 800, salePrice: 1200, stock: 30 },
            { name: 'Leche 1L', category: 'Lácteos', brand: 'Colun', costPrice: 700, salePrice: 1100, stock: 40 },
            { name: 'Arroz 1kg', category: 'Abarrotes', brand: 'Tucapel', costPrice: 900, salePrice: 1400, stock: 25 },
            { name: 'Aceite 1L', category: 'Abarrotes', brand: 'Chef', costPrice: 1500, salePrice: 2300, stock: 20 },
            { name: 'Huevos docena', category: 'Lácteos', brand: 'Los Colonos', costPrice: 2000, salePrice: 2800, stock: 35 },
            { name: 'Jabón en barra', category: 'Aseo', brand: 'Noble', costPrice: 500, salePrice: 800, stock: 45 },
            { name: 'Papel higiénico 4 rollos', category: 'Aseo', brand: 'Elite', costPrice: 1200, salePrice: 1800, stock: 40 },
            { name: 'Fideos 400g', category: 'Abarrotes', brand: 'Carozzi', costPrice: 600, salePrice: 1000, stock: 50 },
            { name: 'Café instantáneo 170g', category: 'Bebidas', brand: 'Nescafé', costPrice: 3500, salePrice: 4800, stock: 15 },
            { name: 'Azúcar 1kg', category: 'Abarrotes', brand: 'Iansa', costPrice: 800, salePrice: 1300, stock: 30 },
            { name: 'Sal 1kg', category: 'Abarrotes', brand: 'Lobos', costPrice: 300, salePrice: 600, stock: 25 },
            { name: 'Mantequilla 250g', category: 'Lácteos', brand: 'Soprole', costPrice: 1800, salePrice: 2500, stock: 20 },
            { name: 'Galletas surtidas', category: 'Snacks', brand: 'McKay', costPrice: 800, salePrice: 1300, stock: 40 },
            { name: 'Jugo en polvo', category: 'Bebidas', brand: 'Zuko', costPrice: 400, salePrice: 700, stock: 50 },
            { name: 'Atún en lata', category: 'Conservas', brand: 'San José', costPrice: 1200, salePrice: 1800, stock: 35 },
            { name: 'Mayonesa 500g', category: 'Salsas', brand: 'Hellmanns', costPrice: 1600, salePrice: 2400, stock: 20 },
            { name: 'Ketchup 400g', category: 'Salsas', brand: 'Maggi', costPrice: 1200, salePrice: 1900, stock: 25 },
            { name: 'Cerveza lata', category: 'Bebidas', brand: 'Cristal', costPrice: 700, salePrice: 1100, stock: 60 },
            { name: 'Pañales pack 30', category: 'Bebé', brand: 'Huggies', costPrice: 8000, salePrice: 11000, stock: 15 },
        ]
    }
};
// Utilidades de fechas
function randomDate(start, end) {
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}
function getRandomElement(array) {
    return array[Math.floor(Math.random() * array.length)];
}
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
// Función principal de población
function populateRealisticData() {
    return __awaiter(this, void 0, void 0, function () {
        var tenants, stats, _loop_1, _i, tenants_1, tenant, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log('🚀 Iniciando población de datos realistas para minimarkets...\n');
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 7, , 8]);
                    return [4 /*yield*/, prisma.tenant.findMany({
                            where: {
                                isActive: true,
                                businessName: {
                                    notIn: ['Empresa Demo CRTLPyme', 'CRTLPyme - Plataforma']
                                }
                            },
                            include: { users: { where: { role: 'ADMIN', isActive: true }, take: 1 } }
                        })];
                case 2:
                    tenants = _a.sent();
                    console.log("\u2705 Encontrados ".concat(tenants.length, " tenants activos\n"));
                    stats = {
                        totalProducts: 0,
                        totalMovements: 0,
                        totalSales: 0,
                        totalRevenue: 0,
                        tenantStats: []
                    };
                    _loop_1 = function (tenant) {
                        var businessType, adminUser, createdProducts, _b, _c, product, masterProduct, existingInventory, tenantInventory, movementsCount, productsWithStock, _d, productsWithStock_1, inventory, existingMovements, entryDate, additionalEntries, i, entryAmount, entryDate_1, salesCount, tenantRevenue, months, lastSale, saleNumber, match, _e, months_1, month, _loop_2, i;
                        return __generator(this, function (_f) {
                            switch (_f.label) {
                                case 0:
                                    console.log("\n\uD83D\uDCE6 Procesando: ".concat(tenant.businessName));
                                    businessType = BUSINESS_CATALOG.minimarket;
                                    adminUser = tenant.users[0];
                                    if (!adminUser) {
                                        console.log("   \u26A0\uFE0F  No se encontr\u00F3 usuario admin, saltando...");
                                        return [2 /*return*/, "continue"];
                                    }
                                    // 2. Crear productos para el tenant
                                    console.log("   \uD83D\uDCDD Creando productos...");
                                    createdProducts = [];
                                    _b = 0, _c = businessType.products;
                                    _f.label = 1;
                                case 1:
                                    if (!(_b < _c.length)) return [3 /*break*/, 8];
                                    product = _c[_b];
                                    return [4 /*yield*/, prisma.masterProduct.findFirst({
                                            where: {
                                                name: product.name,
                                                category: product.category
                                            }
                                        })];
                                case 2:
                                    masterProduct = _f.sent();
                                    if (!!masterProduct) return [3 /*break*/, 4];
                                    return [4 /*yield*/, prisma.masterProduct.create({
                                            data: {
                                                sku: "SKU-".concat(Date.now(), "-").concat(Math.random().toString(36).substr(2, 9)),
                                                name: product.name,
                                                description: "".concat(product.name, " - ").concat(product.category),
                                                category: product.category,
                                                brand: product.brand,
                                                suggestedPrice: product.salePrice,
                                                unit: 'unidad',
                                                isActive: true
                                            }
                                        })];
                                case 3:
                                    masterProduct = _f.sent();
                                    _f.label = 4;
                                case 4: return [4 /*yield*/, prisma.tenantInventory.findFirst({
                                        where: {
                                            tenantId: tenant.id,
                                            masterProductId: masterProduct.id
                                        }
                                    })];
                                case 5:
                                    existingInventory = _f.sent();
                                    if (existingInventory) {
                                        console.log("   \u26A0\uFE0F  Producto ".concat(product.name, " ya existe en el inventario, saltando..."));
                                        createdProducts.push({ inventory: existingInventory, product: masterProduct });
                                        return [3 /*break*/, 7];
                                    }
                                    return [4 /*yield*/, prisma.tenantInventory.create({
                                            data: {
                                                tenantId: tenant.id,
                                                masterProductId: masterProduct.id,
                                                costPrice: product.costPrice,
                                                salePrice: product.salePrice,
                                                stock: product.stock,
                                                minStock: 5,
                                                isActive: true
                                            }
                                        })];
                                case 6:
                                    tenantInventory = _f.sent();
                                    createdProducts.push({ inventory: tenantInventory, product: masterProduct });
                                    _f.label = 7;
                                case 7:
                                    _b++;
                                    return [3 /*break*/, 1];
                                case 8:
                                    console.log("   \u2705 ".concat(createdProducts.length, " productos disponibles"));
                                    stats.totalProducts += createdProducts.length;
                                    // 3. Crear movimientos de inventario (solo para productos con stock > 0)
                                    console.log("   \uD83D\uDCCB Creando movimientos de inventario...");
                                    movementsCount = 0;
                                    productsWithStock = createdProducts.filter(function (p) { return p.inventory.stock > 0; });
                                    _d = 0, productsWithStock_1 = productsWithStock;
                                    _f.label = 9;
                                case 9:
                                    if (!(_d < productsWithStock_1.length)) return [3 /*break*/, 16];
                                    inventory = productsWithStock_1[_d].inventory;
                                    return [4 /*yield*/, prisma.inventoryMovement.count({
                                            where: {
                                                tenantInventoryId: inventory.id,
                                                tenantId: tenant.id
                                            }
                                        })];
                                case 10:
                                    existingMovements = _f.sent();
                                    if (existingMovements > 0) {
                                        console.log("   \u26A0\uFE0F  Ya existen movimientos para un producto, saltando movimientos iniciales...");
                                        return [3 /*break*/, 15];
                                    }
                                    entryDate = randomDate(new Date('2025-06-01'), new Date('2025-06-15'));
                                    return [4 /*yield*/, prisma.inventoryMovement.create({
                                            data: {
                                                tenantInventoryId: inventory.id,
                                                type: 'ENTRY',
                                                quantity: inventory.stock,
                                                reason: 'Compra inicial de inventario',
                                                notes: 'Stock inicial del sistema',
                                                createdBy: adminUser.id,
                                                tenantId: tenant.id,
                                                createdAt: entryDate
                                            }
                                        })];
                                case 11:
                                    _f.sent();
                                    movementsCount++;
                                    additionalEntries = getRandomInt(2, 5);
                                    i = 0;
                                    _f.label = 12;
                                case 12:
                                    if (!(i < additionalEntries)) return [3 /*break*/, 15];
                                    entryAmount = getRandomInt(10, 50);
                                    entryDate_1 = randomDate(new Date('2025-06-16'), new Date('2025-11-10'));
                                    return [4 /*yield*/, prisma.inventoryMovement.create({
                                            data: {
                                                tenantInventoryId: inventory.id,
                                                type: 'ENTRY',
                                                quantity: entryAmount,
                                                reason: 'Reposición de stock',
                                                notes: "Compra a proveedor",
                                                createdBy: adminUser.id,
                                                tenantId: tenant.id,
                                                createdAt: entryDate_1
                                            }
                                        })];
                                case 13:
                                    _f.sent();
                                    movementsCount++;
                                    _f.label = 14;
                                case 14:
                                    i++;
                                    return [3 /*break*/, 12];
                                case 15:
                                    _d++;
                                    return [3 /*break*/, 9];
                                case 16:
                                    console.log("   \u2705 ".concat(movementsCount, " movimientos de inventario creados"));
                                    stats.totalMovements += movementsCount;
                                    // 4. Crear ventas (junio 2025 - noviembre 2025)
                                    console.log("   \uD83D\uDCB0 Creando ventas...");
                                    salesCount = 0;
                                    tenantRevenue = 0;
                                    months = [
                                        { start: new Date('2025-06-01'), end: new Date('2025-06-30'), sales: getRandomInt(20, 40) },
                                        { start: new Date('2025-07-01'), end: new Date('2025-07-31'), sales: getRandomInt(25, 45) },
                                        { start: new Date('2025-08-01'), end: new Date('2025-08-31'), sales: getRandomInt(25, 45) },
                                        { start: new Date('2025-09-01'), end: new Date('2025-09-30'), sales: getRandomInt(30, 50) },
                                        { start: new Date('2025-10-01'), end: new Date('2025-10-31'), sales: getRandomInt(30, 50) },
                                        { start: new Date('2025-11-01'), end: new Date('2025-11-13'), sales: getRandomInt(15, 25) }
                                    ];
                                    return [4 /*yield*/, prisma.sale.findFirst({
                                            where: { tenantId: tenant.id },
                                            orderBy: { saleNumber: 'desc' },
                                            select: { saleNumber: true }
                                        })];
                                case 17:
                                    lastSale = _f.sent();
                                    saleNumber = 1;
                                    if (lastSale && lastSale.saleNumber) {
                                        match = lastSale.saleNumber.match(/\d+/);
                                        if (match) {
                                            saleNumber = parseInt(match[0]) + 1;
                                        }
                                    }
                                    _e = 0, months_1 = months;
                                    _f.label = 18;
                                case 18:
                                    if (!(_e < months_1.length)) return [3 /*break*/, 23];
                                    month = months_1[_e];
                                    _loop_2 = function (i) {
                                        var saleDate, itemsCount, paymentMethod, saleStatus, selectedProducts, j, subtotal, saleItems, tax, total, sale, _g, saleItems_1, item;
                                        return __generator(this, function (_h) {
                                            switch (_h.label) {
                                                case 0:
                                                    saleDate = randomDate(month.start, month.end);
                                                    itemsCount = getRandomInt(1, 5);
                                                    paymentMethod = getRandomElement(['CASH', 'DEBIT', 'CREDIT', 'TRANSFER']);
                                                    saleStatus = Math.random() < 0.95 ? 'COMPLETED' : (Math.random() < 0.5 ? 'PENDING' : 'CANCELLED');
                                                    selectedProducts = [];
                                                    for (j = 0; j < itemsCount; j++) {
                                                        selectedProducts.push(getRandomElement(createdProducts));
                                                    }
                                                    subtotal = 0;
                                                    saleItems = selectedProducts.map(function (_a) {
                                                        var inventory = _a.inventory, product = _a.product;
                                                        var quantity = getRandomInt(1, 3);
                                                        var unitPrice = Number(inventory.salePrice);
                                                        var unitCost = Number(inventory.costPrice);
                                                        var itemSubtotal = unitPrice * quantity;
                                                        subtotal += itemSubtotal;
                                                        return {
                                                            quantity: quantity,
                                                            unitPrice: unitPrice,
                                                            unitCost: unitCost,
                                                            subtotal: itemSubtotal,
                                                            tenantInventoryId: inventory.id,
                                                            tenantId: tenant.id
                                                        };
                                                    });
                                                    tax = 0 // Sin IVA por ahora
                                                    ;
                                                    total = subtotal + tax;
                                                    return [4 /*yield*/, prisma.sale.create({
                                                            data: {
                                                                saleNumber: "".concat(tenant.businessName.substring(0, 3).toUpperCase(), "-").concat(saleNumber.toString().padStart(6, '0')),
                                                                subtotal: subtotal,
                                                                tax: tax,
                                                                total: total,
                                                                paymentMethod: paymentMethod,
                                                                status: saleStatus,
                                                                userId: adminUser.id,
                                                                tenantId: tenant.id,
                                                                createdAt: saleDate,
                                                                updatedAt: saleDate,
                                                                items: {
                                                                    create: saleItems
                                                                }
                                                            }
                                                        })
                                                        // Actualizar stock si la venta está completada
                                                    ];
                                                case 1:
                                                    sale = _h.sent();
                                                    if (!(saleStatus === 'COMPLETED')) return [3 /*break*/, 7];
                                                    _g = 0, saleItems_1 = saleItems;
                                                    _h.label = 2;
                                                case 2:
                                                    if (!(_g < saleItems_1.length)) return [3 /*break*/, 6];
                                                    item = saleItems_1[_g];
                                                    // Registrar salida de inventario
                                                    return [4 /*yield*/, prisma.inventoryMovement.create({
                                                            data: {
                                                                tenantInventoryId: item.tenantInventoryId,
                                                                type: 'EXIT',
                                                                quantity: -item.quantity,
                                                                reason: 'Venta',
                                                                notes: "Venta ".concat(sale.saleNumber),
                                                                createdBy: adminUser.id,
                                                                tenantId: tenant.id,
                                                                createdAt: saleDate
                                                            }
                                                        })
                                                        // Actualizar stock en TenantInventory
                                                    ];
                                                case 3:
                                                    // Registrar salida de inventario
                                                    _h.sent();
                                                    // Actualizar stock en TenantInventory
                                                    return [4 /*yield*/, prisma.tenantInventory.update({
                                                            where: { id: item.tenantInventoryId },
                                                            data: {
                                                                stock: { decrement: item.quantity },
                                                                updatedAt: saleDate
                                                            }
                                                        })];
                                                case 4:
                                                    // Actualizar stock en TenantInventory
                                                    _h.sent();
                                                    _h.label = 5;
                                                case 5:
                                                    _g++;
                                                    return [3 /*break*/, 2];
                                                case 6:
                                                    tenantRevenue += Number(total);
                                                    _h.label = 7;
                                                case 7:
                                                    salesCount++;
                                                    saleNumber++;
                                                    return [2 /*return*/];
                                            }
                                        });
                                    };
                                    i = 0;
                                    _f.label = 19;
                                case 19:
                                    if (!(i < month.sales)) return [3 /*break*/, 22];
                                    return [5 /*yield**/, _loop_2(i)];
                                case 20:
                                    _f.sent();
                                    _f.label = 21;
                                case 21:
                                    i++;
                                    return [3 /*break*/, 19];
                                case 22:
                                    _e++;
                                    return [3 /*break*/, 18];
                                case 23:
                                    console.log("   \u2705 ".concat(salesCount, " ventas creadas"));
                                    console.log("   \uD83D\uDCB5 Ingresos totales: CLP $".concat(tenantRevenue.toLocaleString('es-CL')));
                                    stats.totalSales += salesCount;
                                    stats.totalRevenue += tenantRevenue;
                                    stats.tenantStats.push({
                                        name: tenant.businessName,
                                        type: businessType.name,
                                        products: createdProducts.length,
                                        movements: movementsCount,
                                        sales: salesCount,
                                        revenue: tenantRevenue
                                    });
                                    return [2 /*return*/];
                            }
                        });
                    };
                    _i = 0, tenants_1 = tenants;
                    _a.label = 3;
                case 3:
                    if (!(_i < tenants_1.length)) return [3 /*break*/, 6];
                    tenant = tenants_1[_i];
                    return [5 /*yield**/, _loop_1(tenant)];
                case 4:
                    _a.sent();
                    _a.label = 5;
                case 5:
                    _i++;
                    return [3 /*break*/, 3];
                case 6:
                    console.log('\n\n✨ ¡Población de datos completada!\n');
                    console.log('📊 RESUMEN GLOBAL:');
                    console.log("   Tenants procesados: ".concat(stats.tenantStats.length));
                    console.log("   Total de productos: ".concat(stats.totalProducts));
                    console.log("   Total de movimientos: ".concat(stats.totalMovements));
                    console.log("   Total de ventas: ".concat(stats.totalSales));
                    console.log("   Ingresos totales: CLP $".concat(stats.totalRevenue.toLocaleString('es-CL')));
                    return [2 /*return*/, stats];
                case 7:
                    error_1 = _a.sent();
                    console.error('❌ Error durante la población:', error_1);
                    throw error_1;
                case 8: return [2 /*return*/];
            }
        });
    });
}
// Ejecutar
populateRealisticData()
    .then(function (stats) {
    console.log('\n✅ Proceso completado exitosamente');
    process.exit(0);
})
    .catch(function (error) {
    console.error('\n❌ Error fatal:', error);
    process.exit(1);
})
    .finally(function () { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, prisma.$disconnect()];
            case 1:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); });
