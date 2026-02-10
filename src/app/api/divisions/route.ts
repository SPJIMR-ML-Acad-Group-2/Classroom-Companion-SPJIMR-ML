import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const user = getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 });
    }

    const batchId = req.nextUrl.searchParams.get('batchId');
    const where = batchId ? { batchId } : {};

    const divisions = await prisma.division.findMany({
      where,
      include: { batch: true },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, data: divisions });
  } catch (error) {
    console.error('Get divisions error:', error);
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
    const { batchId, name, type } = body;

    if (!batchId || !name || !type) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }

    const division = await prisma.division.create({
      data: { batchId, name, type },
      include: { batch: true },
    });

    return NextResponse.json({ success: true, data: division }, { status: 201 });
  } catch (error) {
    console.error('Create division error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
