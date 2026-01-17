import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { getAuthUserId } from '@/lib/auth';
import Property from '@/models/Property';
import WarehouseItem from '@/models/WarehouseItem';
import CleaningReport from '@/models/CleaningReport';
import SupplyRequest from '@/models/SupplyRequest';

// Only these user IDs can access super admin
const SUPER_ADMIN_IDS = [
  "user_386HVlYdKRRJsxiIsbOdAKHWUC8", // sebastian.kiely@gmail.com
];

export async function GET(request: Request) {
  await dbConnect();

  const currentUserId = await getAuthUserId();
  if (!currentUserId || !SUPER_ADMIN_IDS.includes(currentUserId)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const targetUserId = searchParams.get('userId');

  if (!targetUserId) {
    return NextResponse.json({ error: 'userId required' }, { status: 400 });
  }

  // Get property IDs for target user
  const userProperties = await Property.find({ ownerId: targetUserId }).select('_id').lean();
  const propertyIds = userProperties.map(p => p._id);

  // Delete all data for target user
  const deletedProperties = await Property.deleteMany({ ownerId: targetUserId });
  const deletedWarehouse = await WarehouseItem.deleteMany({ ownerId: targetUserId });
  const deletedSupplyRequests = await SupplyRequest.deleteMany({ ownerId: targetUserId });
  const deletedReports = await CleaningReport.deleteMany({ propertyId: { $in: propertyIds } });

  return NextResponse.json({
    success: true,
    message: `User ${targetUserId} data has been reset`,
    deleted: {
      properties: deletedProperties.deletedCount,
      warehouseItems: deletedWarehouse.deletedCount,
      supplyRequests: deletedSupplyRequests.deletedCount,
      reports: deletedReports.deletedCount,
    }
  });
}
