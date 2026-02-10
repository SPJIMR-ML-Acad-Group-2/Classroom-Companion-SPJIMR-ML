import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';
import { auditService } from '@/services/auditService';

export async function GET(req: NextRequest) {
  try {
    const user = getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 });
    }

    const status = req.nextUrl.searchParams.get('status');
    const where = status ? { status } : {};

    const batches = await prisma.batch.findMany({
      where,
      include: {
        divisions: true,
        courses: true,
        _count: { select: { divisions: true, courses: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, data: batches });
  } catch (error) {
    console.error('Get batches error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 });
    }

    const body = await req.json();
    const { name, programName, academicYear } = body;

    if (!name || !programName || !academicYear) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }

    const batch = await prisma.batch.create({
      data: { name, programName, academicYear },
    });

    await auditService.log({
      userId: user.userId,
      action: 'BATCH_CREATE',
      entityType: 'Batch',
      entityId: batch.id,
      details: { name, programName, academicYear },
    });

    return NextResponse.json({ success: true, data: batch }, { status: 201 });
  } catch (error) {
    console.error('Create batch error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
