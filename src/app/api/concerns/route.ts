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

    // Students see only their own concerns
    if (user.roleName === 'STUDENT') {
      where.userId = user.userId;
    }

    if (status) {
      where.status = status;
    }

    const concerns = await prisma.concern.findMany({
      where,
      include: { user: { select: { id: true, name: true, email: true } } },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, data: concerns });
  } catch (error) {
    console.error('Get concerns error:', error);
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
    const { subject, body: concernBody, category } = body;

    if (!subject || !concernBody) {
      return NextResponse.json({ success: false, error: 'Subject and body required' }, { status: 400 });
    }

    const concern = await prisma.concern.create({
      data: {
        userId: user.userId,
        subject,
        body: concernBody,
        category: category || 'GENERAL',
      },
    });

    return NextResponse.json({ success: true, data: concern }, { status: 201 });
  } catch (error) {
    console.error('Create concern error:', error);
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

    if (!id) {
      return NextResponse.json({ success: false, error: 'Concern ID required' }, { status: 400 });
    }

    const concern = await prisma.concern.update({
      where: { id },
      data: { ...(status && { status }), ...(comments && { comments }) },
    });

    return NextResponse.json({ success: true, data: concern });
  } catch (error) {
    console.error('Update concern error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
