import prisma from '../lib/prisma';

export const dashboardService = {
  async getDashboardData() {
    // This is a simplified metric calculation based on the spec
    // For a real app, you would use aggregate functions
    
    // Monthly revenue (assuming current month based on payment history)
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    
    const paymentsThisMonth = await prisma.paymentHistory.aggregate({
      _sum: { discountedPrice: true },
      where: {
        date: { gte: firstDay },
        status: 'COMPLETED'
      }
    });

    // New members this month
    const newMembersThisMonth = await prisma.member.count({
      where: {
        registrationDate: { gte: firstDay }
      }
    });

    // Expiring members in 7 days (mock logic since we need to join lockers or use remainingSessions)
    // We'll count members with remainingSessions <= 3 as a proxy
    const expiringMembersIn7Days = await prisma.member.count({
      where: {
        status: 'ACTIVE',
        remainingSessions: { lte: 3, gt: 0 }
      }
    });

    // Locker usage rate
    const totalLockers = await prisma.locker.count();
    const inUseLockers = await prisma.locker.count({ where: { status: 'IN_USE' } });
    
    const lockerUsageRate = totalLockers === 0 ? 0 : (inUseLockers / totalLockers) * 100;

    return {
      monthlyRevenue: paymentsThisMonth._sum.discountedPrice || 0,
      newMembersThisMonth,
      expiringMembersIn7Days,
      lockerUsageRate: Number(lockerUsageRate.toFixed(1))
    };
  }
};
