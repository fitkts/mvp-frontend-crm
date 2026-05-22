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
  },

  async getDashboardStats() {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthFirstDay = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    // 1. Monthly Revenue & Change
    const revenueThisMonth = await prisma.paymentHistory.aggregate({
      _sum: { discountedPrice: true },
      where: { date: { gte: firstDay }, status: 'COMPLETED' }
    });
    const revenueLastMonth = await prisma.paymentHistory.aggregate({
      _sum: { discountedPrice: true },
      where: { date: { gte: lastMonthFirstDay, lt: firstDay }, status: 'COMPLETED' }
    });

    const currentRevenue = revenueThisMonth._sum.discountedPrice || 0;
    const pastRevenue = revenueLastMonth._sum.discountedPrice || 0;
    const revenueChange = pastRevenue === 0 ? '+0%' : `${(((currentRevenue - pastRevenue) / pastRevenue) * 100).toFixed(1)}%`;

    // 2. Payroll & Change
    const payrollThisMonth = await prisma.payroll.aggregate({
      _sum: { total: true },
      where: { period: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}` }
    });
    const payrollLastMonth = await prisma.payroll.aggregate({
      _sum: { total: true },
      where: { period: `${now.getFullYear()}-${String(now.getMonth()).padStart(2, '0')}` }
    });

    const currentPayroll = payrollThisMonth._sum.total || 0;
    const pastPayroll = payrollLastMonth._sum.total || 0;
    const payrollChange = pastPayroll === 0 ? '+0%' : `${(((currentPayroll - pastPayroll) / pastPayroll) * 100).toFixed(1)}%`;

    // 3. Members & Change
    const membersCount = await prisma.member.count();
    const membersLastMonth = await prisma.member.count({
      where: { registrationDate: { lt: firstDay } }
    });
    const membersChange = membersLastMonth === 0 ? '+0%' : `${(((membersCount - membersLastMonth) / membersLastMonth) * 100).toFixed(1)}%`;

    // 4. Reservations (Mocked for now as we don't have enough data)
    const todayReservations = await prisma.event.count({
      where: { time: { startsWith: now.toISOString().split('T')[0] } }
    });

    return {
      monthlyRevenue: currentRevenue,
      revenueChange: revenueChange.startsWith('-') ? revenueChange : `+${revenueChange}`,
      totalPayroll: currentPayroll,
      payrollChange: payrollChange.startsWith('-') ? payrollChange : `+${payrollChange}`,
      netProfit: currentRevenue - currentPayroll,
      profitChange: '+0%', // Simplified
      membersCount,
      membersChange: membersChange.startsWith('-') ? membersChange : `+${membersChange}`,
      membersCountChange: membersCount - membersLastMonth,
      todayReservations,
      reservationsChange: '0',
      revenueTargetPercent: 85, // Mocked
      attendanceRate: 78, // Mocked
      peakTime: '19:00 - 21:00' // Mocked
    };
  },

  async getDashboardTrends() {
    // Return last 4 months of data
    const now = new Date();
    const trends = [];
    for (let i = 3; i >= 0; i--) {
      const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthStr = `${monthDate.getFullYear()}-${String(monthDate.getMonth() + 1).padStart(2, '0')}`;
      const name = `${monthDate.getMonth() + 1}월`;

      const revenue = await prisma.paymentHistory.aggregate({
        _sum: { discountedPrice: true },
        where: { 
          date: { 
            gte: monthDate, 
            lt: new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 1) 
          }, 
          status: 'COMPLETED' 
        }
      });

      const payroll = await prisma.payroll.aggregate({
        _sum: { total: true },
        where: { period: monthStr }
      });

      trends.push({
        name,
        revenue: (revenue._sum.discountedPrice || 0) / 10000, // Convert to man-won for chart readability
        payroll: (payroll._sum.total || 0) / 10000
      });
    }
    return trends;
  },

  async getRecentActivities() {
    // Fetch recent payments and member registrations
    const recentPayments = await prisma.paymentHistory.findMany({
      take: 5,
      orderBy: { date: 'desc' },
      include: { member: true }
    });

    return recentPayments.map(p => ({
      id: p.id,
      type: 'payment',
      user: p.member?.name || 'Unknown',
      detail: `${p.product} 결제 완료`,
      time: '오늘', // Simplified
      amount: `+₩${p.discountedPrice.toLocaleString()}`
    }));
  }
};
