// ⚠️ DEPRECATED: 이 파일은 사용하지 않습니다. product.service.ts를 사용하세요.
// 호환성을 위해 product.service.ts로 리다이렉트합니다.
import { productService } from './product.service';

export const productsService = {
  async getProducts(query: any = {}) {
    return { data: await productService.getAllProducts(query), meta: { total: 0, page: 1, limit: 20 } };
  },
  async createProduct(data: any) {
    return productService.createProduct(data);
  },
  async getProductById(id: number) {
    return productService.getProductById(id);
  },
  async updateProduct(id: number, data: any) {
    return productService.updateProduct(id, data);
  },
  async deleteProduct(id: number) {
    return productService.deleteProduct(id);
  }
};
