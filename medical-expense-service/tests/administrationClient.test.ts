import { afterEach, describe, expect, it, vi } from 'vitest';
import { verifyResidentAndVisit } from '../src/shared/administrationClient';

afterEach(() => vi.unstubAllGlobals());

describe('verificación entre servicios', () => {
  it('acepta el residente y la visita confirmados y transmite la sesión', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ data: { residentId: 1, medicalVisitId: 2 } }), { status: 200 }));
    vi.stubGlobal('fetch', fetchMock);
    await expect(verifyResidentAndVisit(1, 2, 'Bearer prueba')).resolves.toBeUndefined();
    expect(fetchMock.mock.calls[0][1].headers.authorization).toBe('Bearer prueba');
  });
  it('rechaza visitas inexistentes o de otro residente', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify({ error: { code: 'VISIT_NOT_FOUND_FOR_RESIDENT' } }), { status: 404 })));
    await expect(verifyResidentAndVisit(1, 2, 'Bearer prueba')).rejects.toMatchObject({ statusCode: 422, code: 'VISIT_NOT_FOUND_FOR_RESIDENT' });
  });
  it('rechaza residentes inexistentes', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify({ error: { code: 'RESIDENT_NOT_FOUND' } }), { status: 404 })));
    await expect(verifyResidentAndVisit(1, null, 'Bearer prueba')).rejects.toMatchObject({ statusCode: 404, code: 'RESIDENT_NOT_FOUND' });
  });
  it('no permite guardar si el servicio no responde o devuelve datos inconsistentes', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('sin conexión')));
    await expect(verifyResidentAndVisit(1, 2, 'Bearer prueba')).rejects.toMatchObject({ statusCode: 503, code: 'ADMINISTRATION_UNAVAILABLE' });
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify({ data: { residentId: 99, medicalVisitId: 2 } }), { status: 200 })));
    await expect(verifyResidentAndVisit(1, 2, 'Bearer prueba')).rejects.toMatchObject({ statusCode: 503, code: 'ADMINISTRATION_UNAVAILABLE' });
  });
});
