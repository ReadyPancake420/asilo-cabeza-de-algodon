import 'dotenv/config';
import { z } from 'zod';

const schema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(3003),
  DB_HOST: z.string().min(1).default('localhost'),
  DB_PORT: z.coerce.number().int().positive().default(3306),
  DB_NAME: z.string().min(1).default('asilo_administration'),
  DB_USER: z.string().min(1).default('admin_user'),
  DB_PASSWORD: z.string().min(1).default('admin_password'),
  AUTH_JWT_SECRET: z.string().min(32).default('demo-cabeza-algodon-secret-2026-cambiar'),
  AUTH_TOKEN_TTL_SECONDS: z.coerce.number().int().positive().default(28800)
});

export const env = schema.parse(process.env);
