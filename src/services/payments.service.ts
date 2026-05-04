import prisma from '../lib/prisma';
import { NotFoundError, ConflictError } from '../lib/errors';

export const paymentsService = {
  async getPayments(query: any = {}) {
    const { startDate, endDate, status, memberId, page = 1, limit = 20 } = query;
    const skip = (Number(page) - 1) * Number(limit);
    
    const where: any = {};
    if (status) where.status = status;
    if (memberId) where.memberId = Number(memberId);
    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate);
      if (endDate) where.date.lte = new Date(endDate);
    }

    const [data, total] = await Promise.all([
      prisma.paymentHistory.findMany({ where, skip, take: Number(limit), include: { member: true } }),
      prisma.paymentHistory.count({ where })
    ]);

    return { data, meta: { total, page: Number(page), limit: Number(limit) } };
  },

  async createPayment(data: any) {
    const {
      memberId, date, product, sessions, basePrice, discountedPrice, method, installment, trainerId, status
    } = data;

    const member = await prisma.member.findUnique({ where: { id: memberId } });
    if (!member) throw new NotFoundError('Member not found');

    return prisma.$transaction(async (tx) => {
      // 1. Create PaymentHistory record
      const payment = await tx.paymentHistory.create({
        data: {
          memberId,
          date: new Date(date),
          product,
          sessions,
          basePrice,
          discountedPrice,
          method,
          installment,
          trainerId,
          status: status || 'COMPLETED'
        }
      });

      // 2-5. Update Member info
      await tx.member.update({
        where: { id: memberId },
        data: {
          totalPaid: { increment: discountedPrice },
          remainingSessions: { increment: sessions },
          recentPurchase: product,
          status: member.status === 'EXPIRED' ? 'ACTIVE' : undefined
        }
      });

      return payment;
    });
  },

  async getPaymentsByMemberId(memberId: number) {
    return prisma.paymentHistory.findMany({
      where: { memberId },
      orderBy: { date: 'desc' }
    });
  },

  async updatePayment(id: string, data: any) {
    return prisma.paymentHistory.update({
      where: { id },
      data
    }).catch(() => {
      throw new NotFoundError('Payment not found');
    });
  }
};
