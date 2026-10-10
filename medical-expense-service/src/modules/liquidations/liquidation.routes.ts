import { Router } from 'express';
import { asyncHandler } from '../../shared/asyncHandler';
import { allowRoles, authenticate } from '../../shared/auth';
import { validateBody } from '../../shared/validate';
import * as controller from './liquidation.controller';
import {
  calculationSchema,
  createLiquidationSchema,
  voidLiquidationSchema
} from './liquidation.schemas';

export const liquidationRouter = Router();

liquidationRouter.use(authenticate);
liquidationRouter.post('/preview', allowRoles('ADMINISTRACION'), validateBody(calculationSchema), controller.preview);
liquidationRouter.post('/', allowRoles('ADMINISTRACION'), validateBody(createLiquidationSchema), asyncHandler(controller.create));
liquidationRouter.get('/', allowRoles('COORDINACION', 'ADMINISTRACION'), asyncHandler(controller.list));
liquidationRouter.get('/visit/:medicalVisitId', allowRoles('COORDINACION', 'ADMINISTRACION'), asyncHandler(controller.getByVisit));
liquidationRouter.get('/:id', allowRoles('COORDINACION', 'ADMINISTRACION'), asyncHandler(controller.getOne));
liquidationRouter.patch(
  '/:id/void',
  allowRoles('ADMINISTRACION'),
  validateBody(voidLiquidationSchema),
  asyncHandler(controller.voidOne)
);

