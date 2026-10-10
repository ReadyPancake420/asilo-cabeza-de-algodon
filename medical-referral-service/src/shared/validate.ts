import { NextFunction, Request, Response } from 'express';
import { ZodTypeAny } from 'zod';

export function validateBody(schema: ZodTypeAny) {
  return (request: Request, _response: Response, next: NextFunction): void => {
    request.body = schema.parse(request.body);
    next();
  };
}

