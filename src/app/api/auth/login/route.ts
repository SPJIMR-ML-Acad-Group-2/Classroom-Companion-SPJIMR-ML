import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { hashPassword, verifyPassword, signToken } from '@/lib/auth';
import { DEFAULT_PASSWORD } from '@/lib/constants';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email) {
      return NextResponse.json({ success: false, error: 'Email is required' }, { status: 400 });
    }

    let user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      include: { role: true },
    });

    // Auto-create user with default STUDENT role for prototype
    if (!user) {
      const studentRole = await prisma.role.findUnique({ where: { name: 'STUDENT' } });
      if (!studentRole) {
        return NextResponse.json({ success: false, error: 'System not initialized. Run seed script.' }, { status: 500 });
      }
      user = await prisma.user.create({
        data: {
          email: email.toLowerCase(),
          name: email.split('@')[0],
          password: hashPassword(password || DEFAULT_PASSWORD),
          roleId: studentRole.id,
        },
        include: { role: true },
      });
    } else {
      // Verify password
      const passwordToCheck = password || DEFAULT_PASSWORD;
      if (!verifyPassword(passwordToCheck, user.password)) {
        return NextResponse.json({ success: false, error: 'Invalid credentials' }, { status: 401 });
      }
    }

    if (!user.isActive) {
      return NextResponse.json({ success: false, error: 'Account is disabled' }, { status: 403 });
    }

    const token = signToken({
      userId: user.id,
      email: user.email,
      roleId: user.roleId,
      roleName: user.role.name,
    });

    const response = NextResponse.json({
      success: true,
      data: {
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role.name,
          roleDisplayName: user.role.displayName,
        },
      },
    });

    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
