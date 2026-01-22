'use server';

import { getAuthUserId } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import dbConnect from '@/lib/db';
import Product, { IProduct, DEFAULT_PRODUCTS } from '@/models/Product';

export type ProductFormData = {
  name: string;
  description?: string;
  category: string;
  price?: number;
  amazonAsin?: string;
  imageUrl?: string;
  sku: string;
};

export type ActionResult = {
  success: boolean;
  error?: string;
  data?: IProduct;
};

// Get all products (default + user's custom)
export async function getProducts(): Promise<IProduct[]> {
  await dbConnect();

  const userId = await getAuthUserId();

  // Get default products and user's custom products
  const products = await Product.find({
    $or: [
      { isDefault: true },
      { ownerId: userId }
    ]
  }).sort({ category: 1, name: 1 }).lean();

  return JSON.parse(JSON.stringify(products));
}

// Get products by category
export async function getProductsByCategory(category: string): Promise<IProduct[]> {
  await dbConnect();

  const userId = await getAuthUserId();

  const products = await Product.find({
    category,
    $or: [
      { isDefault: true },
      { ownerId: userId }
    ]
  }).sort({ name: 1 }).lean();

  return JSON.parse(JSON.stringify(products));
}

// Get all categories
export async function getCategories(): Promise<string[]> {
  await dbConnect();

  const userId = await getAuthUserId();

  const categories = await Product.distinct('category', {
    $or: [
      { isDefault: true },
      { ownerId: userId }
    ]
  });

  return categories.sort();
}

// Create a custom product
export async function createProduct(data: ProductFormData): Promise<ActionResult> {
  try {
    await dbConnect();

    const userId = await getAuthUserId();
    if (!userId) {
      return { success: false, error: 'Unauthorized' };
    }

    // Check if SKU already exists for this user
    const existing = await Product.findOne({
      sku: data.sku,
      $or: [
        { isDefault: true },
        { ownerId: userId }
      ]
    });

    if (existing) {
      return { success: false, error: 'A product with this SKU already exists' };
    }

    const product = await Product.create({
      ...data,
      ownerId: userId,
      isDefault: false,
    });

    revalidatePath('/admin/shop');

    return { success: true, data: JSON.parse(JSON.stringify(product)) };
  } catch (error) {
    console.error('Error creating product:', error);
    return { success: false, error: 'Failed to create product' };
  }
}

// Update a custom product (can only update own products, not defaults)
export async function updateProduct(id: string, data: Partial<ProductFormData>): Promise<ActionResult> {
  try {
    await dbConnect();

    const userId = await getAuthUserId();
    if (!userId) {
      return { success: false, error: 'Unauthorized' };
    }

    const product = await Product.findOneAndUpdate(
      { _id: id, ownerId: userId, isDefault: false },
      { $set: data },
      { new: true }
    );

    if (!product) {
      return { success: false, error: 'Product not found or cannot be edited' };
    }

    revalidatePath('/admin/shop');

    return { success: true, data: JSON.parse(JSON.stringify(product)) };
  } catch (error) {
    console.error('Error updating product:', error);
    return { success: false, error: 'Failed to update product' };
  }
}

// Delete a custom product
export async function deleteProduct(id: string): Promise<ActionResult> {
  try {
    await dbConnect();

    const userId = await getAuthUserId();
    if (!userId) {
      return { success: false, error: 'Unauthorized' };
    }

    const product = await Product.findOneAndDelete({
      _id: id,
      ownerId: userId,
      isDefault: false,
    });

    if (!product) {
      return { success: false, error: 'Product not found or cannot be deleted' };
    }

    revalidatePath('/admin/shop');

    return { success: true };
  } catch (error) {
    console.error('Error deleting product:', error);
    return { success: false, error: 'Failed to delete product' };
  }
}

// Seed default products (run once or on demand)
export async function seedDefaultProducts(): Promise<{ success: boolean; count: number }> {
  try {
    await dbConnect();

    // Check if defaults already exist
    const existingCount = await Product.countDocuments({ isDefault: true });
    if (existingCount > 0) {
      return { success: true, count: existingCount };
    }

    // Insert default products
    const products = DEFAULT_PRODUCTS.map(p => ({
      ...p,
      ownerId: null,
      isDefault: true,
    }));

    await Product.insertMany(products);

    return { success: true, count: products.length };
  } catch (error) {
    console.error('Error seeding products:', error);
    return { success: false, count: 0 };
  }
}
