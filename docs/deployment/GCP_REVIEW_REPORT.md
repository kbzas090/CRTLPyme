# GCP Comprehensive Review Report - CRTLPyme Project
**Date:** November 10, 2025  
**Project ID:** crtlpyme-477300  
**Review Type:** READ-ONLY Documentation  

---

## Executive Summary

The CRTLPyme project has **TWO Cloud Run services** deployed, which appears to be a **DUPLICATE DEPLOYMENT**:
1. **crtlpyme** (Main service - KEEP THIS ONE)
2. **crtlpyme-app** (Duplicate service - appears to be redundant)

Both services are running the same application but with different configurations. The main service "crtlpyme" has proper Cloud SQL connectivity, while "crtlpyme-app" does NOT have Cloud SQL connection configured.

---

## 1. CLOUD RUN SERVICES

### 1.1 Service: **crtlpyme** (MAIN SERVICE - RECOMMENDED TO KEEP)

**Basic Information:**
- **Service Name:** crtlpyme
- **Region:** us-central1 (Iowa)
- **URL:** https://crtlpyme-399888129827.us-central1.run.app
- **Status:** Active and running
- **Last Deployment:** ~54 minutes ago (from time of review)
- **Current Revision:** crtlpyme-00014-7md
- **Traffic Distribution:** 100% to latest revision

**Container Configuration:**
- **Image:** gcr.io/crtlpyme-477300/crtlpyme@sha256:93abc...
- **Port:** 3000
- **CPU Limit:** 2 vCPU
- **Memory Limit:** 2 GiB

**Scaling Configuration:**
- **Type:** Automatic
- **Min Instances:** 0
- **Max Instances:** 10
- **Concurrency:** 80 requests per instance
- **Request Timeout:** 300 seconds (5 minutes)

**Authentication:**
- **Public Access:** Enabled (Allow unauthenticated)
- **Ingress:** All traffic allowed

**Environment Variables (7 total):**
1. `DATABASE_URL` - Secret reference: `DATABASE_URL:latest`
2. `NEXTAUTH_SECRET` - Secret reference: `NEXTAUTH_SECRET:latest`
3. `NEXTAUTH_URL` - Secret reference: `NEXTAUTH_URL:latest`
4. `SENDGRID_API_KEY` - Secret reference: `SENDGRID_API_KEY:latest`
5. `SENDGRID_FROM_EMAIL` - Secret reference: `SENDGRID_FROM_EMAIL:latest`
6. `TRANSBANK_API_KEY` - Secret reference: `transbank-api-key:latest`
7. `TRANSBANK_COMMERCE_CODE` - Secret reference: `transbank-commerce-code:latest`

**Cloud SQL Connections (1):**
- ✅ **Connected to:** crtlpyme-477300:us-central1:crtlpyme-db

**Billing:**
- Based on requests (pay-per-use)
- CPU allocated during startup

**Current Metrics:**
- **Requests:** 0 (at time of review)

---

### 1.2 Service: **crtlpyme-app** (DUPLICATE SERVICE - CANDIDATE FOR REMOVAL)

**Basic Information:**
- **Service Name:** crtlpyme-app
- **Region:** us-central1 (Iowa)
- **URL:** https://crtlpyme-app-399088129827.us-central1.run.app
- **Status:** Active and running
- **Last Deployment:** ~38 minutes ago (from time of review)
- **Current Revision:** crtlpyme-app-00001-xxx (exact revision not captured)
- **Traffic Distribution:** 100% to latest revision

**Container Configuration:**
- **Image:** gcr.io/crtlpyme-477300/crtlpyme@sha256:032d2c...
- **Port:** 3000
- **CPU Limit:** 2 vCPU
- **Memory Limit:** 2 GiB

**Scaling Configuration:**
- **Type:** Automatic
- **Min Instances:** 0
- **Max Instances:** 10
- **Concurrency:** 160 requests per instance (DIFFERENT from crtlpyme)
- **Request Timeout:** 300 seconds (5 minutes)

