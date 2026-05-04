import prisma from '../lib/prisma';
import { NotFoundError } from '../lib/errors';

export const payrollsService = {
  async getPayrolls(query: any = {}) {
    const { period, staffId, status } = query;
    const where: any = {};
    if (period) where.period = period;
    if (staffId) where.staffId = Number(staffId);
    if (status) where.status = status;

    return prisma.payroll.findMany({
      where,
      include: { staff: true }
    });
  },

  async generatePayrolls(period: string) {
    // Basic implementation for batch generating payrolls
    const staffs = await prisma.staff.findMany({ where: { status: 'ACTIVE' } });
    
    const results = await prisma.$transaction(
      staffs.map(staff => {
        const baseSalary = 2000000; // Mock calculation
        const incentive = staff.revenue * 0.1; // Mock calculation
        return prisma.payroll.create({
          data: {
            staffId: staff.id,
            period,
            baseSalary,
            incentive,
            total: baseSalary + incentive,
            status: 'PENDING'
          }
        });
      })
    );

    return results;
  },

  async updatePayrollStatus(id: number, status: string) {
    return prisma.payroll.update({
      where: { id },
      data: { status }
    }).catch(() => {
      throw new NotFoundError('Payroll not found');
    });
  }
};
