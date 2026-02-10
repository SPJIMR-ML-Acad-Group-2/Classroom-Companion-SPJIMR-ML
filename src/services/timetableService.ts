import prisma from '@/lib/prisma';

export const timetableService = {
  async getByDivision(divisionId: string, startDate?: Date, endDate?: Date) {
    const where: Record<string, unknown> = { divisionId };
    if (startDate && endDate) {
      where.date = { gte: startDate, lte: endDate };
    }
    return prisma.timetableEvent.findMany({
      where,
      include: { division: { include: { batch: true } } },
      orderBy: [{ date: 'asc' }, { startTime: 'asc' }],
    });
  },

  async getByBatch(batchId: string) {
    return prisma.timetableEvent.findMany({
      where: { division: { batchId } },
      include: { division: true },
      orderBy: [{ date: 'asc' }, { startTime: 'asc' }],
    });
  },

  async create(data: {
    divisionId: string;
    title: string;
    date: Date;
    startTime: string;
    endTime: string;
    location?: string;
    eventType?: string;
  }) {
    return prisma.timetableEvent.create({ data });
  },

  async bulkCreate(events: Array<{
    divisionId: string;
    title: string;
    date: Date;
    startTime: string;
    endTime: string;
    location?: string;
    eventType?: string;
  }>) {
    return prisma.timetableEvent.createMany({ data: events });
  },

  async update(id: string, data: Partial<{
    title: string;
    date: Date;
    startTime: string;
    endTime: string;
    location: string;
    eventType: string;
  }>) {
    return prisma.timetableEvent.update({ where: { id }, data });
  },

  async delete(id: string) {
    return prisma.timetableEvent.delete({ where: { id } });
  },

  async getWorkloadSummary(batchId: string) {
    const events = await prisma.timetableEvent.findMany({
      where: { division: { batchId } },
      include: { division: true },
    });

    const weeklyCount = new Map<string, number>();
    for (const event of events) {
      const weekStart = getWeekStart(event.date);
      const key = `${event.division.name}-${weekStart}`;
      weeklyCount.set(key, (weeklyCount.get(key) || 0) + 1);
    }

    return Object.fromEntries(weeklyCount);
  },
};

function getWeekStart(date: Date): string {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  return d.toISOString().split('T')[0];
}
