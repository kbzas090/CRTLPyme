# 🔐 Authentication Issue Fix Guide

## Issue Summary
Users experiencing **401 Unauthorized** errors when attempting to log in to the CRTLPyme application deployed on Google Cloud Run.

### Error Symptoms
- Login attempts return 401 status code
- Error appears on `/api/auth/callback/credentials` endpoint
- Error message: "Credenciales inválidas. Por favor verifica tu email y contraseña."

---

## 🔍 Root Cause Analysis

After thorough investigation of the codebase, the following potential causes were identified:

### 1. **Credential Mismatch** (Most Likely ⭐)
The seed script creates credentials that may not match what users are attempting to use:

**Credentials Created by `seed-complete.ts`:**
- Email: `admin@crtlpyme.com` (note: `.com` not `.cl`)
- Password: `Admin2025!` (note: `2025` not `123`)

**Common User Mistakes:**
- Using `admin@crtlpyme.cl` instead of `admin@crtlpyme.com`
- Using `Admin123!` instead of `Admin2025!`

### 2. **User/Tenant Status Issues**
The authentication checks for:
- User must be active (`user.isActive = true`)
- User's tenant must be active (`user.tenant.isActive = true`)

If either is false, authentication fails.

### 3. **Database Connection or Seed Issues**
- User might not exist in the database
- Seed script might not have run successfully
- Password hash might be corrupted

### 4. **Password Hashing Configuration**
Both the seed script and authentication use:
- Library: `bcryptjs` v2.4.3
- Rounds: 10
- These are **consistent and correct** ✅

---

## ✅ Solutions

### Solution 1: Use Correct Credentials (Quick Fix)

**Try logging in with the EXACT credentials from the seed script:**

```
Email: admin@crtlpyme.com
Password: Admin2025!
```

**Important Notes:**
- Email domain is `.com` NOT `.cl`
- Password is `Admin2025!` NOT `Admin123!`
- Password is case-sensitive
- No extra spaces before/after

---

### Solution 2: Reset Admin Password

If the correct credentials don't work, reset the password using our diagnostic script:

```bash
# Connect to Cloud Run or your deployment environment
# Then run:

cd /path/to/CRTLPyme

# Option A: Check if user exists
npx tsx scripts/fix-admin-password.ts check

# Option B: Test a specific password
npx tsx scripts/fix-admin-password.ts test admin@crtlpyme.com "Admin2025!"

# Option C: Reset password to default
npx tsx scripts/fix-admin-password.ts reset
```

The reset script will:
1. Find the admin user in the database
2. Create a fresh password hash for `Admin2025!`
3. Update the user in the database
4. Verify the new password works
5. Ensure user and tenant are active

---

### Solution 3: Create Admin User from Scratch

If the user doesn't exist at all:

```bash
cd /path/to/CRTLPyme

# Create with default credentials
npx tsx scripts/create-admin-user.ts

# OR create with custom credentials
npx tsx scripts/create-admin-user.ts "your-email@example.com" "YourPassword123!"
```

This script will:
1. Create the platform tenant if needed
2. Hash the password correctly
3. Create/update the admin user
4. Verify everything works
5. Ensure all flags are set correctly

---

### Solution 4: Deploy Debug Version

To get detailed logs and understand exactly what's failing:

```bash
cd /path/to/CRTLPyme

# Checkout the debug branch
git checkout fix/auth-debugging-401

# Build and deploy
docker build -t gcr.io/YOUR_PROJECT_ID/crtlpyme:debug .
docker push gcr.io/YOUR_PROJECT_ID/crtlpyme:debug

# Update Cloud Run service
gcloud run services update crtlpyme-app \
  --image gcr.io/YOUR_PROJECT_ID/crtlpyme:debug \
  --region us-central1
```

The debug version adds comprehensive logging:
- Email being attempted
- Whether user exists
- User active status
- Tenant active status
- Password hash comparison details

Check Cloud Run logs after attempting login to see the detailed output.

---

## 🚀 Deployment Steps

### Step 1: Fix the Issue Locally

```bash
# Clone or navigate to repo
cd /home/ubuntu/github_repos/CRTLPyme

# Checkout fix branch
git checkout fix/auth-debugging-401

# Connect to production database (set DATABASE_URL)
export DATABASE_URL="postgresql://user:pass@your-cloud-sql-ip:5432/dbname"

# Run the fix script
npx tsx scripts/fix-admin-password.ts reset

# Or create fresh admin
npx tsx scripts/create-admin-user.ts
```

