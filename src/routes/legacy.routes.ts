import { Router } from 'express';
import { ReviewController } from '../controllers/review.controller';
import { PhotoController } from '../controllers/photo.controller';
import { ContactController } from '../controllers/contact.controller';
import { AdminController } from '../controllers/admin.controller';
import { photoUpload } from '../middlewares/upload.middleware';
import { reviewRateLimiter, contactRateLimiter, adminLoginRateLimiter } from '../middlewares/rate-limit.middleware';
import { requireAdmin } from '../middlewares/auth.middleware';

const router = Router();

// Legacy reviews.php endpoint mapping
router.get('/reviews.php', ReviewController.getReviews);
router.post('/reviews.php', reviewRateLimiter, photoUpload.single('photo'), ReviewController.submitReview);

// Legacy review-photo.php endpoint mapping
router.get('/review-photo.php', PhotoController.getPhoto);

// Legacy contact.php endpoint mapping
router.post('/contact.php', contactRateLimiter, ContactController.submitContact);

// Legacy admin.php endpoint mapping
router.get('/admin.php', (req, res) => {
  res.redirect('/admin');
});

router.post('/admin.php', (req, res, next) => {
  if (req.body?.admin_login) {
    adminLoginRateLimiter(req, res, () => {
      AdminController.login(req, res, next);
    });
    return;
  }
  if (req.body?.admin_logout) {
    AdminController.logout(req, res);
    return;
  }
  // Otherwise it's a review moderation action
  requireAdmin(req, res, () => {
    AdminController.handleAction(req, res, next);
  });
});

export default router;
