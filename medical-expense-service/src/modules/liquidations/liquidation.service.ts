import { AppError } from '../../shared/AppError';
import { calculateMedicalExpense } from './liquidation.calculator';
import {
  findLiquidationById,
  findLiquidationByVisitId,
  insertLiquidation,
  listLiquidations,
  voidLiquidation
} from './liquidation.repository';
import { CalculateExpenseInput, CreateLiquidationInput } from './liquidation.types';

export const previewCalculation = (input: CalculateExpenseInput) => calculateMedicalExpense(input);

export async function createLiquidation(input: CreateLiquidationInput) {
  if (input.appointmentStatus === 'CANCELLED') {
    throw new AppError(
      422,
      'CANCELLED_APPOINTMENT',
      'No se puede liquidar una cita cancelada'
    );
  }

  const calculation = calculateMedicalExpense(input);

  try {
    const id = await insertLiquidation(input, calculation);
    return await getLiquidation(id);
  } catch (error) {
    if ((error as { code?: string }).code === 'ER_DUP_ENTRY') {
      throw new AppError(
        409,
        'VISIT_ALREADY_LIQUIDATED',
        'La visita medica ya tiene una liquidacion'
      );
    }
    throw error;
  }
}

export async function getLiquidation(id: number) {
  const liquidation = await findLiquidationById(id);
  if (!liquidation) {
    throw new AppError(404, 'LIQUIDATION_NOT_FOUND', 'No se encontro la liquidacion');
  }
  return liquidation;
}

export async function getLiquidationByVisit(medicalVisitId: number) {
  const liquidation = await findLiquidationByVisitId(medicalVisitId);
  if (!liquidation) {
    throw new AppError(404, 'LIQUIDATION_NOT_FOUND', 'La visita no tiene una liquidacion');
  }
  return liquidation;
}

export { listLiquidations };

export async function markLiquidationAsVoided(id: number, reason: string) {
  const exists = await findLiquidationById(id);
  if (!exists) {
    throw new AppError(404, 'LIQUIDATION_NOT_FOUND', 'No se encontro la liquidacion');
  }
  if (exists.status === 'VOIDED') {
    throw new AppError(409, 'LIQUIDATION_ALREADY_VOIDED', 'La liquidacion ya esta anulada');
  }

  const updated = await voidLiquidation(id, reason);
  if (!updated) {
    throw new AppError(409, 'LIQUIDATION_UPDATE_CONFLICT', 'La liquidacion cambio de estado');
  }
  return getLiquidation(id);
}

