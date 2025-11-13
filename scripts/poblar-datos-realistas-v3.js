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
// Definición de productos para minimarket
var MINIMARKET_PRODUCTS = [
    { name: 'Coca Cola 500ml', category: 'Bebidas', brand: 'Coca Cola', costPrice: 600, salePrice: 900, initialStock: 50 },
    { name: 'Pan de molde', category: 'Panadería', brand: 'Ideal', costPrice: 800, salePrice: 1200, initialStock: 30 },
    { name: 'Leche 1L', category: 'Lácteos', brand: 'Colun', costPrice: 700, salePrice: 1100, initialStock: 40 },
    { name: 'Arroz 1kg', category: 'Abarrotes', brand: 'Tucapel', costPrice: 900, salePrice: 1400, initialStock: 25 },
    { name: 'Aceite 1L', category: 'Abarrotes', brand: 'Chef', costPrice: 1500, salePrice: 2300, initialStock: 20 },
    { name: 'Huevos docena', category: 'Lácteos', brand: 'Los Colonos', costPrice: 2000, salePrice: 2800, initialStock: 35 },
    { name: 'Jabón en barra', category: 'Aseo', brand: 'Noble', costPrice: 500, salePrice: 800, initialStock: 45 },
    { name: 'Papel higiénico 4 rollos', category: 'Aseo', brand: 'Elite', costPrice: 1200, salePrice: 1800, initialStock: 40 },
    { name: 'Fideos 400g', category: 'Abarrotes', brand: 'Carozzi', costPrice: 600, salePrice: 1000, initialStock: 50 },
    { name: 'Café instantáneo 170g', category: 'Bebidas', brand: 'Nescafé', costPrice: 3500, salePrice: 4800, initialStock: 15 },
    { name: 'Azúcar 1kg', category: 'Abarrotes', brand: 'Iansa', costPrice: 800, salePrice: 1300, initialStock: 30 },
    { name: 'Sal 1kg', category: 'Abarrotes', brand: 'Lobos', costPrice: 300, salePrice: 600, initialStock: 25 },
    { name: 'Mantequilla 250g', category: 'Lácteos', brand: 'Soprole', costPrice: 1800, salePrice: 2500, initialStock: 20 },
    { name: 'Galletas surtidas', category: 'Snacks', brand: 'McKay', costPrice: 800, salePrice: 1300, initialStock: 40 },
    { name: 'Jugo en polvo', category: 'Bebidas', brand: 'Zuko', costPrice: 400, salePrice: 700, initialStock: 50 },
    { name: 'Atún en lata', category: 'Conservas', brand: 'San José', costPrice: 1200, salePrice: 1800, initialStock: 35 },
    { name: 'Mayonesa 500g', category: 'Salsas', brand: 'Hellmanns', costPrice: 1600, salePrice: 2400, initialStock: 20 },
    { name: 'Ketchup 400g', category: 'Salsas', brand: 'Maggi', costPrice: 1200, salePrice: 1900, initialStock: 25 },
    { name: 'Cerveza lata', category: 'Bebidas', brand: 'Cristal', costPrice: 700, salePrice: 1100, initialStock: 60 },
    { name: 'Pañales pack 30', category: 'Bebé', brand: 'Huggies', costPrice: 8000, salePrice: 11000, initialStock: 15 },
];
// Utilidades
function randomDate(start, end) {
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}
function getRandomElement(array) {
    return array[Math.floor(Math.random() * array.length)];
}
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
// Función principal
function populateRealisticData() {
    return __awaiter(this, void 0, void 0, function () {
        var tenants, globalStats, _loop_1, _i, tenants_1, tenant, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log('🚀 Iniciando población de datos realistas...\n');
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
                    globalStats = {
                        totalProducts: 0,
                        totalSales: 0,
                        totalRevenue: 0,
                        tenantStats: []
                    };
                    _loop_1 = function (tenant) {
                        var adminUser, tenantProducts, _b, MINIMARKET_PRODUCTS_1, productData, masterProduct, inventory, totalStock, salesCount, tenantRevenue, months, existingSalesCount, saleNumber, totalStockReduction, _c, months_1, month, _loop_2, i, _d, _e, _f, inventoryId, reduction;
                        return __generator(this, function (_g) {
                            switch (_g.label) {
                                case 0:
                                    console.log("\n\uD83D\uDCE6 Procesando: ".concat(tenant.businessName));
                                    adminUser = tenant.users[0];
                                    if (!adminUser) {
                                        console.log("   \u26A0\uFE0F  No hay usuario admin, saltando...");
                                        return [2 /*return*/, "continue"];
                                    }
                                    // 2. Crear/obtener productos
                                    console.log("   \uD83D\uDCDD Creando productos...");
                                    tenantProducts = [];
                                    _b = 0, MINIMARKET_PRODUCTS_1 = MINIMARKET_PRODUCTS;
                                    _g.label = 1;
                                case 1:
                                    if (!(_b < MINIMARKET_PRODUCTS_1.length)) return [3 /*break*/, 9];
                                    productData = MINIMARKET_PRODUCTS_1[_b];
                                    return [4 /*yield*/, prisma.masterProduct.findFirst({
                                            where: {
                                                name: productData.name,
                                                category: productData.category
                                            }
                                        })];
                                case 2:
                                    masterProduct = _g.sent();
                                    if (!!masterProduct) return [3 /*break*/, 4];
                                    return [4 /*yield*/, prisma.masterProduct.create({
                                            data: {
                                                sku: "SKU-".concat(Date.now(), "-").concat(Math.random().toString(36).substr(2, 9)),
                                                name: productData.name,
                                                description: "".concat(productData.name, " - ").concat(productData.category),
                                                category: productData.category,
                                                brand: productData.brand,
                                                suggestedPrice: productData.salePrice,
                                                unit: 'unidad',
                                                isActive: true
                                            }
                                        })];
                                case 3:
                                    masterProduct = _g.sent();
                                    _g.label = 4;
                                case 4: return [4 /*yield*/, prisma.tenantInventory.findFirst({
                                        where: {
                                            tenantId: tenant.id,
                                            masterProductId: masterProduct.id
                                        }
                                    })];
                                case 5:
                                    inventory = _g.sent();
                                    if (!!inventory) return [3 /*break*/, 7];
                                    totalStock = productData.initialStock + getRandomInt(100, 200);
                                    return [4 /*yield*/, prisma.tenantInventory.create({
                                            data: {
                                                tenantId: tenant.id,
                                                masterProductId: masterProduct.id,
                                                costPrice: productData.costPrice,
                                                salePrice: productData.salePrice,
                                                stock: totalStock,
                                                minStock: 5,
                                                isActive: true
                                            }
                                        })];
                                case 6:
                                    inventory = _g.sent();
                                    _g.label = 7;
                                case 7:
                                    tenantProducts.push({ inventory: inventory, masterProduct: masterProduct, initialStock: productData.initialStock });
                                    _g.label = 8;
                                case 8:
                                    _b++;
                                    return [3 /*break*/, 1];
                                case 9:
                                    console.log("   \u2705 ".concat(tenantProducts.length, " productos disponibles"));
                                    globalStats.totalProducts += tenantProducts.length;
                                    // 3. Crear ventas históricas
                                    console.log("   \uD83D\uDCB0 Creando ventas hist\u00F3ricas...");
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
                                    return [4 /*yield*/, prisma.sale.count({
                                            where: { tenantId: tenant.id }
                                        })];
                                case 10:
                                    existingSalesCount = _g.sent();
                                    if (existingSalesCount > 0) {
                                        console.log("   \u26A0\uFE0F  Ya existen ".concat(existingSalesCount, " ventas, saltando creaci\u00F3n de ventas..."));
                                        globalStats.tenantStats.push({
                                            name: tenant.businessName,
                                            products: tenantProducts.length,
                                            sales: existingSalesCount,
                                            revenue: 0
                                        });
                                        return [2 /*return*/, "continue"];
                                    }
                                    saleNumber = 1;
                                    totalStockReduction = {};
                                    _c = 0, months_1 = months;
                                    _g.label = 11;
                                case 11:
                                    if (!(_c < months_1.length)) return [3 /*break*/, 16];
                                    month = months_1[_c];
                                    _loop_2 = function (i) {
                                        var saleDate, itemsCount, paymentMethod, saleStatus, selectedProducts, j, subtotal, saleItems, tax, total;
                                        return __generator(this, function (_h) {
                                            switch (_h.label) {
                                                case 0:
                                                    saleDate = randomDate(month.start, month.end);
                                                    itemsCount = getRandomInt(1, 5);
                                                    paymentMethod = getRandomElement(['CASH', 'DEBIT', 'CREDIT', 'TRANSFER']);
                                                    saleStatus = Math.random() < 0.95 ? 'COMPLETED' : (Math.random() < 0.5 ? 'PENDING' : 'CANCELLED');
                                                    selectedProducts = [];
                                                    for (j = 0; j < itemsCount; j++) {
                                                        selectedProducts.push(getRandomElement(tenantProducts));
                                                    }
                                                    subtotal = 0;
                                                    saleItems = selectedProducts.map(function (_a) {
                                                        var inventory = _a.inventory, masterProduct = _a.masterProduct;
                                                        var quantity = getRandomInt(1, 3);
                                                        var unitPrice = Number(inventory.salePrice);
                                                        var unitCost = Number(inventory.costPrice);
                                                        var itemSubtotal = unitPrice * quantity;
                                                        subtotal += itemSubtotal;
                                                        // Rastrear reducción de stock
                                                        if (saleStatus === 'COMPLETED') {
                                                            if (!totalStockReduction[inventory.id]) {
                                                                totalStockReduction[inventory.id] = 0;
                                                            }
                                                            totalStockReduction[inventory.id] += quantity;
                                                        }
                                                        return {
                                                            quantity: quantity,
                                                            unitPrice: unitPrice,
                                                            unitCost: unitCost,
                                                            subtotal: itemSubtotal,
                                                            tenantInventoryId: inventory.id,
                                                            tenantId: tenant.id
                                                        };
                                                    });
                                                    tax = 0;
                                                    total = subtotal + tax;
                                                    // Crear venta
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
                                                        })];
                                                case 1:
                                                    // Crear venta
                                                    _h.sent();
                                                    if (saleStatus === 'COMPLETED') {
                                                        tenantRevenue += Number(total);
                                                    }
                                                    salesCount++;
                                                    saleNumber++;
                                                    return [2 /*return*/];
                                            }
                                        });
                                    };
                                    i = 0;
                                    _g.label = 12;
                                case 12:
                                    if (!(i < month.sales)) return [3 /*break*/, 15];
                                    return [5 /*yield**/, _loop_2(i)];
                                case 13:
                                    _g.sent();
                                    _g.label = 14;
                                case 14:
                                    i++;
                                    return [3 /*break*/, 12];
                                case 15:
                                    _c++;
                                    return [3 /*break*/, 11];
                                case 16:
                                    // 4. Actualizar stock final
                                    console.log("   \uD83D\uDCCA Actualizando stock...");
                                    _d = 0, _e = Object.entries(totalStockReduction);
                                    _g.label = 17;
                                case 17:
                                    if (!(_d < _e.length)) return [3 /*break*/, 20];
                                    _f = _e[_d], inventoryId = _f[0], reduction = _f[1];
                                    return [4 /*yield*/, prisma.tenantInventory.update({
                                            where: { id: inventoryId },
                                            data: { stock: { decrement: reduction } }
                                        })];
                                case 18:
                                    _g.sent();
                                    _g.label = 19;
                                case 19:
                                    _d++;
                                    return [3 /*break*/, 17];
                                case 20:
                                    console.log("   \u2705 ".concat(salesCount, " ventas creadas"));
                                    console.log("   \uD83D\uDCB5 Ingresos: CLP $".concat(tenantRevenue.toLocaleString('es-CL')));
                                    globalStats.totalSales += salesCount;
                                    globalStats.totalRevenue += tenantRevenue;
                                    globalStats.tenantStats.push({
                                        name: tenant.businessName,
                                        products: tenantProducts.length,
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
                    console.log('\n\n✨ ¡Población completada!\n');
                    console.log('📊 RESUMEN GLOBAL:');
                    console.log("   Tenants procesados: ".concat(globalStats.tenantStats.length));
                    console.log("   Total de productos: ".concat(globalStats.totalProducts));
                    console.log("   Total de ventas: ".concat(globalStats.totalSales));
                    console.log("   Ingresos totales: CLP $".concat(globalStats.totalRevenue.toLocaleString('es-CL'), "\n"));
                    return [2 /*return*/, globalStats];
                case 7:
                    error_1 = _a.sent();
                    console.error('❌ Error:', error_1);
                    throw error_1;
                case 8: return [2 /*return*/];
            }
        });
    });
}
// Ejecutar
populateRealisticData()
    .then(function () {
    console.log('✅ Proceso completado');
    process.exit(0);
})
    .catch(function (error) {
    console.error('❌ Error fatal:', error);
    process.exit(1);
})
    .finally(function () { return prisma.$disconnect(); });
