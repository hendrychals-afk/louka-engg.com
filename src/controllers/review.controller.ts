import { Request, Response, NextFunction } from 'express';
import fs from 'fs';
import path from 'path';
import { StoreService } from '../services/store.service';
import { EmailService } from '../services/email.service';
import { config } from '../config';
import { createReviewSchema } from '../validators/review.validator';
import { StoredReview } from '../types';
import { getClientIp } from '../middlewares/rate-limit.middleware';
import { validateImageMagicBytes } from '../middlewares/upload.middleware';

export class ReviewController {
  public static async getReviews(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const storeService = StoreService.getInstance();
      const store = storeService.loadStore();

      // SECURITY FIX: Public API only returns explicitly approved reviews
      const approvedReviews = store.reviews.filter((r) => r.status === 'approved');

      approvedReviews.sort((a, b) =>
        (b.createdAt || '').localeCompare(a.createdAt || '')
      );

      const publicList = approvedReviews.map((r) => storeService.formatPublicItem(r));
      const stats = storeService.computeStats(approvedReviews);
      const featured = storeService.findFeatured(approvedReviews);

      res.setHeader('Cache-Control', 'no-store');
      res.json({
        reviews: publicList,
        stats,
        featured,
        whatsappNumber: config.whatsappNumber,
        reviewsPerPage: config.reviewsPerPage,
      });
    } catch (err) {
      next(err);
    }
  }

  public static async submitReview(req: Request, res: Response, next: NextFunction): Promise<void> {
    let savedPhotoPath: string | null = null;

    try {
      // 1. Honeypot check first (no file processed or written if honeypot triggered)
      const honeypot = (req.body?.website || '').toString().trim();
      if (honeypot !== '') {
        res.status(400).json({ error: 'Invalid submission' });
        return;
      }

      // 2. Validate input schema with Zod
      const validatedData = createReviewSchema.parse(req.body);

      // 3. Inspect binary magic bytes of photo before writing to disk
      if (req.file && req.file.buffer) {
        const { valid, ext } = validateImageMagicBytes(req.file.buffer);
        if (!valid) {
          res.status(422).json({
            error: 'Photo file is corrupt or not a valid JPG, PNG, or WebP image.',
          });
          return;
        }

        const photoId = StoreService.getInstance().generateId();
        const photoFilename = `${photoId}${ext}`;
        const diskDest = path.join(config.uploadsDir, photoFilename);

        fs.writeFileSync(diskDest, req.file.buffer);
        savedPhotoPath = `data/uploads/${photoFilename}`;
      }

      // 4. Construct review object
      const storeService = StoreService.getInstance();
      const ip = getClientIp(req);
      const saltedIpHash = storeService.hashIp(ip);
      const now = new Date().toISOString();
      const isApproved = config.publishImmediately;

      const newReview: StoredReview = {
        id: storeService.generateId(),
        name: validatedData.name,
        role: validatedData.role,
        company: validatedData.company || '',
        service: validatedData.service,
        email: validatedData.email || '',
        rating: validatedData.rating,
        text: validatedData.text,
        source: 'Website',
        verified: false,
        status: isApproved ? 'approved' : 'pending',
        featured: false,
        photo: savedPhotoPath,
        createdAt: now,
        approvedAt: isApproved ? now : null,
        submittedIp: saltedIpHash,
      };

      // 5. Save to store
      const store = storeService.loadStore();
      store.reviews.unshift(newReview);
      const saved = await storeService.saveStore(store);

      if (!saved) {
        if (savedPhotoPath) {
          try {
            fs.unlinkSync(path.join(config.uploadsDir, path.basename(savedPhotoPath)));
          } catch {
            // ignore
          }
        }
        res.status(500).json({ error: 'Could not save review. Please try again.' });
        return;
      }

      // 6. RECORD RATE LIMIT ONLY ON SUCCESSFUL SUBMISSION
      storeService.recordRateLimit(ip);

      // 7. Notify admin
      EmailService.getInstance().notifyNewReview(newReview).catch((e) =>
        console.error('Email notification failed:', e)
      );

      // 8. Send JSON response
      const message = isApproved
        ? 'Thank you! Your review is now visible in the reviews area.'
        : 'Thank you! Your review has been submitted and is pending approval.';

      res.status(201).json({
        success: true,
        message,
        rating: newReview.rating,
        review: isApproved ? storeService.formatPublicItem(newReview) : null,
      });
    } catch (err) {
      if (savedPhotoPath) {
        try {
          fs.unlinkSync(path.join(config.uploadsDir, path.basename(savedPhotoPath)));
        } catch {
          // ignore
        }
      }
      next(err);
    }
  }
}
