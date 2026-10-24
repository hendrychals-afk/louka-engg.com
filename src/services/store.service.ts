import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { config } from '../config';
import {
  StoredReview,
  ReviewStoreData,
  PublicReview,
  ReviewStats,
  RatingHistogram,
  AdminReviewSummary,
  StoredInquiry,
  ContactSubmission,
} from '../types';

export class StoreService {
  private static instance: StoreService;

  private constructor() {
    this.ensureDirectories();
  }

  public static getInstance(): StoreService {
    if (!StoreService.instance) {
      StoreService.instance = new StoreService();
    }
    return StoreService.instance;
  }

  private ensureDirectories(): void {
    const dirs = [config.dataDir, config.uploadsDir, config.backupsDir];
    for (const d of dirs) {
      if (!fs.existsSync(d)) {
        fs.mkdirSync(d, { recursive: true });
      }
    }
  }

  public loadStore(): ReviewStoreData {
    this.ensureDirectories();
    if (!fs.existsSync(config.reviewsFile)) {
      return { reviews: [], meta: { lastUpdated: new Date().toISOString() } };
    }

    try {
      const raw = fs.readFileSync(config.reviewsFile, 'utf8');
      const data = JSON.parse(raw);
      if (!data || !Array.isArray(data.reviews)) {
        return { reviews: [], meta: { lastUpdated: new Date().toISOString() } };
      }
      if (!data.meta || typeof data.meta !== 'object') {
        data.meta = { lastUpdated: new Date().toISOString() };
      }
      return data as ReviewStoreData;
    } catch (err) {
      console.error('Error loading reviews.json:', err);
      return { reviews: [], meta: { lastUpdated: new Date().toISOString() } };
    }
  }

  public async saveStore(store: ReviewStoreData): Promise<boolean> {
    this.ensureDirectories();
    store.meta.lastUpdated = new Date().toISOString();

    // Collision-free unique temp file
    const tempFile = path.join(config.dataDir, `.reviews.${crypto.randomUUID()}.tmp`);

    try {
      // 1. Perform automated rotating backup before writing changes
      this.createAutomatedBackup();

      // 2. Write atomically
      const json = JSON.stringify(store, null, 2);
      fs.writeFileSync(tempFile, json, 'utf8');
      fs.renameSync(tempFile, config.reviewsFile);
      return true;
    } catch (err) {
      console.error('Failed to save reviews store:', err);
      if (fs.existsSync(tempFile)) {
        try {
          fs.unlinkSync(tempFile);
        } catch {
          // ignore
        }
      }
      return false;
    }
  }

  private createAutomatedBackup(): void {
    if (!fs.existsSync(config.reviewsFile)) return;

    try {
      const today = new Date().toISOString().slice(0, 10);
      const backupPath = path.join(config.backupsDir, `reviews-${today}.json`);

      // Write daily backup if not already written today
      if (!fs.existsSync(backupPath)) {
        fs.copyFileSync(config.reviewsFile, backupPath);
      }

      // Also maintain reviews.backup.json
      const staticBackupPath = path.join(config.dataDir, 'reviews.backup.json');
      fs.copyFileSync(config.reviewsFile, staticBackupPath);

      // Clean old backups keeping last 30 daily backups
      const files = fs.readdirSync(config.backupsDir).filter((f) => f.startsWith('reviews-') && f.endsWith('.json'));
      if (files.length > 30) {
        files.sort();
        const toDelete = files.slice(0, files.length - 30);
        for (const del of toDelete) {
          try {
            fs.unlinkSync(path.join(config.backupsDir, del));
          } catch {
            // ignore
          }
        }
      }
    } catch (err) {
      console.error('Automated backup creation failed:', err);
    }
  }

  public generateId(): string {
    return crypto.randomBytes(8).toString('hex');
  }

  public hashIp(ip: string): string {
    return crypto.createHmac('sha256', config.ipHashSalt).update(ip).digest('hex');
  }

  public formatPublicItem(review: StoredReview): PublicReview {
    return {
      id: review.id,
      name: review.name,
      role: review.role,
      company: review.company || '',
      service: review.service || 'Other',
      rating: review.rating,
      text: review.text,
      source: review.source || 'Website',
      verified: Boolean(review.verified),
      featured: Boolean(review.featured),
      photo: review.photo ? `/api/reviews/${encodeURIComponent(review.id)}/photo` : null,
      createdAt: review.createdAt || new Date().toISOString(),
      approvedAt: review.approvedAt || null,
    };
  }