**Authentication:**
- **Public Access:** Disabled (Requires authentication) ⚠️
- **Ingress:** All traffic allowed

**Environment Variables (11 total):**
1. `NODE_ENV` - Value: `production`
2. `NEXT_PUBLIC_APP_NAME` - Value: `CRTLPyme`
3. `GOOGLE_CLOUD_PROJECT_ID` - Value: `crtlpyme-477300`
4. `DATABASE_URL` - Secret reference: `DATABASE_URL:latest`
5. `NEXTAUTH_SECRET` - Secret reference: `NEXTAUTH_SECRET:latest`
6. `NEXTAUTH_URL` - Secret reference: `NEXTAUTH_URL:latest`
7. `SENDGRID_API_KEY` - Secret reference: `SENDGRID_API_KEY:latest`
8. `SENDGRID_FROM_EMAIL` - Secret reference: `SENDGRID_FROM_EMAIL:latest`
9. `TRANSBANK_API_KEY` - Secret reference: `transbank-api-key:latest`
10. `TRANSBANK_COMMERCE_CODE` - Secret reference: `transbank-commerce-code:latest`
11. `TRANSBANK_ENVIRONMENT` - Secret reference: `TRANSBANK_ENVIRONMENT:latest`

**Cloud SQL Connections:**
- ❌ **NO Cloud SQL connection configured!** This is a critical issue.

**Billing:**
- Based on requests (pay-per-use)
- CPU allocated during startup

**Current Metrics:**
- **Requests:** 0 (at time of review)

---

### 1.3 Key Differences Between Services

| Feature | crtlpyme (MAIN) | crtlpyme-app (DUPLICATE) |
|---------|-----------------|--------------------------|
| **Authentication** | Public (unauthenticated) | Requires authentication |
| **Concurrency** | 80 | 160 |
| **Cloud SQL Connection** | ✅ Connected | ❌ NOT Connected |
| **Environment Variables** | 7 (minimal) | 11 (includes NODE_ENV, etc.) |
| **Container Image** | Different SHA256 | Different SHA256 |
| **Last Deployment** | ~54 min ago | ~38 min ago |

**⚠️ CRITICAL FINDING:** The `crtlpyme-app` service does NOT have Cloud SQL connectivity configured, which means it cannot access the database properly. This is likely why it's not functioning correctly.

---

## 2. CLOUD SQL DATABASE

### 2.1 Instance Details

**Basic Information:**
- **Instance ID:** crtlpyme-db
- **Database Engine:** PostgreSQL 15.14
- **Edition:** Enterprise
- **Status:** ✅ Running (Active)
- **Region:** us-central1-a
- **Zonal Availability:** ⚠️ Single zone (no high availability)

**Connection Information:**
- **Instance Connection Name:** crtlpyme-477300:us-central1:crtlpyme-db
- **Public IP Address:** 136.116.45.158
- **Outgoing IP Address:** 34.28.82.6
- **Port:** 5432 (standard PostgreSQL)
- **Private IP:** Disabled
- **Public IP:** Enabled

**Resource Configuration:**
- **vCPUs:** 4
- **Memory:** 16 GB
- **Storage Type:** SSD
- **Storage Size:** 100 GB
- **Automatic Storage Increase:** ✅ Enabled

**Backup Configuration:**
- **Automated Backups:** ✅ Enabled
- **Backup Level:** Standard
- **Point-in-Time Recovery:** ✅ Enabled
- **Backup Retention After Deletion:** ✅ Enabled

**Security Configuration:**
- **Instance Deletion Prevention:** ✅ Enabled
- **SSL/TLS Encryption:** ❌ Disabled
- **Require SSL Connections Only:** ❌ Disabled
- **Require Trusted Client Certificates:** ❌ Disabled
- **Server Certificate Authority:** Google-managed internal CA
- **Certificate Expiration:** November 3, 2035, 2:45:59 AM

---

### 2.2 Network Security

