import { Request, Response, NextFunction } from 'express';
import fs from 'fs';
import path from 'path';
import { AuthService } from '../services/auth.service';
import { StoreService } from '../services/store.service';
import { config } from '../config';
import { ADMIN_COOKIE_NAME } from '../middlewares/auth.middleware';
import { adminLoginSchema, adminActionSchema } from '../validators/admin.validator';
import { getClientIp, recordFailedLogin, clearLoginAttempts } from '../middlewares/rate-limit.middleware';

export class AdminController {
  public static async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { password } = adminLoginSchema.parse(req.body);
      const authService = AuthService.getInstance();
      const ip = getClientIp(req);

      const isValid = await authService.verifyPassword(password);
      if (!isValid) {
        recordFailedLogin(ip);
        res.status(401).json({ error: 'Incorrect password.' });
        return;
      }

      clearLoginAttempts(ip);
      const { sessionId, csrfToken } = authService.createSession();

      res.cookie(ADMIN_COOKIE_NAME, sessionId, {
        httpOnly: true,
        secure: req.secure || config.nodeEnv === 'production',
        sameSite: 'lax',
        maxAge: config.adminSessionLifetimeSeconds * 1000,
        path: '/',
      });

      res.json({
        success: true,
        csrfToken,
        message: 'Authenticated successfully.',
      });
    } catch (err) {
      next(err);
    }
  }

  public static async logout(req: Request, res: Response): Promise<void> {
    const sessionId = req.cookies?.[ADMIN_COOKIE_NAME];
    if (sessionId) {
      AuthService.getInstance().destroySession(sessionId);
    }
    res.clearCookie(ADMIN_COOKIE_NAME, { path: '/' });
    res.json({ success: true, message: 'Logged out successfully.' });
  }

  public static async getStatus(req: Request, res: Response): Promise<void> {
    const sessionId = req.cookies?.[ADMIN_COOKIE_NAME];
    const { valid, session } = AuthService.getInstance().validateSession(sessionId);

    if (valid && session) {
      res.json({
        authenticated: true,
        csrfToken: session.csrfToken,
      });
    } else {
      res.json({
        authenticated: false,
      });
    }
  }

  public static async getReviews(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const storeService = StoreService.getInstance();
      const store = storeService.loadStore();
      const reviews = [...store.reviews].sort((a, b) =>
        (b.createdAt || '').localeCompare(a.createdAt || '')
      );
      const counts = storeService.getAdminSummary(reviews);

      res.json({
        reviews,
        counts,
      });
    } catch (err) {
      next(err);
    }
  }

  public static async handleAction(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = adminActionSchema.parse(req.body);
      const storeService = StoreService.getInstance();
      const store = storeService.loadStore();

      const index = store.reviews.findIndex((r) => r.id === data.id);
      if (index === -1) {
        res.status(404).json({ error: 'Review not found.' });
        return;
      }

      const review = store.reviews[index];
      const now = new Date().toISOString();

      const removePhotoFile = (photoPath: string | null) => {
        if (!photoPath) return;
        const filePath = path.join(config.uploadsDir, path.basename(photoPath));
        if (fs.existsSync(filePath)) {
          try {
            fs.unlinkSync(filePath);
          } catch (e) {
            console.error('Failed to unlink photo:', e);
          }
        }
      };

      switch (data.action) {
        case 'save': {
          if (!data.name || !data.role || !data.text || !data.rating) {
            res.status(422).json({ error: 'Name, role, text, and rating are required.' });
            return;
          }
          review.name = data.name;
          review.role = data.role;
          review.company = data.company || '';
          review.service = data.service || 'Other';
          review.source = data.source || 'Website';
          review.rating = data.rating;
          review.text = data.text;
          review.status = data.status || 'pending';
          if (typeof data.verified === 'boolean') {
            review.verified = data.verified;
          }
          if (review.status === 'approved' && !review.approvedAt) {
            review.approvedAt = now;
          }
          break;
        }

        case 'approve': {
          review.status = 'approved';
          review.approvedAt = now;
          break;
        }

        case 'reject': {
          review.status = 'rejected';
          review.featured = false;
          break;
        }

        case 'feature': {
          for (const other of store.reviews) {
            other.featured = false;
          }
          review.featured = true;
          review.status = 'approved';
          review.approvedAt = review.approvedAt || now;
          break;
        }

        case 'toggle_verified': {
          review.verified = !review.verified;
          break;
        }

        case 'remove_photo': {
          removePhotoFile(review.photo);
          review.photo = null;
          break;
        }

        case 'delete': {
          removePhotoFile(review.photo);
          store.reviews.splice(index, 1);
          break;
        }

        default:
          res.status(400).json({ error: 'Unknown action.' });
          return;
      }

      const saved = await storeService.saveStore(store);
      if (!saved) {
        res.status(500).json({ error: 'Could not save changes to data store.' });
        return;
      }

      res.json({ success: true, message: 'Action completed.' });
    } catch (err) {
      next(err);
    }
  }
}
