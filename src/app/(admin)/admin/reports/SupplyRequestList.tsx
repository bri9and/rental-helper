"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Clock,
  Truck,
  CheckCircle,
  XCircle,
  Loader2,
  ChevronDown,
  ChevronUp,
  ShoppingCart,
  Home,
  RefreshCw,
} from "lucide-react";
import { Card, CardContent, Button } from "@/components/ui";
import {
  markAsOrdered,
  markAsReceived,
  cancelRequest,
  SupplyRequestSummary,
} from "@/lib/actions/supply-requests";
import { getAmazonCartUrl } from "@/lib/amazon";

// Polling interval in milliseconds (10 seconds for near real-time updates)
const POLL_INTERVAL = 10000;

interface SupplyRequestListProps {
  pendingRequests: SupplyRequestSummary[];
  orderedRequests: SupplyRequestSummary[];
  completedRequests: SupplyRequestSummary[];
}

// Group requests by property
function groupByProperty(requests: SupplyRequestSummary[]) {
  const groups: Record<string, {
    propertyId: string;
    propertyName: string;
    propertyAddress?: string;
    requests: SupplyRequestSummary[];
  }> = {};

  requests.forEach((req) => {
    if (!groups[req.propertyId]) {
      groups[req.propertyId] = {
        propertyId: req.propertyId,
        propertyName: req.propertyName,
        propertyAddress: req.propertyAddress,
        requests: [],
      };
    }
    groups[req.propertyId].requests.push(req);
  });

  return Object.values(groups).sort((a, b) => a.propertyName.localeCompare(b.propertyName));
}

function PendingItemRow({ request, quantity, onQuantityChange, onRemove }: {
  request: SupplyRequestSummary;
  quantity: number;
  onQuantityChange: (qty: number) => void;
  onRemove: () => void;
}) {
  return (
    <div className="flex items-center gap-2 py-2 border-b border-zinc-100 last:border-0">
      <div className="flex-1">
        <p className="text-sm text-zinc-900">{request.itemName}</p>
      </div>
      <input
        type="number"
        min="1"
        value={quantity}
        onChange={(e) => onQuantityChange(Math.max(1, parseInt(e.target.value) || 1))}
        className="h-8 w-16 rounded border border-zinc-200 text-center text-sm"
      />
      <button
        onClick={onRemove}
        className="p-1 text-zinc-400 hover:text-rose-500"
      >
        <XCircle className="h-4 w-4" />
      </button>
    </div>
  );
}

function PropertyRequestCard({ group, onUpdate }: {
  group: { propertyId: string; propertyName: string; propertyAddress?: string; requests: SupplyRequestSummary[] };
  onUpdate: () => void;
}) {
  const [quantities, setQuantities] = useState<Record<string, number>>(() =>
    Object.fromEntries(group.requests.map(r => [r._id, r.needed]))
  );
  const [loading, setLoading] = useState(false);

  const handleQuantityChange = (id: string, qty: number) => {
    setQuantities(prev => ({ ...prev, [id]: qty }));
  };

  const handleRemove = async (id: string) => {
    await cancelRequest(id);
    onUpdate();
  };

  const handleAddAllToCart = async () => {
    const itemsWithAsin = group.requests.filter(r => r.amazonAsin);
    if (itemsWithAsin.length > 0) {
      const cartItems = itemsWithAsin.map(r => ({
        asin: r.amazonAsin!,
        qty: quantities[r._id] || r.needed
      }));
      window.open(getAmazonCartUrl(cartItems), '_blank');
    }

    // Mark all as ordered
    setLoading(true);
    await Promise.all(
      group.requests.map(r => markAsOrdered(r._id, quantities[r._id] || r.needed))
    );
    onUpdate();
    setLoading(false);
  };

  const itemsWithAsin = group.requests.filter(r => r.amazonAsin);

  return (
    <Card className="bg-white border-zinc-200 shadow-sm">
      <CardContent className="p-4">
        {/* Property Header */}
        <div className="flex items-center gap-3 mb-3">
          <div className="h-10 w-10 rounded-xl bg-zinc-100 flex items-center justify-center flex-shrink-0">
            <Home className="h-5 w-5 text-zinc-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-zinc-900">{group.propertyName}</p>
            {group.propertyAddress && (
              <p className="text-xs text-zinc-500 truncate">{group.propertyAddress}</p>
            )}
          </div>
        </div>

        {/* Items list */}
        <div className="border border-zinc-200 rounded-lg p-3 mb-3">
          <div className="flex items-center justify-between text-xs text-zinc-500 mb-2 pb-2 border-b border-zinc-100">
            <span>Item</span>
            <span>Qty</span>
          </div>
          {group.requests.map((request) => (
            <PendingItemRow
              key={request._id}
              request={request}
              quantity={quantities[request._id] || request.needed}
              onQuantityChange={(qty) => handleQuantityChange(request._id, qty)}
              onRemove={() => handleRemove(request._id)}
            />
          ))}
        </div>

        {/* Add to Cart button */}
        <button
          onClick={handleAddAllToCart}
          disabled={loading || itemsWithAsin.length === 0}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              <ShoppingCart className="h-4 w-4" />
              Add {itemsWithAsin.length} items to Amazon Cart
            </>
          )}
        </button>
      </CardContent>
    </Card>
  );
}

