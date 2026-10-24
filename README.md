# Louka Engineering — Modern Website & Review System

A fully modern, secure, and high-performance full-stack web application for **Louka Engineering** (Trichy, Tamil Nadu), built using **React**, **TypeScript**, **Tailwind CSS**, **Node.js**, and **Express.js**.

This project has been completely migrated from legacy HTML, CSS, JavaScript, and PHP to a unified modern TypeScript technology stack with **zero PHP runtime dependencies**.

---

## 🚀 Technology Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS (preserving industrial aesthetics, custom animations, and responsive layouts)
- **Backend**: Node.js (LTS) + TypeScript + Express.js
- **API**: RESTful API with backward-compatible legacy URL aliases
- **Validation**: Zod schema validation for all endpoints
- **Email Service**: Nodemailer (SMTP with production validation & disk persistence)
- **SMS Service**: Pluggable provider service (Twilio REST API / Fast2SMS / Console)
- **Database**: Preserved JSON store (`data/reviews.json`) with atomic file operations and automated daily rotating backups (`data/backups/`)
- **Testing**: Vitest + Supertest (14 automated tests covering validation, auth, CSRF, uploads, and moderation)

---

## 📁 Repository Structure

```
├── client/                          # Modern React Frontend (Vite + Tailwind)
│   ├── src/
│   │   ├── components/
│   │   │   ├── admin/               # Admin dashboard & review editor
│   │   │   ├── common/              # Brand logo, Star rating, WhatsApp button
│   │   │   ├── layout/              # Header, Footer, Branded Loading Screen
│   │   │   └── sections/            # Hero, About, Services, Specs, Reviews, Contact
│   │   ├── i18n/                    # Multilingual dictionaries (EN, TA, HI)
│   │   ├── App.tsx                  # Root application & routing
│   │   ├── index.css                # Tailwind CSS directives & custom animations
│   │   └── main.tsx
│   ├── index.html                   # HTML entry with SEO & Schema.org JSON-LD
│   ├── package.json
│   ├── tailwind.config.ts           # Design tokens & color system
│   └── vite.config.ts               # Vite build & API proxy setup
├── data/                            # Persistent Data Storage
│   ├── reviews.json                 # Active database (10 seed reviews intact)
│   ├── reviews.backup.json          # Static backup copy
│   ├── backups/                     # Automated rotating daily backups (last 30 days)
│   ├── inquiries.json               # Persisted contact inquiries
│   ├── sessions.json                # Persisted admin sessions
│   ├── rate-limits.json             # Salted IP rate-limiting logs
│   └── uploads/                     # Validated review photos
├── src/                             # Node.js + Express Backend
│   ├── config/                      # Strongly-typed environment configuration
│   ├── controllers/                 # REST controllers (Reviews, Admin, Contact, Photos)
│   ├── middlewares/                 # Auth, Rate limiting, Uploads (Multer), Errors
│   ├── routes/                      # REST routes & backward-compatible aliases
│   ├── services/                    # Store service, Email (Nodemailer), SMS, Auth
│   ├── types/                       # Shared TypeScript type definitions
│   ├── validators/                  # Zod validation schemas
│   └── server.ts                    # Express application entrypoint
├── tests/                           # Vitest & Supertest automated test suite
├── .env.example                     # Environment configuration reference
├── .gitignore                       # Clean Git configuration
├── package.json                     # Root scripts & dependencies
└── tsconfig.json                    # Backend TypeScript configuration
```

---

## 🛠️ Quick Start

### 1. Prerequisites
- **Node.js**: v18.0.0 or later (v20+ recommended)
- **npm** or **pnpm**
- **PHP is NOT required**

### 2. Environment Setup
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

Configure your `.env` variables:
```env
PORT=3000
NODE_ENV=production
SITE_URL=https://www.loukaengg.com

# REQUIRED IN PRODUCTION: Set your secure admin password or bcrypt hash
ADMIN_PASSWORD=your_secure_password_here
ADMIN_PASSWORD_HASH=
ADMIN_SESSION_LIFETIME=1500
SESSION_SECRET=your_secure_random_session_secret
IP_HASH_SALT=your_random_salt_for_ip_hashes

# Notifications & Contact
NOTIFY_EMAIL=edward@loukaengg.com
REVIEWS_PER_PAGE=6
# Louka Engineering WhatsApp: +91 86675 56619
WHATSAPP_NUMBER=918667556619
PUBLISH_IMMEDIATELY=true
RATE_LIMIT_HOURS=24
```

