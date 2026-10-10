import { NextFunction, Request, Response, RequestHandler } from 'express';

export function asyncHandler(
  handler: (request: Request, response: Response, next: NextFunction) => Promise<unknown>
): RequestHandler {
  return (request, response, next) => {
    void Promise.resolve(handler(request, response, next)).catch(next);
  };
}

