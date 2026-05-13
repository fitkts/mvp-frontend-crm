import prisma from '../lib/prisma';
import { NotFoundError } from '../lib/errors';

export const membersService = {
  async getMembers(query: any = {}) {
    const { status, trainerId, search, page = 1, limit = 20 } = query;
    const skip = (Number(page) - 1) * Number(limit);
    
    const where: any = {};
    
    // Default filter: hide EXPIRED (deleted) members unless specifically requested
    if (status) {
      where.status = status;
    } else {
      where.status = { not: 'EXPIRED' };
    }

    if (trainerId) where.assignedTrainerId = Number(trainerId);
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { phone: { contains: search } }
      ];
    }

    const [data, total] = await Promise.all([
      prisma.member.findMany({ where, skip, take: Number(limit) }),
      prisma.member.count({ where })
    ]);

    return { data, meta: { total, page: Number(page), limit: Number(limit) } };
  },

  async createMember(data: any) {
    return prisma.member.create({ data });
  },

  async getMemberById(id: number) {
    const member = await prisma.member.findUnique({
      where: { id },
      include: {
        assignedTrainer: true,
        paymentHistories: true,
        lockers: true
      }
    });
    if (!member) throw new NotFoundError('Member not found');
    return member;
  },

  async updateMember(id: number, data: any) {
    return prisma.member.update({
      where: { id },
      data
    }).catch(() => {
      throw new NotFoundError('Member not found');
    });
  },

  async deleteMember(id: number) {
    return prisma.member.update({
      where: { id },
      data: { status: 'EXPIRED' }
    }).catch(() => {
      throw new NotFoundError('Member not found');
    });
  }
};
