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
    const where = status ? { status } : {};

    const issues = await prisma.sodexoIssue.findMany({
      where,
      include: { reportedBy: { select: { id: true, name: true, email: true } } },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, data: issues });
  } catch (error) {
    console.error('Get sodexo issues error:', error);
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
    const { location, description, priority } = body;

    if (!location || !description) {
      return NextResponse.json({ success: false, error: 'Location and description required' }, { status: 400 });
    }

    const issue = await prisma.sodexoIssue.create({
      data: {
        reportedById: user.userId,
        location,
        description,
        priority: priority || 'MEDIUM',
      },
    });

    return NextResponse.json({ success: true, data: issue }, { status: 201 });
  } catch (error) {
    console.error('Create sodexo issue error:', error);
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
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json({ success: false, error: 'ID and status required' }, { status: 400 });
    }

    const issue = await prisma.sodexoIssue.update({
      where: { id },
      data: { status },
    });

    return NextResponse.json({ success: true, data: issue });
  } catch (error) {
    console.error('Update sodexo issue error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
