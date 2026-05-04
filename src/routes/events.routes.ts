import { FastifyInstance } from 'fastify';
import { eventsService } from '../services/events.service';

export default async function eventsRoutes(fastify: FastifyInstance) {
  fastify.get('/', async (request, reply) => {
    const data = await eventsService.getEvents(request.query);
    return { success: true, data };
  });

  fastify.post('/', async (request, reply) => {
    const data = await eventsService.createEvent(request.body);
    return { success: true, data };
  });

  fastify.delete('/:id', async (request: any, reply) => {
    const data = await eventsService.deleteEvent(Number(request.params.id));
    return { success: true, data };
  });
}
