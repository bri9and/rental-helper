import { NextResponse, type NextRequest } from 'next/server';
import dbConnect from '@/lib/db';
import Cleaner from '@/models/Cleaner';
import Property from '@/models/Property';

// GET - Get properties for a cleaner (only their manager's properties)
export async function GET(request: NextRequest) {
  try {
    const cleanerId = request.headers.get('x-cleaner-id');

    if (!cleanerId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const cleaner = await Cleaner.findById(cleanerId).lean();

    if (!cleaner || cleaner.status !== 'active') {
      return NextResponse.json({ error: 'Invalid cleaner session' }, { status: 401 });
    }

    // Get properties belonging to the cleaner's manager
    const properties = await Property.find({ ownerId: cleaner.managerId })
      .select('name address')
      .sort({ name: 1 })
      .lean();

    // Update last active
    await Cleaner.findByIdAndUpdate(cleanerId, { lastActiveAt: new Date() });

    return NextResponse.json({
      properties: properties.map((p) => ({
        id: p._id.toString(),
        name: p.name,
        address: p.address,
      })),
      managerName: cleaner.managerId, // Could look up manager name later
    });
  } catch (error) {
    console.error('[API] Get cleaner properties failed:', error);
    return NextResponse.json({ error: 'Failed to fetch properties' }, { status: 500 });
  }
}