### 3. Install Dependencies
```bash
# Install root backend dependencies
npm install

# Install frontend client dependencies
npm --prefix client install
```

### 4. Build Application
```bash
# Build React frontend into client/dist/
npm run client:build

# Build Node.js backend into dist/
npm run build
```

### 5. Run the Application

**Development Mode (with Live Reload):**
```bash
npm run dev
# In a separate terminal:
npm run client:dev
```

**Production Mode:**
```bash
npm start
```
The application will be live at `http://localhost:3000`.

---

## 🧪 Testing

Run the full automated test suite with Vitest:
```bash
npm test
```
The test suite (14 tests) validates:
- Review statistics and 5-star histogram calculations
- Public reviews API (`GET /api/reviews` & legacy `/reviews.php`) returning only approved reviews
- Anti-spam honeypot enforcement
- Binary image magic byte verification (rejecting corrupt or spoofed files before writing to disk)
- Photo streaming endpoint with immutable caching headers
- Contact form honeypot, 10-digit Indian phone number validation, and disk inquiry persistence
- Admin authentication, bcrypt hashing, and session cookie generation
- CSRF protection (enforcing header verification and rejecting query-string tokens)
- Admin review moderation actions (Approve, Feature, Verify, Remove Photo, Delete)

---

## 🔒 Security Hardening

1. **No Hardcoded Passwords**: Fallback passwords are removed. Production startup fails fast if credentials are not configured.
2. **Brute-Force Login Throttling**: The `/api/admin/login` and `/admin.php` endpoints limit failed attempts to 5 per 15-minute window per IP.
3. **Bcrypt Password Security**: Passwords can be stored as salted bcrypt hashes (`$2a$`, `$2b$`).
4. **Spoof-Proof Rate Limiting**: Client IP extraction relies on Express trusted proxy parsing (`req.ip`), preventing `X-Forwarded-For` spoofing.
5. **Memory-First Upload Validation**: Photo uploads are held in memory buffer and verified for real JPEG/PNG/WebP magic bytes. Rejected uploads never touch disk.
6. **Inquiry Data Persistence**: Contact submissions are saved to `data/inquiries.json` before attempting email dispatch, ensuring no inquiry is ever lost.
7. **Strict CORS Policy**: Restricted strictly to `SITE_URL` and trusted local development hosts.
8. **Header-Only CSRF**: CSRF tokens are accepted only from headers/body, never from URLs.
9. **Persistent Admin Sessions**: Sessions are HMAC-signed, verified on every request, and persisted to `data/sessions.json`.
10. **Content Security Policy**: Helmet configured with strict CSP allowing only self, Google Fonts, and trusted assets.

---

## 🌐 Backward-Compatible Endpoints

| Legacy Endpoint | Modern Implementation | Status |
| :--- | :--- | :--- |
| `GET /reviews.php` | Maps to `ReviewController.getReviews` | Active (100% compatible) |
| `POST /reviews.php`| Maps to `ReviewController.submitReview` | Active (100% compatible) |
| `GET /review-photo.php?id=...` | Maps to `PhotoController.getPhoto` | Active (100% compatible) |
| `POST /contact.php`| Maps to `ContactController.submitContact` | Active (100% compatible) |
| `GET /admin.php` | Redirects to `/admin` | Active (100% compatible) |

---

## 👤 Admin Portal

- **URL**: `http://localhost:3000/admin`
- Set `ADMIN_PASSWORD` or `ADMIN_PASSWORD_HASH` in `.env`.
- **Features**:
  - Live metric counters (Pending, Approved, Rejected)
  - Real-time search across client names, companies, and review text
  - Moderation actions: Approve, Reject, Feature spotlight, Verify customer badge, Edit modal, Remove photo, Delete review.
