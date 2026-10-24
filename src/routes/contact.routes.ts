import { Router } from 'express';
import { ContactController } from '../controllers/contact.controller';
import { contactRateLimiter } from '../middlewares/rate-limit.middleware';

const router = Router();

router.post('/', contactRateLimiter, ContactController.submitContact);

export default router;
