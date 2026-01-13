import { generateObject } from 'ai';
import { z } from 'zod';
import { google, isGoogleConfigured } from './providers';

export interface CountResult {
  success: boolean;
  count?: number;
  confidence?: 'high' | 'medium' | 'low';
  description?: string;
  error?: string;
}

const CountSchema = z.object({
  count: z.number().describe('The number of items counted in the image'),
  confidence: z.enum(['high', 'medium', 'low']).describe('Confidence level of the count'),
  description: z.string().describe('Brief description of what was counted and any notes'),
});

/**
 * Use Gemini Vision to count items in an image
 *
 * @param imageBase64 - Base64 encoded image data (without data URL prefix)
 * @param itemName - Name of the item to count (for context)
 * @param mimeType - Image MIME type (e.g., 'image/jpeg', 'image/png')
 */
export async function countItemsInImage(
  imageBase64: string,
  itemName: string,
  mimeType: string = 'image/jpeg'
): Promise<CountResult> {
  if (!isGoogleConfigured() || !google) {
    return {
      success: false,
      error: 'Vision AI service not configured',
    };
  }

  try {
    const prompt = `Count the number of "${itemName}" items visible in this image.

INSTRUCTIONS:
1. Carefully examine the image
2. Count only the specific item type mentioned: "${itemName}"
3. If items are stacked or grouped, try to estimate the total count
4. If the image is unclear or items are partially visible, make your best estimate
5. Provide a confidence level based on image clarity and item visibility

If you cannot identify the items or the image is not suitable for counting, set count to 0 and explain in the description.`;

    // Create data URL from base64
    const dataUrl = `data:${mimeType};base64,${imageBase64}`;

    const { object } = await generateObject({
      model: google('gemini-1.5-flash'),
      schema: CountSchema,
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: prompt },
            {
              type: 'image',
              image: dataUrl,
            },
          ],
        },
      ],
    });

    return {
      success: true,
      count: object.count,
      confidence: object.confidence,
      description: object.description,
    };
  } catch (error) {
    console.error('[AI Vision] Count failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Vision analysis failed',
    };
  }
}

/**
 * Identify and count multiple item types in an image
 * Returns a map of detected items and their counts
 */
export async function identifyAndCountItems(
  imageBase64: string,
  mimeType: string = 'image/jpeg'
): Promise<{
  success: boolean;
  items?: Array<{ name: string; count: number; confidence: string }>;
  error?: string;
}> {
  if (!isGoogleConfigured() || !google) {
    return {
      success: false,
      error: 'Vision AI service not configured',
    };
  }

  try {
    const MultiItemSchema = z.object({
      items: z.array(
        z.object({
          name: z.string().describe('Name/type of the item'),
          count: z.number().describe('Number of this item type'),
          confidence: z.enum(['high', 'medium', 'low']),
        })
      ),
    });

    // Create data URL from base64
    const dataUrl = `data:${mimeType};base64,${imageBase64}`;

    const { object } = await generateObject({
      model: google('gemini-1.5-flash'),
      schema: MultiItemSchema,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: `Analyze this image and identify all countable household/rental supply items.

For each distinct item type you can identify:
1. Name the item (e.g., "toilet paper rolls", "soap bars", "towels")
2. Count how many of that item are visible
3. Rate your confidence in the count

Focus on common rental property supplies like:
- Toiletries (soap, shampoo, toilet paper)
- Linens (towels, sheets)
- Cleaning supplies
- Kitchen items

Only include items you can reasonably identify and count.`,
            },
            {
              type: 'image',
              image: dataUrl,
            },
          ],
        },
      ],
    });

    return {
      success: true,
      items: object.items,
    };
  } catch (error) {
    console.error('[AI Vision] Multi-item count failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Vision analysis failed',
    };
  }
}
