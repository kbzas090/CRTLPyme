# CRTLPyme Database Population Summary

**Date:** November 7, 2025  
**Database:** crtlpyme  
**Status:** ✅ Successfully Populated

---

## 📊 Overall Statistics

| Metric | Count |
|--------|-------|
| Subscription Plans | 3 |
| Master Products (Catalog) | 500 |
| Businesses (Tenants) | 14 |
| Users (Total) | 72 |
| Inventory Items | 3,300 |
| Active Subscriptions | 39 |
| Historical Sales (3 months) | 728 |
| Sale Line Items | 2,845 |
| Stock Adjustments | 136 |
| Subscription Payments | 151 |

---

## 👥 Users by Role

| Role | Count | Description |
|------|-------|-------------|
| PROVEEDOR | 1 | Super administrator with full platform access |
| ADMIN | 7 | Business administrators |
| CAJA | 32 | Cashiers with POS access |
| INVENTARIO | 32 | Inventory managers |

---

## 💼 Businesses by Plan Type

| Plan Type | Count | Features |
|-----------|-------|----------|
| BASIC | 7 | 2 users, 500 products max |
| PRO | 5 | 5 users, unlimited products |
| ENTERPRISE | 2 | Unlimited users and products |

---

## 📦 Product Categories (Top 10)

| Category | Count |
|----------|-------|
| Alimentos y Abarrotes | 120 |
| Bebidas | 80 |
| Limpieza y Hogar | 70 |
| Cuidado Personal | 60 |
| Snacks y Confitería | 60 |
| Lácteos y Refrigerados | 50 |
| Electrónica y Accesorios | 40 |
| Otros | 20 |

---

## 💰 Sales Summary (Last 3 Months)

| Metric | Value |
|--------|-------|
| Total Sales Count | 728 |
| Total Revenue | $30,969,248 CLP |
| Average Sale | $42,540 CLP |
| Total Tax Collected (19% IVA) | $4,944,674 CLP |

### Sales by Payment Method

| Payment Method | Count | Percentage | Total Revenue (CLP) |
|----------------|-------|------------|---------------------|
| CASH | 378 | 51.9% | $16,210,796 |
| DEBIT | 216 | 29.7% | $8,608,027 |
| CREDIT | 102 | 14.0% | $5,110,531 |
| TRANSFER | 32 | 4.4% | $1,039,894 |

---

## 📊 Stock Adjustments by Type

| Adjustment Type | Count | Total Quantity | Description |
|-----------------|-------|----------------|-------------|
| PURCHASE | 39 | +1,447 | Stock purchases from suppliers |
| RETURN | 34 | +117 | Customer returns |
| CORRECTION | 31 | -5 | Inventory corrections |
| LOSS | 32 | -91 | Product losses/damage |

---

## 🏢 Sample Business Data

| Business Name | Users | Products in Inventory | Total Sales |
|---------------|-------|----------------------|-------------|
| Minimarket Don Luis | 6 | 226 | 79 |
| Almacén El Rinconcito | 4 | 309 | 164 |
| Supermercado Familiar | 8 | 249 | 135 |
| Tienda La Esquina | 8 | 298 | 249 |
| Abarrotes San José | 4 | 307 | 101 |

---

## 🔐 Access Credentials

### Platform Administrator
- **Email:** admin@crtlpyme.com
- **Password:** Admin2025!
- **Role:** PROVEEDOR (Super Admin)

### Business Users
- **Password (all business users):** Demo2025!
- For detailed user accounts by business, see `crtlpyme_test_accounts.md`

---

## 🗄️ Database Connection Details

- **Host:** 136.116.45.158
- **Port:** 5432
- **Database:** crtlpyme
- **User:** postgres
- **Password:** CRTLPyme2025!

---

## ✅ What Was Populated

### 1. Subscription Plans
- ✅ Basic Plan ($9,990 CLP/month)
- ✅ Pro Plan ($19,990 CLP/month)
- ✅ Enterprise Plan ($49,990 CLP/month)

### 2. Master Product Catalog
- ✅ 500 real Chilean products with:
  - Product names in Spanish
  - EAN-13 barcodes
  - Categories (Alimentos, Bebidas, Limpieza, etc.)
  - Brand information
  - Suggested prices

### 3. Businesses (PyMEs)
- ✅ 13 realistic Chilean small businesses
- ✅ Distributed across different plan types
- ✅ Complete business information (RUT, address, contact info)

### 4. Users
- ✅ 1 platform administrator
- ✅ 71 business users across all businesses
- ✅ Roles: Administrators, Cashiers, Inventory Managers
- ✅ Chilean names and realistic email addresses

### 5. Inventory
- ✅ 3,300 inventory items distributed across businesses
- ✅ Each business has 50-200 products
- ✅ Realistic pricing with margins (30-60%)
- ✅ Stock levels (5-100 units per product)

### 6. Subscriptions
- ✅ 39 active subscriptions
- ✅ Historical subscription data (1-6 months)
- ✅ 151 payment records

### 7. Sales Data
- ✅ 728 historical sales (last 90 days)
- ✅ 2,845 sale line items
- ✅ Realistic payment method distribution
- ✅ Complete sale information (totals, tax, payments)
- ✅ Revenue: $30.9 million CLP

### 8. Stock Movements
- ✅ 136 stock adjustments
- ✅ Multiple adjustment types (purchases, losses, corrections, returns)
- ✅ Distributed across last 90 days

---

## 🧪 Testing the Data

### Recommended Test Scenarios

1. **Login as Platform Admin**
   - Email: admin@crtlpyme.com
   - Password: Admin2025!
   - Verify access to all platform features

2. **Login as Business Owner**
   - Example: admin@minimarketdonluis.cl
   - Password: Demo2025!
   - Verify business dashboard, sales, inventory

3. **Login as Cashier**
   - Example: carmen1@minimarketdonluis.cl
   - Password: Demo2025!
   - Verify POS access, sales creation

4. **Login as Inventory Manager**
   - Example: jorge1@minimarketdonluis.cl
   - Password: Demo2025!
   - Verify inventory management features

---

## 📝 Notes

- All dates are realistic and distributed over the last 3 months
- Sales numbers follow realistic patterns (more cash, less transfers)
- Stock adjustments include various types (purchases, losses, corrections)
- Product categories are representative of Chilean small business inventory
- All RUT numbers follow Chilean format (XX.XXX.XXX-X)
- Prices are in Chilean Pesos (CLP)

---

## 🚀 Next Steps

1. **Start the application:**
   ```bash
   cd /home/ubuntu/github_repos/CRTLPyme
   npm run dev
   ```

2. **Access the application:**
   - Open browser to http://localhost:3000
   - Login with any of the provided credentials

3. **Test key features:**
   - Dashboard and reports
   - POS system
   - Inventory management
   - User management
   - Subscription management

---

**Report Generated:** November 7, 2025  
**Database Status:** ✅ Ready for Testing
