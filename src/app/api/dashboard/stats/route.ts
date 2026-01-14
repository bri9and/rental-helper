import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import WarehouseItem from '@/models/WarehouseItem';
import Property from '@/models/Property';
import CleaningReport from '@/models/CleaningReport';
import { getAuthUserId } from '@/lib/auth';

export async function GET() {
  try {
    await dbConnect();

    const userId = await getAuthUserId();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const [totalItems, lowStockItems, properties, todayReports] = await Promise.all([
      WarehouseItem.countDocuments({ ownerId: userId }),
      WarehouseItem.countDocuments({
        ownerId: userId,
        $expr: { $lte: ['$quantity', '$lowStockThreshold'] },
      }),
      Property.countDocuments({ ownerId: userId }),
      CleaningReport.countDocuments({
        cleanerId: userId,
        date: {
          $gte: new Date(new Date().setHours(0, 0, 0, 0)),
          $lt: new Date(new Date().setHours(23, 59, 59, 999)),
        },
      }),
    ]);

    // Get low stock items list
    const lowStockItemsList = await WarehouseItem.find({
      ownerId: userId,
      $expr: { $lte: ['$quantity', '$lowStockThreshold'] },
    })
      .select('name sku quantity lowStockThreshold')
      .limit(10)
      .lean();

    const formattedLowStock = lowStockItemsList.map(item => ({
      name: item.name,
      sku: item.sku,
      quantity: item.quantity,
      lowStockThreshold: item.lowStockThreshold,
    }));

    return NextResponse.json({
      totalItems,
      lowStockItems,
      properties,
      todayReports,
      lowStockItemsList: formattedLowStock,
    });
  } catch (error) {
    console.error('[API] Get dashboard stats failed:', error);
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}
