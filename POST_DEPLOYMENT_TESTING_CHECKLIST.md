# Post-Deployment Testing Checklist
## Louka Engineering Website & Review System

Perform this step-by-step verification protocol immediately after deploying to **GoDaddy cPanel** to ensure complete functionality, security, and performance.

---

## 🔍 Phase 1: Security & Header Verification

Run these checks using your browser DevTools (Network tab) or `curl`:

- [ ] **HTTPS Enforcement**:
  - Visit `http://yourdomain.com` (plain HTTP).
  - Verify immediate 301 redirection to `https://yourdomain.com`.
- [ ] **Security Headers**:
  - Inspect response headers for any page or API request:
    - `X-Content-Type-Options: nosniff`
    - `X-Frame-Options: DENY`
    - `X-XSS-Protection: 1; mode=block`
    - `Referrer-Policy: strict-origin-when-cross-origin`
    - `Content-Security-Policy`: Present and restricts script-src and style-src.
- [ ] **Data File Protection (Critical)**:
  - Attempt to directly access:
    - `https://yourdomain.com/.env` → **Must return 403 Forbidden or 404 Not Found**.
    - `https://yourdomain.com/data/reviews.json` → **Must return 403 Forbidden**.
    - `https://yourdomain.com/package.json` → **Must return 403 Forbidden**.
    - `https://yourdomain.com/data/inquiries.json` → **Must return 403 Forbidden**.
- [ ] **CORS Verification**:
  - Attempt an API request from an untrusted origin:
    ```bash
    curl -H "Origin: https://malicious-site.com" -I https://yourdomain.com/api/reviews
    ```
  - Verify that `Access-Control-Allow-Origin: https://malicious-site.com` is **NOT** returned.

---

## 🎨 Phase 2: Frontend UI, UX & Responsiveness

- [ ] **Initial Page Load & Brand Animation**:
  - Open `https://yourdomain.com`.
  - The Louka Engineering loading screen displays on first visit and dismisses cleanly after ~1.6s.
  - Refresh the page: Loading screen does not re-display (session storage flag active).
- [ ] **Hero Section & Video/Animation Controls**:
  - Confirm video/gradient background renders smoothly.
  - Test play/pause toggle button.
  - Hover over testimonials card: confirm rotation pauses on mouse hover.
- [ ] **Equipment Specifications Counter**:
  - Scroll down to the BOIS Stud Welding specs section.
  - Verify counters smoothly animate up to 25mm, 3000A, 100%, and 40 studs/min.
- [ ] **Multilingual Switcher**:
  - Click language selector in header (English / தமிழ் / हिन्दी).
  - Confirm all headings, navigation items, contact form cards & placeholders, review filters, and relative timestamps translate immediately without text collision.
- [ ] **Mobile Responsive & Zoom Accessibility**:
  - Open browser DevTools in Mobile Device Mode (iPhone 14 / Pixel 7).
  - Verify mobile hamburger menu opens, toggles, and navigates properly.
  - Test pinch-to-zoom: confirm zooming up to 200% works cleanly without viewport lock.
- [ ] **WhatsApp Floating Action Button**:
  - Click the floating WhatsApp button in the bottom right.
  - Confirm the link target opens `https://wa.me/918667556619` with pre-filled consultation text.

---

## ⭐ Phase 3: Review System Workflows

- [ ] **Review Display**:
  - Scroll down to the Client Reviews section.
  - Verify the 10 approved seed reviews render with star ratings, client names, roles, and company tags.
  - Verify rating summary card shows accurate 4.8 / 5.0 rating with 5-star histogram breakdown.
- [ ] **Submit New Review (Legitimate)**:
  - Click "Write a Review" button.
  - Fill in:
    - Name: `Site Engineer Test`
    - Role: `Quality Manager`
    - Company: `Apex Infra`
    - Service: `Stud Fixing`
    - Rating: 5 stars
    - Review text: `Verified high-strength shear stud welding on Trichy flyover project.`
  - Submit form:
    - Form shows success state.
    - If `PUBLISH_IMMEDIATELY=true`, review appears on the page.
    - If `PUBLISH_IMMEDIATELY=false`, review enters pending state for admin approval.
