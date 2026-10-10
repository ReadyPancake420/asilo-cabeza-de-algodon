import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import { checkDatabase } from './config/database';
import { administrationRouter } from './modules/administration.routes';
import { authRouter } from './modules/auth.routes';
import { asyncHandler } from './shared/asyncHandler';
import { authenticate } from './shared/auth';
import { errorHandler, notFoundHandler } from './shared/errors';

export const app = express();

app.disable('x-powered-by');
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '200kb' }));
app.use(morgan('dev'));

app.get('/health', asyncHandler(async (_request, response) => {
  await checkDatabase();
  response.json({
    status: 'ok',
    service: 'administration-service',
    database: 'connected',
    timestamp: new Date().toISOString()
  });
}));

app.use('/api/v1/auth', authRouter);
app.use('/api/v1', authenticate, administrationRouter);
app.use(notFoundHandler);
app.use(errorHandler);
