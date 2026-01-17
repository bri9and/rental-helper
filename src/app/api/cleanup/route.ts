import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { getAuthUserId } from '@/lib/auth';
import Property from '@/models/Property';
import WarehouseItem from '@/models/WarehouseItem';
import CleaningReport from '@/models/CleaningReport';
import SupplyRequest from '@/models/SupplyRequest';

export async function GET(request: Request) {
  await dbConnect();

  const userId = await getAuthUserId();
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');

  // If action=reset, delete current user's data
  if (action === 'reset') {
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userProperties = await Property.find({ ownerId: userId }).select('_id').lean();
    const propertyIds = userProperties.map(p => p._id);

    const deletedProperties = await Property.deleteMany({ ownerId: userId });
    const deletedWarehouse = await WarehouseItem.deleteMany({ ownerId: userId });
    const deletedSupplyRequests = await SupplyRequest.deleteMany({ ownerId: userId });
    const deletedReports = await CleaningReport.deleteMany({ propertyId: { $in: propertyIds } });

    return NextResponse.json({
      success: true,
      message: 'Your account data has been reset',
      userId,
      deleted: {
        properties: deletedProperties.deletedCount,
        warehouseItems: deletedWarehouse.deletedCount,
        supplyRequests: deletedSupplyRequests.deletedCount,
        reports: deletedReports.deletedCount,
      }
    });
  }

  const properties = await Property.find({ ownerId: userId }).select('_id name').lean();
  const allProperties = await Property.find().select('_id name ownerId').lean();

  return NextResponse.json({
    currentUserId: userId,
    userPropertiesCount: properties.length,
    userProperties: properties.map(p => ({ _id: p._id.toString(), name: p.name })),
    allPropertiesCount: allProperties.length,
    allOwnerIds: [...new Set(allProperties.map(p => p.ownerId))],
  });
}

// DELETE - Reset current user's data (start fresh)
export async function DELETE() {
  await dbConnect();

  const userId = await getAuthUserId();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Get property IDs for this user
  const userProperties = await Property.find({ ownerId: userId }).select('_id').lean();
  const propertyIds = userProperties.map(p => p._id);

  // Delete all data for current user
  const deletedProperties = await Property.deleteMany({ ownerId: userId });
  const deletedWarehouse = await WarehouseItem.deleteMany({ ownerId: userId });
  const deletedSupplyRequests = await SupplyRequest.deleteMany({ ownerId: userId });
  const deletedReports = await CleaningReport.deleteMany({ propertyId: { $in: propertyIds } });

  return NextResponse.json({
    success: true,
    message: 'Your account data has been reset',
    userId,
    deleted: {
      properties: deletedProperties.deletedCount,
      warehouseItems: deletedWarehouse.deletedCount,
      supplyRequests: deletedSupplyRequests.deletedCount,
      reports: deletedReports.deletedCount,
    }
  });
}

export async function POST() {
  await dbConnect();

  const userId = await getAuthUserId();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Get all property IDs owned by current user
  const userProperties = await Property.find({ ownerId: userId }).select('_id').lean();
  const userPropertyIds = userProperties.map(p => p._id);

  // Delete all data NOT owned by current user
  const deletedProperties = await Property.deleteMany({ ownerId: { $ne: userId } });
  const deletedWarehouse = await WarehouseItem.deleteMany({ ownerId: { $ne: userId } });
  const deletedSupplyRequests = await SupplyRequest.deleteMany({ ownerId: { $ne: userId } });

  // Delete reports for properties not owned by current user
  const deletedReports = await CleaningReport.deleteMany({
    propertyId: { $nin: userPropertyIds }
  });

  return NextResponse.json({
    success: true,
    userId,
    deleted: {
      properties: deletedProperties.deletedCount,
      warehouseItems: deletedWarehouse.deletedCount,
      supplyRequests: deletedSupplyRequests.deletedCount,
      reports: deletedReports.deletedCount,
    }
  });
}
