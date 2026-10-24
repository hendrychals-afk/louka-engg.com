import { Request, Response, NextFunction } from 'express';
import fs from 'fs';
import path from 'path';
import { StoreService } from '../services/store.service';
import { config } from '../config';

export class PhotoController {
  public static async getPhoto(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = (req.params.id || req.query.id || '').toString().trim();
      if (!id) {
        res.status(404).send('Not Found');
        return;
      }

      const store = StoreService.getInstance().loadStore();
      const review = store.reviews.find((r) => r.id === id);

      if (!review || !review.photo) {
        res.status(404).send('Not Found');
        return;
      }

      // Safe basename resolution to avoid directory traversal
      const filename = path.basename(review.photo);
      const filePath = path.join(config.uploadsDir, filename);

      if (!fs.existsSync(filePath)) {
        res.status(404).send('Not Found');
        return;
      }

      const ext = path.extname(filename).toLowerCase();
      const mimeTypes: Record<string, string> = {
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.png': 'image/png',
        '.webp': 'image/webp',
      };
      const contentType = mimeTypes[ext] || 'application/octet-stream';

      res.setHeader('Content-Type', contentType);
      res.setHeader('Cache-Control', 'public, max-age=604800, immutable');

      const stream = fs.createReadStream(filePath);
      stream.pipe(res);
    } catch (err) {
      next(err);
    }
  }
}
