import { HttpError } from '../lib/http-error.js';

export function errorHandler(error, req, res, _next) {
  const statusCode = error instanceof HttpError ? error.statusCode : 500;
  const code = error instanceof HttpError ? error.code : 'INTERNAL_SERVER_ERROR';
  const details =
    error?.name === 'ZodError'
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
        error?.name === 'ZodError'
          ? 'Les donnees envoyees sont invalides.'
          : error.message || 'Une erreur est survenue.',
      details,
    },
  });
}
