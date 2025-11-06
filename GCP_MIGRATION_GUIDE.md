# GCP Database Migration Guide

## Current Status ✅

### Completed Steps:
1. ✅ **Schema Updated** - `prisma/schema.prisma` updated with 16 new models
2. ✅ **Migration Files Created** - Located at `prisma/migrations/20251106012548_complete_saas_implementation/`
3. ✅ **DATABASE_URL Configured** - `.env` file contains properly encoded connection string

### Migration File Details:
- **Location**: `prisma/migrations/20251106012548_complete_saas_implementation/migration.sql`
- **Size**: 823 lines of SQL
- **Content**: All tables, enums, indexes, and foreign key constraints

---

## Network Access Issue ⚠️

### Problem:
The GCP Cloud SQL instance at `136.116.45.158:5432` is **not accessible** from external networks. This is expected behavior for Cloud SQL security.

### Error Encountered:
```
Can't reach database server at `136.116.45.158:5432`
```

---

## Solution: Configure GCP Cloud SQL Network Access

### Option 1: Add Authorized Networks (Recommended for Development)

1. **Open Google Cloud Console**
   - Navigate to: https://console.cloud.google.com/sql/instances
   - Select your project: `crtlpyme-chile-2025`
   - Click on your instance: `crtlpyme-db`

2. **Configure Connections**
   - Go to "Connections" tab
   - Click "Networking"
   - Under "Authorized networks", click "Add network"
   - Add your IP address or `0.0.0.0/0` (for testing only - not recommended for production)
   - Click "Save"

3. **Wait for Configuration**
   - Changes take 1-2 minutes to apply

### Option 2: Use Cloud SQL Proxy (Recommended for Production)

1. **Install Cloud SQL Proxy**:
   ```bash
   curl -o cloud-sql-proxy https://storage.googleapis.com/cloud-sql-connectors/cloud-sql-proxy/v2.14.2/cloud-sql-proxy.linux.amd64
   chmod +x cloud-sql-proxy
   ```

2. **Start Proxy** (requires authentication):
   ```bash
   ./cloud-sql-proxy crtlpyme-chile-2025:southamerica-east1:crtlpyme-db
   ```

3. **Update DATABASE_URL** in `.env`:
   ```
   DATABASE_URL="postgresql://postgres:%7B%60kkE%5B8SyJ%40G_IyF@localhost:5432/crtlpyme-db?schema=public"
   ```

### Option 3: Use Private IP with VPN

For production environments, use Private IP connectivity with Cloud VPN or Interconnect.

---

## Step 4: Apply Migrations to GCP Database

Once network access is configured, run these commands:

### Method 1: Prisma Migrate Deploy (Recommended)

```bash
cd /home/ubuntu/github_repos/CRTLPyme

# Verify connection
npx prisma db pull --force

# Apply migrations
npx prisma migrate deploy

# Verify migrations applied
npx prisma migrate status
```

### Method 2: Manual SQL Execution (Alternative)

If Prisma migrate fails, you can apply the SQL directly:

```bash
# Using psql
PGPASSWORD='{`kkE[8SyJ@G_IyF' psql -h 136.116.45.158 -U postgres -d crtlpyme-db -f prisma/migrations/20251106012548_complete_saas_implementation/migration.sql
```

---

## Step 5: Generate Prisma Client

After migrations are applied:

```bash
cd /home/ubuntu/github_repos/CRTLPyme
npx prisma generate
```

This generates the TypeScript client with all 16 new models.

---

## Database Connection Details

### Connection Information:
- **Host**: 136.116.45.158
- **Port**: 5432
- **Database**: crtlpyme-db
- **User**: postgres
- **Password**: {`kkE[8SyJ@G_IyF (special characters URL-encoded in .env)

### Encoded DATABASE_URL:
```
postgresql://postgres:%7B%60kkE%5B8SyJ%40G_IyF@136.116.45.158:5432/crtlpyme-db?schema=public
```

### Character Encoding Reference:
- `{` → `%7B`
- `` ` `` → `%60`
- `[` → `%5B`
- `@` → `%40`

---

## New Database Models (16 Total)

### SaaS Administration (5 models):
1. **PlatformAdmin** - Super admins managing the platform
2. **PlatformAdminSession** - Admin authentication sessions
3. **TenantManagement** - Enhanced tenant management
4. **TenantActionLog** - Audit log for tenant actions
5. **SubscriptionMetric** - Analytics for subscription plans

### Subscription Management (2 models):
6. **SubscriptionPlan** - Available subscription plans
7. **Subscription** - Active tenant subscriptions

### Email System (3 models):
8. **EmailTemplate** - Reusable email templates
9. **EmailQueue** - Outgoing email queue
10. **EmailLog** - Email delivery tracking

### Notification System (2 models):
11. **NotificationPreference** - User notification settings
12. **NotificationHistory** - Sent notifications log

### Payment Processing (4 models):
13. **SubscriptionPayment** - Payment records
14. **PaymentWebhook** - Webhook event logs
15. **Refund** - Refund processing
16. **TransbankTransaction** - Transbank integration data

---

## Verification Commands

After applying migrations, verify the schema:

```bash
# Check all tables
npx prisma db pull

# List all tables in database
PGPASSWORD='{`kkE[8SyJ@G_IyF' psql -h 136.116.45.158 -U postgres -d crtlpyme-db -c "\dt"

# Count tables
PGPASSWORD='{`kkE[8SyJ@G_IyF' psql -h 136.116.45.158 -U postgres -d crtlpyme-db -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';"
```

---

## Troubleshooting

### Issue: "Can't reach database server"
**Solution**: Configure authorized networks in Cloud SQL (see above)

### Issue: "Password authentication failed"
**Solution**: Verify password encoding in DATABASE_URL

### Issue: "Database does not exist"
**Solution**: Create database:
```sql
CREATE DATABASE "crtlpyme-db";
```

### Issue: "Migration already applied"
**Solution**: Check migration status:
```bash
npx prisma migrate status
```

---

## Next Steps After Migration

1. ✅ Verify all tables created
2. ✅ Generate Prisma Client
3. ✅ Test basic CRUD operations
4. ✅ Seed initial data (subscription plans, email templates)
5. ✅ Configure Cloud Build CI/CD
6. ✅ Set up automatic database backups in GCP

---

## Support

- **GCP Project**: crtlpyme-chile-2025
- **Database Instance**: crtlpyme-db
- **Region**: southamerica-east1
- **GitHub Repo**: https://github.com/kbzas090/CRTLPyme

For questions, check:
- [Prisma Migration Docs](https://www.prisma.io/docs/concepts/components/prisma-migrate)
- [Cloud SQL Connectivity](https://cloud.google.com/sql/docs/postgres/connect-overview)
