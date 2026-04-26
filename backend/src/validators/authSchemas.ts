import { z } from 'zod';

export const loginSchema = z.object({
  username: z.string().trim().min(3).max(50),
  password: z.string().min(3).max(100)
});

export const registerSchema = z.object({
  username: z
    .string()
    .trim()
    .min(3, 'Username must be at least 3 characters.')
    .max(50, 'Username must be at most 50 characters.')
    .regex(/^[A-Za-z0-9_.@+-]+$/, 'Username can contain only letters, numbers, underscore, dot, at-sign, plus, and hyphen.'),
  password: z
    .string()
    .min(12, 'Password must be at least 12 characters.')
    .max(128, 'Password must be at most 128 characters.'),
  fullName: z.string().trim().min(2, 'Full name must be at least 2 characters.').max(80, 'Full name must be at most 80 characters.'),
  phone: z.string().trim().min(7, 'Phone must be at least 7 characters.').max(20, 'Phone must be at most 20 characters.'),
  homeCity: z.string().trim().min(2, 'Home city must be at least 2 characters.').max(80, 'Home city must be at most 80 characters.'),
  bio: z.string().trim().max(320, 'Bio must be at most 320 characters.')
});

export const forgotPasswordSchema = z.object({
  username: z
    .string()
    .trim()
    .min(3, 'Username must be at least 3 characters.')
    .max(50, 'Username must be at most 50 characters.'),
  newPassword: z
    .string()
    .min(12, 'New password must be at least 12 characters.')
    .max(128, 'New password must be at most 128 characters.')
});
