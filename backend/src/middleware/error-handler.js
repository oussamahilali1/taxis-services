import { HttpError } from '../lib/http-error.js';
import { ZodError } from 'zod';

export function errorHandler(error, req, res, _next) {
  const isValidationError = error instanceof ZodError;
  const statusCode = error instanceof HttpError ? error.statusCode : isValidationError ? 400 : 500;
  const code = error instanceof HttpError ? error.code : isValidationError ? 'VALIDATION_ERROR' : 'INTERNAL_SERVER_ERROR';
  const details = isValidationError
    ? error.issues.map((issue) => ({
        path: issue.path.join('.'),
        message: issue.message,
      }))
      : error instanceof HttpError
      ? error.details
      : undefined;

  if (statusCode >= 500) {
    console.error(
      JSON.stringify({
        type: 'error',
        timestamp: new Date().toISOString(),
        requestId: req.requestId,
        method: req.method,
        path: req.originalUrl,
        message: error?.message,
        stack: error?.stack,
      })
    );
  }

  res.status(statusCode).json({
    success: false,
    error: {
      code,
      message: statusCode >= 500 ? 'Une erreur interne est survenue. Veuillez reessayer plus tard.' : isValidationError ? 'Les donnees envoyees sont invalides.' : error.message || 'Une erreur est survenue.',
      details,
      requestId: req.requestId,
    },
  });
}
