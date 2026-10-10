import { describe, expect, it } from 'vitest';
import { AppError } from '../src/shared/AppError';
import { AuthUser, authorizeStatusUpdate } from '../src/shared/auth';

function run(role: AuthUser['role'], status: string): unknown {
  let captured: unknown;
  authorizeStatusUpdate(
    { auth: { id: 1, username: 'test', fullName: 'Usuario Prueba', role }, body: { status } } as never,
    {} as never,
    (error?: unknown) => { captured = error; }
  );
  return captured;
}

describe('permisos del flujo de referencias', () => {
  it('permite a enfermeria registrar traslado y atencion', () => {
    expect(run('ENFERMERIA', 'IN_TRANSIT')).toBeUndefined();
    expect(run('ENFERMERIA', 'ATTENDED')).toBeUndefined();
  });

  it('permite a coordinacion cancelar una referencia', () => {
    expect(run('COORDINACION', 'CANCELLED')).toBeUndefined();
  });

  it('rechaza cambios de estado fuera del rol', () => {
    const error = run('MEDICO', 'IN_TRANSIT');
    expect(error).toBeInstanceOf(AppError);
    expect((error as AppError).statusCode).toBe(403);
  });
});
