'use client';

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Package, AlertTriangle, CheckCircle, Loader2, Camera, Sparkles, Bell } from "lucide-react";
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
  propertyName: string;
  checklist: ChecklistItem[];
}

export function ReportForm({ propertyId, propertyName, checklist }: ReportFormProps) {
  const router = useRouter();
  const [counts, setCounts] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {};
    checklist.forEach((item) => {
      initial[item.sku] = item.parLevel;
    });
    return initial;
  });
  const [supplyRequests, setSupplyRequests] = useState<Record<string, boolean>>({});
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<RestockResult[] | null>(null);
  const [supplyRequestsCreated, setSupplyRequestsCreated] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState<string | null>(null);
  const [aiResult, setAiResult] = useState<Record<string, { count: number; confidence: string; description: string } | null>>({});
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const handleCountChange = (sku: string, value: number) => {
    setCounts((prev) => ({ ...prev, [sku]: value }));
    // Auto-enable supply request when count is 1 or less
    if (value <= 1) {
      setSupplyRequests((prev) => ({ ...prev, [sku]: true }));
    }
  };

  const toggleSupplyRequest = (sku: string) => {
    setSupplyRequests((prev) => ({ ...prev, [sku]: !prev[sku] }));
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

    // Collect supply request flags
    const supplyRequestItems = checklist
      .filter((item) => supplyRequests[item.sku])
      .map((item) => ({
        sku: item.sku,
        name: item.name,
        currentCount: counts[item.sku] ?? 0,
      }));

    const result = await submitReport({
      propertyId,
      propertyName,
      items,
      notes: notes || undefined,
      supplyRequests: supplyRequestItems,
    });

    setLoading(false);

    if (result.success) {
      setResults(result.results ?? []);
      setSupplyRequestsCreated(result.supplyRequestsCreated ?? 0);
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
        <Card className={hasShortages ? "border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950" : "border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950"}>
          <CardContent className="flex items-center gap-4 p-4">
            {hasShortages ? (
              <AlertTriangle className="h-8 w-8 text-amber-600 dark:text-amber-400" />
            ) : (
              <CheckCircle className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
            )}
            <div>
              <p className="font-semibold text-zinc-900 dark:text-zinc-100">
                {hasShortages ? "Report Submitted with Warnings" : "Report Submitted Successfully"}
              </p>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                {totalRestocked} items queued for restocking
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Supply Requests Created */}
        {supplyRequestsCreated > 0 && (
          <Card className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950">
            <CardContent className="flex items-center gap-4 p-4">
              <Bell className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              <div>
                <p className="font-semibold text-zinc-900 dark:text-zinc-100">
                  Supply Requests Sent
                </p>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  {supplyRequestsCreated} item{supplyRequestsCreated > 1 ? 's' : ''} flagged for manager review
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Results List */}
        <div className="space-y-3">
          {results.map((result) => (
            <Card
              key={result.sku}
              className={result.shortage ? "border-rose-200 dark:border-rose-800" : ""}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium text-zinc-900 dark:text-zinc-100">{result.itemName}</p>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">SKU: {result.sku}</p>
                  </div>
                  {result.shortage && (
                    <span className="rounded-full bg-rose-100 dark:bg-rose-900 px-2 py-1 text-xs font-medium text-rose-700 dark:text-rose-300">
                      SHORTAGE
                    </span>
                  )}
                </div>
                <div className="mt-3 grid grid-cols-3 gap-4 text-center text-sm">
                  <div>
                    <p className="text-zinc-500 dark:text-zinc-400">Counted</p>
                    <p className="font-semibold text-zinc-900 dark:text-zinc-100">{result.observedCount}</p>
                  </div>
                  <div>
                    <p className="text-zinc-500 dark:text-zinc-400">Needed</p>
                    <p className="font-semibold text-zinc-900 dark:text-zinc-100">{result.needed}</p>
                  </div>
                  <div>
                    <p className="text-zinc-500 dark:text-zinc-400">Restocked</p>
                    <p className={`font-semibold ${result.shortage ? "text-rose-600 dark:text-rose-400" : "text-emerald-600 dark:text-emerald-400"}`}>
                      {result.restocked}
                    </p>
                  </div>
                </div>
                {result.lowStockAlert && (
                  <div className="mt-3 rounded-lg bg-amber-50 dark:bg-amber-950 p-2 text-center text-xs text-amber-700 dark:text-amber-300">
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
              setSupplyRequestsCreated(0);
              setCounts(() => {
                const initial: Record<string, number> = {};
                checklist.forEach((item) => {
                  initial[item.sku] = item.parLevel;
                });
                return initial;
              });
              setSupplyRequests({});
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
        <Card className="border-rose-200 bg-rose-50 dark:border-rose-800 dark:bg-rose-950">
          <CardContent className="p-4 text-rose-700 dark:text-rose-300">{error}</CardContent>
        </Card>
      )}

      {/* Instructions */}
      <Card className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950">
        <CardContent className="p-4 text-sm text-blue-700 dark:text-blue-300">
          <Bell className="inline h-4 w-4 mr-2" />
          <strong>Tip:</strong> Toggle &quot;Need supplies&quot; when down to 1 unit to notify the manager.
        </CardContent>
      </Card>

      {checklist.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center py-12 text-center">
            <Package className="h-12 w-12 text-zinc-300 dark:text-zinc-600" />
            <h3 className="mt-4 font-semibold text-zinc-900 dark:text-zinc-100">No items to check</h3>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              This property has no inventory requirements configured.
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Item Checklist */}
          {checklist.map((item) => {
            const count = counts[item.sku] ?? 0;
            const isLow = count <= 1;
            const needsSupplies = supplyRequests[item.sku];

            return (
              <Card key={item.sku} className={isLow ? "border-amber-200 dark:border-amber-800" : ""}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-zinc-900 dark:text-zinc-100">{item.name}</p>
                      <p className="text-sm text-zinc-500 dark:text-zinc-400">
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
                        className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-100 dark:bg-violet-900 text-violet-700 dark:text-violet-300 transition-colors hover:bg-violet-200 dark:hover:bg-violet-800 active:bg-violet-300 disabled:opacity-50"
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
                    <div className="mt-3 flex items-center gap-2 rounded-lg bg-violet-50 dark:bg-violet-950 p-2 text-xs text-violet-700 dark:text-violet-300">
                      <Sparkles className="h-4 w-4" />
                      <span>
                        AI counted <strong>{aiResult[item.sku]!.count}</strong> ({aiResult[item.sku]!.confidence} confidence)
                      </span>
                    </div>
                  )}

                  {/* Need Supplies Toggle - Always show for low items, optional for others */}
                  {(isLow || needsSupplies) && (
                    <button
                      type="button"
                      onClick={() => toggleSupplyRequest(item.sku)}
                      className={`mt-3 w-full flex items-center justify-center gap-2 rounded-lg p-3 text-sm font-medium transition-colors ${
                        needsSupplies
                          ? "bg-blue-600 text-white hover:bg-blue-700"
                          : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700"
                      }`}
                    >
                      <Bell className="h-4 w-4" />
                      {needsSupplies ? "Supply request enabled" : "Need supplies?"}
                    </button>
                  )}

                  {/* Low stock warning */}
                  {isLow && !needsSupplies && (
                    <p className="mt-2 text-xs text-amber-600 dark:text-amber-400 text-center">
                      Low count detected - tap above to request supplies
                    </p>
                  )}
                </CardContent>
              </Card>
            );
          })}

          {/* Notes */}
          <Card>
            <CardContent className="p-4">
              <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Notes (optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any issues or observations..."
                className="mt-2 w-full rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-3 text-sm text-zinc-900 dark:text-zinc-100 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                rows={3}
              />
            </CardContent>
          </Card>

          {/* Supply Request Summary */}
          {Object.values(supplyRequests).some(Boolean) && (
            <Card className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950">
              <CardContent className="p-4">
                <p className="text-sm font-medium text-blue-700 dark:text-blue-300">
                  <Bell className="inline h-4 w-4 mr-1" />
                  {Object.values(supplyRequests).filter(Boolean).length} supply request{Object.values(supplyRequests).filter(Boolean).length > 1 ? 's' : ''} will be sent to manager
                </p>
              </CardContent>
            </Card>
          )}

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
