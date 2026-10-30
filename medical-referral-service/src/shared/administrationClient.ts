import { env } from '../config/env';
import { AppError } from './AppError';

/** Verify identifiers with the administrative service without transferring medical details. */
export async function verifyResidentAndVisit(residentId: number, visitId: number | null, authorization: string): Promise<void> {
  const url = new URL(`/api/v1/integration/residents/${residentId}`, env.ADMINISTRATION_URL);
  if (visitId !== null) url.searchParams.set('medicalVisitId', String(visitId));
  try {
    const response = await fetch(url, {
      headers: { authorization },
      signal: AbortSignal.timeout(5000),
      redirect: 'error'
    });
    if (response.status === 404) {
      const body = await response.json() as { error?: { code?: string } };
      if (body.error?.code === 'RESIDENT_NOT_FOUND') {
        throw new AppError(404, 'RESIDENT_NOT_FOUND', 'No se encontró el residente');
      }
      if (body.error?.code === 'VISIT_NOT_FOUND_FOR_RESIDENT') {
        throw new AppError(422, 'VISIT_NOT_FOUND_FOR_RESIDENT', 'La visita no existe o no pertenece al residente');
      }
    }
    if (!response.ok) throw new Error('Respuesta inesperada del servicio administrativo');
    const body = await response.json() as { data?: { residentId?: unknown; medicalVisitId?: unknown } };
    if (body.data?.residentId !== residentId || body.data?.medicalVisitId !== visitId) {
      throw new Error('Respuesta inválida del servicio administrativo');
    }
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError(503, 'ADMINISTRATION_UNAVAILABLE', 'No se pudo verificar el residente o la visita. Intente nuevamente.');
  }
}
