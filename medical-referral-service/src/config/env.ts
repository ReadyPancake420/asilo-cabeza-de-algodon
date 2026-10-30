import 'dotenv/config';
import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(3002),
  ADMINISTRATION_URL: z.string().url().default('http://localhost:3003'),
  DB_HOST: z.string().min(1).default('localhost'),
  DB_PORT: z.coerce.number().int().positive().default(3308),
  DB_NAME: z.string().min(1).default('medical_referrals'),
  DB_USER: z.string().min(1).default('referral_user'),
  DB_PASSWORD: z.string().min(1).default('referral_password'),
  AUTH_JWT_SECRET: z.string().min(32).default('demo-cabeza-algodon-secret-2026-cambiar')
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('Variables de entorno invalidas:', parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;

