import { describe, it, expect, afterAll } from 'vitest';
import fs from 'fs';
import path from 'path';
import request from 'supertest';
import { app } from '../src/server';
import { config } from '../src/config';
import { ADMIN_COOKIE_NAME } from '../src/middlewares/auth.middleware';

describe('Express REST APIs & Security Suite', () => {
  let adminSessionCookie = '';
  let adminCsrfToken = '';
  let testReviewId = '';

  it('GET /api/reviews returns only approved reviews and stats', async () => {
    const res = await request(app).get('/api/reviews');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('reviews');
    expect(Array.isArray(res.body.reviews)).toBe(true);
    expect(res.body).toHaveProperty('stats');
    expect(res.body.stats).toHaveProperty('average');
    expect(res.body.stats).toHaveProperty('histogram');
    expect(res.body.whatsappNumber).toBe('918667556619');

    // Confirm all returned public reviews are approved
    for (const r of res.body.reviews) {
      expect(r).not.toHaveProperty('submittedIp');
      expect(r).not.toHaveProperty('email');
    }
  });

  it('GET /reviews.php backward-compatibility route returns identical payload', async () => {
    const res = await request(app).get('/reviews.php');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('reviews');
    expect(res.body).toHaveProperty('stats');
  });

  it('POST /api/reviews rejects honeypot submissions immediately without touching disk', async () => {
    const res = await request(app)
      .post('/api/reviews')
      .field('name', 'Spam Bot')
      .field('role', 'Bot')
      .field('text', 'Buy cheap crypto now')
      .field('rating', '5')
      .field('website', 'http://spam.ru'); // Honeypot filled

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Invalid submission');
  });

  it('POST /api/reviews rejects corrupt or invalid photo magic bytes', async () => {
    const fakeBuffer = Buffer.from('NOT_A_REAL_IMAGE_DATA_HEADER');

    const res = await request(app)
      .post('/api/reviews')
      .field('name', 'Test User')
      .field('role', 'Inspector')
      .field('text', 'Reviewing weld quality on girder.')
      .field('rating', '5')
      .attach('photo', fakeBuffer, { filename: 'spoofed.jpg', contentType: 'image/jpeg' });

    expect(res.status).toBe(422);
    expect(res.body.error).toContain('valid JPG, PNG, or WebP image');
  });

  it('POST /api/reviews accepts valid submission with real JPEG magic bytes', async () => {
    // Valid JPEG header: FF D8 FF E0 00 10 4A 46 49 46 00 01
    const validJpeg = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01]);

    const res = await request(app)
      .post('/api/reviews')
      .field('name', 'Automated Test User')
      .field('role', 'Quality Engineer')
      .field('company', 'Audit Corp')
      .field('service', 'Stud Fixing')
      .field('rating', '5')
      .field('text', 'Full penetration shear studs verified with 15-degree bend test.')
      .attach('photo', validJpeg, { filename: 'weld.jpg', contentType: 'image/jpeg' });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.review).toHaveProperty('id');
    testReviewId = res.body.review.id;
  });

  it('GET /api/reviews/:id/photo streams the uploaded photo with immutable caching', async () => {
    if (!testReviewId) return;

    const res = await request(app).get(`/api/reviews/${testReviewId}/photo`);
    expect(res.status).toBe(200);
    expect(res.header['content-type']).toContain('image/jpeg');
    expect(res.header['cache-control']).toContain('max-age=604800, immutable');
  });

  it('POST /api/contact rejects honeypot submissions', async () => {
    const res = await request(app)
      .post('/api/contact')
      .send({
        name: 'Spammer',
        email: 'spammer@example.com',
        phone: '9876543210',
        message: 'Spam text',
        website: 'http://spamsite.com',
      });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Invalid submission');
  });

  it('POST /api/contact validates phone numbers and persists inquiries', async () => {
    const invalidRes = await request(app)
      .post('/api/contact')
      .send({
        name: 'Tester',
        email: 'tester@example.com',
        phone: '12345',
        message: 'Hello Louka',
      });
    expect(invalidRes.status).toBe(422);

    const validRes = await request(app)
      .post('/api/contact')
      .send({
        name: 'Valid Tester',
        email: 'tester@example.com',
        phone: '9876543210',
        message: 'Inquiry regarding Trichy bypass bridge stud fixing project.',
      });
    expect(validRes.status).toBe(200);
    expect(validRes.body.success).toBe(true);
  });

  it('POST /api/admin/login enforces authentication and sets secure session cookie', async () => {
    const failRes = await request(app)
      .post('/api/admin/login')
      .send({ password: 'wrong-password' });
    expect(failRes.status).toBe(401);

    const successRes = await request(app)
      .post('/api/admin/login')
      .send({ password: 'louka-dev-admin-2026' });
    expect(successRes.status).toBe(200);
    expect(successRes.body.success).toBe(true);
    expect(successRes.body).toHaveProperty('csrfToken');

    adminCsrfToken = successRes.body.csrfToken;
    const cookies = successRes.header['set-cookie'];
    expect(cookies).toBeDefined();
    adminSessionCookie = cookies[0].split(';')[0];
  });

  it('Protected admin actions reject requests without valid CSRF in headers or body', async () => {
    if (!testReviewId) return;

    // Missing CSRF
    const missingCsrfRes = await request(app)
      .post('/api/admin/action')
      .set('Cookie', adminSessionCookie)
      .send({ action: 'approve', id: testReviewId });
    expect(missingCsrfRes.status).toBe(403);

    // SECURITY CHECK: Reject CSRF sent via query string!
    const queryCsrfRes = await request(app)
      .post(`/api/admin/action?csrf=${adminCsrfToken}`)
      .set('Cookie', adminSessionCookie)
      .send({ action: 'approve', id: testReviewId });
    expect(queryCsrfRes.status).toBe(403);
  });

  it('Protected admin actions succeed with valid CSRF in x-csrf-token header', async () => {
    if (!testReviewId) return;

    // Approve action
    const approveRes = await request(app)
      .post('/api/admin/action')
      .set('Cookie', adminSessionCookie)
      .set('x-csrf-token', adminCsrfToken)
      .send({ action: 'approve', id: testReviewId, csrf: adminCsrfToken });
    expect(approveRes.status).toBe(200);
    expect(approveRes.body.success).toBe(true);

    // Feature action
    const featureRes = await request(app)
      .post('/api/admin/action')
      .set('Cookie', adminSessionCookie)
      .set('x-csrf-token', adminCsrfToken)
      .send({ action: 'feature', id: testReviewId, csrf: adminCsrfToken });
    expect(featureRes.status).toBe(200);

    // Toggle verified action
    const verifyRes = await request(app)
      .post('/api/admin/action')
      .set('Cookie', adminSessionCookie)
      .set('x-csrf-token', adminCsrfToken)
      .send({ action: 'toggle_verified', id: testReviewId, csrf: adminCsrfToken });
    expect(verifyRes.status).toBe(200);

    // Remove photo action
    const removePhotoRes = await request(app)
      .post('/api/admin/action')
      .set('Cookie', adminSessionCookie)
      .set('x-csrf-token', adminCsrfToken)
      .send({ action: 'remove_photo', id: testReviewId, csrf: adminCsrfToken });
    expect(removePhotoRes.status).toBe(200);

    // Delete review action
    const deleteRes = await request(app)
      .post('/api/admin/action')
      .set('Cookie', adminSessionCookie)
      .set('x-csrf-token', adminCsrfToken)
      .send({ action: 'delete', id: testReviewId, csrf: adminCsrfToken });
    expect(deleteRes.status).toBe(200);
  });

  afterAll(() => {
    // Clean up temporary runtime files generated during tests
    const testRuntimeFiles = [
      config.inquiriesFile,
      config.sessionsFile,
      config.rateLimitsFile,
      path.resolve(config.dataDir, 'reviews.backup.json'),
    ];

    for (const file of testRuntimeFiles) {
      if (fs.existsSync(file)) {
        try {
          fs.unlinkSync(file);
        } catch {
          // Ignore
        }
      }
    }

    // Clean up test backup files in backups dir
    if (fs.existsSync(config.backupsDir)) {
      try {
        const files = fs.readdirSync(config.backupsDir);
        for (const file of files) {
          if (file.endsWith('.json')) {
            fs.unlinkSync(path.join(config.backupsDir, file));
          }
        }
      } catch {
        // Ignore
      }
    }
  });
});
