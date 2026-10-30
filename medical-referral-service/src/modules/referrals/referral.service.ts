import { AppError } from '../../shared/AppError';
import { verifyResidentAndVisit } from '../../shared/administrationClient';
import {
  findReferralById,
  insertReferral,
  listReferrals,
  updateReferralWithEvent
} from './referral.repository';
import { assertTransitionAllowed, getAllowedNextStatuses } from './referral.transitions';
import {
  CreateReferralInput,
  NurseAssignmentInput,
  ReferralStatus,
  ScheduleInput
} from './referral.types';

type StoredReferral = Record<string, unknown> & { status: ReferralStatus };

export async function getReferral(id: number): Promise<StoredReferral> {
  const referral = await findReferralById(id);
  if (!referral) {
    throw new AppError(404, 'REFERRAL_NOT_FOUND', 'No se encontro la referencia medica');
  }
  return referral as StoredReferral;
}

export async function createReferral(input: CreateReferralInput): Promise<StoredReferral> {
  const id = await insertReferral(input);
  return getReferral(id);
}

async function persistTransition(options: Parameters<typeof updateReferralWithEvent>[0]) {
  const updated = await updateReferralWithEvent(options);
  if (!updated) {
    throw new AppError(
      409,
      'REFERRAL_UPDATE_CONFLICT',
      'La referencia cambio de estado; vuelva a consultarla'
    );
  }
  return getReferral(options.id);
}

export async function assignNurse(id: number, input: NurseAssignmentInput) {
  const referral = await getReferral(id);
  assertTransitionAllowed(referral.status, 'PENDING_FOUNDATION');

  return persistTransition({
    id,
    expectedStatus: referral.status,
    newStatus: 'PENDING_FOUNDATION',
    fields: { nurse_id: input.nurseId, nurse_name: input.nurseName },
    eventType: 'NURSE_ASSIGNED',
    description: `Enfermero acompañante asignado: ${input.nurseName}`
  });
}

export async function scheduleAppointment(id: number, input: ScheduleInput) {
  const referral = await getReferral(id);
  const isReschedule = referral.status === 'APPOINTMENT_SCHEDULED';

  if (!isReschedule) {
    assertTransitionAllowed(referral.status, 'APPOINTMENT_SCHEDULED');
  }

  return persistTransition({
    id,
    expectedStatus: referral.status,
    newStatus: 'APPOINTMENT_SCHEDULED',
    fields: {
      specialist_doctor_id: input.specialistDoctorId,
      specialist_doctor_name: input.specialistDoctorName,
      scheduled_date: input.scheduledDate,
      scheduled_time: `${input.scheduledTime}:00`
    },
    eventType: isReschedule ? 'RESCHEDULED' : 'SCHEDULED',
    description: `${isReschedule ? 'Cita reprogramada' : 'Cita programada'} con ${input.specialistDoctorName} para ${input.scheduledDate} ${input.scheduledTime}`
  });
}

export async function updateStatus(
  id: number,
  newStatus: 'IN_TRANSIT' | 'ATTENDED' | 'CANCELLED',
  reason?: string
) {
  const referral = await getReferral(id);
  assertTransitionAllowed(referral.status, newStatus);

  const description =
    newStatus === 'CANCELLED'
      ? `Referencia cancelada: ${reason}`
      : `Estado actualizado a ${newStatus}`;

  return persistTransition({
    id,
    expectedStatus: referral.status,
    newStatus,
    fields: reason ? { cancellation_reason: reason } : {},
    eventType: newStatus === 'CANCELLED' ? 'CANCELLED' : 'STATUS_CHANGED',
    description
  });
}

export async function convertToMedicalVisit(id: number, medicalVisitId: number, authorization: string) {
  const referral = await getReferral(id);
  assertTransitionAllowed(referral.status, 'COMPLETED');
  await verifyResidentAndVisit(Number(referral.patientId), medicalVisitId, authorization);

  try {
    return await persistTransition({
      id,
      expectedStatus: referral.status,
      newStatus: 'COMPLETED',
      fields: { medical_visit_id: medicalVisitId },
      eventType: 'CONVERTED_TO_VISIT',
      description: `Solicitud convertida en visita medica ${medicalVisitId}`
    });
  } catch (error) {
    if ((error as { code?: string }).code === 'ER_DUP_ENTRY') {
      throw new AppError(409, 'VISIT_ALREADY_LINKED', 'La visita medica ya esta vinculada');
    }
    throw error;
  }
}

export function allowedNextStatuses(status: ReferralStatus): ReferralStatus[] {
  return getAllowedNextStatuses(status);
}

export { listReferrals };

