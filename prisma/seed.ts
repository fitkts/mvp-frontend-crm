import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding comprehensive data to Supabase...');

  // 1. Create Staff
  const trainer = await prisma.staff.upsert({
    where: { email: 'trainer1@example.com' },
    update: {},
    create: {
      name: '김트레이너',
      role: 'TRAINER',
      phone: '010-1234-5678',
      email: 'trainer1@example.com',
      gender: 'MALE',
      birthDate: '1990-01-01',
      status: 'ACTIVE',
      joinDate: new Date(),
    },
  });

  const admin = await prisma.staff.upsert({
    where: { email: 'admin1@example.com' },
    update: {},
    create: {
      name: '박매니저',
      role: 'ADMIN',
      phone: '010-9999-8888',
      email: 'admin1@example.com',
      gender: 'FEMALE',
      birthDate: '1985-05-05',
      status: 'ACTIVE',
      joinDate: new Date('2023-01-01'),
    },
  });

  // 2. Create Members
  // We'll create one member and save the reference to use their ID for relations
  const member1 = await prisma.member.create({
    data: {
      name: '홍길동',
      gender: 'MALE',
      phone: '010-1111-2222',
      email: 'hong@example.com',
      status: 'ACTIVE',
      registrationDate: new Date(),
      assignedTrainerId: trainer.id,
      remainingSessions: 10,
      recentPurchase: 'PT 20회권',
    },
  });

  const member2 = await prisma.member.create({
    data: {
      name: '이영희',
      gender: 'FEMALE',
      phone: '010-3333-4444',
      email: 'lee@example.com',
      status: 'ACTIVE',
      registrationDate: new Date(),
      assignedTrainerId: trainer.id,
      remainingSessions: 5,
      recentPurchase: '필라테스 10회권',
    },
  });

  // 3. Create Products
  const productPT = await prisma.product.create({
    data: {
      name: 'PT 20회권',
      category: 'PT',
      price: 1000000,
      sessionCnt: 20,
      validDays: 90,
      isActive: true,
      originalPrice: 1200000,
      ptDuration: '50분',
    },
  });

  // 4. Create Payment History
  await prisma.paymentHistory.create({
    data: {
      memberId: member1.id,
      date: new Date(),
      product: 'PT 20회권',
      sessions: 20,
      basePrice: 1200000,
      discountedPrice: 1000000,
      method: 'CARD',
      installment: '일시불',
      trainerId: trainer.id,
      trainerName: trainer.name,
      status: 'COMPLETED',
    },
  });

  // 5. Create Payroll
  await prisma.payroll.create({
    data: {
      staffId: trainer.id,
      period: '2026-04',
      baseSalary: 2000000,
      incentive: 500000,
      total: 2500000,
      status: 'PAID',
    },
  });

  // 6. Create Lockers
  await prisma.locker.create({
    data: {
      id: 'A-01',
      status: 'IN_USE',
      memberId: member1.id,
      startDate: new Date(),
      expireDate: new Date(new Date().setMonth(new Date().getMonth() + 1)),
      paymentStatus: 'PAID',
      paymentMethod: 'CARD',
    },
  });

  await prisma.locker.create({
    data: {
      id: 'A-02',
      status: 'AVAILABLE',
    },
  });

  // 7. Create Events (Schedule)
  await prisma.event.create({
    data: {
      title: '홍길동 PT',
      time: '19:00',
      duration: '50분',
      trainerId: trainer.id,
      type: 'PT',
      color: 'bg-emerald-500',
    },
  });

  console.log('Comprehensive seeding completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
