'use server';

import { getAuthUserId } from '@/lib/auth';
import dbConnect from '@/lib/db';
import WarehouseItem from '@/models/WarehouseItem';
import {
  analyzeBurnRate,
  countItemsInImage,
  BurnRateSuggestion,
  isAnthropicConfigured,
  isGoogleConfigured,
} from '@/lib/ai';

export interface AISuggestion {
  sku: string;
  itemName: string;
  currentPar: number;
  currentQuantity: number;
  suggestion: BurnRateSuggestion;
}

export interface GetSuggestionsResult {
  success: boolean;
  suggestions?: AISuggestion[];
  error?: string;
  aiConfigured?: boolean;
}

/**
 * Get AI-powered inventory suggestions for all items with sufficient history
 */
export async function getAISuggestions(): Promise<GetSuggestionsResult> {
  if (!isAnthropicConfigured()) {
    return {
      success: false,
      error: 'AI service not configured',
      aiConfigured: false,
    };
  }

  try {
    await dbConnect();

    const userId = await getAuthUserId();
    if (!userId) {
      return { success: false, error: 'Unauthorized' };
    }

    // Get items with burn rate history
    const items = await WarehouseItem.find({
      ownerId: userId,
      'burnRateHistory.1': { $exists: true }, // At least 2 entries
    }).lean();

    const suggestions: AISuggestion[] = [];

    // Analyze each item (limit to prevent API overuse)
    const itemsToAnalyze = items.slice(0, 10);

    for (const item of itemsToAnalyze) {
      const result = await analyzeBurnRate({
        itemName: item.name,
        sku: item.sku,
        currentParLevel: item.parLevel,
        currentQuantity: item.quantity,
        lowStockThreshold: item.lowStockThreshold,
        burnRateHistory: item.burnRateHistory,
      });

      if (result.success && result.suggestion) {
        // Only include if suggestion differs from current or there's a concern
        const parDiff = Math.abs(result.suggestion.suggestedPar - item.parLevel);
        const needsAttention =
          parDiff >= 2 ||
          result.suggestion.trend === 'increasing' ||
          (result.suggestion.daysUntilStockout !== null &&
            result.suggestion.daysUntilStockout < 14);

        if (needsAttention) {
          suggestions.push({
            sku: item.sku,
            itemName: item.name,
            currentPar: item.parLevel,
            currentQuantity: item.quantity,
            suggestion: result.suggestion,
          });
        }
      }
    }

    // Sort by urgency (days until stockout, then by trend)
    suggestions.sort((a, b) => {
      const aDays = a.suggestion.daysUntilStockout ?? 999;
      const bDays = b.suggestion.daysUntilStockout ?? 999;
      if (aDays !== bDays) return aDays - bDays;

      const trendOrder = { increasing: 0, stable: 1, decreasing: 2 };
      return trendOrder[a.suggestion.trend] - trendOrder[b.suggestion.trend];
    });

    return {
      success: true,
      suggestions,
      aiConfigured: true,
    };
  } catch (error) {
    console.error('[AI] Get suggestions failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get suggestions',
    };
  }
}

/**
 * Analyze a single item's burn rate
 */
export async function analyzeItemBurnRate(sku: string): Promise<{
  success: boolean;
  suggestion?: BurnRateSuggestion;
  error?: string;
}> {
  if (!isAnthropicConfigured()) {
    return { success: false, error: 'AI service not configured' };
  }

  try {
    await dbConnect();

    const userId = await getAuthUserId();
    if (!userId) {
      return { success: false, error: 'Unauthorized' };
    }

    const item = await WarehouseItem.findOne({ ownerId: userId, sku }).lean();
    if (!item) {
      return { success: false, error: 'Item not found' };
    }

    const result = await analyzeBurnRate({
      itemName: item.name,
      sku: item.sku,
      currentParLevel: item.parLevel,
      currentQuantity: item.quantity,
      lowStockThreshold: item.lowStockThreshold,
      burnRateHistory: item.burnRateHistory,
    });

    return result;
  } catch (error) {
    console.error('[AI] Analyze item failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Analysis failed',
    };
  }
}

export interface CountImageResult {
  success: boolean;
  count?: number;
  confidence?: string;
  description?: string;
  error?: string;
  aiConfigured?: boolean;
}

/**
 * Count items in an uploaded image using Gemini Vision
 */
export async function countItemsFromImage(
  imageBase64: string,
  itemName: string,
  mimeType: string = 'image/jpeg'
): Promise<CountImageResult> {
  if (!isGoogleConfigured()) {
    return {
      success: false,
      error: 'Vision AI service not configured',
      aiConfigured: false,
    };
  }

  try {
    const userId = await getAuthUserId();
    if (!userId) {
      return { success: false, error: 'Unauthorized' };
    }

    const result = await countItemsInImage(imageBase64, itemName, mimeType);

    return {
      ...result,
      aiConfigured: true,
    };
  } catch (error) {
    console.error('[AI Vision] Count from image failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Vision analysis failed',
    };
  }
}

/**
 * Check if AI features are configured
 */
export async function checkAIStatus(): Promise<{
  anthropic: boolean;
  google: boolean;
}> {
  return {
    anthropic: isAnthropicConfigured(),
    google: isGoogleConfigured(),
  };
}
