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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
var client_1 = require("@prisma/client");
var prisma = new client_1.PrismaClient();
function checkDatabase() {
    return __awaiter(this, void 0, void 0, function () {
        var tenants, masterProducts, tenantInventoryCount, legacyProducts, totalSales, salesByTenant, saleItems, movements, movementsByType, plans, payments, paymentsByStatus, _i, _a, tenant, subscription, tenantInv, tenantSales, tenantMovements, error_1;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    console.log('🔍 ANÁLISIS COMPLETO DE BASE DE DATOS CRTLPyme\n');
                    console.log('='.repeat(80));
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 20, 21, 23]);
                    return [4 /*yield*/, prisma.tenant.findMany({
                            include: {
                                subscriptions: {
                                    include: { plan: true },
                                    orderBy: { createdAt: 'desc' },
                                    take: 1
                                },
                                users: { take: 1 }
                            }
                        })];
                case 2:
                    tenants = _b.sent();
                    console.log('\n📊 TENANTS:');
                    console.log("   Total: ".concat(tenants.length));
                    return [4 /*yield*/, prisma.masterProduct.findMany()];
                case 3:
                    masterProducts = _b.sent();
                    console.log('\n📦 MASTER PRODUCTS (Catálogo Global):');
                    console.log("   Total: ".concat(masterProducts.length));
                    if (masterProducts.length > 0) {
                        console.log('   Categorías:', __spreadArray([], new Set(masterProducts.map(function (p) { return p.category; })), true));
                    }
                    return [4 /*yield*/, prisma.tenantInventory.count()];
                case 4:
                    tenantInventoryCount = _b.sent();
                    console.log('\n🏪 TENANT INVENTORY (Productos por Tenant):');
                    console.log("   Total: ".concat(tenantInventoryCount));
                    return [4 /*yield*/, prisma.product.count()];
                case 5:
                    legacyProducts = _b.sent();
                    console.log('\n📋 LEGACY PRODUCTS (Tabla Antigua):');
                    console.log("   Total: ".concat(legacyProducts));
                    return [4 /*yield*/, prisma.sale.count()];
                case 6:
                    totalSales = _b.sent();
                    return [4 /*yield*/, prisma.sale.groupBy({
                            by: ['tenantId'],
                            _count: true
                        })];
                case 7:
                    salesByTenant = _b.sent();
                    console.log('\n💰 SALES:');
                    console.log("   Total: ".concat(totalSales));
                    console.log("   Tenants con ventas: ".concat(salesByTenant.length));
                    return [4 /*yield*/, prisma.saleItem.count()];
                case 8:
                    saleItems = _b.sent();
                    console.log('\n🛒 SALE ITEMS:');
                    console.log("   Total: ".concat(saleItems));
                    return [4 /*yield*/, prisma.inventoryMovement.count()];
                case 9:
                    movements = _b.sent();
                    return [4 /*yield*/, prisma.inventoryMovement.groupBy({
                            by: ['type'],
                            _count: true
                        })];
                case 10:
                    movementsByType = _b.sent();
                    console.log('\n📦 INVENTORY MOVEMENTS:');
                    console.log("   Total: ".concat(movements));
                    movementsByType.forEach(function (m) {
                        console.log("   ".concat(m.type, ": ").concat(m._count));
                    });
                    return [4 /*yield*/, prisma.subscriptionPlan.findMany({
                            orderBy: { sortOrder: 'asc' }
                        })];
                case 11:
                    plans = _b.sent();
                    console.log('\n💎 SUBSCRIPTION PLANS:');
                    console.log("   Total: ".concat(plans.length));
                    plans.forEach(function (p) {
                        console.log("   - ".concat(p.name, " (").concat(p.billingCycle, "): $").concat(p.price));
                    });
                    return [4 /*yield*/, prisma.subscriptionPayment.count()];
                case 12:
                    payments = _b.sent();
                    return [4 /*yield*/, prisma.subscriptionPayment.groupBy({
                            by: ['status'],
                            _count: true,
                            _sum: { amount: true }
                        })];
                case 13:
                    paymentsByStatus = _b.sent();
                    console.log('\n💳 SUBSCRIPTION PAYMENTS:');
                    console.log("   Total: ".concat(payments));
                    paymentsByStatus.forEach(function (p) {
                        console.log("   ".concat(p.status, ": ").concat(p._count, " (Total: $").concat(p._sum.amount || 0, ")"));
                    });
                    // 10. DETALLE POR TENANT (primeros 3)
                    console.log('\n' + '='.repeat(80));
                    console.log('\n👥 DETALLE POR TENANT (primeros 3):\n');
                    _i = 0, _a = tenants.slice(0, 3);
                    _b.label = 14;
                case 14:
                    if (!(_i < _a.length)) return [3 /*break*/, 19];
                    tenant = _a[_i];
                    console.log("\n\uD83C\uDFE2 ".concat(tenant.businessName));
                    console.log("   Email: ".concat(tenant.email));
                    console.log("   Estado: ".concat(tenant.accountStatus));
                    subscription = tenant.subscriptions[0];
                    if (subscription) {
                        console.log("   Plan: ".concat(subscription.plan.name, " (").concat(subscription.status, ")"));
                    }
                    return [4 /*yield*/, prisma.tenantInventory.count({
                            where: { tenantId: tenant.id }
                        })];
                case 15:
                    tenantInv = _b.sent();
                    console.log("   Productos en inventario: ".concat(tenantInv));
                    return [4 /*yield*/, prisma.sale.count({
                            where: { tenantId: tenant.id }
                        })];
                case 16:
                    tenantSales = _b.sent();
                    console.log("   Ventas registradas: ".concat(tenantSales));
                    return [4 /*yield*/, prisma.inventoryMovement.count({
                            where: { tenantId: tenant.id }
                        })];
                case 17:
                    tenantMovements = _b.sent();
                    console.log("   Movimientos de inventario: ".concat(tenantMovements));
                    _b.label = 18;
                case 18:
                    _i++;
                    return [3 /*break*/, 14];
                case 19:
                    console.log('\n' + '='.repeat(80));
                    return [3 /*break*/, 23];
                case 20:
                    error_1 = _b.sent();
                    console.error('❌ Error:', error_1);
                    return [3 /*break*/, 23];
                case 21: return [4 /*yield*/, prisma.$disconnect()];
                case 22:
                    _b.sent();
                    return [7 /*endfinally*/];
                case 23: return [2 /*return*/];
            }
        });
    });
}
checkDatabase();
