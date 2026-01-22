'use server';

import { getAuthUserId } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import dbConnect from '@/lib/db';
import Property, { IProperty, IInventorySetting, IRoomConfiguration } from '@/models/Property';
import WarehouseItem from '@/models/WarehouseItem';

export type PropertyFormData = {
  name: string;
  address?: string;
  rooms?: IRoomConfiguration;
  inventorySettings: IInventorySetting[];
};

export type ActionResult = {
  success: boolean;
  error?: string;
  data?: IProperty;
};

export async function getProperties(): Promise<IProperty[]> {
  await dbConnect();

  const userId = await getAuthUserId();
  if (!userId) {
    return [];
  }

  const properties = await Property.find({ ownerId: userId })
    .sort({ createdAt: -1 })
    .lean();

  return JSON.parse(JSON.stringify(properties));
}

export type PropertyItemDetail = {
  sku: string;
  name: string;
  parLevel: number;
  warehouseQty: number;
  image: string;
};

export type PropertyWithItems = {
  _id: string;
  name: string;
  address?: string;
  items: PropertyItemDetail[];
};

// Map SKUs to simple icons/images
function getItemImage(sku: string): string {
  const imageMap: Record<string, string> = {
    'TP-001': '/items/toilet-paper.png',
    'SOAP-001': '/items/soap.png',
    'SHAMP-001': '/items/shampoo.png',
    'COND-001': '/items/conditioner.png',
    'TOWEL-001': '/items/towel.png',
    'HTOWEL-001': '/items/hand-towel.png',
    'DISH-001': '/items/dish-soap.png',
    'SPONGE-001': '/items/sponge.png',
    'TRASH-001': '/items/trash-bag.png',
    'PTOWEL-001': '/items/paper-towel.png',
    'COFFEE-001': '/items/coffee.png',
    'LAUNDRY-001': '/items/laundry.png',
    'CLEAN-001': '/items/cleaner.png',
    'GLASS-001': '/items/glass-cleaner.png',
    'SHEET-Q01': '/items/sheets.png',
    'FRESH-001': '/items/air-freshener.png',
  };
  return imageMap[sku] || '/items/default.png';
}

export async function getPropertiesWithItems(): Promise<PropertyWithItems[]> {
  await dbConnect();

  const userId = await getAuthUserId();
  if (!userId) {
    return [];
  }

  const properties = await Property.find({ ownerId: userId })
    .sort({ createdAt: -1 })
    .lean();

  // Get all warehouse items for this user
  const warehouseItems = await WarehouseItem.find({ ownerId: userId }).lean();
  const itemMap = new Map(warehouseItems.map(i => [i.sku, i]));

  return properties.map(p => ({
    _id: p._id.toString(),
    name: p.name,
    address: p.address,
    items: (p.inventorySettings || []).map(setting => {
      const item = itemMap.get(setting.itemSku);
      return {
        sku: setting.itemSku,
        name: item?.name || 'Unknown Item',
        parLevel: setting.parLevel,
        warehouseQty: item?.quantity || 0,
        image: getItemImage(setting.itemSku),
      };
    }),
  }));
}

export async function getProperty(id: string): Promise<IProperty | null> {
  await dbConnect();

  const userId = await getAuthUserId();
  if (!userId) {
    return null;
  }

  try {
    const property = await Property.findOne({ _id: id, ownerId: userId }).lean();
    return property ? JSON.parse(JSON.stringify(property)) : null;
  } catch {
    return null;
  }
}

export async function createProperty(data: PropertyFormData): Promise<ActionResult> {
  try {
    await dbConnect();

    const userId = await getAuthUserId();
    if (!userId) {
      return { success: false, error: 'Unauthorized' };
    }

    const property = await Property.create({
      ...data,
      ownerId: userId,
    });

    revalidatePath('/admin/properties');
    revalidatePath('/admin/dashboard');

    return { success: true, data: JSON.parse(JSON.stringify(property)) };
  } catch (error) {
    console.error('Error creating property:', error);
    return { success: false, error: 'Failed to create property' };
  }
}

