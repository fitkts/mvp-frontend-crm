import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

// Zod schema for input validation
const CreateStaffSchema = z.object({
  name: z.string().min(1, '이름은 필수입니다.'),
  role: z.string(),
  phone: z.string(),
  email: z.string().email('유효한 이메일 형식이어야 합니다.'),
  gender: z.string(),
  birthDate: z.string(),
  status: z.string().optional().default('ACTIVE'),
  joinDate: z.union([z.string(), z.date()]).transform((val) => new Date(val)),
  description: z.string().optional(),
});

const UpdateStaffSchema = CreateStaffSchema.partial();

export const staffService = {
  async getAllStaff(filters?: any) {
    const staff = await prisma.staff.findMany({
      orderBy: { id: 'desc' },
      include: {
        _count: {
          select: { members: true }
        }
      }
    });

    // Format for frontend
    return staff.map(s => ({
      ...s,
      joinDate: s.joinDate.toISOString().split('T')[0],
      assignedMembers: s._count.members,
    }));
  },

  async getStaffById(id: number) {
    const staff = await prisma.staff.findUnique({
      where: { id },
      include: {
        members: true,
      }
    });
    if (!staff) throw new Error('직원을 찾을 수 없습니다.');
    return {
      ...staff,
      joinDate: staff.joinDate.toISOString().split('T')[0],
    };
  },

  async createStaff(data: any) {
    const validatedData = CreateStaffSchema.parse(data);

    // Check email uniqueness
    const existingStaff = await prisma.staff.findUnique({
      where: { email: validatedData.email }
    });
    if (existingStaff) throw new Error('이미 사용 중인 이메일입니다.');

    const newStaff = await prisma.staff.create({
      data: validatedData as any,
    });
    return {
      ...newStaff,
      joinDate: newStaff.joinDate.toISOString().split('T')[0],
      assignedMembers: 0,
    };
  },

  async updateStaff(id: number, data: any) {
    const validatedData = UpdateStaffSchema.parse(data);

    if (validatedData.email) {
      const existingStaff = await prisma.staff.findUnique({
        where: { email: validatedData.email }
      });
      if (existingStaff && existingStaff.id !== id) {
        throw new Error('이미 사용 중인 이메일입니다.');
      }
    }

    const updatedStaff = await prisma.staff.update({
      where: { id },
      data: validatedData,
    });
    return {
      ...updatedStaff,
      joinDate: updatedStaff.joinDate.toISOString().split('T')[0],
    };
  },

  async deleteStaff(id: number) {
    return await prisma.staff.delete({
      where: { id },
    });
  }
};
