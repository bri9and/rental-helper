'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { MapPin, RefreshCw, Loader2, Check, AlertTriangle, CheckCircle, Package } from "lucide-react";
import { Card, CardContent, Button } from "@/components/ui";
import { autoRestockProperty } from "@/lib/actions/properties";
import { PropertyStatus } from "./page";

interface PropertyRestockCardsProps {
  properties: PropertyStatus[];
}

function StatusBadge({ status }: { status: 'good' | 'low' | 'critical' }) {
  if (status === 'critical') {
    return (
      <span className="flex items-center gap-1 text-xs font-medium text-rose-700 bg-rose-100 px-2 py-1 rounded-full">
        <AlertTriangle className="h-3 w-3" />
        Needs Restock
      </span>
    );
  }
  if (status === 'low') {
    return (
      <span className="flex items-center gap-1 text-xs font-medium text-amber-700 bg-amber-100 px-2 py-1 rounded-full">
        <AlertTriangle className="h-3 w-3" />
        Running Low
      </span>
    );
  }
  return (
    <span className="flex items-center gap-1 text-xs font-medium text-emerald-700 bg-emerald-100 px-2 py-1 rounded-full">
      <CheckCircle className="h-3 w-3" />
      Stocked
    </span>
  );
}

function PropertyCard({ property }: { property: PropertyStatus }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ fulfilled: number; total: number } | null>(null);

  const handleRestock = async () => {
    setLoading(true);
    setResult(null);

    const res = await autoRestockProperty(property._id);

    if (res.success && res.totalFulfilled !== undefined && res.totalRequested !== undefined) {
      setResult({ fulfilled: res.totalFulfilled, total: res.totalRequested });
      router.refresh();
    }

    setLoading(false);
  };

  const borderColor = {
    critical: 'border-rose-200',
    low: 'border-amber-200',
    good: 'border-emerald-100',
  }[property.status];

  const bgColor = {
    critical: 'bg-gradient-to-br from-rose-50 to-white',
    low: 'bg-gradient-to-br from-amber-50 to-white',
    good: 'bg-white',
  }[property.status];

  // Items that need restocking (below 50% of par)
  const lowItems = property.items.filter(i => i.currentCount < i.parLevel * 0.5);

  return (
    <Card className={`${borderColor} ${bgColor} shadow-sm hover:shadow-md transition-shadow`}>
      <CardContent className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
              property.status === 'critical' ? 'bg-rose-100' :
              property.status === 'low' ? 'bg-amber-100' : 'bg-emerald-100'
            }`}>
              <MapPin className={`h-5 w-5 ${
                property.status === 'critical' ? 'text-rose-600' :
                property.status === 'low' ? 'text-amber-600' : 'text-emerald-600'
              }`} />
            </div>
            <div>
              <h3 className="font-semibold text-zinc-900">{property.name}</h3>
              {property.address && (
                <p className="text-xs text-zinc-500 truncate max-w-[150px]">{property.address}</p>
              )}
            </div>
          </div>
          <StatusBadge status={property.status} />
        </div>

        {/* Items needing attention */}
        {lowItems.length > 0 ? (
          <div className="space-y-2 mb-4">
            <p className="text-xs font-medium text-zinc-500 uppercase tracking-wide">Low Items</p>
            <div className="flex flex-wrap gap-2">
              {lowItems.slice(0, 4).map((item) => (
                <div key={item.sku} className="flex items-center gap-2 bg-white border border-zinc-200 rounded-lg px-2 py-1">
                  <div className="relative h-6 w-6 rounded overflow-hidden bg-zinc-100">
                    <Image src={item.image} alt={item.name} fill className="object-cover" />
                  </div>
                  <span className="text-xs text-zinc-700">{item.currentCount}/{item.parLevel}</span>
                </div>
              ))}
              {lowItems.length > 4 && (
                <span className="text-xs text-zinc-500 self-center">+{lowItems.length - 4} more</span>
              )}
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2 mb-4 p-2 bg-emerald-50 rounded-lg">
            <CheckCircle className="h-4 w-4 text-emerald-600" />
            <span className="text-sm text-emerald-700">All items at or above par level</span>
          </div>
        )}

        {/* Result message */}
        {result && (
          <div className="mb-3 p-2 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center gap-2">
            <Check className="h-4 w-4 text-emerald-600" />
            <span className="text-sm text-emerald-700">
              Sent {result.fulfilled} of {result.total} items
            </span>
          </div>
        )}

        {/* Restock Button */}
        <Button
          onClick={handleRestock}
          disabled={loading || property.items.length === 0}
          className={`w-full font-medium ${
            property.status === 'critical'
              ? 'bg-rose-500 hover:bg-rose-600 text-white'
              : property.status === 'low'
              ? 'bg-amber-500 hover:bg-amber-600 text-white'
              : 'bg-emerald-500 hover:bg-emerald-600 text-white'
          }`}
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Restocking...
            </>
          ) : (
            <>
              <RefreshCw className="h-4 w-4 mr-2" />
              Restock to Par Level
            </>
          )}
        </Button>

        {/* Last report info */}
        {property.lastReport && (
          <p className="text-xs text-zinc-400 text-center mt-2">
            Last report: {new Date(property.lastReport).toLocaleDateString()}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

export function PropertyRestockCards({ properties }: PropertyRestockCardsProps) {
  if (properties.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Package className="h-12 w-12 text-zinc-300" />
          <h3 className="mt-4 text-lg font-semibold text-zinc-900">No properties yet</h3>
          <p className="mt-1 text-zinc-500">Add your first property to get started.</p>
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
