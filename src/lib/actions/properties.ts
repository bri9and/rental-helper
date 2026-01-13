'use server';

import { getAuthUserId } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import dbConnect from '@/lib/db';
import Property, { IProperty, IInventorySetting } from '@/models/Property';

export type PropertyFormData = {
  name: string;
  address?: string;
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
