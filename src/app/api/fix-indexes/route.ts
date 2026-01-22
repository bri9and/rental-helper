import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import mongoose from 'mongoose';

// One-time fix for warehouse item indexes
export async function POST() {
  try {
    await dbConnect();

    const collection = mongoose.connection.collection('warehouseitems');

    // Get current indexes
    const indexes = await collection.indexes();
    const results: string[] = [];

    // Drop the old unique index on sku alone if it exists
    const skuOnlyIndex = indexes.find(
      (idx) => idx.key?.sku === 1 && !idx.key?.ownerId && idx.unique
    );

    if (skuOnlyIndex && skuOnlyIndex.name) {
      await collection.dropIndex(skuOnlyIndex.name);
      results.push(`Dropped old index: ${skuOnlyIndex.name}`);
    }

    // Create compound unique index if it doesn't exist
    const compoundIndex = indexes.find(
      (idx) => idx.key?.ownerId === 1 && idx.key?.sku === 1 && idx.unique
    );

    if (!compoundIndex) {
      await collection.createIndex(
        { ownerId: 1, sku: 1 },
        { unique: true, background: true }
      );
      results.push('Created compound unique index on ownerId + sku');
    } else {
      results.push('Compound index already exists');
    }

    return NextResponse.json({ success: true, results });
  } catch (error) {
    console.error('Error fixing indexes:', error);
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}
