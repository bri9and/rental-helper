'use server';

import { getAuthUserId } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import dbConnect from '@/lib/db';
import WarehouseItem, { IWarehouseItem } from '@/models/WarehouseItem';

export type InventoryFormData = {
  name: string;
  sku: string;
  quantity: number;
  parLevel: number;
  lowStockThreshold: number;
  costPerUnit?: number;
};

export type ActionResult = {
  success: boolean;
  error?: string;
  data?: IWarehouseItem;
};

export async function getInventoryItems(): Promise<IWarehouseItem[]> {
  await dbConnect();

  const userId = await getAuthUserId();
  if (!userId) {
    return [];
  }

  const items = await WarehouseItem.find({ ownerId: userId })
    .sort({ createdAt: -1 })
    .lean();

  return JSON.parse(JSON.stringify(items));
}

export async function createInventoryItem(data: InventoryFormData): Promise<ActionResult> {
  try {
    await dbConnect();

    const userId = await getAuthUserId();
    if (!userId) {
      return { success: false, error: 'Unauthorized' };
    }

    // Check if SKU already exists
    const existing = await WarehouseItem.findOne({ sku: data.sku });
    if (existing) {
      return { success: false, error: 'SKU already exists' };
    }

    const item = await WarehouseItem.create({
      ...data,
      ownerId: userId,
    });

    revalidatePath('/admin/inventory');
    revalidatePath('/admin/dashboard');

    return { success: true, data: JSON.parse(JSON.stringify(item)) };
  } catch (error) {
    console.error('Error creating inventory item:', error);
    return { success: false, error: 'Failed to create item' };
  }
}

export async function updateInventoryItem(
  id: string,
  data: Partial<InventoryFormData>
): Promise<ActionResult> {
  try {
    await dbConnect();

    const userId = await getAuthUserId();
    if (!userId) {
      return { success: false, error: 'Unauthorized' };
    }

    // If updating SKU, check it doesn't conflict
    if (data.sku) {
      const existing = await WarehouseItem.findOne({
        sku: data.sku,
        _id: { $ne: id },
      });
      if (existing) {
        return { success: false, error: 'SKU already exists' };
      }
    }

    const item = await WarehouseItem.findOneAndUpdate(
      { _id: id, ownerId: userId },
      { $set: data },
      { new: true }
    );

    if (!item) {
      return { success: false, error: 'Item not found' };
    }

    revalidatePath('/admin/inventory');
    revalidatePath('/admin/dashboard');

    return { success: true, data: JSON.parse(JSON.stringify(item)) };
  } catch (error) {
    console.error('Error updating inventory item:', error);
    return { success: false, error: 'Failed to update item' };
  }
}

export async function deleteInventoryItem(id: string): Promise<ActionResult> {
  try {
    await dbConnect();

    const userId = await getAuthUserId();
    if (!userId) {
      return { success: false, error: 'Unauthorized' };
    }

    const item = await WarehouseItem.findOneAndDelete({
      _id: id,
      ownerId: userId,
    });

    if (!item) {
      return { success: false, error: 'Item not found' };
    }

    revalidatePath('/admin/inventory');
    revalidatePath('/admin/dashboard');

    return { success: true };
  } catch (error) {
    console.error('Error deleting inventory item:', error);
    return { success: false, error: 'Failed to delete item' };
  }
}

export async function adjustInventoryQuantity(
  id: string,
  adjustment: number
): Promise<ActionResult> {
  try {
    await dbConnect();

    const userId = await getAuthUserId();
    if (!userId) {
      return { success: false, error: 'Unauthorized' };
    }

    const item = await WarehouseItem.findOneAndUpdate(
      { _id: id, ownerId: userId },
      { $inc: { quantity: adjustment } },
      { new: true }
    );

    if (!item) {
      return { success: false, error: 'Item not found' };
    }

    // Prevent negative inventory
    if (item.quantity < 0) {
      await WarehouseItem.findByIdAndUpdate(id, { quantity: 0 });
      item.quantity = 0;
    }

    revalidatePath('/admin/inventory');
    revalidatePath('/admin/dashboard');

    return { success: true, data: JSON.parse(JSON.stringify(item)) };
  } catch (error) {
    console.error('Error adjusting inventory:', error);
    return { success: false, error: 'Failed to adjust quantity' };
  }
}
