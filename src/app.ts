import compression from 'compression';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express, { type Application } from 'express';
import helmet from 'helmet';
import { rateLimit } from 'express-rate-limit';
import morgan from 'morgan';
import { env } from './config/env.js';
import { apiRouter } from './routes/index.js';
import { errorHandler, notFound } from './middlewares/error.js';

export function createApp(): Application {
  const app = express();

  app.set('trust proxy', 1);
  app.use(helmet());
  app.use(
    cors({
      origin(origin, cb) {
        // Allow non-browser clients (no origin) and whitelisted origins.
        if (!origin || env.corsOrigins.includes(origin)) return cb(null, true);
        cb(new Error(`Origin ${origin} not allowed by CORS`));
      },
      credentials: true,
    }),
  );
  app.use(compression());
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());
  if (!env.isProd) app.use(morgan('dev'));

  app.use(
    rateLimit({
      windowMs: env.RATE_LIMIT_WINDOW_MS,
      max: env.RATE_LIMIT_MAX,
      standardHeaders: true,
      legacyHeaders: false,
    }),
  );

  app.get('/', (_req, res) => {
    res.json({ success: true, message: 'Kenlivo API', docs: `${env.API_PREFIX}/health` });
  });

  app.use(env.API_PREFIX, apiRouter);

  app.use(notFound);
  app.use(errorHandler);

  return app;
}
