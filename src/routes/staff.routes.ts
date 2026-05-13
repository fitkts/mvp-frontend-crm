import { FastifyInstance } from 'fastify';
import { ZodError } from 'zod';
import { staffService } from '../services/staff.service';

export default async function staffRoutes(fastify: FastifyInstance) {
  fastify.get('/', async (request: any, reply) => {
    try {
      const data = await staffService.getAllStaff(request.query);
      return { success: true, data, meta: { total: data.length, page: 1, limit: 10 } };
    } catch (error: any) {
      fastify.log.error(error);
      reply.status(500).send({ success: false, error: { code: 'SERVER_ERROR', message: error.message || 'Internal Server Error' } });
    }
  });

  fastify.get('/:id', async (request: any, reply) => {
    try {
      const { id } = request.params;
      const data = await staffService.getStaffById(parseInt(id, 10));
      return { success: true, data };
    } catch (error: any) {
      if (error.message === '직원을 찾을 수 없습니다.') {
        reply.status(404).send({ success: false, error: { code: 'NOT_FOUND', message: error.message } });
        return;
      }
      fastify.log.error(error);
      reply.status(500).send({ success: false, error: { code: 'SERVER_ERROR', message: error.message || 'Internal Server Error' } });
    }
  });

  fastify.post('/', async (request, reply) => {
    try {
      const data = await staffService.createStaff(request.body);
      reply.status(201).send({ success: true, data });
    } catch (error: any) {
      if (error instanceof ZodError) {
        const fieldErrors = error.errors.map(e => ({ field: e.path.join('.'), message: e.message }));
        reply.status(400).send({ success: false, error: { code: 'VALIDATION_ERROR', message: '입력 데이터 검증에 실패했습니다.', details: fieldErrors } });
        return;
      }
      if (error.message === '이미 사용 중인 이메일입니다.') {
        reply.status(409).send({ success: false, error: { code: 'DUPLICATE_EMAIL', message: error.message } });
        return;
      }
      fastify.log.error(error);
      reply.status(500).send({ success: false, error: { code: 'SERVER_ERROR', message: error.message || 'Internal Server Error' } });
    }
  });

  fastify.put('/:id', async (request: any, reply) => {
    try {
      const { id } = request.params;
      const data = await staffService.updateStaff(parseInt(id, 10), request.body);
      return { success: true, data };
    } catch (error: any) {
      if (error instanceof ZodError) {
        const fieldErrors = error.errors.map(e => ({ field: e.path.join('.'), message: e.message }));
        reply.status(400).send({ success: false, error: { code: 'VALIDATION_ERROR', message: '입력 데이터 검증에 실패했습니다.', details: fieldErrors } });
        return;
      }
      fastify.log.error(error);
      reply.status(500).send({ success: false, error: { code: 'SERVER_ERROR', message: error.message || 'Internal Server Error' } });
    }
  });

  fastify.delete('/:id', async (request: any, reply) => {
    try {
      const { id } = request.params;
      await staffService.deleteStaff(parseInt(id, 10));
      return { success: true, message: '직원 삭제 성공' };
    } catch (error: any) {
      fastify.log.error(error);
      reply.status(500).send({ success: false, error: { code: 'SERVER_ERROR', message: error.message || 'Internal Server Error' } });
    }
  });
}
