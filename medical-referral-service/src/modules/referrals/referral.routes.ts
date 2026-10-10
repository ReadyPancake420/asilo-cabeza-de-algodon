import { Router } from 'express';
import { asyncHandler } from '../../shared/asyncHandler';
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

referralRouter.post('/', validateBody(createReferralSchema), asyncHandler(controller.create));
referralRouter.get('/', asyncHandler(controller.list));
referralRouter.get('/:id', asyncHandler(controller.getOne));
referralRouter.patch(
  '/:id/nurse',
  validateBody(nurseAssignmentSchema),
  asyncHandler(controller.nurse)
);
referralRouter.patch(
  '/:id/schedule',
  validateBody(scheduleSchema),
  asyncHandler(controller.schedule)
);
referralRouter.patch(
  '/:id/status',
  validateBody(statusUpdateSchema),
  asyncHandler(controller.status)
);
referralRouter.post(
  '/:id/convert-to-visit',
  validateBody(convertToVisitSchema),
  asyncHandler(controller.convert)
);

