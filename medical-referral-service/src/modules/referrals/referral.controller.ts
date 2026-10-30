import { Request, Response } from 'express';
import { AppError } from '../../shared/AppError';
import { verifyResidentAndVisit } from '../../shared/administrationClient';
import {
  allowedNextStatuses,
  assignNurse,
  convertToMedicalVisit,
  createReferral,
  getReferral,
  listReferrals,
  scheduleAppointment,
  updateStatus
} from './referral.service';
import { REFERRAL_STATUSES, ReferralStatus } from './referral.types';

const parsePositiveId = (value: unknown): number => {
  const id = Number(Array.isArray(value) ? value[0] : value);
  if (!Number.isInteger(id) || id <= 0) {
    throw new AppError(400, 'INVALID_ID', 'El identificador debe ser un entero positivo');
  }
  return id;
};

export async function create(request: Request, response: Response): Promise<void> {
  await verifyResidentAndVisit(request.body.patientId, null, request.get('authorization') || '');
  response.status(201).json({ data: await createReferral({ ...request.body, referringDoctorId: request.auth!.id, referringDoctorName: request.auth!.fullName }) });
}

export async function getOne(request: Request, response: Response): Promise<void> {
  const referral = await getReferral(parsePositiveId(request.params.id));
  response.json({
    data: {
      ...referral,
      allowedNextStatuses: allowedNextStatuses(referral.status)
    }
  });
}

export async function list(request: Request, response: Response): Promise<void> {
  const patientId = request.query.patientId
    ? parsePositiveId(String(request.query.patientId))
    : undefined;
  const status = request.query.status ? String(request.query.status) : undefined;
  const specialty = request.query.specialty ? String(request.query.specialty) : undefined;

  if (status && !REFERRAL_STATUSES.includes(status as ReferralStatus)) {
    throw new AppError(400, 'INVALID_STATUS', 'El estado de referencia no es valido');
  }

  response.json({
    data: await listReferrals({ patientId, status: status as ReferralStatus | undefined, specialty })
  });
}

export async function nurse(request: Request, response: Response): Promise<void> {
  response.json({
    data: await assignNurse(parsePositiveId(request.params.id), request.body)
  });
}

export async function schedule(request: Request, response: Response): Promise<void> {
  response.json({
    data: await scheduleAppointment(parsePositiveId(request.params.id), request.body)
  });
}

export async function status(request: Request, response: Response): Promise<void> {
  response.json({
    data: await updateStatus(
      parsePositiveId(request.params.id),
      request.body.status,
      request.body.reason
    )
  });
}

export async function convert(request: Request, response: Response): Promise<void> {
  response.json({
    data: await convertToMedicalVisit(
      parsePositiveId(request.params.id),
      request.body.medicalVisitId,
      request.get('authorization') || ''
    )
  });
}
