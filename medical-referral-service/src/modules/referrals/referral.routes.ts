import { Router } from 'express';
import { asyncHandler } from '../../shared/asyncHandler';
import { allowRoles, authenticate, authorizeStatusUpdate } from '../../shared/auth';
import { validateBody } from '../../shared/validate';
import * as controller from './referral.controller';
import {
  convertToVisitSchema,
  createReferralSchema,
  nurseAssignmentSchema,
  scheduleSchema,
  statusUpdateSchema
} from './referral.schemas';

export const referralRouter = Router();

referralRouter.use(authenticate);
referralRouter.post('/', allowRoles('MEDICO'), validateBody(createReferralSchema), asyncHandler(controller.create));
referralRouter.get('/', asyncHandler(controller.list));
referralRouter.get('/:id', asyncHandler(controller.getOne));
referralRouter.patch(
  '/:id/nurse',
  allowRoles('COORDINACION'),
  validateBody(nurseAssignmentSchema),
  asyncHandler(controller.nurse)
);
referralRouter.patch(
  '/:id/schedule',
  allowRoles('COORDINACION'),
  validateBody(scheduleSchema),
  asyncHandler(controller.schedule)
);
referralRouter.patch(
  '/:id/status',
  validateBody(statusUpdateSchema),
  authorizeStatusUpdate,
  asyncHandler(controller.status)
);
referralRouter.post(
  '/:id/convert-to-visit',
  allowRoles('COORDINACION'),
  validateBody(convertToVisitSchema),
  asyncHandler(controller.convert)
);