**Authorized Networks:**
- ⚠️ **CRITICAL SECURITY ISSUE:** Network "Acceso-Cloud-Shell" allows access from **0.0.0.0/0** (ANY IP ADDRESS)
- This means the database is publicly accessible from anywhere on the internet
- **Recommendation:** Restrict to specific IP ranges or use Cloud SQL Proxy only

**Connection Methods:**
- **Google Cloud Service Authorization:** ❌ Disabled
- **App Engine Authorization:** ❌ Disabled

---

### 2.3 Databases

The Cloud SQL instance contains **2 databases**:

1. **crtlpyme** (Application database)
   - Collation: en_US.UTF8
   - Character Set: UTF8
   - Contains 72 users (as per previous information)

2. **postgres** (System database)
   - Collation: en_US.UTF8
   - Character Set: UTF8
   - Default PostgreSQL system database

---

### 2.4 Database Users

**Database User:**
- **Username:** postgres
- **Authentication Type:** Built-in (Integrado)
- **Password Status:** N/A (configured)

---

### 2.5 Instance Health Issues (3 detected)

1. **🔴 Security - Exposure to Wide Range of Public IPs**
   - The instance allows connections from 0.0.0.0/0
   - High security risk
   - Recommendation: Restrict to specific IPs or use private IP

2. **🟡 Audit Not Enabled**
   - Database audit logging is not configured
   - Recommendation: Enable for compliance and security monitoring

3. **🟡 No User Password Policies**
   - No password complexity requirements configured
   - Recommendation: Implement password policies

---

## 3. SECRET MANAGER

The project uses **10 secrets** stored in Google Secret Manager:

| Secret Name | Purpose | Replication | Status |
|-------------|---------|-------------|--------|
| `DATABASE_URL` | PostgreSQL connection string | Automatic | Active |
| `database-password` | Database password | Automatic | Active |
| `JWT_SECRET` | JWT token signing | Automatic | Active |
| `NEXTAUTH_SECRET` | NextAuth.js secret | Automatic | Active |
| `NEXTAUTH_URL` | NextAuth.js callback URL | Automatic | Active |
| `SENDGRID_API_KEY` | SendGrid email API key | Automatic | Active |
| `SENDGRID_FROM_EMAIL` | SendGrid sender email | Automatic | Active |
| `TRANSBANK_ENVIRONMENT` | Transbank environment (sandbox/prod) | Automatic | Active |
| `transbank-api-key` | Transbank payment API key | Automatic | Active |
| `transbank-commerce-code` | Transbank commerce code | Automatic | Active |

**Secret Versions:**
- `NEXTAUTH_URL` has 4 versions (latest: version 4, created 10/11/25 6:27 PM)
- All secrets are Google-managed with automatic replication
- All secrets are in "Enabled" state

**Note:** Secret values are not displayed in this report for security reasons.

---

## 4. CONTAINER REGISTRY / ARTIFACT REGISTRY

### 4.1 Repositories

The project has **3 container repositories**:

1. **cloud-run-source-deploy**
   - Format: Docker
   - Type: Standard
   - Region: us-central1 (Iowa)
   - Status: Active
   - Purpose: Cloud Run source deployments

2. **crtlpyme** (Main application repository)
   - Format: Docker
   - Type: Standard
   - Region: us-central1 (Iowa)
   - Status: Active
   - Contains: 13 image versions
   - Image sizes: 118.6 MB - 118.8 MB
   - Last updated: 2 days ago

3. **gcr.io** (Legacy Container Registry)
   - Format: Docker
   - Type: Standard
   - Region: us (multiple regions in United States)
   - Status: Active

---

### 4.2 Container Images

**Repository: crtlpyme**
- **Image Name:** crtlpyme
- **Total Versions:** 13
- **Creation Date:** 2 days ago
- **Last Update:** 2 days ago
- **Size Range:** 118.6 MB - 118.8 MB

All 13 versions were created on the same day (2 days ago), suggesting multiple deployment attempts or iterations.

---

## 5. DOMAIN CONFIGURATION

