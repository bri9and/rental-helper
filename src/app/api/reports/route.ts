import { NextResponse } from 'next/server';
import { submitReport, ReportItemInput } from '@/lib/actions/reports';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const { propertyId, items, notes } = body as {
      propertyId: string;
      items: ReportItemInput[];
      notes?: string;
    };

    if (!propertyId || !items || !Array.isArray(items)) {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    const result = await submitReport({
      propertyId,
      items,
      notes,
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      reportId: result.reportId,
      results: result.results,
      hasShortages: result.hasShortages,
      hasLowStockAlerts: result.hasLowStockAlerts,
    });
  } catch (error) {
    console.error('[API] Submit report failed:', error);
    return NextResponse.json({ error: 'Failed to submit report' }, { status: 500 });
  }
}
