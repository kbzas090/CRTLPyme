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
function verifyIntegrity() {
    return __awaiter(this, void 0, void 0, function () {
        var issues, verifications, masterProductsCount, tenants, _i, tenants_1, tenant, inventoryCount, negativeStock, _a, negativeStock_1, item, salesCount, salesByStatus, _b, salesByStatus_1, status_1, saleItemsCount, salesWithoutItems, sales, inconsistentSales, _c, sales_1, sale, calculatedSubtotal, diff, _d, verifications_1, v, _e, issues_1, i, error_1;
        return __generator(this, function (_f) {
            switch (_f.label) {
                case 0:
                    console.log('🔍 Verificando integridad de datos...\n');
                    issues = [];
                    verifications = [];
                    _f.label = 1;
                case 1:
                    _f.trys.push([1, 14, , 15]);
                    return [4 /*yield*/, prisma.masterProduct.count()];
                case 2:
                    masterProductsCount = _f.sent();
                    verifications.push("\u2705 Total de productos maestros: ".concat(masterProductsCount));
                    return [4 /*yield*/, prisma.tenant.findMany({
                            where: { isActive: true }
                        })];
                case 3:
                    tenants = _f.sent();
                    _i = 0, tenants_1 = tenants;
                    _f.label = 4;
                case 4:
                    if (!(_i < tenants_1.length)) return [3 /*break*/, 8];
                    tenant = tenants_1[_i];
                    return [4 /*yield*/, prisma.tenantInventory.count({
                            where: { tenantId: tenant.id }
                        })];
                case 5:
                    inventoryCount = _f.sent();
                    verifications.push("\u2705 ".concat(tenant.businessName, ": ").concat(inventoryCount, " productos en inventario"));
                    return [4 /*yield*/, prisma.tenantInventory.findMany({
                            where: {
                                tenantId: tenant.id,
                                stock: { lt: 0 }
                            },
                            include: {
                                masterProduct: { select: { name: true } }
                            }
                        })];
                case 6:
                    negativeStock = _f.sent();
                    if (negativeStock.length > 0) {
                        issues.push("\u26A0\uFE0F  ".concat(tenant.businessName, ": ").concat(negativeStock.length, " productos con stock negativo"));
                        for (_a = 0, negativeStock_1 = negativeStock; _a < negativeStock_1.length; _a++) {
                            item = negativeStock_1[_a];
                            issues.push("   - ".concat(item.masterProduct.name, ": stock = ").concat(item.stock));
                        }
                    }
                    _f.label = 7;
                case 7:
                    _i++;
                    return [3 /*break*/, 4];
                case 8: return [4 /*yield*/, prisma.sale.count()];
                case 9:
                    salesCount = _f.sent();
                    return [4 /*yield*/, prisma.sale.groupBy({
                            by: ['status'],
                            _count: true
                        })];
                case 10:
                    salesByStatus = _f.sent();
                    verifications.push("\u2705 Total de ventas: ".concat(salesCount));
                    for (_b = 0, salesByStatus_1 = salesByStatus; _b < salesByStatus_1.length; _b++) {
                        status_1 = salesByStatus_1[_b];
                        verifications.push("   - ".concat(status_1.status, ": ").concat(status_1._count));
                    }
                    return [4 /*yield*/, prisma.saleItem.count()];
                case 11:
                    saleItemsCount = _f.sent();
                    verifications.push("\u2705 Total de items de venta: ".concat(saleItemsCount));
                    return [4 /*yield*/, prisma.sale.findMany({
                            where: {
                                items: { none: {} }
                            },
                            select: { id: true, saleNumber: true }
                        })];
                case 12:
                    salesWithoutItems = _f.sent();
                    if (salesWithoutItems.length > 0) {
                        issues.push("\u26A0\uFE0F  ".concat(salesWithoutItems.length, " ventas sin items"));
                    }
                    else {
                        verifications.push("\u2705 Todas las ventas tienen items");
                    }
                    // 6. Verificar que todos los sale items tienen relaciones válidas
                    verifications.push("\u2705 Relaciones de items de venta asumidas como v\u00E1lidas (constraint FK)");
                    return [4 /*yield*/, prisma.sale.findMany({
                            include: { items: true }
                        })];
                case 13:
                    sales = _f.sent();
                    inconsistentSales = 0;
                    for (_c = 0, sales_1 = sales; _c < sales_1.length; _c++) {
                        sale = sales_1[_c];
                        calculatedSubtotal = sale.items.reduce(function (sum, item) { return sum + Number(item.subtotal); }, 0);
                        diff = Math.abs(calculatedSubtotal - Number(sale.subtotal));
                        if (diff > 1) { // tolerancia de 1 peso
                            inconsistentSales++;
                        }
                    }
                    if (inconsistentSales > 0) {
                        issues.push("\u26A0\uFE0F  ".concat(inconsistentSales, " ventas con totales inconsistentes"));
                    }
                    else {
                        verifications.push("\u2705 Todos los totales de ventas son consistentes");
                    }
                    // Resumen
                    console.log('📊 VERIFICACIONES EXITOSAS:\n');
                    for (_d = 0, verifications_1 = verifications; _d < verifications_1.length; _d++) {
                        v = verifications_1[_d];
                        console.log(v);
                    }
                    if (issues.length > 0) {
                        console.log('\n\n⚠️  PROBLEMAS ENCONTRADOS:\n');
                        for (_e = 0, issues_1 = issues; _e < issues_1.length; _e++) {
                            i = issues_1[_e];
                            console.log(i);
                        }
                    }
                    else {
                        console.log('\n\n✅ No se encontraron problemas de integridad');
                    }
                    return [2 /*return*/, { verifications: verifications, issues: issues }];
                case 14:
                    error_1 = _f.sent();
                    console.error('❌ Error:', error_1);
                    throw error_1;
                case 15: return [2 /*return*/];
            }
        });
    });
}
// Ejecutar
verifyIntegrity()
    .then(function (result) {
    console.log('\n✅ Verificación completada');
    process.exit(result.issues.length > 0 ? 1 : 0);
})
    .catch(function (error) {
    console.error('❌ Error fatal:', error);
    process.exit(1);
})
    .finally(function () { return prisma.$disconnect(); });
