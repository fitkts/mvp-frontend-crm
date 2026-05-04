import { FastifyInstance } from 'fastify';
import { staffService } from '../services/staff.service';

export default async function staffRoutes(fastify: FastifyInstance) {
  fastify.get('/', async (request: any, reply) => {
    const data = await staffService.getAllStaff(request.query);
    return { success: true, data, meta: { total: data.length, page: 1, limit: 10 } };
  });

  fastify.get('/:id', async (request: any, reply) => {
    const { id } = request.params;
    const data = await staffService.getStaffById(parseInt(id, 10));
    return { success: true, data };
  });

  fastify.post('/', async (request, reply) => {
    const data = await staffService.createStaff(request.body);
    return { success: true, data };
  });

  fastify.put('/:id', async (request: any, reply) => {
    const { id } = request.params;
    const data = await staffService.updateStaff(parseInt(id, 10), request.body);
    return { success: true, data };
  });

  fastify.delete('/:id', async (request: any, reply) => {
    const { id } = request.params;
    await staffService.deleteStaff(parseInt(id, 10));
    return { success: true, message: '직원 삭제 성공' };
  });
}
