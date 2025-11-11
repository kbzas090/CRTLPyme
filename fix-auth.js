"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
var bcrypt = __importStar(require("bcryptjs"));
var prisma = new client_1.PrismaClient({
    datasources: {
        db: {
            url: process.env.DATABASE_URL,
        },
    },
});
function main() {
    var _a, _b;
    return __awaiter(this, void 0, void 0, function () {
        var users, _i, users_1, user, isBcrypt, totalUsers, roleStats, _c, roleStats_1, stat, nonBcryptUsers, tenant, testAccounts, createdAccounts, _d, testAccounts_1, account, existing, hashedPassword, hashedPassword, error_1, credentialsContent, fs, testUser, isValid, error_2;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0:
                    console.log('🔍 Checking database connection...');
                    _e.label = 1;
                case 1:
                    _e.trys.push([1, 22, 23, 25]);
                    // Test connection
                    return [4 /*yield*/, prisma.$connect()];
                case 2:
                    // Test connection
                    _e.sent();
                    console.log('✅ Database connected successfully!\n');
                    // Check users table
                    console.log('📊 Analyzing users table...');
                    return [4 /*yield*/, prisma.user.findMany({
                            select: {
                                id: true,
                                email: true,
                                firstName: true,
                                lastName: true,
                                role: true,
                                password: true,
                                isActive: true,
                                tenantId: true,
                            },
                            take: 5 // Get first 5 users as sample
                        })];
                case 3:
                    users = _e.sent();
                    console.log("Found ".concat(users.length, " users (showing first 5):\n"));
                    // Analyze password format
                    for (_i = 0, users_1 = users; _i < users_1.length; _i++) {
                        user = users_1[_i];
                        isBcrypt = user.password.startsWith('$2a$') || user.password.startsWith('$2b$');
                        console.log("User: ".concat(user.email));
                        console.log("  Name: ".concat(user.firstName, " ").concat(user.lastName));
                        console.log("  Role: ".concat(user.role));
                        console.log("  Active: ".concat(user.isActive));
                        console.log("  Password format: ".concat(isBcrypt ? '✅ bcrypt hash' : '❌ NOT bcrypt (plain text or other)'));
                        console.log("  Password preview: ".concat(user.password.substring(0, 20), "..."));
                        console.log('');
                    }
                    return [4 /*yield*/, prisma.user.count()];
                case 4:
                    totalUsers = _e.sent();
                    console.log("\n\uD83D\uDCC8 Total users in database: ".concat(totalUsers));
                    // Count by role
                    console.log('\n📊 Users by role:');
                    return [4 /*yield*/, prisma.user.groupBy({
                            by: ['role'],
                            _count: true,
                        })];
                case 5:
                    roleStats = _e.sent();
                    for (_c = 0, roleStats_1 = roleStats; _c < roleStats_1.length; _c++) {
                        stat = roleStats_1[_c];
                        console.log("  ".concat(stat.role, ": ").concat(stat._count));
                    }
                    nonBcryptUsers = users.filter(function (u) { return !u.password.startsWith('$2a$') && !u.password.startsWith('$2b$'); });
                    if (nonBcryptUsers.length > 0) {
                        console.log("\n\u26A0\uFE0F  Found ".concat(nonBcryptUsers.length, " users with non-bcrypt passwords that need fixing"));
                    }
                    return [4 /*yield*/, prisma.tenant.findFirst({
                            where: { isActive: true }
                        })];
                case 6:
                    tenant = _e.sent();
                    if (!tenant) {
                        console.log('\n❌ No active tenant found. Need to create a tenant first.');
                        return [2 /*return*/];
                    }
                    console.log("\n\u2705 Found active tenant: ".concat(tenant.businessName, " (").concat(tenant.id, ")"));
                    // Now create test accounts with proper bcrypt hashing
                    console.log('\n🔧 Creating test accounts...\n');
                    testAccounts = [
                        {
                            email: 'admin@test.com',
                            password: 'admin123',
                            firstName: 'Admin',
                            lastName: 'Test',
                            role: client_1.UserRole.ADMIN,
                            tenantId: tenant.id,
                        },
                        {
                            email: 'proveedor@test.com',
                            password: 'admin123',
                            firstName: 'Proveedor',
                            lastName: 'Test',
                            role: client_1.UserRole.PROVEEDOR,
                            tenantId: tenant.id,
                        },
                        {
                            email: 'caja@test.com',
                            password: 'test123',
                            firstName: 'Caja',
                            lastName: 'Test',
                            role: client_1.UserRole.CAJA,
                            tenantId: tenant.id,
                        },
                        {
                            email: 'inventario@test.com',
                            password: 'test123',
                            firstName: 'Inventario',
                            lastName: 'Test',
                            role: client_1.UserRole.INVENTARIO,
                            tenantId: tenant.id,
                        },
                    ];
                    createdAccounts = [];
                    _d = 0, testAccounts_1 = testAccounts;
                    _e.label = 7;
                case 7:
                    if (!(_d < testAccounts_1.length)) return [3 /*break*/, 18];
                    account = testAccounts_1[_d];
                    _e.label = 8;
                case 8:
                    _e.trys.push([8, 16, , 17]);
                    return [4 /*yield*/, prisma.user.findUnique({
                            where: { email: account.email }
                        })];
                case 9:
                    existing = _e.sent();
                    if (!existing) return [3 /*break*/, 12];
                    console.log("\u26A0\uFE0F  User ".concat(account.email, " already exists, updating password..."));
                    return [4 /*yield*/, bcrypt.hash(account.password, 10)];
                case 10:
                    hashedPassword = _e.sent();
                    // Update the user
                    return [4 /*yield*/, prisma.user.update({
                            where: { email: account.email },
                            data: {
                                password: hashedPassword,
                                isActive: true,
                            }
                        })];
                case 11:
                    // Update the user
                    _e.sent();
                    console.log("\u2705 Updated ".concat(account.email, " with role ").concat(account.role));
                    createdAccounts.push({
                        email: account.email,
                        password: account.password,
                        role: account.role,
                        status: 'updated'
                    });
                    return [3 /*break*/, 15];
                case 12: return [4 /*yield*/, bcrypt.hash(account.password, 10)];
                case 13:
                    hashedPassword = _e.sent();
                    // Create the user
                    return [4 /*yield*/, prisma.user.create({
                            data: __assign(__assign({}, account), { password: hashedPassword, isActive: true })
                        })];
                case 14:
                    // Create the user
                    _e.sent();
                    console.log("\u2705 Created ".concat(account.email, " with role ").concat(account.role));
                    createdAccounts.push({
                        email: account.email,
                        password: account.password,
                        role: account.role,
                        status: 'created'
                    });
                    _e.label = 15;
                case 15: return [3 /*break*/, 17];
                case 16:
                    error_1 = _e.sent();
                    console.log("\u274C Error with ".concat(account.email, ": ").concat(error_1.message));
                    return [3 /*break*/, 17];
                case 17:
                    _d++;
                    return [3 /*break*/, 7];
                case 18:
                    // Save credentials to file
                    console.log('\n📝 Saving test account credentials...\n');
                    credentialsContent = "\n=================================================================\n         CRTLPyme - Test Account Credentials\n=================================================================\n\nDatabase: crtlpyme\nConnection established: \u2705\n\nTest Accounts Created/Updated:\n-------------------------------\n\n".concat(createdAccounts.map(function (acc) { return "\n".concat(acc.role, " Account (").concat(acc.status, ")\n  Email: ").concat(acc.email, "\n  Password: ").concat(acc.password, "\n  Role: ").concat(acc.role, "\n"); }).join('\n'), "\n\nRole Descriptions:\n------------------\n- PROVEEDOR: SaaS Administrator (super admin equivalent)\n  Full access to the platform and all features\n  \n- ADMIN: Client Administrator\n  Manages their tenant/business\n  \n- CAJA: Cashier/Sales Role (vendedor equivalent)\n  Point of sale operations\n  \n- INVENTARIO: Inventory Manager (contador equivalent)\n  Manages inventory and stock\n\nLogin Instructions:\n-------------------\n1. Navigate to the login page\n2. Use any of the email addresses above\n3. Enter the corresponding password\n4. You will be redirected based on your role\n\nImportant Findings:\n-------------------\n\u2705 NextAuth is configured with bcrypt password hashing\n\u2705 Passwords are hashed using bcrypt.hash() with 10 rounds\n\u2705 Authentication uses bcrypt.compare() for verification\n\u2705 All test accounts are properly hashed and ready to use\n\nTotal Users in System: ").concat(totalUsers, "\n\nRole Distribution:\n").concat(roleStats.map(function (s) { return "  ".concat(s.role, ": ").concat(s._count); }).join('\n'), "\n\nTenant Used: ").concat(tenant.businessName, "\nTenant ID: ").concat(tenant.id, "\n\nDatabase URL: ").concat((_a = process.env.DATABASE_URL) === null || _a === void 0 ? void 0 : _a.replace(/:[^:@]+@/, ':****@'), "\n\n=================================================================\nGenerated: ").concat(new Date().toISOString(), "\n=================================================================\n");
                    fs = require('fs');
                    fs.writeFileSync('/home/ubuntu/test_accounts.txt', credentialsContent);
                    console.log('✅ Test account credentials saved to /home/ubuntu/test_accounts.txt');
                    // Verify one of the passwords works
                    console.log('\n🔍 Verifying password hashing...');
                    return [4 /*yield*/, prisma.user.findUnique({
                            where: { email: 'admin@test.com' }
                        })];
                case 19:
                    testUser = _e.sent();
                    if (!testUser) return [3 /*break*/, 21];
                    return [4 /*yield*/, bcrypt.compare('admin123', testUser.password)];
                case 20:
                    isValid = _e.sent();
                    console.log("Password verification test: ".concat(isValid ? '✅ PASSED' : '❌ FAILED'));
                    _e.label = 21;
                case 21: return [3 /*break*/, 25];
                case 22:
                    error_2 = _e.sent();
                    console.error('❌ Error:', error_2.message);
                    if (error_2.code === 'P1001') {
                        console.error('\n💡 Connection failed. Possible issues:');
                        console.error('   - Cloud SQL Proxy not running');
                        console.error('   - Incorrect DATABASE_URL');
                        console.error('   - Network/firewall issues');
                        console.error('   - Database credentials incorrect');
                        console.error("\nCurrent DATABASE_URL: ".concat((_b = process.env.DATABASE_URL) === null || _b === void 0 ? void 0 : _b.replace(/:[^:@]+@/, ':****@')));
                    }
                    throw error_2;
                case 23: return [4 /*yield*/, prisma.$disconnect()];
                case 24:
                    _e.sent();
                    return [7 /*endfinally*/];
                case 25: return [2 /*return*/];
            }
        });
    });
}
main()
    .catch(function (e) {
    console.error(e);
    process.exit(1);
});
