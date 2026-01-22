import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Product from '@/models/Product';

// One-time fix for Amazon ASINs
const ASIN_UPDATES: Record<string, string> = {
  'TP-30': 'B095CN96JS',
  'SOAP-6': 'B000EEZAXO',
  'TOIL-KIT-24': 'B08NRXZP7K',
  'WASH-3': 'B07PBTB187',
  'CLEAN-3': 'B00NZDRC14',
  'GLASS-2': 'B01GFLYZMG',
  'WIPES-225': 'B07SGZWHVZ',
  'MOP-10': 'B0C1RK2YW2',
  'PTOWEL-12': 'B01K9I068S',
  'TRASH-120': 'B003HFG07M',
  'TISSUE-12': 'B098TVKB9P',
  'TOWEL-8': 'B01N9JLG1W',
  'SHEET-Q': 'B0154ASID6',
  'PILLOW-2': 'B01LYNW421',
  'MATTRESS-PROT': 'B00MRHA96O',
  'COFFEE-40': 'B071Z8LD77',
  'DISH-3': 'B075MMQX9S',
  'DISHPOD-62': 'B01NGTV4J5',
  'SPONGE-9': 'B0043P0GRA',
  'LAUNDRY-81': 'B00VRAFLII',
  'DRYER-240': 'B01ABVJWK6',
};

export async function POST() {
  try {
    await dbConnect();

    const results: Record<string, string> = {};

    for (const [sku, newAsin] of Object.entries(ASIN_UPDATES)) {
      const result = await Product.updateOne(
        { sku, isDefault: true },
        { $set: { amazonAsin: newAsin } }
      );
      results[sku] = result.modifiedCount > 0 ? `updated to ${newAsin}` : 'not found';
    }

    return NextResponse.json({ success: true, results });
  } catch (error) {
    console.error('Error updating ASINs:', error);
    return NextResponse.json({ success: false, error: 'Failed to update ASINs' }, { status: 500 });
  }
}
