import { z } from 'zod';

export const bookingSchema = z.object({
  accID: z.number().int().positive(),
  date: z.string().regex(/^\d{6}$/, 'date must be in YYMMDD format'),
  npeople: z.number().int().positive().max(20),
  apiID: z.literal('0x574144')
});
