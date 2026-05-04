import { FastifyInstance } from 'fastify';
import { paymentsService } from '../services/payments.service';

export default async function paymentsRoutes(fastify: FastifyInstance) {
  fastify.get('/', async (request, reply) => {
    const data = await paymentsService.getPayments(request.query);
    return { success: true, ...data };
  });

  fastify.post('/', async (request, reply) => {
    const data = await paymentsService.createPayment(request.body);
    return { success: true, data };
  });

  fastify.get('/:memberId', async (request: any, reply) => {
    const data = await paymentsService.getPaymentsByMemberId(Number(request.params.memberId));
    return { success: true, data };
  });

  fastify.put('/:id', async (request: any, reply) => {
    const data = await paymentsService.updatePayment(request.params.id, request.body);
    return { success: true, data };
  });
}
