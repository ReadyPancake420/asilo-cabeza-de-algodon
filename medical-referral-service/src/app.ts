import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import { checkDatabase } from './config/database';
import { referralRouter } from './modules/referrals/referral.routes';
import { asyncHandler } from './shared/asyncHandler';
import { errorHandler, notFoundHandler } from './shared/errorHandler';

export const app = express();

app.disable('x-powered-by');
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '100kb' }));
app.use(morgan('dev'));

app.get(
  '/health',
  asyncHandler(async (_request, response) => {
    await checkDatabase();
    response.json({
      status: 'ok',
      service: 'medical-referral-service',
      database: 'connected',
      timestamp: new Date().toISOString()
    });
  })
);

app.use('/api/v1/referrals', referralRouter);
app.use(notFoundHandler);
app.use(errorHandler);

