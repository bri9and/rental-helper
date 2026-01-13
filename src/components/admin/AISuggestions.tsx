'use client';

import { useState, useEffect, useCallback } from 'react';
import { Sparkles, TrendingUp, TrendingDown, Minus, AlertTriangle, Loader2, RefreshCw } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, Button, Badge } from '@/components/ui';
import { getAISuggestions, AISuggestion } from '@/lib/actions/ai';

export function AISuggestions() {
  const [loading, setLoading] = useState(true);
  const [suggestions, setSuggestions] = useState<AISuggestion[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [aiConfigured, setAiConfigured] = useState(true);

  const loadSuggestions = useCallback(async () => {
    setLoading(true);
    setError(null);

    const result = await getAISuggestions();

    if (result.success) {
      setSuggestions(result.suggestions ?? []);
      setAiConfigured(true);
    } else {
      setError(result.error ?? 'Failed to load suggestions');
      setAiConfigured(result.aiConfigured ?? true);
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError(null);

      const result = await getAISuggestions();

      if (cancelled) return;

      if (result.success) {
        setSuggestions(result.suggestions ?? []);
        setAiConfigured(true);
      } else {
        setError(result.error ?? 'Failed to load suggestions');
        setAiConfigured(result.aiConfigured ?? true);
      }

      setLoading(false);
    };

    load();

    return () => {
      cancelled = true;
    };
  }, []);

  const getTrendIcon = (trend: 'increasing' | 'stable' | 'decreasing') => {
    switch (trend) {
      case 'increasing':
        return <TrendingUp className="h-4 w-4 text-rose-500" />;
      case 'decreasing':
        return <TrendingDown className="h-4 w-4 text-emerald-500" />;
      default:
        return <Minus className="h-4 w-4 text-zinc-400" />;
    }
  };

  const getConfidenceBadge = (confidence: 'high' | 'medium' | 'low') => {
    const variants = {
      high: 'success' as const,
      medium: 'warning' as const,
      low: 'default' as const,
    };
    return <Badge variant={variants[confidence]}>{confidence}</Badge>;
  };

  // Don't show if AI is not configured
  if (!aiConfigured) {
    return null;
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-violet-500" />
          AI Inventory Insights
        </CardTitle>
        <Button
          variant="ghost"
          size="sm"
          onClick={loadSuggestions}
          disabled={loading}
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
        </Button>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-zinc-400" />
            <span className="ml-2 text-sm text-zinc-500">Analyzing inventory patterns...</span>
          </div>
        ) : error ? (
          <div className="rounded-lg bg-rose-50 p-4 text-sm text-rose-600">
            {error}
          </div>
        ) : suggestions.length === 0 ? (
          <div className="py-4 text-center text-sm text-zinc-500">
            <Sparkles className="mx-auto h-8 w-8 text-zinc-300" />
            <p className="mt-2">No suggestions at this time</p>
            <p className="text-xs text-zinc-400">
              AI will suggest par level changes based on usage patterns
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {suggestions.map((item) => (
              <div
                key={item.sku}
                className="rounded-lg border border-zinc-200 p-4"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium text-zinc-900">{item.itemName}</p>
                    <p className="text-sm text-zinc-500">SKU: {item.sku}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {getTrendIcon(item.suggestion.trend)}
                    {getConfidenceBadge(item.suggestion.confidence)}
                  </div>
                </div>

                <div className="mt-3 grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-zinc-500">Current Par</p>
                    <p className="font-semibold text-zinc-900">{item.currentPar}</p>
                  </div>
                  <div>
                    <p className="text-zinc-500">Suggested</p>
                    <p className={`font-semibold ${
                      item.suggestion.suggestedPar > item.currentPar
                        ? 'text-rose-600'
                        : item.suggestion.suggestedPar < item.currentPar
                        ? 'text-emerald-600'
                        : 'text-zinc-900'
                    }`}>
                      {item.suggestion.suggestedPar}
                      {item.suggestion.suggestedPar !== item.currentPar && (
                        <span className="ml-1 text-xs">
                          ({item.suggestion.suggestedPar > item.currentPar ? '+' : ''}
                          {item.suggestion.suggestedPar - item.currentPar})
                        </span>
                      )}
                    </p>
                  </div>
                  <div>
                    <p className="text-zinc-500">Weekly Avg</p>
                    <p className="font-semibold text-zinc-900">
                      {item.suggestion.weeklyAverage.toFixed(1)}
                    </p>
                  </div>
                </div>

                {item.suggestion.daysUntilStockout !== null && item.suggestion.daysUntilStockout < 14 && (
                  <div className="mt-3 flex items-center gap-2 rounded-lg bg-amber-50 p-2 text-xs text-amber-700">
                    <AlertTriangle className="h-4 w-4" />
                    Estimated stockout in {item.suggestion.daysUntilStockout} days
                  </div>
                )}

                <p className="mt-3 text-sm text-zinc-600">{item.suggestion.reason}</p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
