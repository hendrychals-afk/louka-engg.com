import multer from 'multer';
import { config } from '../config';

// SECURITY FIX: Hold uploads in memory buffer so malicious or invalid uploads
// NEVER touch disk before honeypot, Zod validation, and magic byte checks pass.
const storage = multer.memoryStorage();

export const photoUpload = multer({
  storage,
  limits: {
    fileSize: config.maxPhotoBytes, // 2MB
  },
  fileFilter: (_req, file, cb) => {
    if (config.allowedPhotoTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Photo must be JPG, PNG, or WebP.'));
    }
  },
});

/**
 * Validates actual binary content (magic bytes) to prevent file-extension spoofing
 */
export function validateImageMagicBytes(buffer: Buffer): { valid: boolean; ext: string } {
  if (!buffer || buffer.length < 12) {
    return { valid: false, ext: '' };
  }

  // JPEG magic bytes: FF D8 FF
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return { valid: true, ext: '.jpg' };
  }

  // PNG magic bytes: 89 50 4E 47 0D 0A 1A 0A
  if (
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0d &&
    buffer[5] === 0x0a &&
    buffer[6] === 0x1a &&
    buffer[7] === 0x0a
  ) {
    return { valid: true, ext: '.png' };
  }

  // WebP magic bytes: RIFF....WEBP
  if (
    buffer.subarray(0, 4).toString('ascii') === 'RIFF' &&
    buffer.subarray(8, 12).toString('ascii') === 'WEBP'
  ) {
    return { valid: true, ext: '.webp' };
  }

  return { valid: false, ext: '' };
}
