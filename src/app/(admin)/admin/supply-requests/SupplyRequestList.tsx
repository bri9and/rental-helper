"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Package,
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
} from "lucide-react";
import { Card, CardContent, Button, Input } from "@/components/ui";
import {
  markAsOrdered,
  markAsReceived,
  cancelRequest,
  SupplyRequestSummary,
} from "@/lib/actions/supply-requests";

// Generate Amazon product URL from ASIN
function getAmazonUrl(asin: string): string {
  return `https://www.amazon.com/dp/${asin}`;
}

interface SupplyRequestListProps {
  pendingRequests: SupplyRequestSummary[];
  orderedRequests: SupplyRequestSummary[];
  completedRequests: SupplyRequestSummary[];
}

function formatDate(dateString: string) {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function getItemImage(sku: string): string {
  const imageMap: Record<string, string> = {
    'TP-001': '/items/toilet-paper.png',
    'SOAP-001': '/items/soap.png',
    'SHAMP-001': '/items/shampoo.png',
    'COND-001': '/items/conditioner.png',
    'TOWEL-001': '/items/towel.png',
    'HTOWEL-001': '/items/hand-towel.png',
    'DISH-001': '/items/dish-soap.png',
    'SPONGE-001': '/items/sponge.png',
    'TRASH-001': '/items/trash-bag.png',
    'PTOWEL-001': '/items/paper-towel.png',
    'COFFEE-001': '/items/coffee.png',
    'LAUNDRY-001': '/items/laundry.png',
    'CLEAN-001': '/items/cleaner.png',
    'GLASS-001': '/items/glass-cleaner.png',
    'SHEET-Q01': '/items/sheets.png',
    'FRESH-001': '/items/air-freshener.png',
  };
  return imageMap[sku] || '/items/default.png';
}

function PendingRequestCard({ request }: { request: SupplyRequestSummary }) {
  const router = useRouter();
  const [orderQuantity, setOrderQuantity] = useState<string>("10");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleOrder = async () => {
    const qty = parseInt(orderQuantity);
    if (!qty || qty <= 0) {
      setError("Enter a valid quantity");
      return;
    }

    setLoading(true);
    setError(null);

    const result = await markAsOrdered(request._id, qty);

    if (result.success) {
      router.refresh();
    } else {
      setError(result.error || "Failed to order");
    }

    setLoading(false);
  };

  const handleCancel = async () => {
    setLoading(true);
    await cancelRequest(request._id);
    router.refresh();
    setLoading(false);
  };

  const handleBuyOnAmazon = () => {
    if (request.amazonAsin) {
      window.open(getAmazonUrl(request.amazonAsin), '_blank');
    }
  };

  return (
    <Card className="bg-white border-amber-100 shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          {/* Item Image */}
          <div className="relative h-14 w-14 flex-shrink-0 rounded-xl bg-amber-50 border border-amber-100 overflow-hidden">
            <Image
              src={getItemImage(request.sku)}
              alt={request.itemName}
              fill
              className="object-cover p-1"
            />
          </div>

          {/* Item Details */}
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-zinc-800 truncate">
              {request.itemName}
            </p>
            <div className="flex items-center gap-1 mt-1">
              <MapPin className="h-3 w-3 text-zinc-400" />
              <p className="text-sm text-zinc-500 truncate">
                {request.propertyName}
              </p>
            </div>
            {request.propertyAddress && (
              <p className="text-xs text-zinc-400 truncate mt-0.5">
                {request.propertyAddress}
              </p>
            )}
            <p className="text-xs text-amber-600 font-medium mt-1">
              Only {request.currentCount} left at property
            </p>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-2">
            {/* Amazon Buy Button */}
            {request.amazonAsin && (
              <button
                onClick={handleBuyOnAmazon}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-gradient-to-r from-amber-400 to-orange-400 hover:from-amber-500 hover:to-orange-500 text-white text-sm font-medium shadow-sm transition-all"
              >
                <ShoppingCart className="h-4 w-4" />
                Buy on Amazon
                <ExternalLink className="h-3 w-3" />
              </button>
            )}

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setOrderQuantity(String(Math.max(1, parseInt(orderQuantity) - 5)))}
                  className="h-8 w-8 rounded-lg bg-slate-100 text-slate-600 hover:bg-amber-100 hover:text-amber-600 text-sm font-bold transition-colors"
                >
                  -
                </button>
                <input
                  type="number"
                  min="1"
                  value={orderQuantity}
                  onChange={(e) => setOrderQuantity(e.target.value)}
                  className="h-8 w-14 rounded-lg border border-slate-200 bg-white text-center text-sm font-semibold text-zinc-800"
                />
                <button
                  onClick={() => setOrderQuantity(String(parseInt(orderQuantity) + 5))}
                  className="h-8 w-8 rounded-lg bg-slate-100 text-slate-600 hover:bg-amber-100 hover:text-amber-600 text-sm font-bold transition-colors"
                >
                  +
                </button>
              </div>
              <Button
                onClick={handleOrder}
                disabled={loading}
                className="bg-amber-500 hover:bg-amber-600 text-white"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Truck className="h-4 w-4 mr-1" />
                    Mark Ordered
                  </>
                )}
              </Button>
              <button
                onClick={handleCancel}
                disabled={loading}
                className="p-2 text-zinc-400 hover:text-rose-500 transition-colors"
              >
                <XCircle className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
        {error && (
          <p className="mt-2 text-sm text-rose-600">{error}</p>
        )}
      </CardContent>
    </Card>
  );
}

