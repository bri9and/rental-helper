'use client';

import { useState } from "react";
import Image from "next/image";
import { MapPin, AlertTriangle, CheckCircle, Package, ShoppingCart, ExternalLink, ChevronDown, ChevronUp } from "lucide-react";
import { Card, CardContent, Button } from "@/components/ui";
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
  const [expanded, setExpanded] = useState(false);

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
          <div className="space-y-3">
            <button
              onClick={() => setExpanded(!expanded)}
              className="w-full flex items-center justify-between text-xs font-medium text-zinc-500 uppercase tracking-wide hover:text-zinc-700"
            >
              <span>{lowItems.length} Items Need Restocking</span>
              {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>

            {expanded && (
              <div className="space-y-2">
                {lowItems.map((item) => (
                  <LowItemRow key={item.sku} item={item} propertyAddress={property.address} />
                ))}
              </div>
            )}

            {!expanded && (
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
            )}
          </div>
        ) : (
          <div className="flex items-center gap-2 p-2 bg-emerald-50 rounded-lg">
            <CheckCircle className="h-4 w-4 text-emerald-600" />
            <span className="text-sm text-emerald-700">All items at or above par level</span>
          </div>
        )}

        {/* Last report info */}
        {property.lastReport && (
          <p className="text-xs text-zinc-400 text-center mt-3">
            Last report: {new Date(property.lastReport).toLocaleDateString()}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

// Individual low item row with Amazon link
function LowItemRow({ item, propertyAddress }: {
  item: PropertyStatus['items'][0];
  propertyAddress?: string;
}) {
  const needed = item.parLevel - item.currentCount;
  const amazonUrl = item.amazonAsin
    ? `https://www.amazon.com/dp/${item.amazonAsin}?qty=${needed}`
    : null;

  return (
    <div className="flex items-center gap-3 p-2 bg-white border border-zinc-200 rounded-lg">
      <div className="relative h-10 w-10 rounded-lg overflow-hidden bg-zinc-100 flex-shrink-0">
        <Image src={item.image} alt={item.name} fill className="object-cover" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-zinc-900 truncate">{item.name}</p>
        <p className="text-xs text-zinc-500">
          Have {item.currentCount} / Need {item.parLevel}
          <span className="text-amber-600 font-medium ml-1">(+{needed})</span>
        </p>
      </div>
      {amazonUrl ? (
        <a
          href={amazonUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-gradient-to-r from-amber-400 to-orange-400 hover:from-amber-500 hover:to-orange-500 text-white text-xs font-medium shadow-sm transition-all flex-shrink-0"
        >
          <ShoppingCart className="h-3.5 w-3.5" />
          Buy
          <ExternalLink className="h-3 w-3" />
        </a>
      ) : (
        <span className="text-xs text-zinc-400 px-2">No link</span>
      )}
    </div>
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
