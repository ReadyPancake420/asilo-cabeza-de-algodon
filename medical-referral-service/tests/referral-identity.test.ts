import { describe, it, expect, vi } from 'vitest';
import type { Request, Response } from 'express';

vi.mock('../src/shared/administrationClient', () => ({ verifyResidentAndVisit: vi.fn() }));
vi.mock('../src/modules/referrals/referral.service', () => ({ createReferral: vi.fn().mockResolvedValue({ id: 2 }) }));
import { create } from '../src/modules/referrals/referral.controller';
import { createReferral } from '../src/modules/referrals/referral.service';
import { createReferralSchema } from '../src/modules/referrals/referral.schemas';

describe('autor de referencia', () => {
  it('ignora el médico enviado y usa la sesión autenticada', async () => {
    const body = createReferralSchema.parse({ patientId: 15, specialty: 'Cardiología', reason: 'Motivo de consulta', referringDoctorId: 999, referringDoctorName: 'Dr. Impostor' });
    const request = { body, auth: { id: 8, fullName: 'Dra. Autenticada' }, get: () => 'Bearer prueba' } as unknown as Request;
    const response = { status() { return this; }, json() { return this; } } as unknown as Response;
    await create(request, response);
    expect(createReferral).toHaveBeenCalledWith(expect.objectContaining({ referringDoctorId: 8, referringDoctorName: 'Dra. Autenticada' }));
  });
});
