import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';

export const ADMIN_COOKIE_NAME = 'louka_admin_session';

export function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  const sessionId = req.cookies?.[ADMIN_COOKIE_NAME];
  const authService = AuthService.getInstance();
  const { valid, session } = authService.validateSession(sessionId);

  if (!valid || !session) {
    res.status(401).json({ error: 'Unauthorized: Session expired or invalid.' });
    return;
  }

  // Check CSRF for state-changing methods (POST, PUT, PATCH, DELETE)
  // SECURITY FIX: Never accept CSRF token from req.query (prevents log leakage)
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
    const providedCsrf =
      req.headers['x-csrf-token'] || (typeof req.body === 'object' && req.body?.csrf);

    if (!providedCsrf || providedCsrf !== session.csrfToken) {
      res.status(403).json({ error: 'CSRF token mismatch or expired. Please reload and try again.' });
      return;
    }
  }

  (req as any).adminSession = session;
  next();
}
