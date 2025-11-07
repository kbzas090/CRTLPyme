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
var pg_1 = require("pg");
var fs = require("fs");
var path = require("path");
function applyMigration() {
    return __awaiter(this, void 0, void 0, function () {
        var DATABASE_URL, pool, client, checkTables, existingTables, countResult, continueAnyway, migrationPath, migrationSQL, error_1, masterProductsCount, tenantInventoryCount, productsLegacyCount, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    DATABASE_URL = process.env.DATABASE_URL ||
                        'postgresql://postgres:CRTLPyme2025!@136.116.45.158:5432/crtlpyme';
                    pool = new pg_1.Pool({
                        connectionString: DATABASE_URL,
                        ssl: {
                            rejectUnauthorized: false // Supabase requiere SSL
                        }
                    });
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 17, 18, 20]);
                    console.log('📡 Conectando a la base de datos...');
                    return [4 /*yield*/, pool.connect()];
                case 2:
                    client = _a.sent();
                    console.log('✅ Conexión establecida\n');
                    // Verificar si las tablas ya existen
                    console.log('🔍 Verificando estado actual de la base de datos...');
                    return [4 /*yield*/, client.query("\n      SELECT table_name \n      FROM information_schema.tables \n      WHERE table_schema = 'public' \n      AND table_name IN ('master_products', 'tenant_inventory', 'products_legacy', 'products');\n    ")];
                case 3:
                    checkTables = _a.sent();
                    existingTables = checkTables.rows.map(function (r) { return r.table_name; });
                    console.log('Tablas existentes:', existingTables);
                    if (!existingTables.includes('master_products')) return [3 /*break*/, 6];
                    console.log('\n⚠️  Las tablas master_products y tenant_inventory ya existen.');
                    console.log('La migración podría ya haber sido aplicada.\n');
                    return [4 /*yield*/, client.query('SELECT COUNT(*) FROM master_products')];
                case 4:
                    countResult = _a.sent();
                    console.log("\uD83D\uDCCA Productos maestros en base de datos: ".concat(countResult.rows[0].count, "\n"));
                    continueAnyway = process.argv.includes('--force');
                    if (!!continueAnyway) return [3 /*break*/, 6];
                    console.log('❌ Abortando. Usa --force para ejecutar de todos modos.');
                    client.release();
                    return [4 /*yield*/, pool.end()];
                case 5:
                    _a.sent();
                    process.exit(0);
                    _a.label = 6;
                case 6:
                    migrationPath = path.join(__dirname, '../prisma/migrations/20251025141836_add_master_products_and_tenant_inventory/migration.sql');
                    console.log('📄 Leyendo archivo de migración...');
                    migrationSQL = fs.readFileSync(migrationPath, 'utf-8');
                    console.log('✅ Archivo de migración cargado\n');
                    // Ejecutar la migración
                    console.log('🚀 Ejecutando migración...');
                    console.log('⏳ Esto puede tomar varios segundos...\n');
                    return [4 /*yield*/, client.query('BEGIN')];
                case 7:
                    _a.sent();
                    _a.label = 8;
                case 8:
                    _a.trys.push([8, 11, , 13]);
                    return [4 /*yield*/, client.query(migrationSQL)];
                case 9:
                    _a.sent();
                    return [4 /*yield*/, client.query('COMMIT')];
                case 10:
                    _a.sent();
                    console.log('✅ Migración ejecutada exitosamente!\n');
                    return [3 /*break*/, 13];
                case 11:
                    error_1 = _a.sent();
                    return [4 /*yield*/, client.query('ROLLBACK')];
                case 12:
                    _a.sent();
                    throw error_1;
                case 13:
                    // Verificar resultados
                    console.log('🔍 Verificando resultados...\n');
                    return [4 /*yield*/, client.query('SELECT COUNT(*) FROM master_products')];
                case 14:
                    masterProductsCount = _a.sent();
                    console.log("\u2705 Productos maestros creados: ".concat(masterProductsCount.rows[0].count));
                    return [4 /*yield*/, client.query('SELECT COUNT(*) FROM tenant_inventory')];
                case 15:
                    tenantInventoryCount = _a.sent();
                    console.log("\u2705 Registros de inventario creados: ".concat(tenantInventoryCount.rows[0].count));
                    return [4 /*yield*/, client.query('SELECT COUNT(*) FROM products_legacy')];
                case 16:
                    productsLegacyCount = _a.sent();
                    console.log("\uD83D\uDCE6 Productos legacy conservados: ".concat(productsLegacyCount.rows[0].count, "\n"));
                    client.release();
                    console.log('✨ Proceso completado exitosamente!');
                    return [3 /*break*/, 20];
                case 17:
                    error_2 = _a.sent();
                    console.error('❌ Error al ejecutar la migración:');
                    console.error(error_2.message);
                    if (error_2.code) {
                        console.error("C\u00F3digo de error: ".concat(error_2.code));
                    }
                    process.exit(1);
                    return [3 /*break*/, 20];
                case 18: return [4 /*yield*/, pool.end()];
                case 19:
                    _a.sent();
                    return [7 /*endfinally*/];
                case 20: return [2 /*return*/];
            }
        });
    });
}
applyMigration();
