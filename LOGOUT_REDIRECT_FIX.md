# Logout Redirect Fix - November 12, 2025

## Problem Identified
Users were being redirected to an incorrect 404 error page after logging out:
- **Incorrect URL**: `crtlpyme-399888129827.us-central1.run.app`
- **Correct URL**: `https://crtlpyme-ean57to77a-uc.a.run.app`

## Root Cause
The `NEXTAUTH_URL` environment variable was either empty or set to an incorrect value in the Cloud Run service. This caused NextAuth to generate incorrect redirect URLs during the logout process.

## Solution Applied
1. **Identified** that NEXTAUTH_URL was empty in the Cloud Run service
2. **Updated** the GitHub secret `NEXTAUTH_URL` to the correct service URL: `https://crtlpyme-ean57to77a-uc.a.run.app`
3. **Triggered** a new deployment through GitHub Actions to apply the fix

## Files Reviewed
- `/lib/auth.ts` - NextAuth configuration with redirect callback
- `/app/auth/signout/page.tsx` - Signout page that calls `signOut({ callbackUrl: '/' })`
- `/components/layout/dashboard-layout.tsx` - Dashboard layout with logout handler
- `/components/admin/AdminNavBar.tsx` - Admin navbar with logout handler
- `/.github/workflows/deploy.yml` - Deployment workflow using NEXTAUTH_URL secret

## Expected Behavior After Fix
- Users click "Cerrar sesión" (Logout)
- User is redirected to `/auth/signout` confirmation page
- Upon confirmation, user is logged out and redirected to `/` (landing page)
- Landing page loads correctly at the proper URL

## Verification Steps
1. Log in to the application
2. Click the logout button in the user menu
3. Confirm logout on the signout page
4. Verify redirection to the landing page at `https://crtlpyme-ean57to77a-uc.a.run.app`
5. Confirm no 404 errors appear

## Technical Details
- The NextAuth `redirect` callback in `lib/auth.ts` uses `baseUrl` which is derived from `NEXTAUTH_URL`
- When `NEXTAUTH_URL` is not set or incorrect, NextAuth may use default or incorrect URL generation
- The fix ensures all redirect URLs use the correct base URL
