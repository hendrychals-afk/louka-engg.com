import { z } from 'zod';

export const allowedServices = [
  'Stud Fixing',
  'Deck Sheet Stud Fixing',
  'Coil Stud Fixing',
  'Deck Sheet Laying',
  'Reinforcement',
  'Roofing',
  'ROB & FOB',
  'Other',
] as const;

export const createReviewSchema = z.object({
  name: z.string().trim().min(1, 'Please enter your name.').max(80, 'Name must be 80 characters or less.'),
  role: z.string().trim().min(1, 'Please enter your role.').max(80, 'Role must be 80 characters or less.'),
  company: z.string().trim().max(120, 'Company must be 120 characters or less.').optional().default(''),
  service: z.enum(allowedServices).optional().default('Other'),
  email: z.string().trim().email('Invalid email address.').or(z.literal('')).optional().default(''),
  text: z.string().trim().min(1, 'Please enter your review text.').max(2000, 'Review text must be 2000 characters or less.'),
  rating: z.coerce.number().int().min(1, 'Please select a rating between 1 and 5 stars.').max(5, 'Please select a rating between 1 and 5 stars.'),
  website: z.string().optional().default(''), // Honeypot field
});

export type CreateReviewInput = z.infer<typeof createReviewSchema>;
