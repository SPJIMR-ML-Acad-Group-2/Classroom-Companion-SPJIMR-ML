import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const payload = getUserFromRequest(req);
    if (!payload) {
      return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      include: {
        role: {
          include: { permissions: true },
        },
      },
    });

    if (!user || !user.isActive) {
      return NextResponse.json({ success: false, error: 'User not found or disabled' }, { status: 404 });
    }

    const allowedTiles = user.role.permissions
      .filter(p => p.canAccess)
      .map(p => ({
        tileKey: p.tileKey,
        canWrite: p.canWrite,
      }));

    return NextResponse.json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role.name,
        roleDisplayName: user.role.displayName,
        isAdmin: user.role.isAdmin,
        allowedTiles,
      },
    });
  } catch (error) {
    console.error('Auth me error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
