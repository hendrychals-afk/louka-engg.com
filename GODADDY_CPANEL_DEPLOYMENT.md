# GoDaddy cPanel Deployment Guide
## Louka Engineering Website & Review System

This guide provides complete, production-grade instructions for deploying the **Louka Engineering** modern stack (React 18 + TypeScript + Node.js/Express) to **GoDaddy Web Hosting Economy with cPanel**.

---

## 📋 Table of Contents
1. [Hosting Environment Diagnosis & Crash Root Causes](#1-hosting-environment-diagnosis--crash-root-causes)
2. [Deployment Architecture](#2-deployment-architecture)
3. [Pre-Bundled Deployment Package](#3-pre-bundled-deployment-package)
4. [Step-by-Step cPanel Application Manager Deployment (Primary)](#4-step-by-step-cpanel-application-manager-deployment-primary)
5. [GoDaddy Email Relay Configuration](#5-godaddy-email-relay-configuration)
6. [Fallback Architecture: Static React + Supabase (Zero PHP)](#6-fallback-architecture-static-react--supabase-zero-php)
7. [Troubleshooting & Log Inspection](#7-troubleshooting--log-inspection)

---

## 1. Hosting Environment Diagnosis & Crash Root Causes

### Why Phusion Passenger Showed: *“We're sorry, but something went wrong.”*
When you deployed previously and visited the site, Phusion Passenger generated its error screen. This proves that **Phusion Passenger and Apache mod_passenger are actively running** on your GoDaddy server.

However, Passenger crashed during startup due to three specific root causes:

1. **Missing `node_modules` on the server**:
   GoDaddy Economy shared hosting does not expose `node` or `npm` in your terminal shell. Because `npm install` could not be executed on the server, `node_modules` was missing, and `require('express')` immediately threw `MODULE_NOT_FOUND`.
2. **Passenger socket / port parameter mismatch**:
   When Passenger runs an app in socket mode, it passes `'passenger'` or intercepts `http.Server.listen`. The application previously called `parseInt(process.env.PORT, 10)`, which converted `'passenger'` to `NaN`, throwing `RangeError [ERR_SOCKET_BAD_PORT]`.
3. **Working directory and `.env` location**:
   When Apache spawns Passenger, the process working directory (`process.cwd()`) may default to the system root instead of your application folder. Without `process.chdir(__dirname)`, `dotenv` could not locate `.env`, causing the fail-fast `ADMIN_PASSWORD` validation check to abort startup.

### How These Issues Have Been Fixed
- **Pre-Bundled Dependencies**: The new deployment package includes pre-bundled production `node_modules`. All 9 production packages (`express`, `bcryptjs`, `cors`, `helmet`, `nodemailer`, `multer`, `zod`, `dotenv`, `cookie-parser`) are **100% pure JavaScript** with zero native C++ compilation requirements. **You never need to run `npm install` in the terminal.**
- **Robust Passenger Entrypoint**: `app.js` and `dist/server.js` automatically detect Phusion Passenger (`app.listen('passenger')`), anchor `process.chdir(__dirname)`, explicitly load `.env` from the application directory, and enable `PassengerFriendlyErrorPages on`.

---

## 2. Deployment Architecture

```
                                  [ Incoming HTTPS Web Traffic ]
                                                │
                                                ▼
                         ┌──────────────────────────────────────────────┐
                         │      GoDaddy Apache Web Server (cPanel)      │
                         │    - Forces HTTPS redirection                │
                         │    - Serves cached static assets & images    │
                         │    - Blocks direct HTTP access to data/*.json│
                         └──────────────────────┬───────────────────────┘
                                                │
                                                ▼ (mod_passenger)
                         ┌──────────────────────────────────────────────┐
                         │       Phusion Passenger (app.js)             │
                         │     - Supervises Express.js process          │
                         │     - Connects via Passenger socket          │
                         └──────────────────────┬───────────────────────┘
                                                │
                                                ▼
                         ┌──────────────────────────────────────────────┐
                         │         Express.js Backend (dist/server.js)  │
                         │    ├── Pre-bundled node_modules (Pure JS)    │
                         │    ├── /api/reviews (Public approved reviews)│
                         │    ├── /api/contact (Spam-proof inquiries)   │
                         │    ├── /api/admin   (Moderation & sessions)  │
                         │    ├── Legacy routes (/reviews.php, etc.)    │
                         │    └── Single Page App (client/dist/*)       │
                         └──────────────────────┬───────────────────────┘
                                                │
                       ┌────────────────────────┼────────────────────────┐
                       ▼                        ▼                        ▼
              ┌─────────────────┐      ┌─────────────────┐      ┌─────────────────┐
              │ Atomic Storage  │      │ GoDaddy Relay   │      │ SMS Gateways    │
              │ - reviews.json  │      │ - Port 25       │      │ - Twilio        │
              │ - inquiries.json│      │ - No auth req.  │      │ - Fast2SMS      │
              │ - sessions.json │      │ - Unblocked     │      │                 │
              │ - backups/      │      └─────────────────┘      └─────────────────┘
              └─────────────────┘
```

---

## 3. Pre-Bundled Deployment Package

The deployment archive [`louka-review-system-cpanel-deploy.zip`](file:///d:/loui/louka-review-system-smooth-animation/louka-review-system-cpanel-deploy.zip) contains everything needed to run:

```
/home/yourusername/louka/
├── app.js                           # Hardened Passenger entrypoint
├── .htaccess                        # Apache rules, HTTPS, Passenger friendly errors
├── package.json
├── package-lock.json
├── .env.example
├── dist/                            # Compiled backend server (server.js, etc.)
├── client/
│   └── dist/                        # Compiled React 18 production bundle
├── data/
│   ├── reviews.json                 # Active database (10 seed reviews)
│   ├── uploads/ (.gitkeep)          # Storage for review photos
│   └── backups/ (.gitkeep)          # Rolling 30-day backups
└── node_modules/                    # PRE-BUNDLED production dependencies (pure JS)
```

---

## 4. Step-by-Step cPanel Application Manager Deployment (Primary)

### Step 4.1: Upload and Extract Application Files
1. Log into your GoDaddy cPanel account.
2. Open **File Manager** (under the **Files** section).
3. In your home directory (`/home/yourusername/`), check if the `louka` folder already exists from your previous attempt.
   - If it exists, delete any old contents inside it so you start clean.
   - If it does not exist, click **+ Folder** and create `louka`.
4. Open the `louka` folder.
5. Click **Upload** in the top toolbar.
6. Upload `louka-review-system-cpanel-deploy.zip`.
7. Once the progress bar reaches 100% (green), click **Go Back to "/home/.../louka"**.
8. Right-click the uploaded ZIP file and click **Extract** → **Extract Files**.
9. Verify that `app.js`, `dist/`, `client/`, `data/`, and `node_modules/` are all present directly inside `/home/yourusername/louka/`.

### Step 4.2: Create and Configure Your `.env` File
1. In File Manager, inside `/home/yourusername/louka/`:
2. Right-click `.env.example` and select **Copy**. Set the new name to `.env` (note the leading dot).
3. Right-click the newly created `.env` file and select **Edit**.
4. Set your production values:
   ```env
   NODE_ENV=production
   PORT=3000
   SITE_URL=https://loukaengg.com
   
   # REQUIRED: Set your administrator login password (at least 16 characters)
   ADMIN_PASSWORD=YourStrongPassword#2026!
   
   # Security Keys
   SESSION_SECRET=louka-prod-secret-9f8a3c2e1b4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f
   IP_HASH_SALT=louka-prod-salt-4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e
   
   # Louka Business Information
   NOTIFY_EMAIL=edward@loukaengg.com
   WHATSAPP_NUMBER=918667556619
   
   # GoDaddy Unblocked Internal Mail Relay
   SMTP_HOST=relay-hosting.secureserver.net
   SMTP_PORT=25
   SMTP_USER=
   SMTP_PASS=
   SMTP_SECURE=false
   FROM_EMAIL=noreply@loukaengg.com
   ```
5. Click **Save Changes** and close the editor.

### Step 4.3: Register Application in cPanel Application Manager
1. Return to the main cPanel dashboard.
2. In the **Software** section, click **Application Manager**.
3. If an existing `louka` application is listed:
   - Click **Edit** (pencil icon).
4. If no application is listed:
   - Click **Register Application**.
5. Configure the registration fields:
   - **Application Name**: `louka`
   - **Deployment Domain**: Select `loukaengg.com` (or `www.loukaengg.com`)
   - **Base URL**: `/` *(leave empty or slash to serve as root website)*
   - **Application Path**: `louka` *(points to `/home/yourusername/louka`)*
   - **Deployment Environment**: `production`
6. Click **Deploy** (or **Save**).

### Step 4.4: Restart Application & Test
1. In Application Manager, click the **Restart** icon or toggle the application state.
2. Open your web browser and visit:  
   👉 **`https://loukaengg.com`**
3. Verify that the homepage, animations, specs counter, and reviews load cleanly without the Passenger error screen.
4. Visit `https://loukaengg.com/admin` and log in with your `ADMIN_PASSWORD`.

---

## 5. GoDaddy Email Relay Configuration

GoDaddy Shared Hosting blocks standard external SMTP ports (587 and 465). The Louka Review System solves this by connecting through GoDaddy's internal relay network:

- **`SMTP_HOST`**: `relay-hosting.secureserver.net`
- **`SMTP_PORT`**: `25`
- **`SMTP_USER`**: *(leave empty)*
- **`SMTP_PASS`**: *(leave empty)*
- **`SMTP_SECURE`**: `false`

### Zero-Loss Guarantee
Even if GoDaddy's mail queue is delayed, every submitted inquiry is automatically saved to `/home/yourusername/louka/data/inquiries.json` before email dispatch is attempted. You can inspect customer messages at any time directly through File Manager.

---

## 6. Fallback Architecture: Static React + Supabase (Zero PHP)

If your GoDaddy account has strict LVE limits that terminate persistent background processes, **do not reintroduce PHP**. Instead, deploy using the **Static React + Supabase** architecture:

```
[ Visitor Browser ] 
        │
        ├── 1. Loads Static React Frontend from GoDaddy cPanel (public_html)
        │      (Zero server runtime required on GoDaddy — instant, fast & free)
        │
        └── 2. Communicates directly with Supabase via HTTPS REST / SDK
               ├── PostgreSQL Database (reviews, inquiries)
               ├── Supabase Auth (Secure admin login, no hardcoded passwords)
               ├── Row Level Security (RLS) (Public can only view approved reviews)
               └── Supabase Storage (Photo uploads)
```

### Setup Steps for Static + Supabase
1. Build client: `npm run client:build`.
2. Upload the contents of `client/dist/` into `/home/yourusername/public_html/`.
3. Copy `.htaccess` into `public_html/` to enable SPA routing:
   ```apache
   RewriteEngine On
   RewriteBase /
   RewriteCond %{REQUEST_FILENAME} !-f
   RewriteCond %{REQUEST_FILENAME} !-d
   RewriteRule ^ index.html [L]
   ```
4. Create a free project on [supabase.com](https://supabase.com).
5. Run the SQL schema provided in [`GODADDY_CPANEL_DEPLOYMENT.md`](#6-fallback-architecture-if-nodejs-app-is-not-available) to create `reviews` and `inquiries` tables with Row Level Security.
6. Configure `client/.env.production` with your public `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.

---

## 7. Troubleshooting & Log Inspection

### If Passenger Displays an Error
Because `PassengerFriendlyErrorPages on` is enabled in `.htaccess`, any runtime exception will now display the exact stack trace and file name directly in your browser instead of the generic "We're sorry, but something went wrong" screen.

### Check Server Error Logs in cPanel
1. In cPanel, click **File Manager**.
2. Open `/home/yourusername/louka/`.
3. Check `stderr.log` or `error.log`.
4. In main cPanel, search for **Errors** under the **Metrics** section to view Apache access/error logs.
