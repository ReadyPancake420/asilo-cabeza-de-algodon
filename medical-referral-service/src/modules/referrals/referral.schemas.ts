import { z } from 'zod';

const validDate = (value: string): boolean => {
  const [year, month, day] = value.split('-').map(Number);
  if (!year || !month || !day) return false;
  const parsed = new Date(Date.UTC(year, month - 1, day));
  return (
    parsed.getUTCFullYear() === year &&
    parsed.getUTCMonth() === month - 1 &&
    parsed.getUTCDate() === day
  );
};

export const createReferralSchema = z.object({
  patientId: z.number().int().positive(),
  specialty: z.string().trim().min(3).max(120),
  reason: z.string().trim().min(10).max(1000)
});

export const nurseAssignmentSchema = z.object({
  nurseId: z.number().int().positive(),
  nurseName: z.string().trim().min(3).max(150)
});

export const scheduleSchema = z.object({
  specialistDoctorId: z.number().int().positive(),
  specialistDoctorName: z.string().trim().min(3).max(150),
  scheduledDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine(validDate, 'Fecha invalida'),
  scheduledTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Hora invalida; use HH:mm')
});

export const statusUpdateSchema = z
  .object({
    status: z.enum(['IN_TRANSIT', 'ATTENDED', 'CANCELLED']),
    reason: z.string().trim().min(5).max(250).optional()
  })
  .superRefine((value, context) => {
    if (value.status === 'CANCELLED' && !value.reason) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['reason'],
        message: 'Debe indicar el motivo de cancelacion'
      });
    }
  });

export const convertToVisitSchema = z.object({
  medicalVisitId: z.number().int().positive()
});

