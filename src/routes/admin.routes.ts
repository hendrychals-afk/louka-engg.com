import { Router } from 'express';
import { AdminController } from '../controllers/admin.controller';
import { requireAdmin } from '../middlewares/auth.middleware';
import { adminLoginRateLimiter } from '../middlewares/rate-limit.middleware';

const router = Router();

router.post('/login', adminLoginRateLimiter, AdminController.login);
router.post('/logout', AdminController.logout);
router.get('/status', AdminController.getStatus);

// Protected admin endpoints
router.get('/reviews', requireAdmin, AdminController.getReviews);
router.post('/action', requireAdmin, AdminController.handleAction);

export default router;
