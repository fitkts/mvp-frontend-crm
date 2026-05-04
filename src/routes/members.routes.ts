import { FastifyInstance } from 'fastify';
import { membersService } from '../services/members.service';

export default async function membersRoutes(fastify: FastifyInstance) {
  fastify.get('/', async (request, reply) => {
    const data = await membersService.getMembers(request.query);
    return { success: true, ...data };
  });

  fastify.post('/', async (request, reply) => {
    const data = await membersService.createMember(request.body);
    return { success: true, data };
  });

  fastify.get('/:id', async (request: any, reply) => {
    const data = await membersService.getMemberById(Number(request.params.id));
    return { success: true, data };
  });

  fastify.put('/:id', async (request: any, reply) => {
    const data = await membersService.updateMember(Number(request.params.id), request.body);
    return { success: true, data };
  });

  fastify.delete('/:id', async (request: any, reply) => {
    const data = await membersService.deleteMember(Number(request.params.id));
    return { success: true, data };
  });
}
