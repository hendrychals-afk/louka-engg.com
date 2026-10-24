import { z } from 'zod';
import { allowedServices } from './review.validator';

const safeBooleanField = z
  .union([
    z.boolean(),
    z.enum(['true', 'false', '1', '0']).transform((val) => val === 'true' || val === '1'),
  ])
  .optional();

export const adminLoginSchema = z.object({
  password: z.string().min(1, 'Password is required.'),
});

export const adminActionSchema = z.object({
  action: z.enum(['save', 'approve', 'reject', 'feature', 'toggle_verified', 'remove_photo', 'delete']),
  id: z.string().min(1, 'Review ID is required.'),
  csrf: z.string().optional(),

  // Fields for 'save' action
  name: z.string().trim().max(80).optional(),
  role: z.string().trim().max(80).optional(),
  company: z.string().trim().max(120).optional(),
  service: z.enum(allowedServices).optional(),
  source: z.string().trim().max(40).optional(),
  rating: z.coerce.number().int().min(1).max(5).optional(),
  status: z.enum(['pending', 'approved', 'rejected']).optional(),
  verified: safeBooleanField,
  text: z.string().trim().max(2000).optional(),
});

export type AdminActionInput = z.infer<typeof adminActionSchema>;
