'use client';

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { MapPin, AlertTriangle, CheckCircle, Package, ShoppingCart, ChevronDown, ChevronUp, X, Plus, Minus, ExternalLink } from "lucide-react";
import { Card, CardContent, Button } from "@/components/ui";
import { PropertyStatus } from "./page";
import { getAmazonCartUrl } from "@/lib/amazon";

interface PropertyRestockCardsProps {
  properties: PropertyStatus[];
}

type CartItem = {
  sku: string;
  name: string;
  image: string;
  quantity: number;
  amazonAsin: string;
  propertyName: string;
};

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

// Cart Preview Component
function CartPreview({
  items,
  onUpdateQuantity,
  onRemoveItem,
  onClose,
  onCheckout
}: {
  items: CartItem[];
  onUpdateQuantity: (sku: string, qty: number) => void;
  onRemoveItem: (sku: string) => void;
  onClose: () => void;
  onCheckout: () => void;
}) {
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg max-h-[80vh] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-zinc-200">
          <div className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5 text-emerald-600" />
            <h2 className="text-lg font-semibold text-zinc-900">Review Cart</h2>
            <span className="text-sm text-zinc-500">({totalItems} items)</span>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-zinc-100 rounded-full">
            <X className="h-5 w-5 text-zinc-500" />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {items.map((item) => (
            <div key={item.sku} className="flex items-center gap-3 p-3 bg-zinc-50 rounded-xl">
              <div className="relative h-12 w-12 rounded-lg overflow-hidden bg-white border border-zinc-200 flex-shrink-0">
                <Image src={item.image} alt={item.name} fill className="object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-zinc-900 truncate">{item.name}</p>
                <p className="text-xs text-zinc-500">{item.propertyName}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onUpdateQuantity(item.sku, Math.max(1, item.quantity - 1))}
                  className="h-8 w-8 flex items-center justify-center rounded-full bg-white border border-zinc-200 hover:bg-zinc-100"
                >
                  <Minus className="h-4 w-4 text-zinc-600" />
                </button>
                <span className="w-8 text-center font-medium text-zinc-900">{item.quantity}</span>
                <button
                  onClick={() => onUpdateQuantity(item.sku, item.quantity + 1)}
                  className="h-8 w-8 flex items-center justify-center rounded-full bg-white border border-zinc-200 hover:bg-zinc-100"
                >
                  <Plus className="h-4 w-4 text-zinc-600" />
                </button>
              </div>
              <button
                onClick={() => onRemoveItem(item.sku)}
                className="p-2 text-zinc-400 hover:text-rose-500"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-zinc-200 space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-zinc-500">Total items to order:</span>
            <span className="font-semibold text-zinc-900">{totalItems} items</span>
          </div>
          <button
            onClick={onCheckout}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-medium transition-colors"
          >
            <ShoppingCart className="h-5 w-5" />
            Add All to Amazon Cart
            <ExternalLink className="h-4 w-4" />
          </button>
          <p className="text-xs text-zinc-400 text-center">
            Opens Amazon.com in a new tab with all items added
          </p>
        </div>
      </div>
    </div>
  );
}

function PropertyCard({
  property,
  onAddToCart
}: {
  property: PropertyStatus;
  onAddToCart: (items: CartItem[]) => void;
}) {
  const [expanded, setExpanded] = useState(property.status !== 'good');
  const [selectedItems, setSelectedItems] = useState<Record<string, number>>({});

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

  // Items with Amazon links
  const itemsWithAsin = lowItems.filter(i => i.amazonAsin);

  const toggleItem = (sku: string, needed: number) => {
    setSelectedItems(prev => {
      if (prev[sku]) {
        const { [sku]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [sku]: needed };
    });
  };

  const selectAll = () => {
    const newSelected: Record<string, number> = {};
    itemsWithAsin.forEach(item => {
      newSelected[item.sku] = item.parLevel - item.currentCount;
    });
    setSelectedItems(newSelected);
  };

  const handleAddToCart = () => {
    const items: CartItem[] = Object.entries(selectedItems).map(([sku, qty]) => {
      const item = lowItems.find(i => i.sku === sku)!;
      return {
        sku,
        name: item.name,
        image: item.image,
        quantity: qty,
        amazonAsin: item.amazonAsin!,
        propertyName: property.name,
      };
    });
    onAddToCart(items);
    setSelectedItems({});
  };

  const selectedCount = Object.keys(selectedItems).length;

  return (
    <Card className={`${borderColor} ${bgColor} shadow-sm hover:shadow-md transition-shadow`}>
      <CardContent className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <Link href={`/admin/properties/${property._id}`} className="flex items-center gap-2 hover:opacity-80">
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
          </Link>
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
                {/* Select all / Clear */}
                {itemsWithAsin.length > 0 && (
                  <div className="flex items-center justify-between text-xs">
                    <button
                      onClick={selectAll}
                      className="text-emerald-600 hover:text-emerald-700 font-medium"
                    >
                      Select all ({itemsWithAsin.length})
                    </button>
                    {selectedCount > 0 && (
                      <button
                        onClick={() => setSelectedItems({})}
                        className="text-zinc-500 hover:text-zinc-700"
                      >
                        Clear selection
                      </button>
                    )}
                  </div>
                )}

                {lowItems.map((item) => {
                  const needed = item.parLevel - item.currentCount;
                  const isSelected = !!selectedItems[item.sku];
                  const hasAsin = !!item.amazonAsin;

                  return (
                    <div
                      key={item.sku}
                      className={`flex items-center gap-3 p-2 rounded-lg border transition-colors ${
                        isSelected
                          ? 'bg-emerald-50 border-emerald-200'
                          : 'bg-white border-zinc-200'
                      }`}
                    >
                      {hasAsin && (
                        <button
                          onClick={() => toggleItem(item.sku, needed)}
                          className={`h-5 w-5 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                            isSelected
                              ? 'bg-emerald-600 border-emerald-600'
                              : 'border-zinc-300 hover:border-emerald-400'
                          }`}
                        >
                          {isSelected && <CheckCircle className="h-3 w-3 text-white" />}
                        </button>
                      )}
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
                      {!hasAsin && (
                        <span className="text-xs text-zinc-400 px-2">No Amazon link</span>
                      )}
                    </div>
                  );
                })}

                {/* Add to Cart button */}
                {selectedCount > 0 && (
                  <button
                    onClick={handleAddToCart}
                    className="w-full flex items-center justify-center gap-2 py-2.5 mt-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-sm font-medium transition-colors"
                  >
                    <ShoppingCart className="h-4 w-4" />
                    Add {selectedCount} to Cart
                  </button>
                )}
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

export function PropertyRestockCards({ properties }: PropertyRestockCardsProps) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [showCart, setShowCart] = useState(false);

  const handleAddToCart = (items: CartItem[]) => {
    setCartItems(prev => {
      const newItems = [...prev];
      items.forEach(item => {
        const existing = newItems.find(i => i.sku === item.sku);
        if (existing) {
          existing.quantity += item.quantity;
        } else {
          newItems.push(item);
        }
      });
      return newItems;
    });
    setShowCart(true);
  };

  const updateQuantity = (sku: string, qty: number) => {
    setCartItems(prev => prev.map(item =>
      item.sku === sku ? { ...item, quantity: qty } : item
    ));
  };

  const removeItem = (sku: string) => {
    setCartItems(prev => prev.filter(item => item.sku !== sku));
  };

  const handleCheckout = () => {
    if (cartItems.length === 0) return;

    const amazonItems = cartItems.map(item => ({
      asin: item.amazonAsin,
      qty: item.quantity,
    }));

    window.open(getAmazonCartUrl(amazonItems), '_blank');
    setCartItems([]);
    setShowCart(false);
  };

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
    <>
      {/* Floating Cart Button */}
      {cartItems.length > 0 && !showCart && (
        <button
          onClick={() => setShowCart(true)}
          className="fixed bottom-6 right-6 flex items-center gap-2 px-4 py-3 rounded-full bg-emerald-700 hover:bg-emerald-800 text-white font-medium shadow-lg z-40"
        >
          <ShoppingCart className="h-5 w-5" />
          View Cart ({cartItems.reduce((sum, i) => sum + i.quantity, 0)})
        </button>
      )}

      {/* Cart Preview Modal */}
      {showCart && cartItems.length > 0 && (
        <CartPreview
          items={cartItems}
          onUpdateQuantity={updateQuantity}
          onRemoveItem={removeItem}
          onClose={() => setShowCart(false)}
          onCheckout={handleCheckout}
        />
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {properties.map((property) => (
          <PropertyCard
            key={property._id}
            property={property}
            onAddToCart={handleAddToCart}
          />
        ))}
      </div>
    </>
  );
}
