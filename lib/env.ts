import { z } from 'zod';

const clientSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  NEXT_PUBLIC_APP_URL: z.string().url(),
  NEXT_PUBLIC_SENTRY_DSN: z.string().url().optional().or(z.literal('')),
  NEXT_PUBLIC_RFID_ENABLED: z
    .union([z.literal('true'), z.literal('false')])
    .optional()
    .default('false'),
  NEXT_PUBLIC_RFID_BRIDGE_URL: z.string().url().optional().default('ws://127.0.0.1:17324'),
});

export const clientEnv = clientSchema.parse({
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  NEXT_PUBLIC_SENTRY_DSN: process.env.NEXT_PUBLIC_SENTRY_DSN,
  NEXT_PUBLIC_RFID_ENABLED: process.env.NEXT_PUBLIC_RFID_ENABLED,
  NEXT_PUBLIC_RFID_BRIDGE_URL: process.env.NEXT_PUBLIC_RFID_BRIDGE_URL,
});

export const rfidEnabled = clientEnv.NEXT_PUBLIC_RFID_ENABLED === 'true';
