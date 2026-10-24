import { Request, Response, NextFunction } from 'express';
import multer from 'multer';
import { ZodError } from 'zod';
import { config } from '../config';

export function errorHandler(err: any, req: Request, res: Response, next: NextFunction): void {
  // Always log internal details securely on the server
  console.error(`[Server Error] ${req.method} ${req.url}:`, err);

  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      res.status(422).json({ error: 'Photo must be under 2 MB.' });
      return;
    }
    res.status(422).json({ error: err.message || 'File upload error.' });
    return;
  }

  if (err instanceof ZodError) {
    const firstIssue = err.issues[0]?.message || 'Invalid input data.';
    res.status(422).json({ error: firstIssue, details: err.format() });
    return;
  }

  if (err?.message && (err.message.includes('Photo must be') || err.message.includes('magic bytes') || err.message.includes('upload'))) {
    res.status(422).json({ error: err.message });
    return;
  }

  const statusCode = typeof err.status === 'number' && err.status >= 400 && err.status < 600 ? err.status : 500;

  // SECURITY FIX: Never leak raw error messages or internal system stacks on 500 errors in production
  if (statusCode >= 500 && config.nodeEnv === 'production') {
    res.status(statusCode).json({
      error: 'An unexpected error occurred. Please try again later.',
    });
    return;
  }

  res.status(statusCode).json({
    error: err.message || 'Internal server error.',
  });
}
