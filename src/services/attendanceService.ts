import prisma from '@/lib/prisma';

export const attendanceService = {
  async getByDivision(divisionId: string) {
    return prisma.attendanceRecord.findMany({
      where: { divisionId },
      include: { user: { select: { id: true, name: true, email: true } }, timetableEvent: true },
      orderBy: { markedAt: 'desc' },
    });
  },

  async getByUser(userId: string) {
    return prisma.attendanceRecord.findMany({
      where: { userId },
      include: { timetableEvent: { include: { division: { include: { batch: true } } } } },
      orderBy: { markedAt: 'desc' },
    });
  },

  async getByEvent(timetableEventId: string) {
    return prisma.attendanceRecord.findMany({
      where: { timetableEventId },
      include: { user: { select: { id: true, name: true, email: true } } },
    });
  },

  async markAttendance(data: {
    userId: string;
    timetableEventId: string;
    divisionId: string;
    status: string;
    source?: string;
  }) {
    return prisma.attendanceRecord.upsert({
      where: {
        userId_timetableEventId: {
          userId: data.userId,
          timetableEventId: data.timetableEventId,
        },
      },
      update: { status: data.status, source: data.source || 'MANUAL' },
      create: {
        userId: data.userId,
        timetableEventId: data.timetableEventId,
        divisionId: data.divisionId,
        status: data.status,
        source: data.source || 'MANUAL',
      },
    });
  },

  async bulkMarkAttendance(records: Array<{
    userId: string;
    timetableEventId: string;
    divisionId: string;
    status: string;
    source?: string;
  }>) {
    const results = [];
    for (const record of records) {
      const result = await this.markAttendance(record);
      results.push(result);
    }
    return results;
  },

  async getStudentSummary(userId: string) {
    const records = await prisma.attendanceRecord.findMany({
      where: { userId },
    });
    const total = records.length;
    const present = records.filter(r => r.status === 'PRESENT' || r.status === 'LATE').length;
    const absent = records.filter(r => r.status === 'ABSENT').length;
    const excused = records.filter(r => r.status === 'EXCUSED').length;
    const percentage = total > 0 ? Math.round((present / total) * 100) : 0;

    return { total, present, absent, excused, percentage };
  },

  async getDivisionSummary(divisionId: string) {
    const records = await prisma.attendanceRecord.findMany({
      where: { divisionId },
      include: { user: { select: { id: true, name: true } } },
    });

    const byStudent = new Map<string, { name: string; total: number; present: number }>();
    for (const r of records) {
      const existing = byStudent.get(r.userId) || { name: r.user.name, total: 0, present: 0 };
      existing.total++;
      if (r.status === 'PRESENT' || r.status === 'LATE') existing.present++;
      byStudent.set(r.userId, existing);
    }

    return Array.from(byStudent.entries()).map(([userId, stats]) => ({
      userId,
      name: stats.name,
      total: stats.total,
      present: stats.present,
      percentage: stats.total > 0 ? Math.round((stats.present / stats.total) * 100) : 0,
    }));
  },
};
