'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { MapPin, RefreshCw, Loader2, Check } from "lucide-react";
import { Card, CardContent, Button, Input } from "@/components/ui";
import { PropertyWithItems, autoRestockProperty } from "@/lib/actions/properties";

interface PropertyCardsProps {
  properties: PropertyWithItems[];
}

function PropertyCard({ property }: { property: PropertyWithItems }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [quantities, setQuantities] = useState<Record<string, number>>(
    Object.fromEntries(property.items.map(i => [i.sku, i.parLevel]))
  );
  const [result, setResult] = useState<{ fulfilled: number; total: number } | null>(null);

  const handleRestock = async () => {
    setLoading(true);
    setResult(null);

    const res = await autoRestockProperty(property._id);

    if (res.success && res.totalFulfilled !== undefined && res.totalRequested !== undefined) {
      setResult({ fulfilled: res.totalFulfilled, total: res.totalRequested });
      setShowConfirm(false);
      router.refresh();
    }

    setLoading(false);
  };

  const updateQuantity = (sku: string, value: number) => {
    setQuantities(prev => ({ ...prev, [sku]: Math.max(1, value) }));
  };

  const totalItems = Object.values(quantities).reduce((a, b) => a + b, 0);

  return (
    <Card className="bg-white border-emerald-100 shadow-sm">
      <CardContent className="p-5">
        {/* Property Header */}
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-emerald-50">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center">
              <MapPin className="h-4 w-4 text-emerald-600" />
            </div>
            <h3 className="font-semibold text-zinc-800">{property.name}</h3>
          </div>
          {result && (
            <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full flex items-center gap-1">
              <Check className="h-3 w-3" />
              {result.fulfilled}/{result.total} sent
            </span>
          )}
        </div>

        {/* Items Grid */}
        <div className="space-y-3">
          {property.items.map((item) => (
            <div key={item.sku} className="flex items-center gap-3 p-2 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors">
              {/* Item Image */}
              <div className="relative h-12 w-12 flex-shrink-0 rounded-lg bg-white border border-slate-200 overflow-hidden shadow-sm">
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  className="object-cover"
                />
              </div>

              {/* Item Name */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-zinc-800 truncate">
                  {item.name}
                </p>
                <p className="text-xs text-emerald-600 font-medium">
                  {item.warehouseQty} in stock
                </p>
              </div>

              {/* Quantity Input */}
              <div className="flex items-center gap-1">
                <button
                  onClick={() => updateQuantity(item.sku, quantities[item.sku] - 1)}
                  className="h-8 w-8 rounded-lg bg-white border border-slate-200 text-slate-600 hover:bg-emerald-50 hover:border-emerald-300 hover:text-emerald-600 text-sm font-bold transition-colors"
                >
                  -
                </button>
                <input
                  type="number"
                  value={quantities[item.sku]}
                  onChange={(e) => updateQuantity(item.sku, parseInt(e.target.value) || 1)}
                  className="h-8 w-12 rounded-lg border border-slate-200 bg-white text-center text-sm font-semibold text-zinc-800 focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400"
                />
                <button
                  onClick={() => updateQuantity(item.sku, quantities[item.sku] + 1)}
                  className="h-8 w-8 rounded-lg bg-white border border-slate-200 text-slate-600 hover:bg-emerald-50 hover:border-emerald-300 hover:text-emerald-600 text-sm font-bold transition-colors"
                >
                  +
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Confirmation Step */}
        {showConfirm ? (
          <div className="mt-4 p-3 rounded-lg bg-amber-50 border border-amber-200">
            <p className="text-sm font-medium text-amber-800 mb-3">
              Send {totalItems} items to {property.name}?
            </p>
            <div className="flex gap-2">
              <Button
                onClick={handleRestock}
                disabled={loading}
                className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white font-medium"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Check className="h-4 w-4 mr-2" />
                )}
                {loading ? 'Sending...' : 'Confirm'}
              </Button>
              <Button
                onClick={() => setShowConfirm(false)}
                disabled={loading}
                variant="ghost"
                className="flex-1 text-zinc-600"
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <Button
            onClick={() => setShowConfirm(true)}
            disabled={property.items.length === 0}
            className="w-full mt-4 bg-emerald-500 hover:bg-emerald-600 text-white font-medium shadow-sm"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Restock Property
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

export function PropertyCards({ properties }: PropertyCardsProps) {
  if (properties.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <MapPin className="h-12 w-12 text-zinc-300 dark:text-zinc-600" />
          <h3 className="mt-4 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            No properties yet
          </h3>
          <p className="mt-1 text-zinc-500 dark:text-zinc-400">
            Add your first property to get started.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {properties.map((property) => (
        <PropertyCard key={property._id} property={property} />
      ))}
    </div>
  );
}
