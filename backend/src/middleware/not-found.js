import { HttpError } from '../lib/http-error.js';

export function notFoundHandler(req, _res, next) {
  next(new HttpError(404, 'NOT_FOUND', `No route matches ${req.method} ${req.originalUrl}.`));
}
