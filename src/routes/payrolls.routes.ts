import { FastifyInstance } from 'fastify';
import { payrollsService } from '../services/payrolls.service';

export default async function payrollsRoutes(fastify: FastifyInstance) {
  fastify.get('/', async (request, reply) => {
    const data = await payrollsService.getPayrolls(request.query);
    return { success: true, data };
  });

  fastify.post('/generate', async (request: any, reply) => {
    const { period } = request.body;
    const data = await payrollsService.generatePayrolls(period);
    return { success: true, data };
  });

  fastify.put('/:id/status', async (request: any, reply) => {
    const { status } = request.body;
    const data = await payrollsService.updatePayrollStatus(Number(request.params.id), status);
    return { success: true, data };
  });
}
