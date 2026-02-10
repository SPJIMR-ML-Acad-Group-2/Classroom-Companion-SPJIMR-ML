import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { timetableService } from '@/services/timetableService';

export async function GET(req: NextRequest) {
  try {
    const user = getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 });
    }

    const divisionId = req.nextUrl.searchParams.get('divisionId');
    const batchId = req.nextUrl.searchParams.get('batchId');

    if (divisionId) {
      const events = await timetableService.getByDivision(divisionId);
      return NextResponse.json({ success: true, data: events });
    }

    if (batchId) {
      const events = await timetableService.getByBatch(batchId);
      return NextResponse.json({ success: true, data: events });
    }

    return NextResponse.json({ success: false, error: 'Provide divisionId or batchId' }, { status: 400 });
  } catch (error) {
    console.error('Get timetable error:', error);
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

    // Support bulk create
    if (Array.isArray(body)) {
      const events = body.map(e => ({
        ...e,
        date: new Date(e.date),
      }));
      const result = await timetableService.bulkCreate(events);
      return NextResponse.json({ success: true, data: result }, { status: 201 });
    }

    const event = await timetableService.create({
      ...body,
      date: new Date(body.date),
    });

    return NextResponse.json({ success: true, data: event }, { status: 201 });
  } catch (error) {
    console.error('Create timetable error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
