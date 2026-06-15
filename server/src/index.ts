import express from 'express';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from './config.js';
import { csrfMiddleware } from './middleware/csrf.js';
import { apiLimiter } from './middleware/rateLimiter.js';
import { errorHandler } from './middleware/errorHandler.js';
import authRoutes from './routes/auth.js';
import pushRoutes from './routes/push.js';
import meRoutes from './routes/me.js';
import pagesRoutes from './routes/pages.js';
import syncRoutes from './routes/sync.js';
import './lib/migrate.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();

app.set('trust proxy', config.isProduction ? 1 : 0);

app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
}));

app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(apiLimiter);
app.use(csrfMiddleware);

const staticDir = path.resolve(__dirname, '../static');
app.use(express.static(staticDir));

app.use('/api/auth', authRoutes);
app.use('/api/push', pushRoutes);
app.use('/api/me', meRoutes);
app.use('/api/pages', pagesRoutes);
app.use('/api/sync', syncRoutes);

app.get('*', (_req, res) => {
  const indexPath = path.join(staticDir, 'index.html');
  res.sendFile(indexPath, (err) => {
    if (err) {
      res.status(200).json({ status: 'ok', message: 'API server running. Build the webui for the full UI.' });
    }
  });
});

app.use(errorHandler);

app.listen(config.port, () => {
  console.log(`Server listening on http://localhost:${config.port}`);
});

export default app;
