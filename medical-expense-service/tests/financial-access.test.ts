import { createHmac } from 'crypto';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import type { Server } from 'http';
import { app } from '../src/app';
import { env } from '../src/config/env';

let server: Server;
let base: string;
beforeAll(() => {
  server = app.listen(0);
  const address = server.address();
  if (!address || typeof address === 'string') throw new Error('No se pudo iniciar el servidor');
  base = `http://127.0.0.1:${address.port}/api/v1/liquidations`;
});
afterAll(async () => { await new Promise<void>((resolve, reject) => server.close((error) => error ? reject(error) : resolve())); });

function token(role: string): string {
  const encode = (v: unknown) => Buffer.from(JSON.stringify(v)).toString('base64url');
  const payload = { id: 2, username: 'prueba', fullName: 'Persona Prueba', role, exp: Math.floor(Date.now() / 1000) + 3600 };
  const unsigned = `${encode({ alg: 'HS256', typ: 'JWT' })}.${encode(payload)}`;
  return `${unsigned}.${createHmac('sha256', env.AUTH_JWT_SECRET).update(unsigned).digest('base64url')}`;
}

describe('detalle financiero reservado a Administración', () => {
  for (const path of ['', '/report', '/visit/1', '/1']) {
    it(`rechaza Coordinación en ${path || '/'}`, async () => {
      const response = await fetch(`${base}${path}`, { headers: { Authorization: `Bearer ${token('COORDINACION')}` } });
      expect(response.status).toBe(403);
    });
  }
});
