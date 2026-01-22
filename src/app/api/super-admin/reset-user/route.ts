import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { requireSuperAdmin } from '@/lib/roles';
import Property from '@/models/Property';
import WarehouseItem from '@/models/WarehouseItem';
import CleaningReport from '@/models/CleaningReport';
import SupplyRequest from '@/models/SupplyRequest';

// Changed from GET to POST for CSRF protection
// Destructive operations should never be on GET requests
export async function POST(request: Request) {
  try {
    // Verify super admin access using role-based check
    await requireSuperAdmin();
  } catch {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  await dbConnect();

  const body = await request.json();
  const targetUserId = body.userId;

  if (!targetUserId) {
    return NextResponse.json({ error: 'userId required in request body' }, { status: 400 });
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

// Block GET requests - destructive operations must use POST
export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed. Use POST with { userId: "..." } in body.' },
    { status: 405 }
  );
}
