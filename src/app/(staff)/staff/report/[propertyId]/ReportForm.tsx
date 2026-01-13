'use client';

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Package, AlertTriangle, CheckCircle, Loader2, Camera, Sparkles } from "lucide-react";
import { Card, CardContent, Button, StepperInput } from "@/components/ui";
import { submitReport, ReportItemInput, RestockResult } from "@/lib/actions/reports";
import { countItemsFromImage } from "@/lib/actions/ai";

interface ChecklistItem {
  sku: string;
  name: string;
  parLevel: number;
  warehouseQuantity: number;
}

interface ReportFormProps {
  propertyId: string;
  checklist: ChecklistItem[];
}

export function ReportForm({ propertyId, checklist }: ReportFormProps) {
  const router = useRouter();
  const [counts, setCounts] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {};
    checklist.forEach((item) => {
      initial[item.sku] = item.parLevel;
    });
    return initial;
  });
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<RestockResult[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState<string | null>(null);
  const [aiResult, setAiResult] = useState<Record<string, { count: number; confidence: string; description: string } | null>>({});
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const handleCountChange = (sku: string, value: number) => {
    setCounts((prev) => ({ ...prev, [sku]: value }));
  };

  const handleAICount = async (sku: string, itemName: string, file: File) => {
    setAiLoading(sku);
    setAiResult((prev) => ({ ...prev, [sku]: null }));

    try {
      // Convert file to base64
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result as string;
          // Remove the data URL prefix to get just the base64
          const base64Data = result.split(',')[1];
          resolve(base64Data);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const result = await countItemsFromImage(base64, itemName, file.type);

      if (result.success && result.count !== undefined) {
        // Update the count
        handleCountChange(sku, result.count);
        setAiResult((prev) => ({
          ...prev,
          [sku]: {
            count: result.count!,
            confidence: result.confidence ?? 'medium',
            description: result.description ?? '',
          },
        }));
      } else {
        setError(result.error ?? 'AI count failed');
      }
    } catch (err) {
      setError('Failed to process image');
      console.error('[AI Count] Error:', err);
    }

    setAiLoading(null);
  };

  const handleFileSelect = (sku: string, itemName: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleAICount(sku, itemName, file);
    }
    // Reset input so same file can be selected again
    e.target.value = '';
  };

  const triggerFileInput = (sku: string) => {
    fileInputRefs.current[sku]?.click();
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    const items: ReportItemInput[] = checklist.map((item) => ({
      sku: item.sku,
      observedCount: counts[item.sku] ?? 0,
    }));

    const result = await submitReport({
      propertyId,
      items,
      notes: notes || undefined,
    });

    setLoading(false);

    if (result.success) {
      setResults(result.results ?? []);
    } else {
      setError(result.error ?? "Failed to submit report");
    }
  };

  // Show results after submission
  if (results) {
    const hasShortages = results.some((r) => r.shortage);
    const totalRestocked = results.reduce((sum, r) => sum + r.restocked, 0);

    return (
      <div className="space-y-4">
        {/* Success Header */}
        <Card className={hasShortages ? "border-amber-200 bg-amber-50" : "border-emerald-200 bg-emerald-50"}>
          <CardContent className="flex items-center gap-4 p-4">
            {hasShortages ? (
              <AlertTriangle className="h-8 w-8 text-amber-600" />
            ) : (
              <CheckCircle className="h-8 w-8 text-emerald-600" />
            )}
            <div>
              <p className="font-semibold text-zinc-900">
                {hasShortages ? "Report Submitted with Warnings" : "Report Submitted Successfully"}
              </p>
              <p className="text-sm text-zinc-600">
                {totalRestocked} items queued for restocking
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Results List */}
        <div className="space-y-3">
          {results.map((result) => (
            <Card
              key={result.sku}
              className={result.shortage ? "border-rose-200" : ""}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium text-zinc-900">{result.itemName}</p>
                    <p className="text-sm text-zinc-500">SKU: {result.sku}</p>
                  </div>
                  {result.shortage && (
                    <span className="rounded-full bg-rose-100 px-2 py-1 text-xs font-medium text-rose-700">
                      SHORTAGE
                    </span>
                  )}
                </div>
                <div className="mt-3 grid grid-cols-3 gap-4 text-center text-sm">
                  <div>
                    <p className="text-zinc-500">Counted</p>
                    <p className="font-semibold text-zinc-900">{result.observedCount}</p>
                  </div>
                  <div>
                    <p className="text-zinc-500">Needed</p>
                    <p className="font-semibold text-zinc-900">{result.needed}</p>
                  </div>
                  <div>
                    <p className="text-zinc-500">Restocked</p>
                    <p className={`font-semibold ${result.shortage ? "text-rose-600" : "text-emerald-600"}`}>
                      {result.restocked}
                    </p>
                  </div>
                </div>
                {result.lowStockAlert && (
                  <div className="mt-3 rounded-lg bg-amber-50 p-2 text-center text-xs text-amber-700">
                    <AlertTriangle className="mr-1 inline h-3 w-3" />
                    Warehouse low: {result.newWarehouseQuantity} remaining
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Button
            variant="secondary"
            className="flex-1"
            onClick={() => router.push("/staff")}
          >
            Back to Properties
          </Button>
          <Button
            className="flex-1"
            onClick={() => {
              setResults(null);
              setCounts(() => {
                const initial: Record<string, number> = {};
                checklist.forEach((item) => {
                  initial[item.sku] = item.parLevel;
                });
                return initial;
              });
              setNotes("");
              setAiResult({});
            }}
          >
            New Report
          </Button>
        </div>
      </div>
    );
  }

  // Show form
  return (
    <div className="space-y-4">
      {error && (
        <Card className="border-rose-200 bg-rose-50">
          <CardContent className="p-4 text-rose-700">{error}</CardContent>
        </Card>
      )}

      {checklist.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center py-12 text-center">
            <Package className="h-12 w-12 text-zinc-300" />
            <h3 className="mt-4 font-semibold text-zinc-900">No items to check</h3>
            <p className="mt-1 text-sm text-zinc-500">
              This property has no inventory requirements configured.
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Item Checklist */}
          {checklist.map((item) => (
            <Card key={item.sku}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-zinc-900">{item.name}</p>
                    <p className="text-sm text-zinc-500">
                      Par: {item.parLevel} • Warehouse: {item.warehouseQuantity}
                    </p>
                  </div>

                  {/* AI Count Button */}
                  <div className="flex items-center gap-2">
                    <input
                      type="file"
                      accept="image/*"
                      capture="environment"
                      className="hidden"
                      ref={(el) => { fileInputRefs.current[item.sku] = el; }}
                      onChange={handleFileSelect(item.sku, item.name)}
                    />
                    <button
                      type="button"
                      onClick={() => triggerFileInput(item.sku)}
                      disabled={aiLoading === item.sku}
                      className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-100 text-violet-700 transition-colors hover:bg-violet-200 active:bg-violet-300 disabled:opacity-50"
                      title="AI Count - Take a photo"
                    >
                      {aiLoading === item.sku ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : (
                        <Camera className="h-5 w-5" />
                      )}
                    </button>

                    <StepperInput
                      value={counts[item.sku] ?? 0}
                      onChange={(v) => handleCountChange(item.sku, v)}
                      min={0}
                      max={999}
                    />
                  </div>
                </div>

                {/* AI Result Feedback */}
                {aiResult[item.sku] && (
                  <div className="mt-3 flex items-center gap-2 rounded-lg bg-violet-50 p-2 text-xs text-violet-700">
                    <Sparkles className="h-4 w-4" />
                    <span>
                      AI counted <strong>{aiResult[item.sku]!.count}</strong> ({aiResult[item.sku]!.confidence} confidence)
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}

          {/* Notes */}
          <Card>
            <CardContent className="p-4">
              <label className="text-sm font-medium text-zinc-700">
                Notes (optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any issues or observations..."
                className="mt-2 w-full rounded-lg border border-zinc-200 p-3 text-sm focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                rows={3}
              />
            </CardContent>
          </Card>

          {/* Submit Button */}
          <Button
            className="w-full"
            size="lg"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Submitting...
              </>
            ) : (
              "Submit Report"
            )}
          </Button>
        </>
      )}
    </div>
  );
}
