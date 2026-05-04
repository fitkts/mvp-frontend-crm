import { FastifyInstance } from 'fastify';
import { lockerService } from '../services/locker.service';

export default async function lockersRoutes(fastify: FastifyInstance) {
  // 전체 사물함 목록 조회
  fastify.get('/', async (request, reply) => {
    const data = await lockerService.getAllLockers();
    return { success: true, data, meta: { total: data.length } };
  });

  // 단일 사물함 상세 (히스토리 포함)
  fastify.get('/:id', async (request: any, reply) => {
    const { id } = request.params;
    const data = await lockerService.getLockerById(id);
    return { success: true, data };
  });

  // 사물함 신규 생성
  fastify.post('/', async (request, reply) => {
    const data = await lockerService.createLocker(request.body);
    return { success: true, data };
  });

  // 사물함 배정
  fastify.post('/:id/assign', async (request: any, reply) => {
    const { id } = request.params;
    const data = await lockerService.assignLocker(id, request.body);
    return { success: true, data };
  });

  // 사물함 정보 수정
  fastify.put('/:id', async (request: any, reply) => {
    const { id } = request.params;
    const data = await lockerService.updateLocker(id, request.body);
    return { success: true, data };
  });

  // 사물함 배정 해제
  fastify.post('/:id/release', async (request: any, reply) => {
    const { id } = request.params;
    const data = await lockerService.releaseLocker(id);
    return { success: true, data };
  });

  // 사물함 히스토리 조회
  fastify.get('/:id/history', async (request: any, reply) => {
    const { id } = request.params;
    const data = await lockerService.getLockerHistory(id);
    return { success: true, data };
  });
}
