import { FastifyInstance } from 'fastify';
import { dashboardService } from '../services/dashboard.service';

export default async function dashboardRoutes(fastify: FastifyInstance) {
  fastify.get('/', async (request, reply) => {
    const data = await dashboardService.getDashboardData();
    return { success: true, data };
  });
}
