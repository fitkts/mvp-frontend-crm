import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

const CreateLockerSchema = z.object({
  id: z.string().min(1, '사물함 ID는 필수입니다.'), // e.g. "A-01"
  status: z.string().optional().default('AVAILABLE'),
  memberId: z.number().optional().nullable(),
  startDate: z.union([z.string(), z.date()]).transform((val) => val ? new Date(val) : null).optional().nullable(),
  expireDate: z.union([z.string(), z.date()]).transform((val) => val ? new Date(val) : null).optional().nullable(),
  productId: z.number().optional().nullable(),
  paymentStatus: z.string().optional().nullable(),
  paymentMethod: z.string().optional().nullable(),
  memo: z.string().optional().nullable(),
}).strip();

const UpdateLockerSchema = CreateLockerSchema.omit({ id: true }).partial();

const AssignLockerSchema = z.object({
  memberId: z.number(),
  startDate: z.union([z.string(), z.date()]).transform((val) => new Date(val)),
  expireDate: z.union([z.string(), z.date()]).transform((val) => new Date(val)),
  productId: z.number().optional().nullable(),
  paymentStatus: z.string().optional().default('PAID'),
  paymentMethod: z.string().optional().nullable(),
  memo: z.string().optional().nullable(),
}).strip();

export const lockerService = {
  async getAllLockers() {
    const lockers = await prisma.locker.findMany({
      orderBy: { id: 'asc' },
      include: {
        member: { select: { id: true, name: true, phone: true } },
      },
    });

    return lockers.map(l => ({
      ...l,
      startDate: l.startDate?.toISOString().split('T')[0] || null,
      expireDate: l.expireDate?.toISOString().split('T')[0] || null,
    }));
  },

  async getLockerById(id: string) {
    const locker = await prisma.locker.findUnique({
      where: { id },
      include: {
        member: { select: { id: true, name: true, phone: true } },
        history: { orderBy: { date: 'desc' }, take: 20 },
      },
    });
    if (!locker) throw new Error('사물함을 찾을 수 없습니다.');
    return {
      ...locker,
      startDate: locker.startDate?.toISOString().split('T')[0] || null,
      expireDate: locker.expireDate?.toISOString().split('T')[0] || null,
    };
  },

  async createLocker(data: any) {
    const validatedData = CreateLockerSchema.parse(data);
    return await prisma.locker.create({
      data: validatedData as any,
    });
  },

  async assignLocker(id: string, data: any) {
    const validatedData = AssignLockerSchema.parse(data);
    
    const locker = await prisma.$transaction(async (tx) => {
      const updated = await tx.locker.update({
        where: { id },
        data: {
          ...validatedData as any,
          status: 'IN_USE',
        },
      });

      await tx.lockerHistory.create({
        data: {
          lockerId: id,
          date: new Date(),
          type: 'ASSIGN',
          desc: `회원 ID ${validatedData.memberId}에게 배정됨`,
        },
      });

      return updated;
    });

    return locker;
  },

  async updateLocker(id: string, data: any) {
    const validatedData = UpdateLockerSchema.parse(data);
    return await prisma.locker.update({
      where: { id },
      data: validatedData as any,
    });
  },

  async releaseLocker(id: string) {
    return await prisma.$transaction(async (tx) => {
      const updated = await tx.locker.update({
        where: { id },
        data: {
          status: 'AVAILABLE',
          memberId: null,
          startDate: null,
          expireDate: null,
          productId: null,
          paymentStatus: null,
          paymentMethod: null,
        },
      });

      await tx.lockerHistory.create({
        data: {
          lockerId: id,
          date: new Date(),
          type: 'SYSTEM',
          desc: '사물함 배정 해제됨',
        },
      });

      return updated;
    });
  },

  async getLockerHistory(id: string) {
    return await prisma.lockerHistory.findMany({
      where: { lockerId: id },
      orderBy: { date: 'desc' },
    });
  },
};
