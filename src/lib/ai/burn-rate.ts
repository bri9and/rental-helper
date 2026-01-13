import { generateObject } from 'ai';
import { z } from 'zod';
import { anthropic, isAnthropicConfigured } from './providers';

export interface BurnRateEntry {
  date: Date;
  amountUsed: number;
}

export interface BurnRateAnalysisInput {
  itemName: string;
  sku: string;
  currentParLevel: number;
  currentQuantity: number;
  lowStockThreshold: number;
  burnRateHistory: BurnRateEntry[];
}

export interface BurnRateSuggestion {
  suggestedPar: number;
  reason: string;
  weeklyAverage: number;
  trend: 'increasing' | 'stable' | 'decreasing';
  confidence: 'high' | 'medium' | 'low';
  daysUntilStockout: number | null;
}

export interface AnalysisResult {
  success: boolean;
  suggestion?: BurnRateSuggestion;
  error?: string;
}

const SuggestionSchema = z.object({
  suggestedPar: z.number().describe('The recommended new par level for the warehouse'),
  reason: z.string().describe('A brief explanation of why this par level is recommended'),
  weeklyAverage: z.number().describe('The calculated average weekly consumption'),
  trend: z.enum(['increasing', 'stable', 'decreasing']).describe('The trend direction of consumption'),
  confidence: z.enum(['high', 'medium', 'low']).describe('Confidence level based on data quality'),
  daysUntilStockout: z.number().nullable().describe('Estimated days until stockout at current rate, null if cannot be calculated'),
});

/**
 * Analyze burn rate history for an inventory item and suggest optimal par levels
 *
 * Uses Claude to analyze consumption patterns and provide intelligent recommendations
 */
export async function analyzeBurnRate(
  input: BurnRateAnalysisInput
): Promise<AnalysisResult> {
  if (!isAnthropicConfigured() || !anthropic) {
    return {
      success: false,
      error: 'AI service not configured',
    };
  }

  // Need at least some history to analyze
  if (input.burnRateHistory.length < 2) {
    return {
      success: false,
      error: 'Insufficient data for analysis (need at least 2 data points)',
    };
  }

  try {
    // Prepare the history data for the prompt
    const historyData = input.burnRateHistory
      .map((entry) => ({
        date: new Date(entry.date).toISOString().split('T')[0],
        amountUsed: entry.amountUsed,
        dayOfWeek: new Date(entry.date).toLocaleDateString('en-US', { weekday: 'long' }),
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    const prompt = `Analyze the burn rate history for this inventory item and suggest an optimal par level.

ITEM DETAILS:
- Name: ${input.itemName}
- SKU: ${input.sku}
- Current Par Level: ${input.currentParLevel}
- Current Warehouse Quantity: ${input.currentQuantity}
- Low Stock Threshold: ${input.lowStockThreshold}

CONSUMPTION HISTORY (${historyData.length} records):
${JSON.stringify(historyData, null, 2)}

ANALYSIS REQUIREMENTS:
1. Calculate the average weekly consumption based on the history
2. Identify any trends (increasing, stable, or decreasing usage)
3. Look for patterns (e.g., higher usage on weekends, seasonal patterns)
4. Consider the current quantity and estimate days until stockout
5. Suggest a new par level that:
   - Maintains a 20% safety buffer above the calculated needs
   - Accounts for any increasing trends
   - Ensures adequate stock between restock cycles (assume weekly restocking)

Provide a practical recommendation with clear reasoning.`;

    const { object } = await generateObject({
      model: anthropic('claude-3-5-sonnet-20241022'),
      schema: SuggestionSchema,
      prompt,
    });

    return {
      success: true,
      suggestion: object,
    };
  } catch (error) {
    console.error('[AI] Burn rate analysis failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Analysis failed',
    };
  }
}

/**
 * Get AI suggestions for all items that need attention
 * (items with sufficient history and either low stock or changing patterns)
 */
export async function getInventorySuggestions(
  items: BurnRateAnalysisInput[]
): Promise<Map<string, AnalysisResult>> {
  const results = new Map<string, AnalysisResult>();

  // Filter to items with enough history
  const analyzableItems = items.filter((item) => item.burnRateHistory.length >= 2);

  // Analyze in parallel (with concurrency limit)
  const BATCH_SIZE = 3;
  for (let i = 0; i < analyzableItems.length; i += BATCH_SIZE) {
    const batch = analyzableItems.slice(i, i + BATCH_SIZE);
    const batchResults = await Promise.all(
      batch.map(async (item) => {
        const result = await analyzeBurnRate(item);
        return { sku: item.sku, result };
      })
    );

    for (const { sku, result } of batchResults) {
      results.set(sku, result);
    }
  }

  return results;
}