- [ ] **Photo Upload Verification**:
  - Submit a review with a valid JPEG/PNG photo (< 2 MB).
  - Verify image uploads and photo thumbnail displays correctly via `/review-photo.php?id=...` or `/data/uploads/...`.
  - Submit a review with an invalid file (e.g. `.exe` renamed to `.jpg`):
    - Verify server rejects the upload with 400 Bad Request due to binary magic bytes check.
- [ ] **Anti-Spam Honeypot Verification**:
  - Submit a POST request with the hidden `website` field filled.
  - Verify server responds immediately with `400 Bad Request` and no review is stored.
- [ ] **Submission Rate Limiting**:
  - Attempt to submit a second review from the same IP within 24 hours.
  - Verify error message indicates rate limit cooldown.

---

## 📬 Phase 4: Contact Form & Inquiries

- [ ] **Submit Contact Inquiry**:
  - Scroll down to the Contact section.
  - Enter:
    - Name: `Karthik R`
    - Email: `karthik@example.com`
    - Phone: `9876543210` (10-digit Indian mobile number)
    - Message: `Need quote for 2500 shear studs on industrial warehouse floor in Trichy.`
  - Click "Send Message".
  - Verify success confirmation message appears.
- [ ] **Check Inquiries Persistence**:
  - In cPanel File Manager, view `/home/yourusername/louka/data/inquiries.json`.
  - Confirm inquiry was saved with UUID, timestamp, hashed IP, and details.
- [ ] **Check Email Delivery**:
  - Check the inbox for `NOTIFY_EMAIL` (`edward@loukaengg.com`).
  - Confirm notification email arrived with the submitted message details.

---

## 🔒 Phase 5: Admin Dashboard & Moderation

- [ ] **Access `/admin`**:
  - Navigate to `https://yourdomain.com/admin`.
  - Confirm branded login screen appears.
- [ ] **Brute-Force Rate Limiting Test**:
  - Enter incorrect password 5 times in a row.
  - On the 6th attempt, confirm error: `Too many login attempts. Please try again in 15 minutes.`
- [ ] **Successful Admin Authentication**:
  - Enter correct `ADMIN_PASSWORD`.
  - Confirm dashboard loads with stats overview (Total, Approved, Pending, Rejected).
- [ ] **Session Cookie Verification**:
  - In DevTools → Application → Cookies:
    - Confirm `louka_admin_session` cookie is present.
    - Flags: `HttpOnly: true`, `SameSite: Strict`, `Secure: true` (on HTTPS).
- [ ] **CSRF Protection Test**:
  - Attempt an admin action with a forged or missing `x-csrf-token` header:
  - Confirm request is rejected with `403 Forbidden: Invalid or missing CSRF token`.
- [ ] **Moderation Actions**:
  - **Approve**: Mark a pending review as approved; verify it appears publicly.
  - **Feature**: Toggle spotlight feature badge on a review.
  - **Verified Badge**: Toggle verified customer badge.
  - **Remove Photo**: Remove photo from an existing review.
  - **Delete**: Permanently delete a review from store.
- [ ] **Admin Logout**:
  - Click "Logout" in dashboard header.
  - Confirm session cookie is invalidated and user is redirected to login screen.

---

## 🔄 Phase 6: Backward Compatibility

Verify that existing legacy bookmarks and external links continue to function without error:

- [ ] `GET /reviews.php` → Returns JSON payload matching `/api/reviews`.
- [ ] `GET /review-photo.php?id=...` → Streams image with caching headers.
- [ ] `GET /admin.php` → Redirects smoothly to `/admin`.
- [ ] `POST /contact.php` → Successfully processes inquiry identically to `/api/contact`.

---

## 💾 Phase 7: Automated Backup Verification

- [ ] In cPanel File Manager, inspect `/home/yourusername/louka/data/backups/`.
- [ ] After submitting a review or moderating via admin, confirm a rotating backup file (`reviews-YYYY-MM-DD.json`) is generated automatically.
- [ ] Verify that backups older than 30 days are automatically pruned to prevent disk consumption.
