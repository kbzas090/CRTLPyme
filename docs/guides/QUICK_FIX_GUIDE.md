# 🚀 NEXTAUTH_URL Quick Fix Guide

## ⚡ TL;DR - What You Need to Do NOW

The code fix is ready in GitHub. You just need to **deploy it** to Cloud Run.

---

## 🎯 Fastest Method: GCP Console (5 minutes)

### Step-by-Step:

1. **Open this link**:
   ```
   https://console.cloud.google.com/run/detail/us-central1/crtlpyme?project=crtlpyme-477300
   ```

2. **Click** the blue "EDIT & DEPLOY NEW REVISION" button (top of page)

3. **Scroll down** to "Variables y secretos" section

4. **Find NEXTAUTH_URL** and remove the secret reference (click ❌)

5. **Click "+ ADD VARIABLE"**:
   - Name: `NEXTAUTH_URL`
   - Value: `https://crtlpyme-ean57to77a-uc.a.run.app`

6. **Click "DEPLOY"** at the bottom

7. **Wait 5-10 minutes** for deployment

8. **Test logout** at: https://crtlpyme-ean57to77a-uc.a.run.app

---

## ✅ How to Verify It Worked

1. Go to: https://crtlpyme-ean57to77a-uc.a.run.app
2. Log in
3. Click "Cerrar Sesión"
4. **Should redirect to landing page** (not 404)

---

## 📋 Alternative: Check for Automatic Build

Before manual deployment, check if it's building automatically:

**Open**: https://console.cloud.google.com/cloud-build/builds?project=crtlpyme-477300

- If you see a build running → Wait for it to finish
- If no build → Use manual deployment above

---

## 🔧 Alternative: gcloud Command

If you have gcloud installed and authenticated:

```bash
gcloud run services update crtlpyme \
  --region=us-central1 \
  --update-env-vars=NEXTAUTH_URL=https://crtlpyme-ean57to77a-uc.a.run.app \
  --remove-secrets=NEXTAUTH_URL
```

---

## ❓ Questions?

- **What was the problem?** NEXTAUTH_URL secret was empty in Secret Manager
- **What's the fix?** Use direct environment variable instead of secret
- **Is the code ready?** Yes, pushed to GitHub (commit c495938)
- **What's missing?** Just need to deploy it to Cloud Run
- **How long?** 5-10 minutes for deployment

---

**Status**: ✅ Code ready | ⏳ Deployment pending | 🎯 Action required
