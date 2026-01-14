import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import WarehouseItem from '@/models/WarehouseItem';
import { getAuthUserId } from '@/lib/auth';

export async function GET() {
  try {
    await dbConnect();

    const userId = await getAuthUserId();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const items = await WarehouseItem.find({ ownerId: userId })
      .sort({ name: 1 })
      .lean();

    const formattedItems = items.map(item => ({
      _id: item._id.toString(),
      name: item.name,
      sku: item.sku,
      quantity: item.quantity,
      parLevel: item.parLevel,
      lowStockThreshold: item.lowStockThreshold,
      costPerUnit: item.costPerUnit,
      isLowStock: item.quantity <= item.lowStockThreshold,
    }));

    return NextResponse.json({ items: formattedItems });
  } catch (error) {
    console.error('[API] Get inventory failed:', error);
    return NextResponse.json({ error: 'Failed to fetch inventory' }, { status: 500 });
  }
}
