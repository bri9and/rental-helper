import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Property from '@/models/Property';
import { getAuthUserId } from '@/lib/auth';

export async function GET() {
  try {
    await dbConnect();

    const userId = await getAuthUserId();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const properties = await Property.find({ ownerId: userId })
      .select('name address inventorySettings')
      .sort({ name: 1 })
      .lean();

    return NextResponse.json({
      properties: properties.map((p) => ({
        id: p._id.toString(),
        name: p.name,
        address: p.address,
        itemCount: p.inventorySettings?.length ?? 0,
      })),
    });
  } catch (error) {
    console.error('[API] Get properties failed:', error);
    return NextResponse.json({ error: 'Failed to fetch properties' }, { status: 500 });
  }
}
