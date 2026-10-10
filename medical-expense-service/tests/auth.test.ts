import { createHmac } from 'crypto';
import { describe, expect, it } from 'vitest';
import { env } from '../src/config/env';
import { AppError } from '../src/shared/AppError';
import { verifyToken } from '../src/shared/auth';

function tokenFor(exp: number): string {
  const encode = (value: unknown) => Buffer.from(JSON.stringify(value)).toString('base64url');
  const unsigned = `${encode({ alg: 'HS256', typ: 'JWT' })}.${encode({
    id: 4, username: 'administracion.demo', fullName: 'Ana Rodriguez', role: 'ADMINISTRACION', exp
  })}`;
  return `${unsigned}.${createHmac('sha256', env.AUTH_JWT_SECRET).update(unsigned).digest('base64url')}`;
}

describe('sesion compartida', () => {
  it('acepta una sesion valida del servicio administrativo', () => {
    expect(verifyToken(tokenFor(2_000), 1_000).role).toBe('ADMINISTRACION');
  });

  it('rechaza una sesion vencida', () => {
    expect(() => verifyToken(tokenFor(900), 1_000)).toThrowError(AppError);
  });
});
