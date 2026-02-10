import prisma from '@/lib/prisma';

export const materialService = {
  async getByCourse(courseId: string) {
    return prisma.material.findMany({
      where: { courseId },
      include: {
        uploadedBy: { select: { id: true, name: true, email: true } },
        course: true,
      },
      orderBy: [{ sessionNumber: 'asc' }, { createdAt: 'desc' }],
    });
  },

  async getByBatch(batchId: string) {
    return prisma.material.findMany({
      where: { course: { batchId } },
      include: {
        course: true,
        uploadedBy: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  },

  async create(data: {
    courseId: string;
    uploadedById: string;
    title: string;
    description?: string;
    category?: string;
    fileUrl?: string;
    fileName?: string;
    sessionNumber?: number;
  }) {
    return prisma.material.create({ data });
  },

  async update(id: string, data: Partial<{
    title: string;
    description: string;
    category: string;
    fileUrl: string;
    fileName: string;
    sessionNumber: number;
  }>) {
    return prisma.material.update({ where: { id }, data });
  },

  async delete(id: string) {
    return prisma.material.delete({ where: { id } });
  },

  async search(query: string, batchId?: string) {
    const where: Record<string, unknown> = {
      OR: [
        { title: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
      ],
    };
    if (batchId) {
      where.course = { batchId };
    }
    return prisma.material.findMany({
      where,
      include: { course: true, uploadedBy: { select: { id: true, name: true } } },
    });
  },
};
