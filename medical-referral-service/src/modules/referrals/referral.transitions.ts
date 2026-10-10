import { AppError } from '../../shared/AppError';
import { ReferralStatus } from './referral.types';

const ALLOWED_TRANSITIONS: Record<ReferralStatus, ReferralStatus[]> = {
  PENDING_NURSE_ASSIGNMENT: ['PENDING_FOUNDATION', 'CANCELLED'],
  PENDING_FOUNDATION: ['APPOINTMENT_SCHEDULED', 'CANCELLED'],
  APPOINTMENT_SCHEDULED: ['IN_TRANSIT', 'CANCELLED'],
  IN_TRANSIT: ['ATTENDED', 'CANCELLED'],
  ATTENDED: ['COMPLETED'],
  COMPLETED: [],
  CANCELLED: []
};

export function isTransitionAllowed(from: ReferralStatus, to: ReferralStatus): boolean {
  return ALLOWED_TRANSITIONS[from].includes(to);
}

export function assertTransitionAllowed(from: ReferralStatus, to: ReferralStatus): void {
  if (!isTransitionAllowed(from, to)) {
    throw new AppError(
      409,
      'INVALID_STATUS_TRANSITION',
      `No se permite cambiar la referencia de ${from} a ${to}`,
      { allowedNextStatuses: ALLOWED_TRANSITIONS[from] }
    );
  }
}

export function getAllowedNextStatuses(status: ReferralStatus): ReferralStatus[] {
  return [...ALLOWED_TRANSITIONS[status]];
}

