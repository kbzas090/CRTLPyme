# NEXTAUTH_URL Fix Summary

## Problem Identified
- **Issue**: NEXTAUTH_URL secret in Google Secret Manager was empty
- **Impact**: Logout redirects were failing with 404 errors
- **Root Cause**: The service was trying to load NEXTAUTH_URL from Secret Manager, but the secret had no value

## Solution Implemented

### ✅ Code Changes Pushed to GitHub
**File Modified**: `cloudbuild.yaml`

**Changes Made**:
1. **Removed** NEXTAUTH_URL from Secret Manager references:
   ```yaml
   # REMOVED THIS LINE:
   - '--set-secrets=NEXTAUTH_URL=NEXTAUTH_URL:latest'
   ```

2. **Added** NEXTAUTH_URL as a direct environment variable:
   ```yaml
   # ADDED THIS LINE:
   - '--set-env-vars=NEXTAUTH_URL=https://crtlpyme-ean57to77a-uc.a.run.app'
   ```

3. **Verified** service name is correct: `crtlpyme` (not `crtlpyme-app`)

**Commit**: `c495938`
**Commit Message**: "fix: Set NEXTAUTH_URL as direct environment variable"
**Status**: ✅ Successfully pushed to GitHub main branch

---

## Deployment Status

### Attempted Approaches

#### ❌ Approach 1: Update Secret Manager
- **Status**: Failed
- **Reason**: Service account lacks `secretmanager.secrets.get` permission
- **Error**: `403 Permission denied`

#### ❌ Approach 2: Direct Cloud Run Update via API
- **Status**: Failed
- **Reason**: Service account lacks `artifactregistry.repositories.downloadArtifacts` permission
- **Error**: `403 Permission denied`

#### ✅ Approach 3: Update via GitHub + Cloud Build
- **Status**: Code changes pushed successfully
- **Next Step**: Deployment needs to be triggered

---

## Required Actions

### Option A: Automatic Deployment (If Cloud Build Trigger Exists)
If you have a Cloud Build trigger configured for the GitHub repository:
1. The deployment should trigger automatically from the push to `main` branch
2. Wait 5-10 minutes for the build to complete
3. Verify at: https://console.cloud.google.com/cloud-build/builds?project=crtlpyme-477300

### Option B: Manual Deployment via GCP Console
If no automatic trigger exists, deploy manually:

1. **Go to Cloud Build**:
   - https://console.cloud.google.com/cloud-build/builds?project=crtlpyme-477300

2. **Trigger Manual Build**:
   - Click "Run" or "Trigger Build"
   - Select the repository: `kbzas090/CRTLPyme`
   - Branch: `main`
   - Commit: `c495938` (or latest)

3. **Monitor the Build**:
   - Build should take 10-15 minutes
   - Check logs for any errors

### Option C: Deploy via gcloud CLI (If you have owner access)
```bash
# Authenticate with owner account
gcloud auth login

# Set project
gcloud config set project crtlpyme-477300

# Trigger Cloud Build
gcloud builds submit --config=cloudbuild.yaml

# OR update Cloud Run directly
gcloud run services update crtlpyme \
  --region=us-central1 \
  --update-env-vars=NEXTAUTH_URL=https://crtlpyme-ean57to77a-uc.a.run.app
```

---

## Verification Steps

Once deployment completes:

### 1. Check Environment Variables
```bash
gcloud run services describe crtlpyme \
  --region=us-central1 \
  --format="value(spec.template.spec.containers[0].env)"
```

Look for: `NEXTAUTH_URL=https://crtlpyme-ean57to77a-uc.a.run.app`

### 2. Test Logout Functionality
1. Visit: https://crtlpyme-ean57to77a-uc.a.run.app
2. Log in with test credentials
3. Click "Cerrar Sesión" (Logout)
4. **Expected**: Should redirect to landing page
5. **Previous behavior**: 404 error

### 3. Check Service Status
- Console: https://console.cloud.google.com/run/detail/us-central1/crtlpyme?project=crtlpyme-477300
- Verify latest revision is deployed
- Check that service is receiving traffic

---

## Technical Details

### Current Configuration
- **Project ID**: crtlpyme-477300
- **Region**: us-central1
- **Service Name**: crtlpyme
- **Service URL**: https://crtlpyme-ean57to77a-uc.a.run.app
- **Latest Commit**: c495938

### Environment Variables (After Deployment)
```
NODE_ENV=production
NEXT_PUBLIC_APP_NAME=CRTLPyme
GOOGLE_CLOUD_PROJECT_ID=crtlpyme-477300
NEXTAUTH_URL=https://crtlpyme-ean57to77a-uc.a.run.app  ← NEW (direct value)
```

### Secrets (Still from Secret Manager)
```
DATABASE_URL → secret:DATABASE_URL:latest
NEXTAUTH_SECRET → secret:NEXTAUTH_SECRET:latest
SENDGRID_API_KEY → secret:SENDGRID_API_KEY:latest
SENDGRID_FROM_EMAIL → secret:SENDGRID_FROM_EMAIL:latest
TRANSBANK_API_KEY → secret:transbank-api-key:latest
TRANSBANK_COMMERCE_CODE → secret:transbank-commerce-code:latest
TRANSBANK_ENVIRONMENT → secret:TRANSBANK_ENVIRONMENT:latest
```

---

## Service Account Permissions Issue

The current service account (`github-actions@crtlpyme-477300.iam.gserviceaccount.com`) has limited permissions:
- ✅ Can read Cloud Run service configuration
- ❌ Cannot update Secret Manager
- ❌ Cannot update Cloud Run services directly
- ❌ Cannot access Cloud Build API

**Recommendation**: Keep these limited permissions for security. Use Cloud Build triggers or manual GCP Console deployment for updates.

---

## Next Steps

1. **Immediate**: Check if Cloud Build trigger exists and if deployment started automatically
2. **If no trigger**: Manually trigger deployment via GCP Console (Option B above)
3. **After deployment**: Test logout functionality to confirm fix
4. **Optional**: Set up Cloud Build trigger for automatic deployments on push to main

---

## Files Modified
- ✅ `/home/ubuntu/github_repos/CRTLPyme/cloudbuild.yaml` - Updated and pushed to GitHub
- ✅ Commit `c495938` on `main` branch

## Scripts Created
- `/home/ubuntu/fix_nextauth_url.py` - Attempted automated fix (permission issues)
- `/home/ubuntu/update_cloudrun_nextauth.py` - Attempted direct update (permission issues)
- `/home/ubuntu/check_cloudbuild.py` - Attempted to check build status (permission issues)

---

**Status**: ✅ Code fix complete and pushed to GitHub
**Deployment**: ⏳ Pending (requires manual trigger or automatic Cloud Build trigger)
**Expected Result**: Logout redirects will work correctly after deployment
