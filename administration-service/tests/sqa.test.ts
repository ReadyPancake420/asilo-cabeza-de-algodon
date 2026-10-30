import assert from 'node:assert/strict';
import { after, describe, it } from 'node:test';
import type { NextFunction, Request, Response } from 'express';
import { pool } from '../src/config/database';
import { dateSchema, residentSchema } from '../src/modules/administration.routes';
import { errorHandler } from '../src/shared/errors';

after(async () => { await pool.end(); });

describe('validaciones observadas por SQA', () => {
  it('rechaza fechas inexistentes y acepta fechas reales', () => {
    assert.equal(dateSchema.safeParse('2026-02-31').success, false);
    assert.equal(dateSchema.safeParse('2024-02-29').success, true);
    assert.equal(dateSchema.safeParse('2025-02-29').success, false);
  });

  it('rechaza fechas de nacimiento futuras', () => {
    const resident = { name: 'Persona Prueba', birthDate: '9999-01-01', room: 'X', condition: 'Estable', family: 'Familiar Prueba', familyPhone: '1234' };
    assert.equal(residentSchema.safeParse(resident).success, false);
    assert.equal(residentSchema.safeParse({ ...resident, birthDate: '1950-01-01' }).success, true);
  });

  for (const [error, expectedStatus, expectedCode] of [
    [{ type: 'entity.parse.failed' }, 400, 'INVALID_JSON'],
    [{ type: 'entity.too.large' }, 413, 'PAYLOAD_TOO_LARGE'],
    [{ code: 'ER_DUP_ENTRY' }, 409, 'DUPLICATE']
  ] as const) {
    it(`devuelve ${expectedStatus} para ${expectedCode}`, () => {
      let status = 0;
      let body: any;
      const response = { status(value: number) { status = value; return this; }, json(value: unknown) { body = value; return this; } };
      errorHandler(error, {} as Request, response as unknown as Response, (() => {}) as NextFunction);
      assert.equal(status, expectedStatus);
      assert.equal(body.error.code, expectedCode);
    });
  }
});