function OrderedRequestCard({ request }: { request: SupplyRequestSummary }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleReceived = async () => {
    setLoading(true);
    await markAsReceived(request._id);
    router.refresh();
    setLoading(false);
  };

  const handleCancel = async () => {
    setLoading(true);
    await cancelRequest(request._id);
    router.refresh();
    setLoading(false);
  };

  return (
    <Card className="bg-white border-blue-100 shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          {/* Item Image */}
          <div className="relative h-14 w-14 flex-shrink-0 rounded-xl bg-blue-50 border border-blue-100 overflow-hidden">
            <Image
              src={getItemImage(request.sku)}
              alt={request.itemName}
              fill
              className="object-cover p-1"
            />
          </div>

          {/* Item Details */}
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-zinc-800 truncate">
              {request.itemName}
            </p>
            <div className="flex items-center gap-1 mt-1">
              <MapPin className="h-3 w-3 text-zinc-400" />
              <p className="text-sm text-zinc-500 truncate">
                {request.propertyName}
              </p>
            </div>
            <p className="text-xs text-blue-600 font-medium mt-1">
              {request.orderQuantity} units on order
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Button
              onClick={handleReceived}
              disabled={loading}
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
              className="p-2 text-zinc-400 hover:text-rose-500 transition-colors"
            >
              <XCircle className="h-5 w-5" />
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function CompletedRequestCard({ request }: { request: SupplyRequestSummary }) {
  const isCancelled = request.status === "cancelled";

  return (
    <Card className="bg-slate-50 border-slate-200">
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          {/* Item Image */}
          <div className="relative h-12 w-12 flex-shrink-0 rounded-xl bg-white border border-slate-200 overflow-hidden opacity-60">
            <Image
              src={getItemImage(request.sku)}
              alt={request.itemName}
              fill
              className="object-cover p-1"
            />
          </div>

          {/* Item Details */}
          <div className="flex-1 min-w-0">
            <p className="font-medium text-zinc-600 truncate">
              {request.itemName}
            </p>
            <p className="text-sm text-zinc-400 truncate">
              {request.propertyName}
            </p>
          </div>

          {/* Status Badge */}
          <span
            className={`px-3 py-1 rounded-full text-xs font-medium ${
              isCancelled
                ? "bg-zinc-200 text-zinc-600"
                : "bg-emerald-100 text-emerald-700"
            }`}
          >
            {isCancelled ? "Cancelled" : `+${request.orderQuantity} received`}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

export function SupplyRequestList({
  pendingRequests,
  orderedRequests,
  completedRequests,
}: SupplyRequestListProps) {
  const [showCompleted, setShowCompleted] = useState(false);

  return (
    <div className="space-y-8">
      {/* Pending Requests */}
      {pendingRequests.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-4">
            <div className="h-8 w-8 rounded-full bg-amber-100 flex items-center justify-center">
              <Clock className="h-4 w-4 text-amber-600" />
            </div>
            <h2 className="text-lg font-semibold text-zinc-800">
              Needs Ordering
            </h2>
            <span className="ml-auto text-sm text-amber-600 font-medium">
              {pendingRequests.length} pending
            </span>
          </div>
          <div className="space-y-3">
            {pendingRequests.map((request) => (
              <PendingRequestCard key={request._id} request={request} />
            ))}
          </div>
        </section>
      )}

      {/* Ordered Requests */}
      {orderedRequests.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-4">
            <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
              <Truck className="h-4 w-4 text-blue-600" />
            </div>
            <h2 className="text-lg font-semibold text-zinc-800">
              Awaiting Delivery
            </h2>
            <span className="ml-auto text-sm text-blue-600 font-medium">
              {orderedRequests.length} on order
            </span>
          </div>
          <div className="space-y-3">
            {orderedRequests.map((request) => (
              <OrderedRequestCard key={request._id} request={request} />
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
                <CompletedRequestCard key={request._id} request={request} />
              ))}
              {completedRequests.length > 10 && (
                <p className="text-sm text-zinc-400 text-center py-2">
                  +{completedRequests.length - 10} more completed requests
                </p>
              )}
            </div>
          )}
        </section>
      )}
    </div>
  );
}
