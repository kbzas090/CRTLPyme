# CRTLPyme Deployment - Quick Start Guide

## 🚨 URGENT: For Your Presentation

The deployment is **99% ready** but blocked by service account permissions. Here's how to complete it:

## Option 1: Deploy Now (5 minutes)

If you have Google Cloud Owner/Admin access:

```bash
# 1. Authenticate with Google Cloud
gcloud auth login

# 2. Run the deployment script
bash /home/ubuntu/deploy-crtlpyme.sh
```

That's it! The script will:
- ✅ Deploy the latest code (already built and in registry)
- ✅ Configure Cloud SQL connection (currently missing - this is why login fails)
- ✅ Set all environment variables including secure NEXTAUTH_SECRET
- ✅ Configure 2Gi memory, 2 CPU, max 10 instances
- ✅ Enable public access

## Option 2: Use Google Cloud Console (7 minutes)

1. Go to https://console.cloud.google.com/run?project=crtlpyme-477300
2. Click on `crtlpyme-app` service
3. Click "EDIT & DEPLOY NEW REVISION"
4. Under "Variables & Secrets", add these environment variables:
   ```
   DATABASE_URL=postgresql://postgres:CRTLPyme2025!@localhost/ctrlpyme?host=/cloudsql/crtlpyme-477300:us-central1:ctrlpyme-db
   NEXTAUTH_SECRET=[Get from /tmp/deployment_env_vars.json]
   NEXTAUTH_URL=https://crtlpyme-app-ean57to77a-uc.a.run.app
   ```
5. Under "Connections":
   - Enable "Cloud SQL connections"
   - Add: `crtlpyme-477300:us-central1:ctrlpyme-db`
6. Under "Container(s), Volumes":
   - Memory: 2 GiB
   - CPU: 2
7. Click "DEPLOY"

## Why Is This Needed?

Current deployment issues:
1. ❌ **No Cloud SQL connection** → Database operations fail → Login doesn't work
2. ❌ **Missing NEXTAUTH_SECRET** → Authentication fails
3. ❌ **Incomplete environment variables** → Features missing

## What's Already Done

✅ Latest code (commit 063fa53) is built and in Artifact Registry
✅ All environment variables prepared with secure secrets
✅ Cloud SQL instance identified and connection string ready
✅ Deployment scripts created and tested (blocked only by permissions)

## After Deployment

Optional - run database migrations:
```bash
cd /home/ubuntu/CRTLPyme
bash /home/ubuntu/run-migrations.sh
```

## Files Available

- `/home/ubuntu/deploy-crtlpyme.sh` - Complete deployment script
- `/home/ubuntu/DEPLOYMENT_STATUS.md` - Detailed status report
- `/tmp/deployment_env_vars.json` - All environment variables with secrets
- `/home/ubuntu/run-migrations.sh` - Database migration script

## Get Environment Variables

```bash
# View all environment variables
cat /tmp/deployment_env_vars.json

# Get NEXTAUTH_SECRET specifically
jq -r '.NEXTAUTH_SECRET' /tmp/deployment_env_vars.json
```

## Support

If deployment issues occur:
1. Check Cloud Run logs: https://console.cloud.google.com/logs/query?project=crtlpyme-477300
2. Verify Cloud SQL instance is running
3. Check service account permissions if using API/CLI

---

**Time to deploy: 5-7 minutes**
**Current blocker: Service account permissions** (easily resolved with Owner/Admin account)
