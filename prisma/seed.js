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
var bcrypt = require("bcrypt");
var prisma = new client_1.PrismaClient();
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var planBasico, planProfesional, planEnterprise, platformTenant, minimarketElAhorro, ferreteriaConstructomax, adminPassword, proveedorPassword, vendedorPassword, clientePassword, adminUser, proveedorUser, vendedorUser, clienteUser, masterProducts, _i, masterProducts_1, product, existingBySku, existingByBarcode, allMasterProducts, minimarketProducts, _a, minimarketProducts_1, mp, costPrice, salePrice, stock, ferreteriaProducts, _b, ferreteriaProducts_1, mp, costPrice, salePrice, stock, minimarketInventory, i, daysAgo, saleDate, numItems, selectedItems, usedIndices, idx, subtotal, saleNumber, sale, _c, selectedItems_1, item, quantity, unitPrice, itemSubtotal, ferreteriaInventory, ferreteriaCashier, _d, _e, i, daysAgo, saleDate, numItems, selectedItems, usedIndices, idx, subtotal, saleNumber, sale, _f, selectedItems_2, item, quantity, unitPrice, itemSubtotal, i, randomItem, quantity, i, randomItem, quantity;
        var _g, _h;
        return __generator(this, function (_j) {
            switch (_j.label) {
                case 0:
                    console.log('🌱 Starting database seeding...\n');
                    // ============ A. SUBSCRIPTION PLANS ============
                    console.log('📦 Creating Subscription Plans...');
                    return [4 /*yield*/, prisma.subscriptionPlan.findFirst({
                            where: { name: 'Plan Básico' }
                        })];
                case 1:
                    planBasico = _j.sent();
                    if (!!planBasico) return [3 /*break*/, 3];
                    return [4 /*yield*/, prisma.subscriptionPlan.create({
                            data: {
                                name: 'Plan Básico',
                                description: 'Perfecto para emprendedores y pequeños negocios que están comenzando',
                                price: 9990,
                                billingCycle: 'MONTHLY',
                                trialDays: 15,
                                isVisible: true,
                                sortOrder: 1,
                                maxUsers: 2,
                                maxProducts: 500,
                                isActive: true,
                                features: {
                                    features: [
                                        '2 usuarios incluidos',
                                        'Hasta 500 productos',
                                        'Reportes básicos',
                                        'Soporte por email',
                                        'App móvil'
                                    ]
                                }
                            }
                        })];
                case 2:
                    planBasico = _j.sent();
                    _j.label = 3;
                case 3: return [4 /*yield*/, prisma.subscriptionPlan.findFirst({
                        where: { name: 'Plan Profesional' }
                    })];
                case 4:
                    planProfesional = _j.sent();
                    if (!!planProfesional) return [3 /*break*/, 6];
                    return [4 /*yield*/, prisma.subscriptionPlan.create({
                            data: {
                                name: 'Plan Profesional',
                                description: 'Para negocios en crecimiento que necesitan funcionalidades avanzadas',
                                price: 29990,
                                billingCycle: 'MONTHLY',
                                trialDays: 15,
                                isVisible: true,
                                sortOrder: 2,
                                maxUsers: 5,
                                maxProducts: -1,
                                isActive: true,
                                features: {
                                    features: [
                                        '5 usuarios incluidos',
                                        'Productos ilimitados',
                                        'Reportes avanzados',
                                        'Soporte prioritario',
                                        'App móvil',
                                        'Integración con Transbank',
                                        'Gestión de inventario avanzada'
                                    ]
                                }
                            }
                        })];
                case 5:
                    planProfesional = _j.sent();
                    _j.label = 6;
                case 6: return [4 /*yield*/, prisma.subscriptionPlan.findFirst({
                        where: { name: 'Plan Enterprise' }
                    })];
                case 7:
                    planEnterprise = _j.sent();
                    if (!!planEnterprise) return [3 /*break*/, 9];
                    return [4 /*yield*/, prisma.subscriptionPlan.create({
                            data: {
                                name: 'Plan Enterprise',
                                description: 'Solución completa para cadenas y grandes negocios con todo incluido',
                                price: 59990,
                                billingCycle: 'MONTHLY',
                                trialDays: 30,
                                isVisible: true,
                                sortOrder: 3,
                                maxUsers: -1,
                                maxProducts: -1,
                                isActive: true,
                                features: {
                                    features: [
                                        'Usuarios ilimitados',
                                        'Productos ilimitados',
                                        'Reportes personalizados',
                                        'Soporte 24/7 prioritario',
                                        'App móvil',
                                        'Integración con Transbank',
                                        'API personalizada',
                                        'Gestor de cuenta dedicado',
                                        'Capacitación personalizada'
                                    ]
                                }
                            }
                        })];
                case 8:
                    planEnterprise = _j.sent();
                    _j.label = 9;
                case 9:
                    console.log('✅ Subscription plans created\n');
                    // ============ C. TENANTS (Chilean Businesses) ============
                    console.log('🏢 Creating Tenants...');
                    return [4 /*yield*/, prisma.tenant.upsert({
                            where: { rut: '99.999.999-9' },
                            update: {},
                            create: {
                                businessName: 'CRTLPyme - Plataforma',
                                rut: '99.999.999-9',
                                email: 'plataforma@crtlpyme.cl',
                                phone: '+56 9 8765 4321',
                                address: 'Av. Providencia 1234, Santiago',
                                isActive: true,
                                planType: 'ENTERPRISE',
                                accountStatus: 'ACTIVE',
                                onboardingCompleted: true
                            }
                        })];
                case 10:
                    platformTenant = _j.sent();
                    return [4 /*yield*/, prisma.tenant.upsert({
                            where: { rut: '76.123.456-7' },
                            update: {},
                            create: {
                                businessName: 'Minimarket El Ahorro',
                                rut: '76.123.456-7',
                                email: 'contacto@elahorro.cl',
                                phone: '+56 2 2345 6789',
                                address: 'Calle Las Rosas 456, Santiago',
                                isActive: true,
                                planType: 'PRO',
                                accountStatus: 'ACTIVE',
                                onboardingCompleted: true,
                                maxCashiers: 5,
                                trialStartedAt: new Date('2024-10-01'),
                                lastActivityAt: new Date()
                            }
                        })];
                case 11:
                    minimarketElAhorro = _j.sent();
                    return [4 /*yield*/, prisma.tenant.upsert({
                            where: { rut: '76.234.567-8' },
                            update: {},
                            create: {
                                businessName: 'Ferretería Construmax',
                                rut: '76.234.567-8',
                                email: 'ventas@construmax.cl',
                                phone: '+56 2 3456 7890',
                                address: 'Av. Los Carrera 789, Puente Alto',
                                isActive: true,
                                planType: 'BASIC',
                                accountStatus: 'ACTIVE',
                                onboardingCompleted: true,
                                maxCashiers: 2,
                                trialStartedAt: new Date('2024-09-15'),
                                lastActivityAt: new Date()
                            }
                        })];
                case 12:
                    ferreteriaConstructomax = _j.sent();
                    console.log('✅ Tenants created\n');
                    // Create subscriptions for tenants
                    console.log('📝 Creating Subscriptions...');
                    return [4 /*yield*/, prisma.subscription.upsert({
                            where: {
                                id: "sub-".concat(minimarketElAhorro.id)
                            },
                            update: {},
                            create: {
                                id: "sub-".concat(minimarketElAhorro.id),
                                tenantId: minimarketElAhorro.id,
                                planId: planProfesional.id,
                                status: 'ACTIVE',
                                startDate: new Date('2024-10-01'),
                                nextBillingDate: new Date('2025-12-01'),
                                autoRenew: true,
                                billingCycle: 'MONTHLY'
                            }
                        })];
                case 13:
                    _j.sent();
                    return [4 /*yield*/, prisma.subscription.upsert({
                            where: {
                                id: "sub-".concat(ferreteriaConstructomax.id)
                            },
                            update: {},
                            create: {
                                id: "sub-".concat(ferreteriaConstructomax.id),
                                tenantId: ferreteriaConstructomax.id,
                                planId: planBasico.id,
                                status: 'ACTIVE',
                                startDate: new Date('2024-09-15'),
                                nextBillingDate: new Date('2025-12-15'),
                                autoRenew: true,
                                billingCycle: 'MONTHLY'
                            }
                        })];
                case 14:
                    _j.sent();
                    console.log('✅ Subscriptions created\n');
                    // ============ B. TEST USERS WITH BCRYPT PASSWORDS ============
                    console.log('👥 Creating Test Users with bcrypt passwords...');
                    return [4 /*yield*/, bcrypt.hash('Admin2025!', 10)];
                case 15:
                    adminPassword = _j.sent();
                    return [4 /*yield*/, bcrypt.hash('Proveedor2025!', 10)];
                case 16:
                    proveedorPassword = _j.sent();
                    return [4 /*yield*/, bcrypt.hash('Vendedor2025!', 10)];
                case 17:
                    vendedorPassword = _j.sent();
                    return [4 /*yield*/, bcrypt.hash('Cliente2025!', 10)];
                case 18:
                    clientePassword = _j.sent();
                    // Delete existing users if they exist to recreate them
                    return [4 /*yield*/, prisma.user.deleteMany({
                            where: {
                                email: {
                                    in: ['admin@crtlpyme.cl', 'proveedor@crtlpyme.cl', 'vendedor@crtlpyme.cl', 'cliente@crtlpyme.cl']
                                }
                            }
                        })];
                case 19:
                    // Delete existing users if they exist to recreate them
                    _j.sent();
                    return [4 /*yield*/, prisma.user.create({
                            data: {
                                email: 'admin@crtlpyme.cl',
                                password: adminPassword,
                                firstName: 'Administrador',
                                lastName: 'Sistema',
                                role: 'ADMIN',
                                isActive: true,
                                tenantId: platformTenant.id
                            }
                        })];
                case 20:
                    adminUser = _j.sent();
                    return [4 /*yield*/, prisma.user.create({
                            data: {
                                email: 'proveedor@crtlpyme.cl',
                                password: proveedorPassword,
                                firstName: 'Proveedor',
                                lastName: 'Maestro',
                                role: 'PROVEEDOR',
                                isActive: true,
                                tenantId: platformTenant.id
                            }
                        })];
                case 21:
                    proveedorUser = _j.sent();
                    return [4 /*yield*/, prisma.user.create({
                            data: {
                                email: 'vendedor@crtlpyme.cl',
                                password: vendedorPassword,
                                firstName: 'Juan',
                                lastName: 'Pérez',
                                role: 'CAJA',
                                isActive: true,
                                tenantId: minimarketElAhorro.id
                            }
                        })];
                case 22:
                    vendedorUser = _j.sent();
                    return [4 /*yield*/, prisma.user.create({
                            data: {
                                email: 'cliente@crtlpyme.cl',
                                password: clientePassword,
                                firstName: 'María',
                                lastName: 'González',
                                role: 'ADMIN',
                                isActive: true,
                                tenantId: minimarketElAhorro.id
                            }
                        })];
                case 23:
                    clienteUser = _j.sent();
                    console.log('✅ Test users created with bcrypt passwords\n');
                    // ============ D. MASTER PRODUCTS (50 Chilean Products) ============
                    console.log('📦 Creating Master Products (Chilean products with EAN codes)...');
                    masterProducts = [
                        // Bebidas
                        { sku: 'CC-350-001', barcode: '7804650000014', name: 'Coca-Cola 350ml', category: 'Bebidas', brand: 'Coca-Cola', suggestedPrice: 1200 },
                        { sku: 'CC-500-001', barcode: '7804650000021', name: 'Coca-Cola 500ml', category: 'Bebidas', brand: 'Coca-Cola', suggestedPrice: 1500 },
                        { sku: 'SP-350-001', barcode: '7804650000038', name: 'Sprite 350ml', category: 'Bebidas', brand: 'Coca-Cola', suggestedPrice: 1100 },
                        { sku: 'FA-500-001', barcode: '7804650000045', name: 'Fanta 500ml', category: 'Bebidas', brand: 'Coca-Cola', suggestedPrice: 1300 },
                        { sku: 'PE-350-001', barcode: '7790310055014', name: 'Pepsi 350ml', category: 'Bebidas', brand: 'Pepsi', suggestedPrice: 1100 },
                        { sku: 'BI-500-001', barcode: '7802400000011', name: 'Bilz 500ml', category: 'Bebidas', brand: 'Bilz & Pap', suggestedPrice: 1200 },
                        { sku: 'PA-500-001', barcode: '7802400000028', name: 'Pap 500ml', category: 'Bebidas', brand: 'Bilz & Pap', suggestedPrice: 1200 },
                        // Lácteos
                        { sku: 'LE-1L-001', barcode: '7802900000014', name: 'Leche Soprole 1L', category: 'Lácteos', brand: 'Soprole', suggestedPrice: 1200 },
                        { sku: 'YO-125-001', barcode: '7802900100015', name: 'Yogurt Soprole Natural 125g', category: 'Lácteos', brand: 'Soprole', suggestedPrice: 450 },
                        { sku: 'YO-125-002', barcode: '7802900100022', name: 'Yogurt Soprole Frutilla 125g', category: 'Lácteos', brand: 'Soprole', suggestedPrice: 500 },
                        { sku: 'QU-250-001', barcode: '7802900200016', name: 'Queso Colun 250g', category: 'Lácteos', brand: 'Colun', suggestedPrice: 2500 },
                        { sku: 'MA-250-001', barcode: '7802900300017', name: 'Mantequilla Colun 250g', category: 'Lácteos', brand: 'Colun', suggestedPrice: 2200 },
                        // Snacks
                        { sku: 'PA-150-001', barcode: '7802100000012', name: 'Papas Lays Original 150g', category: 'Snacks', brand: 'Lays', suggestedPrice: 1800 },
                        { sku: 'PA-150-002', barcode: '7802100000029', name: 'Papas Lays Queso 150g', category: 'Snacks', brand: 'Lays', suggestedPrice: 1800 },
                        { sku: 'DO-100-001', barcode: '7802100100013', name: 'Doritos Nacho 100g', category: 'Snacks', brand: 'Doritos', suggestedPrice: 1500 },
                        { sku: 'CH-45-001', barcode: '7802100200014', name: 'Cheetos 45g', category: 'Snacks', brand: 'Cheetos', suggestedPrice: 800 },
                        { sku: 'SU-50-001', barcode: '7802200000015', name: 'Súper 8 Chocolate 50g', category: 'Snacks', brand: 'Costa', suggestedPrice: 600 },
                        // Galletas y Dulces
                        { sku: 'GA-180-001', barcode: '7802300000016', name: 'Galletas McKay Chocolate 180g', category: 'Galletas', brand: 'McKay', suggestedPrice: 1200 },
                        { sku: 'GA-180-002', barcode: '7802300000023', name: 'Galletas Tritón 180g', category: 'Galletas', brand: 'Tritón', suggestedPrice: 1100 },
                        { sku: 'CH-30-001', barcode: '7802400100012', name: 'Chocolate Sahne-Nuss 30g', category: 'Dulces', brand: 'Costa', suggestedPrice: 500 },
                        { sku: 'CH-100-001', barcode: '7613034000011', name: 'Chocolate Nestlé 100g', category: 'Dulces', brand: 'Nestlé', suggestedPrice: 1500 },
                        // Despensa
                        { sku: 'AR-1K-001', barcode: '7802500000017', name: 'Arroz Tucapel 1kg', category: 'Despensa', brand: 'Tucapel', suggestedPrice: 1200 },
                        { sku: 'FI-400-001', barcode: '7802600000018', name: 'Fideos Carozzi 400g', category: 'Despensa', brand: 'Carozzi', suggestedPrice: 800 },
                        { sku: 'AC-500-001', barcode: '7802700000019', name: 'Aceite Chef 500ml', category: 'Despensa', brand: 'Chef', suggestedPrice: 2200 },
                        { sku: 'AZ-1K-001', barcode: '7802800000010', name: 'Azúcar Iansa 1kg', category: 'Despensa', brand: 'Iansa', suggestedPrice: 1100 },
                        { sku: 'SA-1K-001', barcode: '7802900000011', name: 'Sal Lobos 1kg', category: 'Despensa', brand: 'Lobos', suggestedPrice: 600 },
                        { sku: 'HA-1K-001', barcode: '7803000000012', name: 'Harina Selecta 1kg', category: 'Despensa', brand: 'Selecta', suggestedPrice: 1000 },
                        // Aseo
                        { sku: 'JA-500-001', barcode: '7803100000013', name: 'Jabón Líquido Popeye 500ml', category: 'Aseo', brand: 'Popeye', suggestedPrice: 1500 },
                        { sku: 'DE-500-001', barcode: '7803200000014', name: 'Detergente Drive 500g', category: 'Aseo', brand: 'Drive', suggestedPrice: 2200 },
                        { sku: 'CL-1L-001', barcode: '7803300000015', name: 'Cloro Poett 1L', category: 'Aseo', brand: 'Poett', suggestedPrice: 1800 },
                        { sku: 'PA-10-001', barcode: '7803400000016', name: 'Papel Higiénico Elite x10', category: 'Aseo', brand: 'Elite', suggestedPrice: 4500 },
                        // Ferretería - Herramientas
                        { sku: 'MA-500-001', barcode: '7703000000017', name: 'Martillo 500g', category: 'Herramientas', brand: 'Toolcraft', suggestedPrice: 8900 },
                        { sku: 'DE-PL-001', barcode: '7703000000024', name: 'Destornillador Plano', category: 'Herramientas', brand: 'Stanley', suggestedPrice: 3500 },
                        { sku: 'DE-ES-001', barcode: '7703000000031', name: 'Destornillador Estrella', category: 'Herramientas', brand: 'Stanley', suggestedPrice: 3500 },
                        { sku: 'AL-5M-001', barcode: '7703000000048', name: 'Alicate Universal 5"', category: 'Herramientas', brand: 'Toolcraft', suggestedPrice: 5900 },
                        { sku: 'LL-ING-001', barcode: '7703000000055', name: 'Llave Inglesa 10"', category: 'Herramientas', brand: 'Toolcraft', suggestedPrice: 7500 },
                        { sku: 'SE-350-001', barcode: '7703000000062', name: 'Serrucho 350mm', category: 'Herramientas', brand: 'Bellota', suggestedPrice: 12000 },
                        // Ferretería - Materiales
                        { sku: 'TO-1K-001', barcode: '7703100000018', name: 'Tornillos 1" x100', category: 'Materiales', brand: 'Genérico', suggestedPrice: 2500 },
                        { sku: 'CL-1K-001', barcode: '7703100000025', name: 'Clavos 1" x100', category: 'Materiales', brand: 'Genérico', suggestedPrice: 1800 },
                        { sku: 'PE-500-001', barcode: '7703100000032', name: 'Pegamento Universal 500ml', category: 'Materiales', brand: 'Agorex', suggestedPrice: 3200 },
                        { sku: 'CI-24-001', barcode: '7703100000049', name: 'Cinta Aislante 24mm', category: 'Materiales', brand: '3M', suggestedPrice: 1500 },
                        { sku: 'SI-300-001', barcode: '7703100000056', name: 'Silicona 300ml', category: 'Materiales', brand: 'Sikaflex', suggestedPrice: 4500 },
                        { sku: 'LI-120-001', barcode: '7703100000063', name: 'Lija Grano 120', category: 'Materiales', brand: 'Norton', suggestedPrice: 800 },
                        // Ferretería - Eléctricos
                        { sku: 'FO-LED-001', barcode: '7703200000019', name: 'Foco LED 9W', category: 'Eléctricos', brand: 'Philips', suggestedPrice: 3500 },
                        { sku: 'EN-3P-001', barcode: '7703200000026', name: 'Enchufe 3 Patas', category: 'Eléctricos', brand: 'Bticino', suggestedPrice: 1200 },
                        { sku: 'CA-5M-001', barcode: '7703200000033', name: 'Cable Eléctrico 2x1.5 5m', category: 'Eléctricos', brand: 'Procobre', suggestedPrice: 8500 },
                        { sku: 'IN-001', barcode: '7703200000040', name: 'Interruptor Simple', category: 'Eléctricos', brand: 'Bticino', suggestedPrice: 1800 },
                        { sku: 'PI-9V-001', barcode: '7703200000057', name: 'Pilas 9V Duracell', category: 'Eléctricos', brand: 'Duracell', suggestedPrice: 3200 },
                        { sku: 'PI-AA-001', barcode: '7703200000064', name: 'Pilas AA x4 Energizer', category: 'Eléctricos', brand: 'Energizer', suggestedPrice: 4500 },
                        { sku: 'LI-5M-001', barcode: '7703200000071', name: 'Linterna LED 5W', category: 'Eléctricos', brand: 'Genérico', suggestedPrice: 5900 },
                    ];
                    _i = 0, masterProducts_1 = masterProducts;
                    _j.label = 24;
                case 24:
                    if (!(_i < masterProducts_1.length)) return [3 /*break*/, 29];
                    product = masterProducts_1[_i];
                    return [4 /*yield*/, prisma.masterProduct.findUnique({
                            where: { sku: product.sku }
                        })];
                case 25:
                    existingBySku = _j.sent();
                    return [4 /*yield*/, prisma.masterProduct.findUnique({
                            where: { barcode: product.barcode }
                        })];
                case 26:
                    existingByBarcode = _j.sent();
                    if (!(!existingBySku && !existingByBarcode)) return [3 /*break*/, 28];
                    return [4 /*yield*/, prisma.masterProduct.create({
                            data: {
                                sku: product.sku,
                                barcode: product.barcode,
                                name: product.name,
                                category: product.category,
                                brand: product.brand,
                                suggestedPrice: product.suggestedPrice,
                                unit: 'unidad',
                                isActive: true
                            }
                        })];
                case 27:
                    _j.sent();
                    _j.label = 28;
                case 28:
                    _i++;
                    return [3 /*break*/, 24];
                case 29:
                    console.log('✅ 50 Master products created\n');
                    // ============ E. TENANT INVENTORY ============
                    console.log('📦 Creating Tenant Inventory...');
                    return [4 /*yield*/, prisma.masterProduct.findMany({
                            take: 50
                        })];
                case 30:
                    allMasterProducts = _j.sent();
                    minimarketProducts = allMasterProducts.slice(0, 30);
                    _a = 0, minimarketProducts_1 = minimarketProducts;
                    _j.label = 31;
                case 31:
                    if (!(_a < minimarketProducts_1.length)) return [3 /*break*/, 34];
                    mp = minimarketProducts_1[_a];
                    costPrice = Number(mp.suggestedPrice) * 0.7;
                    salePrice = Number(mp.suggestedPrice);
                    stock = Math.floor(Math.random() * 90) + 10;
                    return [4 /*yield*/, prisma.tenantInventory.upsert({
                            where: {
                                tenantId_masterProductId: {
                                    tenantId: minimarketElAhorro.id,
                                    masterProductId: mp.id
                                }
                            },
                            update: {},
                            create: {
                                tenantId: minimarketElAhorro.id,
                                masterProductId: mp.id,
                                costPrice: costPrice,
                                salePrice: salePrice,
                                stock: stock,
                                minStock: 5,
                                isActive: true
                            }
                        })];
                case 32:
                    _j.sent();
                    _j.label = 33;
                case 33:
                    _a++;
                    return [3 /*break*/, 31];
                case 34:
                    ferreteriaProducts = allMasterProducts.slice(25, 50);
                    _b = 0, ferreteriaProducts_1 = ferreteriaProducts;
                    _j.label = 35;
                case 35:
                    if (!(_b < ferreteriaProducts_1.length)) return [3 /*break*/, 38];
                    mp = ferreteriaProducts_1[_b];
                    costPrice = Number(mp.suggestedPrice) * 0.65;
                    salePrice = Number(mp.suggestedPrice);
                    stock = Math.floor(Math.random() * 40) + 10;
                    return [4 /*yield*/, prisma.tenantInventory.upsert({
                            where: {
                                tenantId_masterProductId: {
                                    tenantId: ferreteriaConstructomax.id,
                                    masterProductId: mp.id
                                }
                            },
                            update: {},
                            create: {
                                tenantId: ferreteriaConstructomax.id,
                                masterProductId: mp.id,
                                costPrice: costPrice,
                                salePrice: salePrice,
                                stock: stock,
                                minStock: 5,
                                isActive: true
                            }
                        })];
                case 36:
                    _j.sent();
                    _j.label = 37;
                case 37:
                    _b++;
                    return [3 /*break*/, 35];
                case 38:
                    console.log('✅ Tenant inventory created\n');
                    // ============ F. SAMPLE SALES ============
                    console.log('💰 Creating Sample Sales...');
                    return [4 /*yield*/, prisma.tenantInventory.findMany({
                            where: { tenantId: minimarketElAhorro.id },
                            include: { masterProduct: true }
                        })];
                case 39:
                    minimarketInventory = _j.sent();
                    i = 1;
                    _j.label = 40;
                case 40:
                    if (!(i <= 12)) return [3 /*break*/, 50];
                    daysAgo = Math.floor(Math.random() * 7);
                    saleDate = new Date();
                    saleDate.setDate(saleDate.getDate() - daysAgo);
                    numItems = Math.floor(Math.random() * 4) + 2;
                    selectedItems = [];
                    usedIndices = new Set();
                    while (selectedItems.length < numItems) {
                        idx = Math.floor(Math.random() * minimarketInventory.length);
                        if (!usedIndices.has(idx)) {
                            usedIndices.add(idx);
                            selectedItems.push(minimarketInventory[idx]);
                        }
                    }
                    subtotal = 0;
                    saleNumber = "MKT-".concat(Date.now(), "-").concat(i);
                    return [4 /*yield*/, prisma.sale.create({
                            data: {
                                saleNumber: saleNumber,
                                subtotal: 0,
                                tax: 0,
                                total: 0,
                                paymentMethod: ['CASH', 'DEBIT', 'CREDIT'][Math.floor(Math.random() * 3)],
                                status: 'COMPLETED',
                                userId: vendedorUser.id,
                                tenantId: minimarketElAhorro.id,
                                createdAt: saleDate
                            }
                        })];
                case 41:
                    sale = _j.sent();
                    _c = 0, selectedItems_1 = selectedItems;
                    _j.label = 42;
                case 42:
                    if (!(_c < selectedItems_1.length)) return [3 /*break*/, 47];
                    item = selectedItems_1[_c];
                    quantity = Math.floor(Math.random() * 3) + 1;
                    unitPrice = Number(item.salePrice);
                    itemSubtotal = unitPrice * quantity;
                    subtotal += itemSubtotal;
                    return [4 /*yield*/, prisma.saleItem.create({
                            data: {
                                quantity: quantity,
                                unitPrice: unitPrice,
                                unitCost: Number(item.costPrice),
                                subtotal: itemSubtotal,
                                saleId: sale.id,
                                tenantInventoryId: item.id,
                                tenantId: minimarketElAhorro.id
                            }
                        })];
                case 43:
                    _j.sent();
                    // Update stock
                    return [4 /*yield*/, prisma.tenantInventory.update({
                            where: { id: item.id },
                            data: { stock: { decrement: quantity } }
                        })];
                case 44:
                    // Update stock
                    _j.sent();
                    // Create inventory movement
                    return [4 /*yield*/, prisma.inventoryMovement.create({
                            data: {
                                tenantInventoryId: item.id,
                                type: 'EXIT',
                                quantity: -quantity,
                                reason: "Venta ".concat(saleNumber),
                                createdBy: vendedorUser.id,
                                tenantId: minimarketElAhorro.id,
                                createdAt: saleDate
                            }
                        })];
                case 45:
                    // Create inventory movement
                    _j.sent();
                    _j.label = 46;
                case 46:
                    _c++;
                    return [3 /*break*/, 42];
                case 47: 
                // Update sale totals
                return [4 /*yield*/, prisma.sale.update({
                        where: { id: sale.id },
                        data: {
                            subtotal: subtotal,
                            total: subtotal
                        }
                    })];
                case 48:
                    // Update sale totals
                    _j.sent();
                    _j.label = 49;
                case 49:
                    i++;
                    return [3 /*break*/, 40];
                case 50: return [4 /*yield*/, prisma.tenantInventory.findMany({
                        where: { tenantId: ferreteriaConstructomax.id },
                        include: { masterProduct: true }
                    })];
                case 51:
                    ferreteriaInventory = _j.sent();
                    _e = (_d = prisma.user).create;
                    _g = {};
                    _h = {
                        email: 'cajero@construmax.cl'
                    };
                    return [4 /*yield*/, bcrypt.hash('Demo2025!', 10)];
                case 52: return [4 /*yield*/, _e.apply(_d, [(_g.data = (_h.password = _j.sent(),
                            _h.firstName = 'Pedro',
                            _h.lastName = 'Sánchez',
                            _h.role = 'CAJA',
                            _h.isActive = true,
                            _h.tenantId = ferreteriaConstructomax.id,
                            _h),
                            _g)])];
                case 53:
                    ferreteriaCashier = _j.sent();
                    i = 1;
                    _j.label = 54;
                case 54:
                    if (!(i <= 10)) return [3 /*break*/, 64];
                    daysAgo = Math.floor(Math.random() * 7);
                    saleDate = new Date();
                    saleDate.setDate(saleDate.getDate() - daysAgo);
                    numItems = Math.floor(Math.random() * 3) + 1;
                    selectedItems = [];
                    usedIndices = new Set();
                    while (selectedItems.length < numItems) {
                        idx = Math.floor(Math.random() * ferreteriaInventory.length);
                        if (!usedIndices.has(idx)) {
                            usedIndices.add(idx);
                            selectedItems.push(ferreteriaInventory[idx]);
                        }
                    }
                    subtotal = 0;
                    saleNumber = "FER-".concat(Date.now(), "-").concat(i);
                    return [4 /*yield*/, prisma.sale.create({
                            data: {
                                saleNumber: saleNumber,
                                subtotal: 0,
                                tax: 0,
                                total: 0,
                                paymentMethod: ['CASH', 'DEBIT', 'CREDIT'][Math.floor(Math.random() * 3)],
                                status: 'COMPLETED',
                                userId: ferreteriaCashier.id,
                                tenantId: ferreteriaConstructomax.id,
                                createdAt: saleDate
                            }
                        })];
                case 55:
                    sale = _j.sent();
                    _f = 0, selectedItems_2 = selectedItems;
                    _j.label = 56;
                case 56:
                    if (!(_f < selectedItems_2.length)) return [3 /*break*/, 61];
                    item = selectedItems_2[_f];
                    quantity = Math.floor(Math.random() * 2) + 1;
                    unitPrice = Number(item.salePrice);
                    itemSubtotal = unitPrice * quantity;
                    subtotal += itemSubtotal;
                    return [4 /*yield*/, prisma.saleItem.create({
                            data: {
                                quantity: quantity,
                                unitPrice: unitPrice,
                                unitCost: Number(item.costPrice),
                                subtotal: itemSubtotal,
                                saleId: sale.id,
                                tenantInventoryId: item.id,
                                tenantId: ferreteriaConstructomax.id
                            }
                        })];
                case 57:
                    _j.sent();
                    return [4 /*yield*/, prisma.tenantInventory.update({
                            where: { id: item.id },
                            data: { stock: { decrement: quantity } }
                        })];
                case 58:
                    _j.sent();
                    return [4 /*yield*/, prisma.inventoryMovement.create({
                            data: {
                                tenantInventoryId: item.id,
                                type: 'EXIT',
                                quantity: -quantity,
                                reason: "Venta ".concat(saleNumber),
                                createdBy: ferreteriaCashier.id,
                                tenantId: ferreteriaConstructomax.id,
                                createdAt: saleDate
                            }
                        })];
                case 59:
                    _j.sent();
                    _j.label = 60;
                case 60:
                    _f++;
                    return [3 /*break*/, 56];
                case 61: return [4 /*yield*/, prisma.sale.update({
                        where: { id: sale.id },
                        data: {
                            subtotal: subtotal,
                            total: subtotal
                        }
                    })];
                case 62:
                    _j.sent();
                    _j.label = 63;
                case 63:
                    i++;
                    return [3 /*break*/, 54];
                case 64:
                    console.log('✅ Sample sales created\n');
                    // ============ G. INVENTORY MOVEMENTS (Additional Entries) ============
                    console.log('📦 Creating Additional Inventory Movements...');
                    i = 0;
                    _j.label = 65;
                case 65:
                    if (!(i < 5)) return [3 /*break*/, 69];
                    randomItem = minimarketInventory[Math.floor(Math.random() * minimarketInventory.length)];
                    quantity = Math.floor(Math.random() * 50) + 20;
                    return [4 /*yield*/, prisma.inventoryMovement.create({
                            data: {
                                tenantInventoryId: randomItem.id,
                                type: 'ENTRY',
                                quantity: quantity,
                                reason: 'Compra de mercadería',
                                notes: 'Reposición de stock',
                                createdBy: clienteUser.id,
                                tenantId: minimarketElAhorro.id,
                                createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000)
                            }
                        })];
                case 66:
                    _j.sent();
                    return [4 /*yield*/, prisma.tenantInventory.update({
                            where: { id: randomItem.id },
                            data: { stock: { increment: quantity } }
                        })];
                case 67:
                    _j.sent();
                    _j.label = 68;
                case 68:
                    i++;
                    return [3 /*break*/, 65];
                case 69:
                    i = 0;
                    _j.label = 70;
                case 70:
                    if (!(i < 5)) return [3 /*break*/, 74];
                    randomItem = ferreteriaInventory[Math.floor(Math.random() * ferreteriaInventory.length)];
                    quantity = Math.floor(Math.random() * 30) + 10;
                    return [4 /*yield*/, prisma.inventoryMovement.create({
                            data: {
                                tenantInventoryId: randomItem.id,
                                type: 'ENTRY',
                                quantity: quantity,
                                reason: 'Compra a proveedor',
                                notes: 'Reposición de stock',
                                createdBy: ferreteriaCashier.id,
                                tenantId: ferreteriaConstructomax.id,
                                createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000)
                            }
                        })];
                case 71:
                    _j.sent();
                    return [4 /*yield*/, prisma.tenantInventory.update({
                            where: { id: randomItem.id },
                            data: { stock: { increment: quantity } }
                        })];
                case 72:
                    _j.sent();
                    _j.label = 73;
                case 73:
                    i++;
                    return [3 /*break*/, 70];
                case 74:
                    console.log('✅ Additional inventory movements created\n');
                    console.log('🎉 Database seeding completed successfully!\n');
                    console.log('═══════════════════════════════════════════════════');
                    console.log('📋 TEST USER CREDENTIALS:');
                    console.log('═══════════════════════════════════════════════════');
                    console.log('1. admin@crtlpyme.cl / Admin2025! (ADMIN - Platform)');
                    console.log('2. proveedor@crtlpyme.cl / Proveedor2025! (PROVEEDOR - Platform)');
                    console.log('3. vendedor@crtlpyme.cl / Vendedor2025! (CAJA - Minimarket El Ahorro)');
                    console.log('4. cliente@crtlpyme.cl / Cliente2025! (ADMIN - Minimarket El Ahorro)');
                    console.log('═══════════════════════════════════════════════════\n');
                    return [2 /*return*/];
            }
        });
    });
}
main()
    .catch(function (e) {
    console.error('❌ Error during seeding:', e);
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
