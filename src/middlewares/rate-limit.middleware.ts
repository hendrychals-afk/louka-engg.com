import { Request, Response, NextFunction } from 'express';
import { StoreService } from '../services/store.service';

export function getClientIp(req: Request): string {
  // SECURITY FIX: Express trust proxy handles X-Forwarded-For securely.
  // Never read raw X-Forwarded-For headers directly to prevent spoofing.
  return req.ip || req.socket.remoteAddress || '127.0.0.1';
}

export function reviewRateLimiter(req: Request, res: Response, next: NextFunction): void {
  if (process.env.NODE_ENV === 'test') {
    return next();
  }

  const ip = getClientIp(req);
  const storeService = StoreService.getInstance();

  if (!storeService.checkRateLimit(ip)) {
    res.status(429).json({
      error: 'You have already submitted a review recently. Please try again later.',
    });
    return;
  }

  next();
}

// In-memory throttling maps for admin login & contact inquiries
const loginAttempts = new Map<string, { count: number; firstAttempt: number }>();
const contactAttempts = new Map<string, { count: number; firstAttempt: number }>();

export function adminLoginRateLimiter(req: Request, res: Response, next: NextFunction): void {
  if (process.env.NODE_ENV === 'test') {
    return next();
  }

  const ip = getClientIp(req);
  const now = Date.now();
  const windowMs = 15 * 60 * 1000; // 15 minutes
  const maxAttempts = 5;

  const entry = loginAttempts.get(ip);
  if (entry) {
    if (now - entry.firstAttempt > windowMs) {
      loginAttempts.delete(ip);
    } else if (entry.count >= maxAttempts) {
      const waitMin = Math.ceil((windowMs - (now - entry.firstAttempt)) / 60000);
      res.status(429).json({
        error: `Too many failed login attempts. Please try again in ${waitMin} minutes.`,
      });
      return;
    }
  }

  next();
}

export function recordFailedLogin(ip: string): void {
  const now = Date.now();
  const entry = loginAttempts.get(ip);
  if (!entry) {
    loginAttempts.set(ip, { count: 1, firstAttempt: now });
  } else {
    entry.count += 1;
  }
}

export function clearLoginAttempts(ip: string): void {
  loginAttempts.delete(ip);
}

export function contactRateLimiter(req: Request, res: Response, next: NextFunction): void {
  if (process.env.NODE_ENV === 'test') {
    return next();
  }

  const ip = getClientIp(req);
  const now = Date.now();
  const windowMs = 60 * 60 * 1000; // 1 hour
  const maxInquiries = 5;

  const entry = contactAttempts.get(ip);
  if (entry) {
    if (now - entry.firstAttempt > windowMs) {
      contactAttempts.delete(ip);
    } else if (entry.count >= maxInquiries) {
      res.status(429).json({
        error: 'Too many messages sent from your IP. Please try again later or call us directly.',
      });
      return;
    }
  }

  next();
}

export function recordContactAttempt(ip: string): void {
  const now = Date.now();
  const entry = contactAttempts.get(ip);
  if (!entry) {
    contactAttempts.set(ip, { count: 1, firstAttempt: now });
  } else {
    entry.count += 1;
  }
}
