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
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var tenantCount, userCount, productCount, saleCount, users, inventarioUser, products, tenants, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log('🔍 VERIFICANDO ESTADO DE LA BASE DE DATOS PARA DEMOSTRACIÓN\n');
                    console.log('='.repeat(70));
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 11, 12, 14]);
                    // 1. Verificar conexión
                    console.log('\n1️⃣ Verificando conexión a la base de datos...');
                    return [4 /*yield*/, prisma.$connect()];
                case 2:
                    _a.sent();
                    console.log('✅ Conexión exitosa a Supabase');
                    // 2. Contar registros en tablas principales
                    console.log('\n2️⃣ Estado de las tablas principales:');
                    return [4 /*yield*/, prisma.tenant.count()];
                case 3:
                    tenantCount = _a.sent();
                    return [4 /*yield*/, prisma.user.count()];
                case 4:
                    userCount = _a.sent();
                    return [4 /*yield*/, prisma.product.count()];
                case 5:
                    productCount = _a.sent();
                    return [4 /*yield*/, prisma.sale.count()];
                case 6:
                    saleCount = _a.sent();
                    console.log("   \uD83D\uDCCA Tenants: ".concat(tenantCount));
                    console.log("   \uD83D\uDC64 Usuarios: ".concat(userCount));
                    console.log("   \uD83D\uDCE6 Productos: ".concat(productCount));
                    console.log("   \uD83D\uDCB0 Ventas: ".concat(saleCount));
                    // 3. Listar todos los usuarios
                    console.log('\n3️⃣ Usuarios existentes:');
                    return [4 /*yield*/, prisma.user.findMany({
                            select: {
                                id: true,
                                email: true,
                                firstName: true,
                                lastName: true,
                                role: true,
                                isActive: true,
                                tenantId: true,
                            },
                        })];
                case 7:
                    users = _a.sent();
                    if (users.length === 0) {
                        console.log('   ⚠️  No hay usuarios en la base de datos');
                    }
                    else {
                        users.forEach(function (user, idx) {
                            console.log("\n   Usuario ".concat(idx + 1, ":"));
                            console.log("   - Email: ".concat(user.email));
                            console.log("   - Nombre: ".concat(user.firstName, " ").concat(user.lastName));
                            console.log("   - Rol: ".concat(user.role));
                            console.log("   - Activo: ".concat(user.isActive ? 'Sí' : 'No'));
                            console.log("   - TenantID: ".concat(user.tenantId));
                        });
                    }
                    // 4. Verificar usuario "inventario"
                    console.log('\n4️⃣ Verificando usuario "inventario":');
                    return [4 /*yield*/, prisma.user.findFirst({
                            where: {
                                email: 'inventario@crtlpyme.cl',
                            },
                        })];
                case 8:
                    inventarioUser = _a.sent();
                    if (inventarioUser) {
                        console.log('   ✅ Usuario "inventario" encontrado');
                        console.log("   - Email: ".concat(inventarioUser.email));
                        console.log("   - Nombre: ".concat(inventarioUser.firstName, " ").concat(inventarioUser.lastName));
                        console.log("   - Rol: ".concat(inventarioUser.role));
                        console.log("   - Activo: ".concat(inventarioUser.isActive));
                    }
                    else {
                        console.log('   ⚠️  Usuario "inventario" NO encontrado');
                        console.log('   ℹ️  Se debe crear este usuario para la demostración');
                    }
                    // 5. Listar productos
                    console.log('\n5️⃣ Productos en inventario:');
                    return [4 /*yield*/, prisma.product.findMany({
                            take: 10,
                            select: {
                                id: true,
                                sku: true,
                                name: true,
                                category: true,
                                salePrice: true,
                                stock: true,
                                isActive: true,
                            },
                        })];
                case 9:
                    products = _a.sent();
                    if (products.length === 0) {
                        console.log('   ⚠️  No hay productos en el inventario');
                    }
                    else {
                        console.log("   \uD83D\uDCE6 Total de productos (primeros 10): ".concat(products.length));
                        products.forEach(function (product, idx) {
                            console.log("\n   Producto ".concat(idx + 1, ":"));
                            console.log("   - SKU: ".concat(product.sku));
                            console.log("   - Nombre: ".concat(product.name));
                            console.log("   - Categor\u00EDa: ".concat(product.category));
                            console.log("   - Precio: $".concat(product.salePrice));
                            console.log("   - Stock: ".concat(product.stock, " unidades"));
                            console.log("   - Activo: ".concat(product.isActive ? 'Sí' : 'No'));
                        });
                    }
                    // 6. Listar tenants
                    console.log('\n6️⃣ Tenants existentes:');
                    return [4 /*yield*/, prisma.tenant.findMany({
                            select: {
                                id: true,
                                businessName: true,
                                rut: true,
                                email: true,
                                isActive: true,
                                planType: true,
                            },
                        })];
                case 10:
                    tenants = _a.sent();
                    if (tenants.length === 0) {
                        console.log('   ⚠️  No hay tenants en la base de datos');
                    }
                    else {
                        tenants.forEach(function (tenant, idx) {
                            console.log("\n   Tenant ".concat(idx + 1, ":"));
                            console.log("   - ID: ".concat(tenant.id));
                            console.log("   - Empresa: ".concat(tenant.businessName));
                            console.log("   - RUT: ".concat(tenant.rut));
                            console.log("   - Email: ".concat(tenant.email));
                            console.log("   - Plan: ".concat(tenant.planType));
                            console.log("   - Activo: ".concat(tenant.isActive ? 'Sí' : 'No'));
                        });
                    }
                    console.log('\n' + '='.repeat(70));
                    console.log('✅ Verificación completada exitosamente');
                    return [3 /*break*/, 14];
                case 11:
                    error_1 = _a.sent();
                    console.error('\n❌ Error durante la verificación:', error_1);
                    throw error_1;
                case 12: return [4 /*yield*/, prisma.$disconnect()];
                case 13:
                    _a.sent();
                    return [7 /*endfinally*/];
                case 14: return [2 /*return*/];
            }
        });
    });
}
main()
    .catch(function (error) {
    console.error('Error fatal:', error);
    process.exit(1);
});