export async function updateProperty(
  id: string,
  data: Partial<PropertyFormData>
): Promise<ActionResult> {
  try {
    await dbConnect();

    const userId = await getAuthUserId();
    if (!userId) {
      return { success: false, error: 'Unauthorized' };
    }

    const property = await Property.findOneAndUpdate(
      { _id: id, ownerId: userId },
      { $set: data },
      { new: true }
    );

    if (!property) {
      return { success: false, error: 'Property not found' };
    }

    revalidatePath('/admin/properties');
    revalidatePath('/admin/dashboard');

    return { success: true, data: JSON.parse(JSON.stringify(property)) };
  } catch (error) {
    console.error('Error updating property:', error);
    return { success: false, error: 'Failed to update property' };
  }
}

export async function deleteProperty(id: string): Promise<ActionResult> {
  try {
    await dbConnect();

    const userId = await getAuthUserId();
    if (!userId) {
      return { success: false, error: 'Unauthorized' };
    }

    const property = await Property.findOneAndDelete({
      _id: id,
      ownerId: userId,
    });

    if (!property) {
      return { success: false, error: 'Property not found' };
    }

    revalidatePath('/admin/properties');
    revalidatePath('/admin/dashboard');

    return { success: true };
  } catch (error) {
    console.error('Error deleting property:', error);
    return { success: false, error: 'Failed to delete property' };
  }
}

export type RestockItem = {
  sku: string;
  itemName: string;
  requested: number;
  fulfilled: number;
  warehouseRemaining: number;
};

export type AutoRestockResult = {
  success: boolean;
  error?: string;
  propertyName?: string;
  items?: RestockItem[];
  totalFulfilled?: number;
  totalRequested?: number;
};

export async function autoRestockProperty(propertyId: string): Promise<AutoRestockResult> {
  try {
    await dbConnect();

    const userId = await getAuthUserId();
    if (!userId) {
      return { success: false, error: 'Unauthorized' };
    }

    const property = await Property.findOne({ _id: propertyId, ownerId: userId });
    if (!property) {
      return { success: false, error: 'Property not found' };
    }

    if (!property.inventorySettings || property.inventorySettings.length === 0) {
      return { success: false, error: 'No inventory settings for this property' };
    }

    const restockedItems: RestockItem[] = [];
    let totalFulfilled = 0;
    let totalRequested = 0;

    for (const setting of property.inventorySettings) {
      const warehouseItem = await WarehouseItem.findOne({
        sku: setting.itemSku,
        ownerId: userId
      });

      if (!warehouseItem) {
        restockedItems.push({
          sku: setting.itemSku,
          itemName: 'Unknown Item',
          requested: setting.parLevel,
          fulfilled: 0,
          warehouseRemaining: 0,
        });
        totalRequested += setting.parLevel;
        continue;
      }

      const amountToDeduct = Math.min(setting.parLevel, warehouseItem.quantity);

      if (amountToDeduct > 0) {
        warehouseItem.quantity -= amountToDeduct;
        warehouseItem.burnRateHistory.push({
          date: new Date(),
          amountUsed: amountToDeduct,
        });
        await warehouseItem.save();
      }

      restockedItems.push({
        sku: setting.itemSku,
        itemName: warehouseItem.name,
        requested: setting.parLevel,
        fulfilled: amountToDeduct,
        warehouseRemaining: warehouseItem.quantity,
      });

      totalFulfilled += amountToDeduct;
      totalRequested += setting.parLevel;
    }

    revalidatePath('/admin/properties');
    revalidatePath('/admin/inventory');
    revalidatePath('/admin/dashboard');

    return {
      success: true,
      propertyName: property.name,
      items: restockedItems,
      totalFulfilled,
      totalRequested,
    };
  } catch (error) {
    console.error('Error auto-restocking property:', error);
    return { success: false, error: 'Failed to auto-restock property' };
  }
}
