# 🚀 Quick Fix Deployment Guide

## Issue: 401 Authentication Errors

**TL;DR:** The most likely issue is using wrong credentials. Try logging in with:
- Email: `admin@crtlpyme.com` (not .cl)
- Password: `Admin2025!` (not Admin123!)

---

## Option 1: Quick Password Fix (Recommended) ⚡

**If you have access to Cloud SQL from your local machine:**

```bash
# 1. Set your database connection
export DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@YOUR_IP:5432/crtlpyme-db"

# 2. Clone/pull the latest code
cd /home/ubuntu/github_repos/CRTLPyme
git fetch
git checkout fix/auth-debugging-401

# 3. Install dependencies if needed
npm install

# 4. Check if user exists
npx tsx scripts/fix-admin-password.ts check

# 5. Reset the password
npx tsx scripts/fix-admin-password.ts reset

# 6. Try logging in with:
# Email: admin@crtlpyme.com
# Password: Admin2025!
```

**This should fix the issue without redeploying!** ✅

---

## Option 2: Deploy with Debug Logging 🔍

**If Option 1 doesn't work or you want detailed logs:**

### Step 1: Build and Push

```bash
cd /home/ubuntu/github_repos/CRTLPyme

# Make sure you're on the fix branch
git checkout fix/auth-debugging-401

# Build the Docker image
docker build -t gcr.io/crtlpyme-app-399088/crtlpyme:debug .

# Push to Google Container Registry
docker push gcr.io/crtlpyme-app-399088/crtlpyme:debug
```

### Step 2: Deploy to Cloud Run

```bash
# Deploy with the new image
gcloud run deploy crtlpyme-app \
  --image gcr.io/crtlpyme-app-399088/crtlpyme:debug \
  --region us-central1 \
  --platform managed \
  --allow-unauthenticated \
  --set-env-vars "DATABASE_URL=YOUR_DATABASE_URL" \
  --set-env-vars "NEXTAUTH_SECRET=YOUR_SECRET" \
  --set-env-vars "NEXTAUTH_URL=https://crtlpyme-app-399088129827.us-central1.run.app"
```

### Step 3: Check Logs

```bash
# View logs in real-time
gcloud logging read "resource.type=cloud_run_revision" \
  --limit 50 \
  --format "table(timestamp, textPayload)" \
  --project crtlpyme-app-399088

# Filter for auth logs
gcloud logging read "resource.type=cloud_run_revision AND textPayload=~'AUTH'" \
  --limit 100 \
  --format "table(timestamp, textPayload)"
```

The debug version will show:
- ✅ Email being attempted
- ✅ Whether user exists
- ✅ User and tenant active status
- ✅ Password hash details
- ✅ Exact failure point

---

## Option 3: Run Fix Script in Cloud Run 🌐

**If you want to fix directly in production:**

### Method A: Cloud Shell

```bash
# 1. Open Cloud Shell in GCP Console
# 2. Connect to Cloud SQL
gcloud sql connect YOUR_INSTANCE_NAME --user=postgres --database=crtlpyme-db

# 3. Check user exists
SELECT email, "isActive", role FROM "User" WHERE email = 'admin@crtlpyme.com';

# 4. Check tenant status
SELECT u.email, t."isActive" 
FROM "User" u 
JOIN "Tenant" t ON u."tenantId" = t.id 
WHERE u.email = 'admin@crtlpyme.com';
```

### Method B: Cloud Run Job

```bash
# Create a one-off job to run the fix script
gcloud run jobs create fix-password \
  --image gcr.io/crtlpyme-app-399088/crtlpyme:debug \
  --region us-central1 \
  --set-env-vars "DATABASE_URL=YOUR_DATABASE_URL" \
  --command "npx" \
  --args "tsx,scripts/fix-admin-password.ts,reset"

# Execute the job
gcloud run jobs execute fix-password --region us-central1
```

---

## Common Issues and Solutions

### Issue: "User not found"

**Solution:** Run the create user script

```bash
npx tsx scripts/create-admin-user.ts
```

### Issue: "Tenant not active"

**Solution:** Update tenant status in database

```sql
UPDATE "Tenant" 
SET "isActive" = true, "accountStatus" = 'ACTIVE' 
WHERE rut = '99.999.999-9';
```

### Issue: "Password still invalid"

**Solution:** Double-check you're using exact credentials

```
Email: admin@crtlpyme.com  (NOT .cl)
Password: Admin2025!  (NOT Admin123!)
```

### Issue: Environment variables

**Verify Cloud Run env vars:**

```bash
gcloud run services describe crtlpyme-app \
  --region us-central1 \
  --format "value(spec.template.spec.containers[0].env)"
```

**Required variables:**
- `DATABASE_URL`
- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL`

---

## Verification Steps

After applying any fix:

1. **Navigate to:** https://crtlpyme-app-399088129827.us-central1.run.app
2. **Click:** "Iniciar Sesión"
3. **Enter:**
   - Email: `admin@crtlpyme.com`
   - Password: `Admin2025!`
4. **Expected:** Successful login and redirect to dashboard

---

## Rollback Plan

If debug version causes issues:

```bash
# Redeploy previous version
gcloud run deploy crtlpyme-app \
  --image gcr.io/crtlpyme-app-399088/crtlpyme:latest \
  --region us-central1
```

---

## Need More Help?

Check the comprehensive guide:
- **File:** `AUTHENTICATION_FIX_GUIDE.md`
- **Location:** `/home/ubuntu/github_repos/CRTLPyme/AUTHENTICATION_FIX_GUIDE.md`

Or review the implementation:
- **Auth Config:** `/lib/auth.ts`
- **Fix Script:** `/scripts/fix-admin-password.ts`
- **Create User:** `/scripts/create-admin-user.ts`

---

**Quick Reference:**

| Task | Command |
|------|---------|
| Check user exists | `npx tsx scripts/fix-admin-password.ts check` |
| Test password | `npx tsx scripts/fix-admin-password.ts test admin@crtlpyme.com "Admin2025!"` |
| Reset password | `npx tsx scripts/fix-admin-password.ts reset` |
| Create admin | `npx tsx scripts/create-admin-user.ts` |
| View logs | `gcloud logging read "resource.type=cloud_run_revision" --limit 50` |

---

**Status:** Ready to Deploy  
**Branch:** `fix/auth-debugging-401`  
**Date:** November 7, 2025
