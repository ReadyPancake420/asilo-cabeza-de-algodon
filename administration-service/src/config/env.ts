import 'dotenv/config';
import { z } from 'zod';

const schema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(3003),
  DB_HOST: z.string().min(1).default('localhost'),
  DB_PORT: z.coerce.number().int().positive().default(3306),
  DB_NAME: z.string().min(1).default('asilo_administration'),
  DB_USER: z.string().min(1).default('admin_user'),
  DB_PASSWORD: z.string().min(1).default('admin_password')
});

export const env = schema.parse(process.env);
