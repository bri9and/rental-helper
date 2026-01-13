import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import CleaningReport from '@/models/CleaningReport';
import Property from '@/models/Property';
import { getAuthUserId } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    await dbConnect();

    const userId = await getAuthUserId();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') ?? '20');
    const propertyId = searchParams.get('propertyId');

    // Build query
    const query: Record<string, unknown> = { cleanerId: userId };
    if (propertyId) {
      query.propertyId = propertyId;
    }

    // Get recent reports
    const reports = await CleaningReport.find(query)
      .sort({ date: -1 })
      .limit(limit)
      .lean();

    // Get property names
    const propertyIds = [...new Set(reports.map(r => r.propertyId.toString()))];
    const properties = await Property.find({ _id: { $in: propertyIds } })
      .select('name')
      .lean();

    const propertyMap = new Map(
      properties.map(p => [p._id.toString(), p.name])
    );

    // Format response
    const formattedReports = reports.map(report => {
      const hasShortages = report.items.some((item: { restockedAmount: number }) => {
        // If we know parLevel, we could calculate shortage
        // For now, check if restocked amount is 0 when items needed restocking
        return false; // We'd need more data to determine this
      });

      const totalRestocked = report.items.reduce(
        (sum: number, item: { restockedAmount: number }) => sum + item.restockedAmount,
        0
      );

      return {
        id: report._id.toString(),
        propertyId: report.propertyId.toString(),
        propertyName: propertyMap.get(report.propertyId.toString()) ?? 'Unknown Property',
        date: report.date,
        itemCount: report.items.length,
        totalRestocked,
        notes: report.notes,
        items: report.items.map((item: { sku: string; observedCount: number; restockedAmount: number }) => ({
          sku: item.sku,
          observedCount: item.observedCount,
          restockedAmount: item.restockedAmount,
        })),
      };
    });

    return NextResponse.json({ reports: formattedReports });
  } catch (error) {
    console.error('[API] Get recent reports failed:', error);
    return NextResponse.json({ error: 'Failed to fetch reports' }, { status: 500 });
  }
}
