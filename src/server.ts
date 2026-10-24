import express from 'express';
import fs from 'fs';
import path from 'path';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { config } from './config';
import reviewRoutes from './routes/review.routes';
import contactRoutes from './routes/contact.routes';
import adminRoutes from './routes/admin.routes';
import legacyRoutes from './routes/legacy.routes';
import { errorHandler } from './middlewares/error.middleware';

export const app = express();

// SECURITY FIX: Configured Content Security Policy (Helmet)
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
        fontSrc: ["'self'", 'https://fonts.gstatic.com'],
        imgSrc: ["'self'", 'data:', 'blob:'],
        connectSrc: ["'self'"],
        frameAncestors: ["'none'"],
        formAction: ["'self'"],
      },
    },
    crossOriginResourcePolicy: { policy: 'same-origin' },
  })
);

// SECURITY FIX: Restrict CORS origins explicitly (never reflect arbitrary origins with credentials)
const domainBase = config.siteUrl.replace(/^https?:\/\/(www\.)?/, '');
const allowedOrigins = [
  config.siteUrl,
  `https://${domainBase}`,
  `https://www.${domainBase}`,
  `http://${domainBase}`,
  `http://www.${domainBase}`,
  'http://localhost:3000',
  'http://localhost:5173',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:5173',
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. mobile apps, curl, same-origin browser requests)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('CORS blocked: Origin not allowed'));
      }
    },
    credentials: true,
  })
);

// Request parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Trust first proxy hop securely
app.set('trust proxy', 1);

// Mount API routes
app.use('/api/reviews', reviewRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/admin', adminRoutes);

// Mount backward-compatible legacy PHP routes
app.use('/', legacyRoutes);

// Serve frontend static assets in production
const clientDistPath = path.resolve(__dirname, '../client/dist');
app.use(express.static(clientDistPath));

// Also serve brand and uploads with caching headers
app.use('/brand', express.static(path.resolve(config.appRootDir, 'brand'), { maxAge: '7d' }));
app.use('/data/uploads', express.static(config.uploadsDir, { maxAge: '7d', immutable: true }));

// Client SPA fallback
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api/') || req.path.includes('.')) {
    return next();
  }
  const indexHtml = path.join(clientDistPath, 'index.html');
  if (fs.existsSync(indexHtml)) {
    return res.sendFile(indexHtml);
  }
  next();
});

// Centralized error handling
app.use(errorHandler);

// Start server if not imported by test runner
if (process.env.NODE_ENV !== 'test') {
  const isPassenger = typeof (global as any).PhusionPassenger !== 'undefined' || process.env.PORT === 'passenger';
  const listenTarget: any = isPassenger ? 'passenger' : config.port;

  app.listen(listenTarget, () => {
    console.log(`===============================================`);
    console.log(`🚀 Louka Engineering Server Running`);
    console.log(`📍 Port / Socket: ${listenTarget}`);
    console.log(`⚙️  Environment: ${config.nodeEnv}`);
    console.log(`📦 Data File: ${config.reviewsFile}`);
    console.log(`===============================================`);
  });
}

export default app;
