import { z } from 'zod';
import { APPOINTMENT_STATUSES } from './liquidation.types';

const money = z.number().finite().nonnegative().max(1_000_000).multipleOf(0.01);

const expenseItemSchema = z.object({
  name: z.string().trim().min(2).max(150),
  quantity: z.number().int().positive().max(10_000).default(1),
  unitPrice: money
});

export const calculationSchema = z.object({
  consultationAmount: money,
  foundationDiscountPercent: z.number().finite().min(0).max(100).multipleOf(0.01).default(0),
  laboratoryItems: z.array(expenseItemSchema).max(100).default([]),
  pharmacyItems: z.array(expenseItemSchema).max(100).default([])
});

export const createLiquidationSchema = calculationSchema.extend({
  medicalVisitId: z.number().int().positive(),
  patientId: z.number().int().positive(),
  appointmentStatus: z.enum(APPOINTMENT_STATUSES)
});

export const voidLiquidationSchema = z.object({
  reason: z.string().trim().min(5).max(250)
});
