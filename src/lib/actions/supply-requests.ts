'use server';

import { revalidatePath } from 'next/cache';
import dbConnect from '@/lib/db';
import { getAuthUserId } from '@/lib/auth';
import SupplyRequest, { ISupplyRequestDocument, SupplyRequestStatus } from '@/models/SupplyRequest';
import WarehouseItem from '@/models/WarehouseItem';

export type SupplyRequestSummary = {
  _id: string;
  propertyId: string;
  propertyName: string;
  sku: string;
  itemName: string;
  requestedBy: string;
  requestedByName?: string;
  currentCount: number;
  status: SupplyRequestStatus;
  orderQuantity?: number;
  notes?: string;
  createdAt: string;
  orderedAt?: string;
  receivedAt?: string;
};

/**
 * Get all supply requests for the current user
 */
export async function getSupplyRequests(status?: SupplyRequestStatus): Promise<SupplyRequestSummary[]> {
  await dbConnect();

  const userId = await getAuthUserId();
  if (!userId) {
    return [];
  }

  const query: { ownerId: string; status?: SupplyRequestStatus } = { ownerId: userId };
  if (status) {
    query.status = status;
  }

  const requests = await SupplyRequest.find(query)
    .sort({ createdAt: -1 })
    .lean() as ISupplyRequestDocument[];

  return requests.map((r) => ({
    _id: r._id.toString(),
    propertyId: r.propertyId.toString(),
    propertyName: r.propertyName,
    sku: r.sku,
    itemName: r.itemName,
    requestedBy: r.requestedBy,
    requestedByName: r.requestedByName,
    currentCount: r.currentCount,
    status: r.status,
    orderQuantity: r.orderQuantity,
    notes: r.notes,
    createdAt: r.createdAt.toISOString(),
    orderedAt: r.orderedAt?.toISOString(),
    receivedAt: r.receivedAt?.toISOString(),
  }));
}

/**
 * Get count of pending supply requests
 */
export async function getPendingSupplyRequestCount(): Promise<number> {
  await dbConnect();

  const userId = await getAuthUserId();
  if (!userId) {
    return 0;
  }

  return SupplyRequest.countDocuments({ ownerId: userId, status: 'pending' });
}

/**
 * Set order quantity and mark as ordered
 */
export async function markAsOrdered(
  requestId: string,
  orderQuantity: number,
  notes?: string
): Promise<{ success: boolean; error?: string }> {
  await dbConnect();

  const userId = await getAuthUserId();
  if (!userId) {
    return { success: false, error: 'Unauthorized' };
  }

  const request = await SupplyRequest.findOne({
    _id: requestId,
    ownerId: userId,
  });

  if (!request) {
    return { success: false, error: 'Request not found' };
  }

  if (request.status !== 'pending') {
    return { success: false, error: 'Request is not pending' };
  }

  request.orderQuantity = orderQuantity;
  request.status = 'ordered';
  request.orderedAt = new Date();
  if (notes) {
    request.notes = notes;
  }

  await request.save();

  revalidatePath('/admin/supply-requests');
  revalidatePath('/admin/dashboard');

  return { success: true };
}

/**
 * Mark order as received and add to warehouse inventory
 */
export async function markAsReceived(
  requestId: string
): Promise<{ success: boolean; error?: string }> {
  await dbConnect();

  const userId = await getAuthUserId();
  if (!userId) {
    return { success: false, error: 'Unauthorized' };
  }

  const request = await SupplyRequest.findOne({
    _id: requestId,
    ownerId: userId,
  });

  if (!request) {
    return { success: false, error: 'Request not found' };
  }

  if (request.status !== 'ordered') {
    return { success: false, error: 'Request is not in ordered state' };
  }

  // Add ordered quantity to warehouse
  if (request.orderQuantity && request.orderQuantity > 0) {
    const warehouseItem = await WarehouseItem.findOne({
      ownerId: userId,
      sku: request.sku,
    });

    if (warehouseItem) {
      warehouseItem.quantity += request.orderQuantity;
      await warehouseItem.save();
    }
  }

  request.status = 'received';
  request.receivedAt = new Date();

  await request.save();

  revalidatePath('/admin/supply-requests');
  revalidatePath('/admin/dashboard');
  revalidatePath('/admin/inventory');

  return { success: true };
}

/**
 * Cancel a supply request
 */
export async function cancelRequest(
  requestId: string
): Promise<{ success: boolean; error?: string }> {
  await dbConnect();

  const userId = await getAuthUserId();
  if (!userId) {
    return { success: false, error: 'Unauthorized' };
  }

  const request = await SupplyRequest.findOne({
    _id: requestId,
    ownerId: userId,
  });

  if (!request) {
    return { success: false, error: 'Request not found' };
  }

  if (request.status === 'received') {
    return { success: false, error: 'Cannot cancel a received request' };
  }

  request.status = 'cancelled';

  await request.save();

  revalidatePath('/admin/supply-requests');
  revalidatePath('/admin/dashboard');

  return { success: true };
}
