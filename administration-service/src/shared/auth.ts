import { createHmac, randomBytes, scryptSync, timingSafeEqual } from 'crypto';
import { RequestHandler } from 'express';
import { env } from '../config/env';
import { AppError } from './errors';

export const ROLES = ['MEDICO', 'ENFERMERIA', 'COORDINACION', 'ADMINISTRACION'] as const;
export type Role = (typeof ROLES)[number];

export type AuthUser = {
  id: number;
  username: string;
  fullName: string;
  role: Role;
};

type TokenPayload = AuthUser & { iat: number; exp: number };

declare global {
  namespace Express {
    interface Request {
      auth?: AuthUser;
    }
  }
}

const encode = (value: unknown): string => Buffer.from(JSON.stringify(value)).toString('base64url');
const signatureFor = (value: string): string =>
  createHmac('sha256', env.AUTH_JWT_SECRET).update(value).digest('base64url');

export function signToken(user: AuthUser, nowSeconds = Math.floor(Date.now() / 1000)): string {
  const header = encode({ alg: 'HS256', typ: 'JWT' });
  const payload = encode({
    ...user,
    iat: nowSeconds,
    exp: nowSeconds + env.AUTH_TOKEN_TTL_SECONDS
  } satisfies TokenPayload);
  const unsigned = `${header}.${payload}`;
  return `${unsigned}.${signatureFor(unsigned)}`;
}

export function verifyToken(token: string, nowSeconds = Math.floor(Date.now() / 1000)): AuthUser {
  const parts = token.split('.');
  if (parts.length !== 3 || !parts[0] || !parts[1] || !parts[2]) {
    throw new AppError(401, 'INVALID_TOKEN', 'La sesion no es valida');
  }

  const unsigned = `${parts[0]}.${parts[1]}`;
  const expected = Buffer.from(signatureFor(unsigned));
  const received = Buffer.from(parts[2]);
  if (expected.length !== received.length || !timingSafeEqual(expected, received)) {
    throw new AppError(401, 'INVALID_TOKEN', 'La sesion no es valida');
  }

  try {
    const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf8')) as TokenPayload;
    if (
      !Number.isInteger(payload.id) ||
      !payload.username ||
      !payload.fullName ||
      !ROLES.includes(payload.role) ||
      !Number.isInteger(payload.exp) ||
      payload.exp <= nowSeconds
    ) {
      throw new Error('Invalid payload');
    }
    return { id: payload.id, username: payload.username, fullName: payload.fullName, role: payload.role };
  } catch {
    throw new AppError(401, 'INVALID_TOKEN', 'La sesion vencio o no es valida');
  }
}

export const authenticate: RequestHandler = (request, _response, next) => {
  const [scheme, token] = (request.header('authorization') || '').split(' ');
  if (scheme !== 'Bearer' || !token) {
    next(new AppError(401, 'AUTH_REQUIRED', 'Debe iniciar sesion para continuar'));
    return;
  }
  try {
    request.auth = verifyToken(token);
    next();
  } catch (error) {
    next(error);
  }
};

export function allowRoles(...roles: Role[]): RequestHandler {
  return (request, _response, next) => {
    if (!request.auth || !roles.includes(request.auth.role)) {
      next(new AppError(403, 'FORBIDDEN', 'Su rol no tiene permiso para realizar esta accion'));
      return;
    }
    next();
  };
}

export function hashPassword(password: string, salt = randomBytes(16).toString('hex')): string {
  const hash = scryptSync(password, salt, 64).toString('hex');
  return `scrypt$${salt}$${hash}`;
}

export function verifyPassword(password: string, storedHash: string): boolean {
  const [algorithm, salt, hash] = storedHash.split('$');
  if (algorithm !== 'scrypt' || !salt || !hash) return false;
  try {
    const expected = Buffer.from(hash, 'hex');
    const received = scryptSync(password, salt, expected.length);
    return expected.length === received.length && timingSafeEqual(expected, received);
  } catch {
    return false;
  }
}
