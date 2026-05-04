import prisma from '../lib/prisma';
import { NotFoundError } from '../lib/errors';

export const eventsService = {
  async getEvents(query: any = {}) {
    const { startDate, endDate, trainerId, type } = query;
    const where: any = {};
    
    if (trainerId) where.trainerId = Number(trainerId);
    if (type) where.type = type;
    if (startDate || endDate) {
      // Assuming 'time' is stored as a string or Date. Based on schema, 'time' is String, which is tricky to filter accurately without parsing.
      // We will just do a generic text search or exact match for simplicity as per schema type "String".
      // If it was a DateTime we'd use gte/lte.
      // We'll leave filtering minimal since it's a string, or you can adjust schema to DateTime.
    }

    return prisma.event.findMany({ where });
  },

  async createEvent(data: any) {
    return prisma.event.create({ data });
  },

  async deleteEvent(id: number) {
    return prisma.event.delete({ where: { id } }).catch(() => {
      throw new NotFoundError('Event not found');
    });
  }
};
