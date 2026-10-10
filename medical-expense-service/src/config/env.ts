import 'dotenv/config';
import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(3001),
  DB_HOST: z.string().min(1).default('localhost'),
  DB_PORT: z.coerce.number().int().positive().default(3307),
  DB_NAME: z.string().min(1).default('medical_expenses'),
  DB_USER: z.string().min(1).default('expense_user'),
  DB_PASSWORD: z.string().min(1).default('expense_password'),
  AUTH_JWT_SECRET: z.string().min(32).default('demo-cabeza-algodon-secret-2026-cambiar')
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('Variables de entorno invalidas:', parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;

