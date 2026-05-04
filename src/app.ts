import Fastify from 'fastify';
import cors from '@fastify/cors';
import { AppError } from './lib/errors';

import staffRoutes from './routes/staff.routes';
import membersRoutes from './routes/members.routes';
import productsRoutes from './routes/products.routes';
import paymentsRoutes from './routes/payments.routes';
import lockersRoutes from './routes/lockers.routes';
import payrollsRoutes from './routes/payrolls.routes';
import eventsRoutes from './routes/events.routes';
import dashboardRoutes from './routes/dashboard.routes';

export function buildApp() {
  const app = Fastify({ logger: true });

  // Register CORS
  app.register(cors, {
    origin: true // Allow all origins for dev, restrict in prod
  });

  // Standardized Error Handler
  app.setErrorHandler((error, request, reply) => {
    if (error instanceof AppError) {
      reply.status(error.statusCode).send({
        success: false,
        error: {
          code: error.code,
          message: error.message
        }
      });
      return;
    }

    // Default error
    app.log.error(error);
    reply.status(500).send({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Internal Server Error'
      }
    });
  });

  // Register Routes
  app.register(staffRoutes, { prefix: '/api/v1/staff' });
  app.register(membersRoutes, { prefix: '/api/v1/members' });
  app.register(productsRoutes, { prefix: '/api/v1/products' });
  app.register(paymentsRoutes, { prefix: '/api/v1/payments' });
  app.register(lockersRoutes, { prefix: '/api/v1/lockers' });
  app.register(payrollsRoutes, { prefix: '/api/v1/payrolls' });
  app.register(eventsRoutes, { prefix: '/api/v1/events' });
  app.register(dashboardRoutes, { prefix: '/api/v1/dashboard' });

  return app;
}
