import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { attendanceService } from '@/services/attendanceService';

export async function GET(req: NextRequest) {
  try {
    const user = getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 });
    }

    const divisionId = req.nextUrl.searchParams.get('divisionId');
    const userId = req.nextUrl.searchParams.get('userId');
    const eventId = req.nextUrl.searchParams.get('eventId');
    const summary = req.nextUrl.searchParams.get('summary');

    if (summary === 'student' && userId) {
      const data = await attendanceService.getStudentSummary(userId);
      return NextResponse.json({ success: true, data });
    }

    if (summary === 'division' && divisionId) {
      const data = await attendanceService.getDivisionSummary(divisionId);
      return NextResponse.json({ success: true, data });
    }

    if (eventId) {
      const records = await attendanceService.getByEvent(eventId);
      return NextResponse.json({ success: true, data: records });
    }

    if (divisionId) {
      const records = await attendanceService.getByDivision(divisionId);
      return NextResponse.json({ success: true, data: records });
    }

    if (userId) {
      const records = await attendanceService.getByUser(userId);
      return NextResponse.json({ success: true, data: records });
    }

    return NextResponse.json({ success: false, error: 'Provide filter parameter' }, { status: 400 });
  } catch (error) {
    console.error('Get attendance error:', error);
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

    // Support bulk marking
    if (Array.isArray(body)) {
      const results = await attendanceService.bulkMarkAttendance(body);
      return NextResponse.json({ success: true, data: results }, { status: 201 });
    }

    const record = await attendanceService.markAttendance(body);
    return NextResponse.json({ success: true, data: record }, { status: 201 });
  } catch (error) {
    console.error('Mark attendance error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
