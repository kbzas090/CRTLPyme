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
function generateReport() {
    return __awaiter(this, void 0, void 0, function () {
        var tenants, reportData, globalStats, _i, tenants_1, tenant, productsCount, sales, salesCount, completedSales, revenue, productSales, _a, completedSales_1, sale, _b, _c, item, productName, topProducts, salesByMonth, _d, completedSales_2, sale, month, markdown, i, data, _e, _f, product, _g, _h, _j, month, count, error_1;
        return __generator(this, function (_k) {
            switch (_k.label) {
                case 0:
                    console.log('📊 Generando reporte detallado...\n');
                    _k.label = 1;
                case 1:
                    _k.trys.push([1, 8, , 9]);
                    return [4 /*yield*/, prisma.tenant.findMany({
                            where: {
                                isActive: true,
                                businessName: {
                                    notIn: ['Empresa Demo CRTLPyme', 'CRTLPyme - Plataforma']
                                }
                            },
                            orderBy: { businessName: 'asc' }
                        })];
                case 2:
                    tenants = _k.sent();
                    reportData = [];
                    globalStats = {
                        totalProducts: 0,
                        totalSales: 0,
                        totalRevenue: 0,
                        totalTenants: tenants.length
                    };
                    _i = 0, tenants_1 = tenants;
                    _k.label = 3;
                case 3:
                    if (!(_i < tenants_1.length)) return [3 /*break*/, 7];
                    tenant = tenants_1[_i];
                    return [4 /*yield*/, prisma.tenantInventory.count({
                            where: { tenantId: tenant.id, isActive: true }
                        })
                        // Obtener ventas
                    ];
                case 4:
                    productsCount = _k.sent();
                    return [4 /*yield*/, prisma.sale.findMany({
                            where: { tenantId: tenant.id },
                            select: {
                                id: true,
                                total: true,
                                status: true,
                                createdAt: true,
                                items: {
                                    select: {
                                        quantity: true,
                                        unitPrice: true,
                                        tenantInventory: {
                                            select: {
                                                masterProduct: {
                                                    select: {
                                                        name: true,
                                                        category: true
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        })];
                case 5:
                    sales = _k.sent();
                    salesCount = sales.length;
                    completedSales = sales.filter(function (s) { return s.status === 'COMPLETED'; });
                    revenue = completedSales.reduce(function (sum, s) { return sum + Number(s.total); }, 0);
                    productSales = {};
                    for (_a = 0, completedSales_1 = completedSales; _a < completedSales_1.length; _a++) {
                        sale = completedSales_1[_a];
                        for (_b = 0, _c = sale.items; _b < _c.length; _b++) {
                            item = _c[_b];
                            productName = item.tenantInventory.masterProduct.name;
                            if (!productSales[productName]) {
                                productSales[productName] = { name: productName, quantity: 0, revenue: 0 };
                            }
                            productSales[productName].quantity += item.quantity;
                            productSales[productName].revenue += item.quantity * Number(item.unitPrice);
                        }
                    }
                    topProducts = Object.values(productSales)
                        .sort(function (a, b) { return b.quantity - a.quantity; })
                        .slice(0, 5);
                    salesByMonth = {};
                    for (_d = 0, completedSales_2 = completedSales; _d < completedSales_2.length; _d++) {
                        sale = completedSales_2[_d];
                        month = sale.createdAt.toISOString().substring(0, 7) // YYYY-MM
                        ;
                        if (!salesByMonth[month])
                            salesByMonth[month] = 0;
                        salesByMonth[month]++;
                    }
                    reportData.push({
                        name: tenant.businessName,
                        rut: tenant.rut,
                        email: tenant.email,
                        plan: tenant.planType,
                        productsCount: productsCount,
                        salesCount: salesCount,
                        completedSalesCount: completedSales.length,
                        revenue: revenue,
                        topProducts: topProducts,
                        salesByMonth: salesByMonth
                    });
                    globalStats.totalProducts += productsCount;
                    globalStats.totalSales += salesCount;
                    globalStats.totalRevenue += revenue;
                    _k.label = 6;
                case 6:
                    _i++;
                    return [3 /*break*/, 3];
                case 7:
                    markdown = "# \uD83D\uDCCA REPORTE DE POBLACI\u00D3N DE DATOS - CRTLPyme\n\n";
                    markdown += "**Fecha de generaci\u00F3n:** ".concat(new Date().toLocaleString('es-CL', { timeZone: 'America/Santiago' }), "\n\n");
                    markdown += "---\n\n";
                    markdown += "## \uD83C\uDFAF RESUMEN EJECUTIVO\n\n";
                    markdown += "- **Tenants procesados:** ".concat(globalStats.totalTenants, "\n");
                    markdown += "- **Total de productos creados:** ".concat(globalStats.totalProducts, "\n");
                    markdown += "- **Total de ventas registradas:** ".concat(globalStats.totalSales, "\n");
                    markdown += "- **Ingresos totales:** CLP $".concat(globalStats.totalRevenue.toLocaleString('es-CL'), "\n\n");
                    markdown += "---\n\n";
                    markdown += "## \uD83D\uDCCB DETALLE POR TENANT\n\n";
                    for (i = 0; i < reportData.length; i++) {
                        data = reportData[i];
                        markdown += "### ".concat(i + 1, ". ").concat(data.name, "\n\n");
                        markdown += "**Informaci\u00F3n General:**\n";
                        markdown += "- RUT: ".concat(data.rut, "\n");
                        markdown += "- Email: ".concat(data.email, "\n");
                        markdown += "- Plan: ".concat(data.plan, "\n\n");
                        markdown += "**Estad\u00EDsticas:**\n";
                        markdown += "- Productos en inventario: ".concat(data.productsCount, "\n");
                        markdown += "- Ventas totales: ".concat(data.salesCount, "\n");
                        markdown += "- Ventas completadas: ".concat(data.completedSalesCount, "\n");
                        markdown += "- Ingresos generados: CLP $".concat(data.revenue.toLocaleString('es-CL'), "\n\n");
                        if (data.topProducts.length > 0) {
                            markdown += "**Top 5 Productos M\u00E1s Vendidos:**\n\n";
                            markdown += "| Producto | Unidades | Ingresos |\n";
                            markdown += "|----------|----------|----------|\n";
                            for (_e = 0, _f = data.topProducts; _e < _f.length; _e++) {
                                product = _f[_e];
                                markdown += "| ".concat(product.name, " | ").concat(product.quantity, " | CLP $").concat(product.revenue.toLocaleString('es-CL'), " |\n");
                            }
                            markdown += "\n";
                        }
                        if (Object.keys(data.salesByMonth).length > 0) {
                            markdown += "**Ventas por Mes:**\n\n";
                            markdown += "| Mes | Ventas |\n";
                            markdown += "|-----|--------|\n";
                            for (_g = 0, _h = Object.entries(data.salesByMonth).sort(); _g < _h.length; _g++) {
                                _j = _h[_g], month = _j[0], count = _j[1];
                                markdown += "| ".concat(month, " | ").concat(count, " |\n");
                            }
                            markdown += "\n";
                        }
                        markdown += "---\n\n";
                    }
                    markdown += "## \u2705 NOTAS FINALES\n\n";
                    markdown += "- Se crearon productos de inventario realistas para todos los tenants de tipo minimarket/almac\u00E9n\n";
                    markdown += "- Los tenants ya ten\u00EDan ventas existentes, por lo que NO se crearon ventas adicionales\n";
                    markdown += "- Todos los productos fueron agregados al cat\u00E1logo maestro (master_products) y al inventario de cada tenant (tenant_inventory)\n";
                    markdown += "- Stock inicial establecido con valores realistas para negocio tipo minimarket\n";
                    markdown += "- Backup de la base de datos creado en: /home/ubuntu/backups/\n\n";
                    return [2 /*return*/, markdown];
                case 8:
                    error_1 = _k.sent();
                    console.error('❌ Error:', error_1);
                    throw error_1;
                case 9: return [2 /*return*/];
            }
        });
    });
}
// Ejecutar
generateReport()
    .then(function (markdown) {
    console.log(markdown);
    // Guardar en archivo
    require('fs').writeFileSync('/home/ubuntu/POBLACION_DATOS_VENTAS_INVENTARIO.md', markdown, 'utf8');
    console.log('\n✅ Reporte guardado en /home/ubuntu/POBLACION_DATOS_VENTAS_INVENTARIO.md');
    process.exit(0);
})
    .catch(function (error) {
    console.error('❌ Error fatal:', error);
    process.exit(1);
})
    .finally(function () { return prisma.$disconnect(); });
