import assert from 'node:assert/strict';
import { after, it } from 'node:test';
import { app } from '../src/app';
import { pool } from '../src/config/database';
import { signToken } from '../src/shared/auth';

after(async () => { await pool.end(); });

it('registra al médico autenticado e ignora el nombre enviado', async () => {
  const original = pool.execute;
  let saved: unknown[] = [];
  (pool as any).execute = async (sql: string, values: unknown[]) => {
    if (sql.startsWith('SELECT')) return [[{ id: 15 }]];
    saved = values;
    return [{ insertId: 7 }];
  };
  const server = app.listen(0);
  try {
    const address = server.address();
    if (!address || typeof address === 'string') throw new Error('No se pudo iniciar el servidor de prueba');
    const token = signToken({ id: 8, username: 'medico', fullName: 'Dra. Autenticada', role: 'MEDICO' });
    const response = await fetch(`http://127.0.0.1:${address.port}/api/v1/medical-visits`, {
      method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ residentId: 15, visitDate: '2026-10-29', visitType: 'Consulta', doctorName: 'Dr. Impostor', reason: 'Motivo de prueba', diagnosis: 'Diagnóstico' })
    });
    assert.equal(response.status, 201);
    assert.equal(saved[3], 'Dra. Autenticada');
    assert.equal((await response.json() as { data: { doctorName: string } }).data.doctorName, 'Dra. Autenticada');
  } finally {
    (pool as any).execute = original;
    await new Promise<void>((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
  }
});
