# GoDaddy cPanel Deployment Guide (Static React + Supabase)
## Louka Engineering Website & Review System

**Architecture:** Static React 18 + Supabase Backend  
**Hosting Target:** GoDaddy Web Hosting Economy with cPanel (`public_html/`)  
**Server Runtime Required on GoDaddy:** NONE (100% PHP-Free, Node-Free Apache Hosting)  
**Database & Auth:** Supabase PostgreSQL & Row Level Security  

---

## 🚀 Quick Deployment (3 Minutes)

We have created the pre-built, production-ready ZIP file for your cPanel:  
📁 [`loukaengg-godaddy-public_html.zip`](file:///d:/loui/louka-review-system-smooth-animation/loukaengg-godaddy-public_html.zip) *(136 KB)*

It contains:
- `index.html` (SEO, Schema.org LocalBusiness JSON-LD)
- `assets/` (Hashed JavaScript & Tailwind CSS bundles)
- `.htaccess` (HTTPS enforcement, SPA routing, 1-year caching, security headers)

---

### Step 1: Clean Up Previous Application Manager Setup

1. In cPanel, go to **Software** → **Application Manager**.
2. If `louka` is listed, click the **Delete** / Trash icon to remove it (since GoDaddy shared hosting only supports Ruby in Application Manager).
3. In cPanel, open **File Manager**.
4. If you have a `/home/yourusername/louka` folder, you can safely delete it.

---

### Step 2: Upload to `public_html/`

1. In cPanel **File Manager**, open the **`public_html`** folder.
2. If there are any old files or default GoDaddy files inside `public_html`, select all and delete them.
3. Click the **Upload** button in the top toolbar.
4. Upload [`loukaengg-godaddy-public_html.zip`](file:///d:/loui/louka-review-system-smooth-animation/loukaengg-godaddy-public_html.zip).
5. Once the upload bar reaches **100% (green)**, click **Go Back to "/public_html"**.
6. Right-click `loukaengg-godaddy-public_html.zip` and select **Extract** → **Extract Files**.
7. Delete the `.zip` file from `public_html` to keep things tidy.

You will see:
```text
/home/yourusername/public_html/
├── .htaccess
├── index.html
├── brand/
│   ├── logo.png
│   ├── logo.jpg
│   └── logo.svg
└── assets/
    ├── index-KoJHEr0K.js
    └── index-DrykD_6G.css
```

---

### Step 3: Create Your Admin Account in Supabase (For `/admin`)

1. Go to your Supabase Dashboard: [supabase.com](https://supabase.com).
2. On the left menu, click **Authentication** (person icon).
3. In the top-right, click **Add User** → **Create User**.
4. Enter:
   - **Email**: `edward@loukaengg.com` (or your email)
   - **Password**: *(your strong password)*
   - Make sure **Auto Confirm User** is checked.
5. Click **Create User**.

---

### Step 4: Visit Your Website!

Open your browser and go to:  
👉 **`https://loukaengg.com`** (or `https://www.loukaengg.com`)

1. **Homepage**: The website will load instantly with smooth animations, spec counters, and the 10 approved customer reviews.
2. **Contact Form**: Test submitting an inquiry; it will save directly to your Supabase `inquiries` table with zero delay.
3. **Admin Dashboard**: Go to `https://loukaengg.com/admin` and sign in with the email and password you created in Step 3!
