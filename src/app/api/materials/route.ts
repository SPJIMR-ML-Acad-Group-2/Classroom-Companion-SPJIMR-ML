import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { materialService } from '@/services/materialService';

export async function GET(req: NextRequest) {
  try {
    const user = getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 });
    }

    const courseId = req.nextUrl.searchParams.get('courseId');
    const batchId = req.nextUrl.searchParams.get('batchId');
    const search = req.nextUrl.searchParams.get('search');

    if (search) {
      const results = await materialService.search(search, batchId || undefined);
      return NextResponse.json({ success: true, data: results });
    }

    if (courseId) {
      const materials = await materialService.getByCourse(courseId);
      return NextResponse.json({ success: true, data: materials });
    }

    if (batchId) {
      const materials = await materialService.getByBatch(batchId);
      return NextResponse.json({ success: true, data: materials });
    }

    return NextResponse.json({ success: false, error: 'Provide courseId or batchId' }, { status: 400 });
  } catch (error) {
    console.error('Get materials error:', error);
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
    const material = await materialService.create({
      ...body,
      uploadedById: user.userId,
    });

    return NextResponse.json({ success: true, data: material }, { status: 201 });
  } catch (error) {
    console.error('Create material error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
