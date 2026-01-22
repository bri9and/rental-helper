'use client';

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  MapPin,
  CheckCircle,
  AlertTriangle,
  Truck,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Clock,
  User,
  Settings,
  ShoppingCart,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui";
import { PropertyWithItems, PropertyItemDetail } from "@/lib/actions/properties";
import { getAmazonUrl } from "@/lib/amazon";

interface PropertyCardsProps {
  properties: PropertyWithItems[];
}

function StatusBadge({ status }: { status: PropertyItemDetail['status'] }) {
  switch (status) {
    case 'ok':
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">
          <CheckCircle className="h-3 w-3" />
          OK
        </span>
      );
    case 'needs_order':
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
          <AlertTriangle className="h-3 w-3" />
          Needs Order
        </span>
      );
    case 'on_order':
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
          <Truck className="h-3 w-3" />
          On Order
        </span>
      );
  }
}

function ItemRow({ item }: { item: PropertyItemDetail }) {
  const timeAgo = item.supplyRequest?.createdAt
    ? formatTimeAgo(new Date(item.supplyRequest.createdAt))
    : null;

  // Calculate how many to buy (par level - current count, or use par level if no request info)
  const currentCount = item.supplyRequest?.currentCount ?? 0;
  const neededQty = Math.max(1, item.parLevel - currentCount);

  return (
    <div className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
      item.status === 'needs_order'
        ? 'bg-amber-50 border border-amber-200'
        : item.status === 'on_order'
        ? 'bg-blue-50 border border-blue-200'
        : 'bg-slate-50 hover:bg-slate-100'
    }`}>
      {/* Item Image */}
      <div className="relative h-10 w-10 flex-shrink-0 rounded-lg bg-white border border-slate-200 overflow-hidden shadow-sm">
        <Image
          src={item.image}
          alt={item.name}
          fill
          className="object-cover"
        />
      </div>

      {/* Item Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-zinc-800 truncate">
          {item.name}
        </p>
        {item.supplyRequest ? (
          <div className="flex items-center gap-2 text-xs text-zinc-500">
            {item.supplyRequest.requestedByName && (
              <span className="flex items-center gap-1">
                <User className="h-3 w-3" />
                {item.supplyRequest.requestedByName}
              </span>
            )}
            {timeAgo && (
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {timeAgo}
              </span>
            )}
          </div>
        ) : (
          <p className="text-xs text-emerald-600 font-medium">
            {item.warehouseQty} in stock
          </p>
        )}
      </div>

      {/* Buy Button for items needing order */}
      {item.status === 'needs_order' && item.amazonAsin && (
        <a
          href={getAmazonUrl(item.amazonAsin, neededQty)}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 px-2 py-1 rounded bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium transition-colors"
          onClick={(e) => e.stopPropagation()}
        >
          <ShoppingCart className="h-3 w-3" />
          Buy {neededQty}
        </a>
      )}

      {/* Status Badge */}
      <StatusBadge status={item.status} />
    </div>
  );
}

function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function PropertyCard({ property }: { property: PropertyWithItems }) {
  const [showOkItems, setShowOkItems] = useState(false);

  const needsAttentionItems = property.items.filter(i => i.status !== 'ok');
  const okItems = property.items.filter(i => i.status === 'ok');

  return (
    <Card className={`bg-white shadow-sm ${
      property.itemsNeedOrder > 0
        ? 'border-amber-200'
        : property.itemsOnOrder > 0
        ? 'border-blue-200'
        : 'border-emerald-100'
    }`}>
      <CardContent className="p-0">
        {/* Property Header */}
        <Link
          href={`/admin/properties/${property._id}`}
          className="flex items-center justify-between p-4 border-b border-zinc-100 hover:bg-zinc-50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
              property.itemsNeedOrder > 0
                ? 'bg-amber-100'
                : property.itemsOnOrder > 0
                ? 'bg-blue-100'
                : 'bg-emerald-100'
            }`}>
              <MapPin className={`h-5 w-5 ${
                property.itemsNeedOrder > 0
                  ? 'text-amber-600'
                  : property.itemsOnOrder > 0
                  ? 'text-blue-600'
                  : 'text-emerald-600'
              }`} />
            </div>
            <div>
              <h3 className="font-semibold text-zinc-800">{property.name}</h3>
              {property.address && (
                <p className="text-xs text-zinc-500 truncate max-w-[200px]">{property.address}</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Status summary badges */}
            <div className="flex items-center gap-1">
              {property.itemsNeedOrder > 0 && (
                <span className="flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
                  <AlertTriangle className="h-3 w-3" />
                  {property.itemsNeedOrder}
                </span>
              )}
              {property.itemsOnOrder > 0 && (
                <span className="flex items-center gap-1 rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
                  <Truck className="h-3 w-3" />
                  {property.itemsOnOrder}
                </span>
              )}
              {property.itemsOk > 0 && (
                <span className="flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">
                  <CheckCircle className="h-3 w-3" />
                  {property.itemsOk}
                </span>
              )}
            </div>
            <ChevronRight className="h-4 w-4 text-zinc-400" />
          </div>
        </Link>

        {/* Items Needing Attention */}
        {needsAttentionItems.length > 0 && (
          <div className="p-4 border-b border-zinc-100">
            <h4 className="text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-3">
              Needs Attention
            </h4>
            <div className="space-y-2">
              {needsAttentionItems.map((item) => (
                <ItemRow key={item.sku} item={item} />
              ))}
            </div>
          </div>
        )}

        {/* OK Items (Collapsible) */}
        {okItems.length > 0 && (
          <div className="p-4">
            <button
              onClick={() => setShowOkItems(!showOkItems)}
              className="flex items-center justify-between w-full text-left"
            >
              <h4 className="text-xs font-semibold text-zinc-500 uppercase tracking-wide flex items-center gap-2">
                <CheckCircle className="h-3 w-3 text-emerald-500" />
                {okItems.length} Items OK
              </h4>
              {showOkItems ? (
                <ChevronUp className="h-4 w-4 text-zinc-400" />
              ) : (
                <ChevronDown className="h-4 w-4 text-zinc-400" />
              )}
            </button>
            {showOkItems && (
              <div className="space-y-2 mt-3">
                {okItems.map((item) => (
                  <ItemRow key={item.sku} item={item} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Empty state */}
        {property.items.length === 0 && (
          <div className="p-6 text-center">
            <Settings className="h-8 w-8 text-zinc-300 mx-auto mb-2" />
            <p className="text-sm text-zinc-500">No items configured</p>
            <Link
              href={`/admin/properties/${property._id}`}
              className="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
            >
              Configure items
            </Link>
          </div>
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
          <MapPin className="h-12 w-12 text-zinc-300" />
          <h3 className="mt-4 text-lg font-semibold text-zinc-900">
            No properties yet
          </h3>
          <p className="mt-1 text-zinc-500">
            Add your first property to get started.
          </p>
        </CardContent>
      </Card>
    );
  }

  // Sort properties: those with issues first
  const sortedProperties = [...properties].sort((a, b) => {
    const aHasIssues = a.itemsNeedOrder > 0 || a.itemsOnOrder > 0;
    const bHasIssues = b.itemsNeedOrder > 0 || b.itemsOnOrder > 0;
    if (aHasIssues && !bHasIssues) return -1;
    if (!aHasIssues && bHasIssues) return 1;
    // Secondary sort by needs_order count
    return b.itemsNeedOrder - a.itemsNeedOrder;
  });

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {sortedProperties.map((property) => (
        <PropertyCard key={property._id} property={property} />
      ))}
    </div>
  );
}
