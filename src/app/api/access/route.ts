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

    const type = req.nextUrl.searchParams.get('type');

    if (type === 'requests') {
      const requests = await prisma.accessChangeRequest.findMany({
        include: {
          requester: { select: { id: true, name: true, email: true } },
          reviewer: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: 'desc' },
      });
      return NextResponse.json({ success: true, data: requests });
    }

    if (type === 'users') {
      const users = await prisma.user.findMany({
        include: { role: true },
        orderBy: { createdAt: 'desc' },
      });
      return NextResponse.json({ success: true, data: users });
    }

    if (type === 'roles') {
      const roles = await prisma.role.findMany({
        include: { _count: { select: { users: true } } },
      });
      return NextResponse.json({ success: true, data: roles });
    }

    return NextResponse.json({ success: false, error: 'Provide type parameter' }, { status: 400 });
  } catch (error) {
    console.error('Get access error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

// Submit access change request
export async function POST(req: NextRequest) {
  try {
    const user = getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 });
    }

    const body = await req.json();
    const { requestedRoleId, reason } = body;

    if (!requestedRoleId || !reason) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }

    const request = await prisma.accessChangeRequest.create({
      data: {
        requesterId: user.userId,
        currentRoleId: user.roleId,
        requestedRoleId,
        reason,
      },
    });

    return NextResponse.json({ success: true, data: request }, { status: 201 });
  } catch (error) {
    console.error('Create access request error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

// Admin: approve/reject request or directly change role
export async function PATCH(req: NextRequest) {
  try {
    const user = getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 });
    }

    const body = await req.json();

    // Direct role change
    if (body.userId && body.newRoleId) {
      const targetUser = await prisma.user.findUnique({
        where: { id: body.userId },
        include: { role: true },
      });
      if (!targetUser) {
        return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
      }

      const previousRole = targetUser.role.name;
      const updatedUser = await prisma.user.update({
        where: { id: body.userId },
        data: { roleId: body.newRoleId },
        include: { role: true },
      });

      await auditService.log({
        userId: user.userId,
        action: 'ROLE_CHANGE',
        entityType: 'User',
        entityId: body.userId,
        details: { previousRole, newRole: updatedUser.role.name, changedBy: user.email },
      });

      return NextResponse.json({ success: true, data: updatedUser });
    }

    // Approve/reject access request
    if (body.requestId && body.status) {
      const request = await prisma.accessChangeRequest.update({
        where: { id: body.requestId },
        data: {
          status: body.status,
          reviewerId: user.userId,
          reviewComment: body.reviewComment || null,
        },
      });

      // If approved, update user role
      if (body.status === 'APPROVED') {
        await prisma.user.update({
          where: { id: request.requesterId },
          data: { roleId: request.requestedRoleId },
        });

        await auditService.log({
          userId: user.userId,
          action: 'ACCESS_REQUEST_APPROVED',
          entityType: 'AccessChangeRequest',
          entityId: request.id,
          details: { requesterId: request.requesterId, newRoleId: request.requestedRoleId },
        });
      }

      return NextResponse.json({ success: true, data: request });
    }

    return NextResponse.json({ success: false, error: 'Invalid request body' }, { status: 400 });
  } catch (error) {
    console.error('Update access error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