  public computeStats(reviews: (StoredReview | PublicReview)[]): ReviewStats {
    const histogram: RatingHistogram = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    let total = 0;
    let sum = 0;
    let verified = 0;
    const sources = new Set<string>();

    for (const r of reviews) {
      const rating = typeof r.rating === 'number' ? r.rating : parseInt(String(r.rating), 10);
      if (!isNaN(rating) && rating >= 1 && rating <= 5) {
        histogram[rating as keyof RatingHistogram] = (histogram[rating as keyof RatingHistogram] || 0) + 1;
        sum += rating;
        total++;
      }
      if (r.verified) {
        verified++;
      }
      if (r.source) {
        sources.add(r.source);
      }
    }

    const average = total === 0 ? 0 : Math.round((sum / total) * 10) / 10;

    return {
      total,
      average,
      verified,
      sources: sources.size || 1,
      histogram,
    };
  }

  public findFeatured(reviews: StoredReview[]): PublicReview | null {
    const featured = reviews.find((r) => r.featured && r.status === 'approved');
    if (featured) {
      return this.formatPublicItem(featured);
    }
    const approved = reviews.filter((r) => r.status === 'approved');
    if (approved.length > 0) {
      return this.formatPublicItem(approved[0]);
    }
    return null;
  }

  public getAdminSummary(reviews: StoredReview[]): AdminReviewSummary {
    const counts: AdminReviewSummary = { pending: 0, approved: 0, rejected: 0 };
    for (const r of reviews) {
      const st = r.status || 'pending';
      if (st in counts) {
        counts[st as keyof AdminReviewSummary]++;
      }
    }
    return counts;
  }

  public checkRateLimit(ip: string): boolean {
    const hash = this.hashIp(ip);
    const limitSeconds = Math.max(3600, config.rateLimitHours * 3600);
    const now = Math.floor(Date.now() / 1000);

    let limits: Record<string, number> = {};
    if (fs.existsSync(config.rateLimitsFile)) {
      try {
        limits = JSON.parse(fs.readFileSync(config.rateLimitsFile, 'utf8'));
      } catch {
        limits = {};
      }
    }

    // Clean expired
    for (const [key, timestamp] of Object.entries(limits)) {
      if (now - timestamp > limitSeconds) {
        delete limits[key];
      }
    }

    if (limits[hash] && now - limits[hash] < limitSeconds) {
      return false; // Rate limited
    }

    return true; // Allowed
  }

  public recordRateLimit(ip: string): void {
    const hash = this.hashIp(ip);
    const now = Math.floor(Date.now() / 1000);

    let limits: Record<string, number> = {};
    if (fs.existsSync(config.rateLimitsFile)) {
      try {
        limits = JSON.parse(fs.readFileSync(config.rateLimitsFile, 'utf8'));
      } catch {
        limits = {};
      }
    }

    limits[hash] = now;
    try {
      fs.writeFileSync(config.rateLimitsFile, JSON.stringify(limits, null, 2), 'utf8');
    } catch (e) {
      console.error('Failed to update rate limits file:', e);
    }
  }

  public saveInquiry(submission: ContactSubmission, ip: string): StoredInquiry {
    this.ensureDirectories();
    const inquiry: StoredInquiry = {
      id: crypto.randomUUID(),
      ...submission,
      createdAt: new Date().toISOString(),
      ip: this.hashIp(ip),
      status: 'new',
    };

    let inquiries: StoredInquiry[] = [];
    if (fs.existsSync(config.inquiriesFile)) {
      try {
        inquiries = JSON.parse(fs.readFileSync(config.inquiriesFile, 'utf8'));
      } catch {
        inquiries = [];
      }
    }

    inquiries.unshift(inquiry);
    try {
      const tempFile = path.join(config.dataDir, `.inquiries.${crypto.randomUUID()}.tmp`);
      fs.writeFileSync(tempFile, JSON.stringify(inquiries, null, 2), 'utf8');
      fs.renameSync(tempFile, config.inquiriesFile);
    } catch (err) {
      console.error('Failed to persist contact inquiry:', err);
    }

    return inquiry;
  }
}
