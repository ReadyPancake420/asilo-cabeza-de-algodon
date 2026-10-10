import { Router } from 'express';
import { RowDataPacket } from 'mysql2';
import { z } from 'zod';
import { pool } from '../config/database';
import { env } from '../config/env';
import { asyncHandler } from '../shared/asyncHandler';
import { authenticate, ROLES, Role, signToken, verifyPassword } from '../shared/auth';
import { AppError } from '../shared/errors';

interface UserRow extends RowDataPacket {
  id: number;
  username: string;
  fullName: string;
  role: string;
  passwordHash: string;
  active: number;
}

const loginSchema = z.object({
  username: z.string().trim().min(3).max(80),
  password: z.string().min(8).max(200)
});

export const authRouter = Router();

authRouter.post('/login', asyncHandler(async (request, response) => {
  const credentials = loginSchema.parse(request.body);
  const [rows] = await pool.execute<UserRow[]>(
    `SELECT id, username, full_name AS fullName, role, password_hash AS passwordHash, active
     FROM users WHERE username = ? LIMIT 1`,
    [credentials.username]
  );
  const row = rows[0];
  if (!row || !verifyPassword(credentials.password, row.passwordHash)) {
    throw new AppError(401, 'INVALID_CREDENTIALS', 'Usuario o contrasena incorrectos');
  }
  if (!row.active) throw new AppError(403, 'USER_DISABLED', 'El usuario se encuentra deshabilitado');
  if (!ROLES.includes(row.role as Role)) throw new AppError(403, 'INVALID_ROLE', 'El usuario no tiene un rol valido');

  const user = {
    id: Number(row.id),
    username: row.username,
    fullName: row.fullName,
    role: row.role as Role
  };
  await pool.execute('UPDATE users SET last_login_at = CURRENT_TIMESTAMP WHERE id = ?', [user.id]);
  response.set('Cache-Control', 'no-store').json({
    data: { token: signToken(user), expiresIn: env.AUTH_TOKEN_TTL_SECONDS, user }
  });
}));

authRouter.get('/me', authenticate, (request, response) => {
  response.set('Cache-Control', 'no-store').json({ data: request.auth });
});
