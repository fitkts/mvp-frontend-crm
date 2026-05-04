import { FastifyInstance } from 'fastify';
import { productService } from '../services/product.service';

export default async function productsRoutes(fastify: FastifyInstance) {
  fastify.get('/', async (request: any, reply) => {
    const data = await productService.getAllProducts(request.query);
    return { success: true, data, meta: { total: data.length, page: 1, limit: 10 } };
  });

  fastify.get('/:id', async (request: any, reply) => {
    const { id } = request.params;
    const data = await productService.getProductById(parseInt(id, 10));
    return { success: true, data };
  });

  fastify.post('/', async (request, reply) => {
    const data = await productService.createProduct(request.body);
    return { success: true, data };
  });

  fastify.put('/:id', async (request: any, reply) => {
    const { id } = request.params;
    const data = await productService.updateProduct(parseInt(id, 10), request.body);
    return { success: true, data };
  });

  fastify.delete('/:id', async (request: any, reply) => {
    const { id } = request.params;
    await productService.deleteProduct(parseInt(id, 10));
    return { success: true, message: '상품 삭제 성공' };
  });
}
