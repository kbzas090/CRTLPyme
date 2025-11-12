# CRTLPyme Logout Redirect Issue - Fix Required

## Issue Identified

After investigation, the logout redirect issue (404 error) is caused by an **empty NEXTAUTH_URL secret** in Google Secret Manager.

### Root Cause

The Cloud Run service "crtlpyme" loads the `NEXTAUTH_URL` environment variable from Google Secret Manager:

```
NEXTAUTH_URL → Secret Manager → projects/crtlpyme-477300/secrets/NEXTAUTH_URL/versions/latest
```

**Current Status:**
- Secret exists but contains an **empty value** ("")
- This causes NextAuth to use an incorrect default URL for redirects
- Result: Users get 404 errors after logout

**Required Value:**
- `https://crtlpyme-ean57to77a-uc.a.run.app`

## Investigation Summary

### What We Checked

1. ✓ Cloud Run service configuration
   - Service: `crtlpyme`
   - Region: `us-central1`
   - Project: `crtlpyme-477300`
   - URL: `https://crtlpyme-ean57to77a-uc.a.run.app`

2. ✓ Environment variables structure
   - Found 11 environment variables
   - NEXTAUTH_URL is configured to load from Secret Manager
   - Other secrets (DATABASE_URL, NEXTAUTH_SECRET, etc.) are also from Secret Manager

3. ✓ Verified the bad URL is NOT in environment variables
   - The incorrect URL `crtlpyme-39988812927.us-central1.run.app` is not present
   - This confirms the issue is the empty NEXTAUTH_URL secret

### Permission Issue

The provided service account (`crtlpyme-477300-b26b110cecfa.json`) does **not** have permissions to:
- `secretmanager.versions.access` (read secrets)
- `secretmanager.versions.add` (create new secret versions)

## Solution Options

### Option 1: Update Secret via GCP Console (RECOMMENDED - Fastest)

1. Go to Google Cloud Console: https://console.cloud.google.com/security/secret-manager
2. Select project: `crtlpyme-477300`
3. Find secret: `NEXTAUTH_URL`
4. Click "New Version"
5. Enter value: `https://crtlpyme-ean57to77a-uc.a.run.app`
6. Click "Add New Version"
7. Force Cloud Run service restart:
   ```bash
   gcloud run services update crtlpyme --region=us-central1 --no-traffic
   gcloud run services update-traffic crtlpyme --region=us-central1 --to-latest
   ```

### Option 2: Grant Service Account Permissions

Grant the service account Secret Manager permissions:

```bash
# Get service account email from the JSON file
SERVICE_ACCOUNT_EMAIL=$(cat /home/ubuntu/Downloads/crtlpyme-477300-b26b110cecfa.json | jq -r '.client_email')

# Grant Secret Manager Admin role
gcloud projects add-iam-policy-binding crtlpyme-477300 \
  --member="serviceAccount:$SERVICE_ACCOUNT_EMAIL" \
  --role="roles/secretmanager.admin"
```

Then re-run the update script.

### Option 3: Update via GitHub Actions Deployment

1. Update the secret in Secret Manager (via console or with proper permissions)
2. Trigger a new deployment via GitHub Actions
3. The service will automatically pick up the new secret value

## Environment Variables Reference

All environment variables currently configured:

| Variable | Source | Current Value |
|----------|--------|---------------|
| NODE_ENV | Direct | production |
| NEXT_PUBLIC_APP_NAME | Direct | CRTLPyme |
| GOOGLE_CLOUD_PROJECT_ID | Direct | crtlpyme-477300 |
| DATABASE_URL | Secret Manager | (configured) |
| NEXTAUTH_SECRET | Secret Manager | (configured) |
| **NEXTAUTH_URL** | **Secret Manager** | **(EMPTY - NEEDS FIX)** |
| SENDGRID_API_KEY | Secret Manager | (configured) |
| SENDGRID_FROM_EMAIL | Secret Manager | (configured) |
| TRANSBANK_API_KEY | Secret Manager | (configured) |
| TRANSBANK_COMMERCE_CODE | Secret Manager | (configured) |
| TRANSBANK_ENVIRONMENT | Secret Manager | (configured) |

## Next Steps

**Immediate Action Required:**

1. Update the `NEXTAUTH_URL` secret in Google Secret Manager to: `https://crtlpyme-ean57to77a-uc.a.run.app`
2. Restart the Cloud Run service to pick up the new value
3. Test logout functionality

**Verification:**

After updating the secret and restarting the service:
1. Log in to the application
2. Click logout
3. Verify you are redirected to the landing page (not a 404 error)

## Technical Details

- **Service URL:** https://crtlpyme-ean57to77a-uc.a.run.app
- **Secret Path:** projects/crtlpyme-477300/secrets/NEXTAUTH_URL
- **Region:** us-central1
- **Service Name:** crtlpyme

---

**Status:** ⚠️ Awaiting manual intervention to update Secret Manager

**Priority:** HIGH - Affects user authentication flow
