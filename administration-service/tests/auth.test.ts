import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { AppError } from '../src/shared/errors';
import { allowRoles, hashPassword, signToken, verifyPassword, verifyToken } from '../src/shared/auth';

const user = {
  id: 7,
  username: 'medico.demo',
  fullName: 'Dra. Maria Lopez',
  role: 'MEDICO' as const
};

describe('autenticacion', () => {
  it('genera y valida una sesion firmada', () => {
    const token = signToken(user, 1_000);
    assert.deepEqual(verifyToken(token, 1_001), user);
  });

  it('rechaza una sesion alterada', () => {
    const token = signToken(user, 1_000);
    const altered = `${token.slice(0, -1)}${token.endsWith('a') ? 'b' : 'a'}`;
    assert.throws(() => verifyToken(altered, 1_001), (error: unknown) =>
      error instanceof AppError && error.statusCode === 401
    );
  });

  it('rechaza una sesion vencida', () => {
    const token = signToken(user, 1_000);
    assert.throws(() => verifyToken(token, 30_000), (error: unknown) =>
      error instanceof AppError && error.code === 'INVALID_TOKEN'
    );
  });

  it('protege contrasenas con scrypt', () => {
    const stored = hashPassword('DemoMedico2026!', '00112233445566778899aabbccddeeff');
    assert.equal(verifyPassword('DemoMedico2026!', stored), true);
    assert.equal(verifyPassword('incorrecta', stored), false);
    assert.equal(stored.includes('DemoMedico2026!'), false);
  });

  it('rechaza operaciones que no pertenecen al rol', () => {
    let captured: unknown;
    const middleware = allowRoles('ADMINISTRACION');
    middleware({ auth: user } as never, {} as never, (error?: unknown) => { captured = error; });
    assert.ok(captured instanceof AppError);
    assert.equal(captured.statusCode, 403);
  });
});
