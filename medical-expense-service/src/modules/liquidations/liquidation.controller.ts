import { Request, Response } from 'express';
import { AppError } from '../../shared/AppError';
import { verifyResidentAndVisit } from '../../shared/administrationClient';
import {
  createLiquidation,
  getLiquidation,
  getLiquidationByVisit,
  listLiquidations,
  markLiquidationAsVoided,
  previewCalculation
} from './liquidation.service';

const parsePositiveId = (value: unknown): number => {
  const id = Number(Array.isArray(value) ? value[0] : value);
  if (!Number.isInteger(id) || id <= 0) {
    throw new AppError(400, 'INVALID_ID', 'El identificador debe ser un entero positivo');
  }
  return id;
};

export function preview(request: Request, response: Response): void {
  response.json({ data: previewCalculation(request.body) });
}

export async function create(request: Request, response: Response): Promise<void> {
  if (request.body.appointmentStatus !== 'CANCELLED') {
    await verifyResidentAndVisit(request.body.patientId, request.body.medicalVisitId, request.get('authorization') || '');
  }
  const liquidation = await createLiquidation(request.body);
  response.status(201).json({ data: liquidation });
}

export async function getOne(request: Request, response: Response): Promise<void> {
  response.json({ data: await getLiquidation(parsePositiveId(request.params.id)) });
}

export async function getByVisit(request: Request, response: Response): Promise<void> {
  response.json({
    data: await getLiquidationByVisit(parsePositiveId(request.params.medicalVisitId))
  });
}

export async function list(request: Request, response: Response): Promise<void> {
  const patientId = request.query.patientId
    ? parsePositiveId(String(request.query.patientId))
    : undefined;
  const status = request.query.status ? String(request.query.status) : undefined;

  if (status && !['FINALIZED', 'VOIDED'].includes(status)) {
    throw new AppError(400, 'INVALID_STATUS', 'El estado de liquidacion no es valido');
  }

  response.json({ data: await listLiquidations({ patientId, status }) });
}

export async function voidOne(request: Request, response: Response): Promise<void> {
  const liquidation = await markLiquidationAsVoided(
    parsePositiveId(request.params.id),
    request.body.reason
  );
  response.json({ data: liquidation });
}
