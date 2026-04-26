import { z } from 'zod';

export const updateClientByAdminSchema = z.object({
  username: z
    .string()
    .trim()
    .min(3, 'Username must be at least 3 characters.')
    .max(50, 'Username must be at most 50 characters.')
    .regex(/^[A-Za-z0-9_.@+-]+$/, 'Username can contain only letters, numbers, underscore, dot, at-sign, plus, and hyphen.'),
  fullName: z.string().trim().min(2).max(80),
  phone: z.string().trim().min(7).max(20),
  homeCity: z.string().trim().min(2).max(80),
  bio: z.string().trim().max(320)
});

export const updateAccommodationByAdminSchema = z.object({
  name: z.string().trim().min(2).max(120),
  type: z.string().trim().min(2).max(60),
  location: z.string().trim().min(2).max(120),
  roomsTotal: z.number().int().min(1).max(500),
  images: z.array(z.string().trim().min(1).max(2048)).min(1).max(12)
});
