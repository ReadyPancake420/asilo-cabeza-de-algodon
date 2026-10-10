import { ErrorRequestHandler, RequestHandler } from 'express';
import { ZodError } from 'zod';

export class AppError extends Error {
  constructor(
    public readonly statusCode: number,
    public readonly code: string,
    message: string
  ) {
    super(message);
  }
}

export const notFoundHandler: RequestHandler = (request, response) => {
  response.status(404).json({
    error: { code: 'ROUTE_NOT_FOUND', message: `No existe la ruta ${request.method} ${request.originalUrl}` }
  });
};

export const errorHandler: ErrorRequestHandler = (error, _request, response, _next) => {
  if (error instanceof ZodError) {
    response.status(400).json({
      error: { code: 'VALIDATION_ERROR', message: 'Los datos enviados no son validos', details: error.flatten() }
    });
    return;
  }
  if (error instanceof AppError) {
    response.status(error.statusCode).json({ error: { code: error.code, message: error.message } });
    return;
  }
  console.error(error);
  response.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Ocurrio un error interno inesperado' } });
};
