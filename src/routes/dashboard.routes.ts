import { FastifyInstance } from 'fastify';
import { dashboardService } from '../services/dashboard.service';

export default async function dashboardRoutes(fastify: FastifyInstance) {
  fastify.get('/', async (request, reply) => {
    const data = await dashboardService.getDashboardData();
    return { success: true, data };
  });

  fastify.get('/stats', async (request, reply) => {
    const data = await dashboardService.getDashboardStats();
    return { success: true, data };
  });

  fastify.get('/trends', async (request, reply) => {
    const data = await dashboardService.getDashboardTrends();
    return { success: true, data };
  });

  fastify.get('/activities', async (request, reply) => {
    const data = await dashboardService.getRecentActivities();
    return { success: true, data };
  });
}
