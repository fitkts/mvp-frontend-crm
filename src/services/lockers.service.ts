import prisma from '../lib/prisma';
import { NotFoundError, ConflictError } from '../lib/errors';

export const lockersService = {
  async getLockers(query: any = {}) {
    const { status } = query;
    const where = status ? { status } : {};
    
    return prisma.locker.findMany({
      where,
      include: { member: true }
    });
  },

  async createLocker(data: any) {
    const { id, status } = data;
    const existing = await prisma.locker.findUnique({ where: { id } });
    if (existing) throw new ConflictError('Locker ID already exists');
    
    return prisma.locker.create({ data: { id, status: status || 'AVAILABLE' } });
  },

  async assignLocker(id: string, data: any) {
    const locker = await prisma.locker.findUnique({ where: { id } });
    if (!locker) throw new NotFoundError('Locker not found');
    if (locker.status === 'IN_USE') throw new ConflictError('Locker is already in use');

    return prisma.$transaction([
      prisma.locker.update({
        where: { id },
        data: {
          ...data,
          status: 'IN_USE',
          startDate: data.startDate ? new Date(data.startDate) : undefined,
          expireDate: data.expireDate ? new Date(data.expireDate) : undefined,
        }
      }),
      prisma.lockerHistory.create({
        data: {
          lockerId: id,
          date: new Date(),
          type: 'ASSIGN',
          desc: `Assigned to member ${data.memberId}`
        }
      })
    ]);
  },

  async releaseLocker(id: string) {
    const locker = await prisma.locker.findUnique({ where: { id } });
    if (!locker) throw new NotFoundError('Locker not found');

    return prisma.$transaction([
      prisma.locker.update({
        where: { id },
        data: {
          status: 'AVAILABLE',
          memberId: null,
          startDate: null,
          expireDate: null,
          productId: null,
          paymentStatus: null,
          paymentMethod: null,
          memo: null
        }
      }),
      prisma.lockerHistory.create({
        data: {
          lockerId: id,
          date: new Date(),
          type: 'SYSTEM',
          desc: 'Locker released and made available'
        }
      })
    ]);
  },

  async getLockerHistory(id: string) {
    return prisma.lockerHistory.findMany({
      where: { lockerId: id },
      orderBy: { date: 'desc' }
    });
  },

  async deleteLocker(id: string) {
    const locker = await prisma.locker.findUnique({ where: { id } });
    if (!locker) throw new NotFoundError('Locker not found');
    if (locker.status === 'IN_USE') throw new ConflictError('Cannot delete a locker that is in use');

    return prisma.locker.delete({ where: { id } });
  }
};