**Custom Domains:**
- ❌ **No custom domain mappings configured**
- Both services are using default Cloud Run URLs:
  - `crtlpyme-399888129827.us-central1.run.app`
  - `crtlpyme-app-399088129827.us-central1.run.app`

**Recommendation:** Configure a custom domain for production use (e.g., app.crtlpyme.cl or crtlpyme.cl)

---

## 6. IDENTIFIED ISSUES AND DUPLICATES

### 6.1 Duplicate Services ⚠️

**DUPLICATE DETECTED:** Two Cloud Run services exist:
- `crtlpyme` (Main service with Cloud SQL connection)
- `crtlpyme-app` (Duplicate without Cloud SQL connection)

**Analysis:**
- Both services appear to run the same application
- Different container images (different SHA256 hashes)
- Different deployment times (crtlpyme is older)
- `crtlpyme-app` is missing critical Cloud SQL connection
- `crtlpyme-app` requires authentication (not publicly accessible)
- Both services have 0 requests, indicating neither is actively used

**Recommendation:**
- **KEEP:** `crtlpyme` service (has proper Cloud SQL connection)
- **CONSIDER REMOVING:** `crtlpyme-app` service (missing database connection, requires auth)

---

### 6.2 Security Issues 🔴

1. **Database Publicly Accessible**
   - Cloud SQL allows connections from 0.0.0.0/0
   - High risk of unauthorized access
   - **Action Required:** Restrict to specific IPs or use private networking

2. **SSL/TLS Not Enforced**
   - Database connections don't require SSL
   - Data transmitted in plain text
   - **Action Required:** Enable SSL requirement

3. **No Audit Logging**
   - Database activities not logged
   - Compliance and security monitoring gaps
   - **Action Required:** Enable Cloud SQL audit logs

4. **No Password Policies**
   - Weak passwords allowed
   - **Action Required:** Implement password complexity requirements

---

### 6.3 Configuration Issues ⚠️

1. **crtlpyme-app Missing Cloud SQL Connection**
   - Service cannot access database
   - Will fail on any database operation
   - **Action Required:** Either add Cloud SQL connection or remove service

2. **No High Availability**
   - Cloud SQL is single-zone (us-central1-a)
   - No automatic failover
   - **Action Required:** Consider enabling high availability for production

3. **No Custom Domain**
   - Using default Cloud Run URLs
   - Not production-ready
   - **Action Required:** Configure custom domain

4. **Authentication Mismatch**
   - `crtlpyme` allows public access
   - `crtlpyme-app` requires authentication
   - Inconsistent configuration
   - **Action Required:** Standardize authentication approach

---

## 7. RESOURCE UTILIZATION

**Current Usage (at time of review):**
- **Cloud Run Requests:** 0 on both services
- **Database Connections:** Unknown (not visible in console)
- **Storage Used:** Unknown (not visible in overview)

**Observation:** Both services show 0 requests, suggesting:
- Services may not be actively used
- Services may have just been deployed
- There may be issues preventing access

---

## 8. COST OPTIMIZATION OPPORTUNITIES

1. **Duplicate Service Removal**
   - Remove `crtlpyme-app` to eliminate redundant costs
   - Estimated savings: ~50% of Cloud Run costs

2. **Database Right-Sizing**
   - Current: 4 vCPUs, 16 GB RAM
   - Consider monitoring actual usage and downsizing if underutilized

3. **Container Image Cleanup**
   - 13 container images stored
   - Consider implementing image retention policy
   - Keep only last 3-5 versions

4. **Scaling Configuration**
   - Min instances: 0 (good for cost)
   - Max instances: 10 (may be high for small business app)
   - Consider reducing max instances if not needed

---

## 9. RECOMMENDATIONS SUMMARY

### Immediate Actions (High Priority)

1. **✅ Keep `crtlpyme` service** - It has proper Cloud SQL connection
2. **🗑️ Remove or fix `crtlpyme-app` service** - Missing database connection
3. **🔒 Restrict database access** - Remove 0.0.0.0/0 from authorized networks
4. **🔐 Enable SSL for database** - Encrypt data in transit
5. **🔑 Update Transbank keys** - Use sandbox keys as requested by user

