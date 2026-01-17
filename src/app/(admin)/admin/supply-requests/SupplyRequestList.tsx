"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Clock,
  Truck,
  CheckCircle,
  XCircle,
  Loader2,
  ChevronDown,
  ChevronUp,
  MapPin,
  ShoppingCart,
  ExternalLink,
  Home,
} from "lucide-react";
import { Card, CardContent, Button } from "@/components/ui";
import {
  markAsOrdered,
  markAsReceived,
  cancelRequest,
  SupplyRequestSummary,
} from "@/lib/actions/supply-requests";

function getAmazonUrl(asin: string, qty: number = 1): string {
  return `https://www.amazon.com/dp/${asin}?qty=${qty}`;
}

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

function PendingItemRow({ request, onUpdate }: {
  request: SupplyRequestSummary;
  onUpdate: () => void;
}) {
  const [quantity, setQuantity] = useState(10);
  const [loading, setLoading] = useState(false);

  const handleBuyAndMark = async () => {
    if (request.amazonAsin) {
      window.open(getAmazonUrl(request.amazonAsin, quantity), '_blank');
    }
    setLoading(true);
    await markAsOrdered(request._id, quantity);
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
        <p className="text-xs text-zinc-500">
          {request.requestedByName ? `Reported by ${request.requestedByName}` : 'Low stock reported'}
        </p>
      </div>

      {/* Quantity selector */}
      <div className="flex items-center gap-1">
        <button
          onClick={() => setQuantity(Math.max(1, quantity - 1))}
          className="h-7 w-7 rounded bg-zinc-100 text-zinc-600 hover:bg-zinc-200 text-sm font-bold"
        >
          -
        </button>
        <input
          type="number"
          min="1"
          value={quantity}
          onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
          className="h-7 w-12 rounded border border-zinc-200 text-center text-sm font-semibold"
        />
        <button
          onClick={() => setQuantity(quantity + 1)}
          className="h-7 w-7 rounded bg-zinc-100 text-zinc-600 hover:bg-zinc-200 text-sm font-bold"
        >
          +
        </button>
      </div>

      {/* Buy button */}
      <button
        onClick={handleBuyAndMark}
        disabled={loading}
        className="flex items-center gap-1 px-2 py-1 rounded bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-xs font-medium disabled:opacity-50"
      >
        {loading ? (
          <Loader2 className="h-3 w-3 animate-spin" />
        ) : (
          <>
            {request.amazonAsin ? <ShoppingCart className="h-3 w-3" /> : <Truck className="h-3 w-3" />}
            Buy
          </>
        )}
      </button>

      {/* Cancel */}
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

function PropertyRequestCard({ group, onUpdate }: {
  group: { propertyId: string; propertyName: string; propertyAddress?: string; requests: SupplyRequestSummary[] };
  onUpdate: () => void;
}) {
  const [expanded, setExpanded] = useState(true);

  return (
    <Card className="bg-white border-zinc-200 shadow-sm">
      <CardContent className="p-0">
        {/* Property Header */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full flex items-center gap-3 p-4 hover:bg-zinc-50 transition-colors"
        >
          <div className="h-10 w-10 rounded-xl bg-zinc-100 flex items-center justify-center flex-shrink-0">
            <Home className="h-5 w-5 text-zinc-600" />
          </div>
          <div className="flex-1 text-left min-w-0">
            <p className="font-semibold text-zinc-900">{group.propertyName}</p>
            {group.propertyAddress && (
              <p className="text-xs text-zinc-500 truncate">{group.propertyAddress}</p>
            )}
          </div>
          <span className="px-2 py-1 rounded-full bg-zinc-100 text-zinc-600 text-xs font-medium">
            {group.requests.length} item{group.requests.length > 1 ? 's' : ''}
          </span>
          {expanded ? (
            <ChevronUp className="h-5 w-5 text-zinc-400" />
          ) : (
            <ChevronDown className="h-5 w-5 text-zinc-400" />
          )}
        </button>

        {/* Items */}
        {expanded && (
          <div className="px-4 pb-4">
            <div className="bg-zinc-50 rounded-lg p-3">
              {group.requests.map((request) => (
                <PendingItemRow key={request._id} request={request} onUpdate={onUpdate} />
              ))}
            </div>
          </div>
        )}
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

  const handleUpdate = () => router.refresh();

  const pendingGroups = groupByProperty(pendingRequests);
  const orderedGroups = groupByProperty(orderedRequests);

  return (
    <div className="space-y-8">
      {/* Pending Requests - Grouped by Property */}
      {pendingGroups.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-4">
            <div className="h-8 w-8 rounded-full bg-zinc-100 flex items-center justify-center">
              <Clock className="h-4 w-4 text-zinc-600" />
            </div>
            <h2 className="text-lg font-semibold text-zinc-800">
              Needs Ordering
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
