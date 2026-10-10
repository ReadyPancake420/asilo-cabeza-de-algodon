export const APPOINTMENT_STATUSES = ['SCHEDULED', 'COMPLETED', 'CANCELLED'] as const;
export type AppointmentStatus = (typeof APPOINTMENT_STATUSES)[number];

export const LIQUIDATION_STATUSES = ['FINALIZED', 'VOIDED'] as const;
export type LiquidationStatus = (typeof LIQUIDATION_STATUSES)[number];

export type ExpenseItemInput = {
  name: string;
  quantity: number;
  unitPrice: number;
};

export type CalculateExpenseInput = {
  consultationAmount: number;
  foundationDiscountPercent: number;
  laboratoryItems: ExpenseItemInput[];
  pharmacyItems: ExpenseItemInput[];
};

export type CalculatedItem = ExpenseItemInput & {
  subtotal: number;
};

export type ExpenseCalculation = {
  consultationAmount: number;
  laboratorySubtotal: number;
  pharmacySubtotal: number;
  grossTotal: number;
  foundationDiscountPercent: number;
  discountAmount: number;
  totalDue: number;
  currency: 'GTQ';
  laboratoryItems: CalculatedItem[];
  pharmacyItems: CalculatedItem[];
};

export type CreateLiquidationInput = CalculateExpenseInput & {
  medicalVisitId: number;
  patientId: number;
  appointmentStatus: AppointmentStatus;
};