### Short-term Actions (Medium Priority)

6. **🌐 Configure custom domain** - For production readiness
7. **📊 Enable audit logging** - For security and compliance
8. **🔄 Implement password policies** - Strengthen security
9. **🧹 Clean up old container images** - Reduce storage costs
10. **📝 Document which service is production** - Clarify deployment strategy

### Long-term Actions (Low Priority)

11. **🏗️ Enable high availability** - For production resilience
12. **📈 Monitor and optimize resources** - Right-size database and Cloud Run
13. **🔐 Implement private networking** - Use VPC for Cloud SQL
14. **🚀 Set up CI/CD pipeline** - Automate deployments from GitHub

---

## 10. NEXT STEPS

Based on user's request to focus on **"crtlpyme"** service:

1. **Verify `crtlpyme` service is working**
   - Test URL: https://crtlpyme-399888129827.us-central1.run.app
   - Verify login functionality
   - Check database connectivity

2. **Fix authentication issues**
   - Verify NEXTAUTH_URL points to correct service
   - Test user login with existing accounts
   - Create test accounts if needed

3. **Update Transbank configuration**
   - Set sandbox API keys
   - Verify payment integration

4. **Decision on `crtlpyme-app`**
   - Delete if not needed
   - Or fix Cloud SQL connection if it serves a purpose

5. **Security hardening**
   - Restrict database access
   - Enable SSL
   - Enable audit logging

---

## 11. TECHNICAL SPECIFICATIONS SUMMARY

### Cloud Run Service: crtlpyme
```
Service URL: https://crtlpyme-399888129827.us-central1.run.app
Region: us-central1
Container: gcr.io/crtlpyme-477300/crtlpyme@sha256:93abc...
Port: 3000
CPU: 2 vCPU
Memory: 2 GiB
Scaling: 0-10 instances
Concurrency: 80
Timeout: 300s
Authentication: Public
Cloud SQL: ✅ crtlpyme-477300:us-central1:crtlpyme-db
```

### Cloud Run Service: crtlpyme-app
```
Service URL: https://crtlpyme-app-399088129827.us-central1.run.app
Region: us-central1
Container: gcr.io/crtlpyme-477300/crtlpyme@sha256:032d2c...
Port: 3000
CPU: 2 vCPU
Memory: 2 GiB
Scaling: 0-10 instances
Concurrency: 160
Timeout: 300s
Authentication: Required
Cloud SQL: ❌ NOT CONNECTED
```

### Cloud SQL Instance: crtlpyme-db
```
Connection Name: crtlpyme-477300:us-central1:crtlpyme-db
Engine: PostgreSQL 15.14
Edition: Enterprise
vCPUs: 4
Memory: 16 GB
Storage: 100 GB SSD
Public IP: 136.116.45.158
Port: 5432
Databases: crtlpyme, postgres
Zone: us-central1-a
High Availability: ❌ Disabled
```

---

## 12. CONCLUSION

The CRTLPyme project has a **duplicate deployment issue** with two Cloud Run services. The main service `crtlpyme` is properly configured with Cloud SQL connectivity, while `crtlpyme-app` is missing this critical connection and requires authentication, making it inaccessible and non-functional.

**Key Findings:**
- ✅ Main service (`crtlpyme`) is properly configured
- ❌ Duplicate service (`crtlpyme-app`) is misconfigured
- 🔴 Critical security issue: Database accessible from any IP
- ⚠️ No custom domain configured
- ⚠️ No high availability setup
- 📊 Both services show 0 requests (not actively used or just deployed)

**Primary Recommendation:** Focus on the `crtlpyme` service, fix authentication issues, update Transbank keys to sandbox, and address security concerns. Consider removing `crtlpyme-app` service to eliminate confusion and reduce costs.

---

**Report Generated:** November 10, 2025  
**Review Completed By:** DeepAgent (Automated GCP Review)  
**Review Type:** READ-ONLY (No changes made)  
**Project:** CRTLPyme (crtlpyme-477300)
