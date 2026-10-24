import { z } from 'zod';

export const contactSchema = z.object({
  name: z.string().trim().min(1, 'Please enter your name.').max(100, 'Name must be 100 characters or less.'),
  email: z.string().trim().email('Please enter a valid email address.').max(120),
  phone: z
    .string()
    .trim()
    .regex(/^(\+91)?[6-9]\d{9}$/, 'Please enter a valid 10-digit Indian phone number.'),
  message: z.string().trim().min(1, 'Please enter your message.').max(3000, 'Message must be 3000 characters or less.'),
  website: z.string().optional().default(''), // Anti-spam honeypot
});

export type ContactInput = z.infer<typeof contactSchema>;
