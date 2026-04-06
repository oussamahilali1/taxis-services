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
    console.error(error);
  }

  res.status(statusCode).json({
    success: false,
    error: {
      code,
      message:
        isValidationError
          ? 'Les donnees envoyees sont invalides.'
          : error.message || 'Une erreur est survenue.',
      details,
    },
  });
}
