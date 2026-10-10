import { Router } from 'express';
import { asyncHandler } from '../../shared/asyncHandler';
import { validateBody } from '../../shared/validate';
import * as controller from './liquidation.controller';
import {
  calculationSchema,
  createLiquidationSchema,
  voidLiquidationSchema
} from './liquidation.schemas';

export const liquidationRouter = Router();

liquidationRouter.post('/preview', validateBody(calculationSchema), controller.preview);
liquidationRouter.post('/', validateBody(createLiquidationSchema), asyncHandler(controller.create));
liquidationRouter.get('/', asyncHandler(controller.list));
liquidationRouter.get('/visit/:medicalVisitId', asyncHandler(controller.getByVisit));
liquidationRouter.get('/:id', asyncHandler(controller.getOne));
liquidationRouter.patch(
  '/:id/void',
  validateBody(voidLiquidationSchema),
  asyncHandler(controller.voidOne)
);

