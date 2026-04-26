import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import session from 'express-session';
import { accommodationRouter } from './routes/accommodationRoutes';
import { authRouter } from './routes/authRoutes';
import { bookingRouter } from './routes/bookingRoutes';
import { profileRouter } from './routes/profileRoutes';
import { adminRouter } from './routes/adminRoutes';
import { errorMiddleware } from './middleware/errorMiddleware';
import { env } from './types/env';

export function createApp() {
  const app = express();
  const allowedOrigins = env.corsOrigin.split(',').map((origin) => origin.trim()).filter(Boolean);

  app.use(helmet());
  app.use(
    cors({
      origin(origin, callback) {
        if (!origin) {
          callback(null, true);
          return;
        }

        const isConfiguredOrigin = allowedOrigins.includes(origin);
        const isLocalhostDevOrigin = /^http:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin);

        if (isConfiguredOrigin || isLocalhostDevOrigin) {
          callback(null, true);
          return;
        }

        callback(new Error('Not allowed by CORS'));
      },
      credentials: true
    })
  );

  app.use(express.json());
  app.use(
    session({
      secret: env.sessionSecret,
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        secure: false,
        sameSite: 'lax',
        maxAge: 1000 * 60 * 60 * 8
      }
    })
  );

  app.get('/health', (_req, res) => {
    res.status(200).json({ ok: true });
  });

  app.use('/accommodation', accommodationRouter);
  app.use(authRouter);
  app.use(bookingRouter);
  app.use(profileRouter);
  app.use(adminRouter);

  app.use(errorMiddleware);

  return app;
}