### Step 2: Deploy Updated Code (if needed)

```bash
# Commit changes
git add .
git commit -m "fix: Add authentication debugging and password fix scripts"

# Push to GitHub
git push origin fix/auth-debugging-401

# Create PR or merge to main
```

### Step 3: Rebuild and Deploy

```bash
# Build new image
docker build -t gcr.io/YOUR_PROJECT_ID/crtlpyme:latest .

# Push to GCR
docker push gcr.io/YOUR_PROJECT_ID/crtlpyme:latest

# Deploy to Cloud Run
gcloud run deploy crtlpyme-app \
  --image gcr.io/YOUR_PROJECT_ID/crtlpyme:latest \
  --region us-central1 \
  --allow-unauthenticated
```

### Step 4: Test Authentication

1. Navigate to: `https://crtlpyme-app-399088129827.us-central1.run.app`
2. Click "Iniciar Sesión"
3. Enter credentials:
   - Email: `admin@crtlpyme.com`
   - Password: `Admin2025!`
4. Should successfully authenticate

---

## 🔧 Additional Diagnostics

### Check Database Directly

```bash
# Connect to Cloud SQL
gcloud sql connect YOUR_INSTANCE_NAME --user=postgres

# Check if user exists
SELECT email, "isActive", role FROM "User" WHERE email = 'admin@crtlpyme.com';

# Check tenant status
SELECT u.email, u."isActive" as user_active, t."isActive" as tenant_active 
FROM "User" u 
JOIN "Tenant" t ON u."tenantId" = t.id 
WHERE u.email = 'admin@crtlpyme.com';
```

### Check Cloud Run Logs

```bash
# View recent logs
gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=crtlpyme-app" \
  --limit 50 \
  --format json

# Filter for auth errors
gcloud logging read "resource.type=cloud_run_revision AND textPayload=~'AUTH'" \
  --limit 100
```

### Test Password Hash Locally

```javascript
// test-password.js
const bcrypt = require('bcryptjs');

async function test() {
  const password = 'Admin2025!';
  const hash = '$2a$10$...'; // Get from database
  
  const result = await bcrypt.compare(password, hash);
  console.log('Password matches:', result);
}

test();
```

---

## 📋 Checklist

Use this checklist to systematically resolve the issue:

- [ ] Verify exact credentials from seed script
- [ ] Try login with `admin@crtlpyme.com` and `Admin2025!`
- [ ] If failed, run `fix-admin-password.ts check` to verify user exists
- [ ] If user doesn't exist, run `create-admin-user.ts`
- [ ] If user exists but password wrong, run `fix-admin-password.ts reset`
- [ ] Deploy debug version if still failing
- [ ] Check Cloud Run logs for detailed error info
- [ ] Verify database connection works
- [ ] Check user and tenant are active in database
- [ ] Test authentication locally if possible
- [ ] Deploy fix to production

---

## 📝 Related Files

- **Authentication Config:** `/lib/auth.ts`
- **Seed Script:** `/prisma/seed-complete.ts`
- **Password Fix Script:** `/scripts/fix-admin-password.ts`
- **User Creation Script:** `/scripts/create-admin-user.ts`

---

## 🆘 If Nothing Works

If all solutions fail:

1. **Check Environment Variables:**
   ```bash
   # In Cloud Run, verify NEXTAUTH_SECRET is set
   gcloud run services describe crtlpyme-app --region us-central1 --format="value(spec.template.spec.containers[0].env)"
   ```

2. **Verify Database Connection:**
   ```bash
   # Test from Cloud Run environment
   npx prisma db pull
   ```

3. **Check NextAuth Configuration:**
   - Verify `NEXTAUTH_URL` matches deployment URL
   - Ensure `NEXTAUTH_SECRET` is set and consistent

4. **Contact for Support:**
   - Provide Cloud Run logs
   - Share output from `fix-admin-password.ts check`
   - Include any error messages

---

## 📚 Additional Resources

- [NextAuth.js Credentials Provider Docs](https://next-auth.js.org/providers/credentials)
- [bcryptjs Documentation](https://www.npmjs.com/package/bcryptjs)
- [Cloud Run Troubleshooting](https://cloud.google.com/run/docs/troubleshooting)

---

**Last Updated:** November 7, 2025  
**Status:** ✅ Solutions Implemented  
**Branch:** `fix/auth-debugging-401`
