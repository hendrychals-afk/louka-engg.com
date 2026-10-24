import { Router } from 'express';
import { ReviewController } from '../controllers/review.controller';
import { PhotoController } from '../controllers/photo.controller';
import { photoUpload } from '../middlewares/upload.middleware';
import { reviewRateLimiter } from '../middlewares/rate-limit.middleware';

const router = Router();

router.get('/', ReviewController.getReviews);
router.post('/', reviewRateLimiter, photoUpload.single('photo'), ReviewController.submitReview);
router.get('/:id/photo', PhotoController.getPhoto);

export default router;
