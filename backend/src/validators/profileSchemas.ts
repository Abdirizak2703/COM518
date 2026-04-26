import { z } from 'zod';

export const updateProfileSchema = z.object({
  fullName: z.string().trim().min(2).max(80),
  phone: z.string().trim().min(7).max(20),
  homeCity: z.string().trim().min(2).max(80),
  bio: z.string().trim().max(320)
});
