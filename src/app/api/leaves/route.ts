import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const user = getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 });
    }

    const status = req.nextUrl.searchParams.get('status');
    const where: Record<string, unknown> = {};

    if (user.roleName === 'STUDENT') {
      where.userId = user.userId;
    }

    if (status) {
      where.status = status;
    }

    const leaves = await prisma.leaveRequest.findMany({
      where,
      include: { user: { select: { id: true, name: true, email: true } } },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, data: leaves });
  } catch (error) {
    console.error('Get leaves error:', error);
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
    const { purpose, startDate, endDate } = body;

    if (!purpose || !startDate || !endDate) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }

    const leave = await prisma.leaveRequest.create({
      data: {
        userId: user.userId,
        purpose,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
      },
    });

    return NextResponse.json({ success: true, data: leave }, { status: 201 });
  } catch (error) {
    console.error('Create leave error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const user = getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 });
    }

    const body = await req.json();
    const { id, status, comments } = body;

    if (!id || !status) {
      return NextResponse.json({ success: false, error: 'ID and status required' }, { status: 400 });
    }

    const leave = await prisma.leaveRequest.update({
      where: { id },
      data: { status, ...(comments && { comments }) },
    });

    return NextResponse.json({ success: true, data: leave });
  } catch (error) {
    console.error('Update leave error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
