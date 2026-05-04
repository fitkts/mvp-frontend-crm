import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

const CreateProductSchema = z.object({
  name: z.string().min(1, '상품명은 필수입니다.'),
  category: z.string(),
  price: z.number().min(0),
  sessionCnt: z.number(),
  validDays: z.number(),
  isActive: z.boolean().optional().default(true),
  status: z.string().optional().default('ACTIVE'),
  originalPrice: z.number().optional().nullable(),
  description: z.string().optional().nullable(),
  ptDuration: z.string().optional().nullable(),
  ptLevel: z.string().optional().nullable(),
  // 프론트에서 배열로 오는 경우 JSON 문자열로 변환
  membershipAccess: z.preprocess(
    (val) => (Array.isArray(val) ? JSON.stringify(val) : val),
    z.string().optional().nullable()
  ),
  lockerSection: z.string().optional().nullable(),
  lockerSize: z.string().optional().nullable(),
}).strip(); // strip()으로 isUnlimited 등 스키마에 없는 필드 자동 제거

const UpdateProductSchema = CreateProductSchema.partial();

export const productService = {
  async getAllProducts(filters?: { category?: string; status?: string }) {
    const where: any = {};
    if (filters?.category && filters.category !== '전체') {
      where.category = filters.category;
    }
    if (filters?.status && filters.status !== '전체') {
      where.status = filters.status;
    }
    
    const products = await prisma.product.findMany({
      where,
      orderBy: { id: 'desc' },
    });
    return products;
  },

  async getProductById(id: number) {
    const product = await prisma.product.findUnique({
      where: { id },
    });
    if (!product) throw new Error('상품을 찾을 수 없습니다.');
    return product;
  },

  async createProduct(data: any) {
    const validatedData = CreateProductSchema.parse(data);
    return await prisma.product.create({
      data: validatedData,
    });
  },

  async updateProduct(id: number, data: any) {
    const validatedData = UpdateProductSchema.parse(data);
    return await prisma.product.update({
      where: { id },
      data: validatedData,
    });
  },

  async deleteProduct(id: number) {
    return await prisma.product.delete({
      where: { id },
    });
  }
};
