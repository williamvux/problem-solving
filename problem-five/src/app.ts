import express from 'express';
import swaggerUi from 'swagger-ui-express';
import { apiRouter } from './shared/router';
import { errorHandler, notFound } from './shared/errors';
import { requestLogger } from './shared/http/logger';
import { generateOpenApiSpec } from './shared/openapi/spec';

export function createApp(): express.Express {
  const app = express();

  app.use(requestLogger);
  app.use(express.json());

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  const openApiSpec = generateOpenApiSpec();
  app.get('/openapi.json', (_req, res) => res.json(openApiSpec));
  app.use('/docs', swaggerUi.serve, swaggerUi.setup(openApiSpec));

  app.use('/api', apiRouter);

  app.use(notFound);
  app.use(errorHandler);

  return app;
}