function OrderedItemRow({ request, onUpdate }: {
  request: SupplyRequestSummary;
  onUpdate: () => void;
}) {
  const [loading, setLoading] = useState(false);

  const handleReceived = async () => {
    setLoading(true);
    await markAsReceived(request._id);
    onUpdate();
    setLoading(false);
  };

  const handleCancel = async () => {
    setLoading(true);
    await cancelRequest(request._id);
    onUpdate();
    setLoading(false);
  };

  return (
    <div className="flex items-center gap-3 py-3 border-b border-zinc-100 last:border-0">
      <div className="flex-1 min-w-0">
        <p className="font-medium text-zinc-900 truncate">{request.itemName}</p>
        <p className="text-xs text-blue-600 font-medium">{request.orderQuantity} units ordered</p>
      </div>

      <Button
        onClick={handleReceived}
        disabled={loading}
        size="sm"
        className="bg-blue-500 hover:bg-blue-600 text-white"
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <>
            <CheckCircle className="h-4 w-4 mr-1" />
            Received
          </>
        )}
      </Button>

      <button
        onClick={handleCancel}
        disabled={loading}
        className="p-1.5 text-zinc-400 hover:text-rose-500"
      >
        <XCircle className="h-5 w-5" />
      </button>
    </div>
  );
}

