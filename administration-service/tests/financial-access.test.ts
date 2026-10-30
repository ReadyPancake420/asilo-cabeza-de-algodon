import assert from 'node:assert/strict';
import { after, it } from 'node:test';
import { app } from '../src/app';
import { pool } from '../src/config/database';
import { signToken } from '../src/shared/auth';

after(async () => { await pool.end(); });

it('limita los movimientos a Administración y conserva entregas para Coordinación', async () => {
  const original = pool.execute;
  const queries: string[] = [];
  (pool as any).execute = async (sql: string) => {
    queries.push(sql);
    return sql.includes('FROM cash_movements') ? [[{ concept: 'Movimiento privado', source: 'Persona', amount: 50 }]] : [[{ medicine: 'Medicamento' }]];
  };
  const server = app.listen(0);
  try {
    const address = server.address();
    if (!address || typeof address === 'string') throw new Error('No se pudo iniciar el servidor');
    const url = `http://127.0.0.1:${address.port}/api/v1/reports/data`;
    const token = (role: 'COORDINACION' | 'ADMINISTRACION') => signToken({ id: 1, username: role, fullName: 'Prueba', role });
    const coord = await fetch(url, { headers: { Authorization: `Bearer ${token('COORDINACION')}` } });
    const coordData = await coord.json() as { data: { movements: unknown[]; deliveries: unknown[] } };
    assert.equal(coord.status, 200);
    assert.deepEqual(coordData.data.movements, []);
    assert.equal(coordData.data.deliveries.length, 1);
    assert.equal(queries.some((query) => query.includes('FROM cash_movements')), false);
    const admin = await fetch(url, { headers: { Authorization: `Bearer ${token('ADMINISTRACION')}` } });
    const adminData = await admin.json() as { data: { movements: unknown[] } };
    assert.equal(adminData.data.movements.length, 1);
  } finally {
    (pool as any).execute = original;
    await new Promise<void>((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
  }
});
