export const REFERRAL_STATUSES = [
  'PENDING_NURSE_ASSIGNMENT',
  'PENDING_FOUNDATION',
  'APPOINTMENT_SCHEDULED',
  'IN_TRANSIT',
  'ATTENDED',
  'COMPLETED',
  'CANCELLED'
] as const;

export type ReferralStatus = (typeof REFERRAL_STATUSES)[number];

export type CreateReferralInput = {
  patientId: number;
  specialty: string;
  reason: string;
  referringDoctorId: number;
  referringDoctorName: string;
};

export type NurseAssignmentInput = {
  nurseId: number;
  nurseName: string;
};

export type ScheduleInput = {
  specialistDoctorId: number;
  specialistDoctorName: string;
  scheduledDate: string;
  scheduledTime: string;
};

