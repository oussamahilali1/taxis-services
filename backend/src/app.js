import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import { config } from './lib/config.js';
import { prisma } from './lib/prisma.js';
import { errorHandler } from './middleware/error-handler.js';
import { notFoundHandler } from './middleware/not-found.js';
import { assignRequestContext } from './middleware/request-context.js';
import { noStore } from './middleware/response-security.js';
import routes from './routes/index.js';

const allowedOrigins = new Set(config.corsOrigins);

const corsMiddleware = cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.has(origin)) {
      return callback(null, true);
    }

    return callback(null, false);
  },
  credentials: true,
});

export const app = express();

app.disable('x-powered-by');
app.set('trust proxy', 1);
app.use(helmet());
app.use(corsMiddleware);
app.use(cookieParser());
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: false }));
app.use(assignRequestContext);
app.use(morgan(config.isProduction ? 'combined' : 'dev'));
app.use('/api/admin', noStore);

app.get('/api/health', async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;

    res.json({
      success: true,
      data: {
        status: 'ok',
        database: 'ok',
        timestamp: new Date().toISOString(),
      },
    });
  } catch (_error) {
    res.status(503).json({
      success: false,
      error: {
        code: 'HEALTHCHECK_FAILED',
        message: 'The service is running but the database is unavailable.',
      },
      data: {
        status: 'degraded',
        database: 'unavailable',
        timestamp: new Date().toISOString(),
      },
    });
  }
});

app.use('/api', routes);
app.use(notFoundHandler);
app.use(errorHandler);
