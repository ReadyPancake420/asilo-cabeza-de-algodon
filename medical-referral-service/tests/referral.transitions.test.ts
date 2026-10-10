import { describe, expect, it } from 'vitest';
import {
  getAllowedNextStatuses,
  isTransitionAllowed
} from '../src/modules/referrals/referral.transitions';

describe('flujo de estados de una referencia', () => {
  it('permite el flujo normal hasta una visita completada', () => {
    expect(isTransitionAllowed('PENDING_NURSE_ASSIGNMENT', 'PENDING_FOUNDATION')).toBe(true);
    expect(isTransitionAllowed('PENDING_FOUNDATION', 'APPOINTMENT_SCHEDULED')).toBe(true);
    expect(isTransitionAllowed('APPOINTMENT_SCHEDULED', 'IN_TRANSIT')).toBe(true);
    expect(isTransitionAllowed('IN_TRANSIT', 'ATTENDED')).toBe(true);
    expect(isTransitionAllowed('ATTENDED', 'COMPLETED')).toBe(true);
  });

  it('no permite saltar directamente de creada a atendida', () => {
    expect(isTransitionAllowed('PENDING_NURSE_ASSIGNMENT', 'ATTENDED')).toBe(false);
  });

  it('considera COMPLETED y CANCELLED como estados finales', () => {
    expect(getAllowedNextStatuses('COMPLETED')).toEqual([]);
    expect(getAllowedNextStatuses('CANCELLED')).toEqual([]);
  });
});

