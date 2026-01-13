import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Property from '@/models/Property';
import WarehouseItem from '@/models/WarehouseItem';
import { getAuthUserId } from '@/lib/auth';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();

    const userId = await getAuthUserId();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const property = await Property.findOne({
      _id: id,
      ownerId: userId,
    }).lean();

    if (!property) {
      return NextResponse.json({ error: 'Property not found' }, { status: 404 });
    }

    // Get warehouse items for this property's inventory settings
    const skus = property.inventorySettings.map((s: { itemSku: string }) => s.itemSku);
    const warehouseItems = await WarehouseItem.find({
      ownerId: userId,
      sku: { $in: skus },
    }).lean();

    // Build the checklist
    const checklist = property.inventorySettings.map((setting: { itemSku: string; parLevel: number }) => {
      const item = warehouseItems.find((w: { sku: string }) => w.sku === setting.itemSku);
      return {
        sku: setting.itemSku,
        name: item?.name ?? setting.itemSku,
        parLevel: setting.parLevel,
        warehouseQuantity: item?.quantity ?? 0,
      };
    });

    return NextResponse.json({
      property: {
        id: property._id.toString(),
        name: property.name,
        address: property.address,
      },
      checklist,
    });
  } catch (error) {
    console.error('[API] Get checklist failed:', error);
    return NextResponse.json({ error: 'Failed to fetch checklist' }, { status: 500 });
  }
}