function OrderedPropertyCard({ group, onUpdate }: {
  group: { propertyId: string; propertyName: string; propertyAddress?: string; requests: SupplyRequestSummary[] };
  onUpdate: () => void;
}) {
  const [expanded, setExpanded] = useState(true);

  return (
    <Card className="bg-white border-blue-100 shadow-sm">
      <CardContent className="p-0">
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full flex items-center gap-3 p-4 hover:bg-blue-50/50 transition-colors"
        >
          <div className="h-10 w-10 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
            <Truck className="h-5 w-5 text-blue-600" />
          </div>
          <div className="flex-1 text-left min-w-0">
            <p className="font-semibold text-zinc-900">{group.propertyName}</p>
            {group.propertyAddress && (
              <p className="text-xs text-zinc-500 truncate">{group.propertyAddress}</p>
            )}
          </div>
          <span className="px-2 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-medium">
            {group.requests.length} on order
          </span>
          {expanded ? (
            <ChevronUp className="h-5 w-5 text-zinc-400" />
          ) : (
            <ChevronDown className="h-5 w-5 text-zinc-400" />
          )}
        </button>

        {expanded && (
          <div className="px-4 pb-4">
            <div className="bg-zinc-50 rounded-lg p-3">
              {group.requests.map((request) => (
                <OrderedItemRow key={request._id} request={request} onUpdate={onUpdate} />
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function SupplyRequestList({
  pendingRequests,
  orderedRequests,
  completedRequests,
}: SupplyRequestListProps) {
  const router = useRouter();
  const [showCompleted, setShowCompleted] = useState(false);
  const [isPolling, setIsPolling] = useState(true);
  const [hasNewData, setHasNewData] = useState(false);
  const lastKnownCountRef = useRef(pendingRequests.length);

  const handleUpdate = useCallback(() => {
    setHasNewData(false);
    router.refresh();
  }, [router]);

  // Auto-refresh periodically to get new data
  // This uses Next.js router.refresh() which re-fetches server components
  // The server-side data fetching is already authenticated via Clerk
  useEffect(() => {
    if (!isPolling) return;

    const refreshData = () => {
      router.refresh();
    };

    const intervalId = setInterval(refreshData, POLL_INTERVAL);

    return () => clearInterval(intervalId);
  }, [isPolling, router]);

  // Track when new data comes in (count changed)
  useEffect(() => {
    const currentCount = pendingRequests.length;
    if (currentCount > lastKnownCountRef.current) {
      setHasNewData(true);
      // Auto-clear after 5 seconds
      const timeout = setTimeout(() => setHasNewData(false), 5000);
      return () => clearTimeout(timeout);
    }
    lastKnownCountRef.current = currentCount;
  }, [pendingRequests.length]);

  const pendingGroups = groupByProperty(pendingRequests);
  const orderedGroups = groupByProperty(orderedRequests);

  return (
    <div className="space-y-8">
      {/* Live Update Indicator */}
      <div className="flex items-center justify-between text-xs text-zinc-500 bg-zinc-50 rounded-lg px-3 py-2">
        <div className="flex items-center gap-2">
          <div className={`h-2 w-2 rounded-full ${isPolling ? 'bg-emerald-500 animate-pulse' : 'bg-zinc-300'}`} />
          <span>{isPolling ? 'Live updates enabled' : 'Updates paused'}</span>
          {hasNewData && (
            <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full font-medium">
              New data available
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsPolling(!isPolling)}
            className="text-zinc-500 hover:text-zinc-700"
          >
            {isPolling ? 'Pause' : 'Resume'}
          </button>
          <button
            onClick={handleUpdate}
            className="flex items-center gap-1 text-zinc-500 hover:text-zinc-700"
          >
            <RefreshCw className="h-3 w-3" />
            Refresh
          </button>
        </div>
      </div>

      {/* Pending Requests - Grouped by Property */}
      {pendingGroups.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-4">
            <div className="h-8 w-8 rounded-full bg-zinc-100 flex items-center justify-center">
              <Clock className="h-4 w-4 text-zinc-600" />
            </div>
            <h2 className="text-lg font-semibold text-zinc-800">
              Need to Order
            </h2>
            <span className="ml-auto text-sm text-zinc-500 font-medium">
              {pendingRequests.length} items across {pendingGroups.length} properties
            </span>
          </div>
          <div className="space-y-4">
            {pendingGroups.map((group) => (
              <PropertyRequestCard key={group.propertyId} group={group} onUpdate={handleUpdate} />
            ))}
          </div>
        </section>
      )}

      {/* Ordered Requests - Grouped by Property */}
      {orderedGroups.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-4">
            <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
              <Truck className="h-4 w-4 text-blue-600" />
            </div>
            <h2 className="text-lg font-semibold text-zinc-800">
              Awaiting Delivery
            </h2>
            <span className="ml-auto text-sm text-blue-600 font-medium">
              {orderedRequests.length} items across {orderedGroups.length} properties
            </span>
          </div>
          <div className="space-y-4">
            {orderedGroups.map((group) => (
              <OrderedPropertyCard key={group.propertyId} group={group} onUpdate={handleUpdate} />
            ))}
          </div>
        </section>
      )}

      {/* Completed Requests */}
      {completedRequests.length > 0 && (
        <section>
          <button
            onClick={() => setShowCompleted(!showCompleted)}
            className="flex items-center gap-2 mb-4 w-full hover:opacity-80 transition-opacity"
          >
            <div className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center">
              <CheckCircle className="h-4 w-4 text-emerald-600" />
            </div>
            <h2 className="text-lg font-semibold text-zinc-800">
              Recently Completed
            </h2>
            <span className="ml-auto text-sm text-emerald-600 font-medium flex items-center gap-1">
              {completedRequests.length} done
              {showCompleted ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </span>
          </button>
          {showCompleted && (
            <div className="space-y-2">
              {completedRequests.slice(0, 10).map((request) => (
                <div key={request._id} className="flex items-center gap-3 p-3 bg-zinc-50 rounded-lg">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-zinc-600">{request.itemName}</p>
                    <p className="text-xs text-zinc-400">{request.propertyName}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    request.status === 'cancelled'
                      ? "bg-zinc-200 text-zinc-600"
                      : "bg-emerald-100 text-emerald-700"
                  }`}>
                    {request.status === 'cancelled' ? "Cancelled" : `+${request.orderQuantity} received`}
                  </span>
                </div>
              ))}
              {completedRequests.length > 10 && (
                <p className="text-sm text-zinc-400 text-center py-2">
                  +{completedRequests.length - 10} more
                </p>
              )}
            </div>
          )}
        </section>
      )}
    </div>
  );
}
