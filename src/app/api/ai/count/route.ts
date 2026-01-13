import { NextResponse } from 'next/server';
import { countItemsFromImage } from '@/lib/actions/ai';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const { imageBase64, itemName, mimeType } = body as {
      imageBase64: string;
      itemName: string;
      mimeType?: string;
    };

    if (!imageBase64 || !itemName) {
      return NextResponse.json({ error: 'Missing imageBase64 or itemName' }, { status: 400 });
    }

    const result = await countItemsFromImage(imageBase64, itemName, mimeType);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      count: result.count,
      confidence: result.confidence,
      description: result.description,
    });
  } catch (error) {
    console.error('[API] AI count failed:', error);
    return NextResponse.json({ error: 'Failed to count items' }, { status: 500 });
  }
}
