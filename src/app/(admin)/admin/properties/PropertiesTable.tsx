'use client';

import { useState } from "react";
import { Edit, Trash2, MapPin, Package, RefreshCw, Loader2, CheckCircle, AlertTriangle, X } from "lucide-react";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  Button,
  Badge
} from "@/components/ui";
import { IProperty } from "@/models/Property";
import { deleteProperty, autoRestockProperty, AutoRestockResult } from "@/lib/actions/properties";
import Link from "next/link";

interface PropertiesTableProps {
  properties: IProperty[];
}

function RestockResultModal({
  result,
  onClose
}: {
  result: AutoRestockResult;
  onClose: () => void;
}) {
  if (!result.items) return null;

  const partialItems = result.items.filter(i => i.fulfilled < i.requested && i.fulfilled > 0);
  const unfulfilledItems = result.items.filter(i => i.fulfilled === 0);
  const fulfilledItems = result.items.filter(i => i.fulfilled === i.requested);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="mx-4 w-full max-w-md rounded-lg bg-white p-6 shadow-xl dark:bg-zinc-900">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            Restock Complete: {result.propertyName}
          </h3>
          <button onClick={onClose} className="text-zinc-400 hover:text-zinc-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mb-4 flex items-center gap-3 rounded-lg bg-emerald-50 dark:bg-emerald-950 p-3">
          <CheckCircle className="h-5 w-5 text-emerald-600" />
          <div>
            <p className="font-medium text-emerald-800 dark:text-emerald-200">
              {result.totalFulfilled} of {result.totalRequested} items fulfilled
            </p>
          </div>
        </div>

        <div className="max-h-64 overflow-y-auto space-y-2">
          {fulfilledItems.map((item) => (
            <div key={item.sku} className="flex items-center justify-between rounded bg-zinc-50 dark:bg-zinc-800 p-2 text-sm">
              <span className="text-zinc-700 dark:text-zinc-300">{item.itemName}</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-medium">+{item.fulfilled}</span>
            </div>
          ))}
          {partialItems.map((item) => (
            <div key={item.sku} className="flex items-center justify-between rounded bg-amber-50 dark:bg-amber-950 p-2 text-sm">
              <span className="text-zinc-700 dark:text-zinc-300">{item.itemName}</span>
              <span className="text-amber-600 dark:text-amber-400 font-medium">
                +{item.fulfilled} (needed {item.requested})
              </span>
            </div>
          ))}
          {unfulfilledItems.map((item) => (
            <div key={item.sku} className="flex items-center justify-between rounded bg-rose-50 dark:bg-rose-950 p-2 text-sm">
              <span className="text-zinc-700 dark:text-zinc-300">{item.itemName}</span>
              <span className="text-rose-600 dark:text-rose-400 font-medium">
                Out of stock (needed {item.requested})
              </span>
            </div>
          ))}
        </div>

        <Button onClick={onClose} className="mt-4 w-full">
          Close
        </Button>
      </div>
    </div>
  );
}

export function PropertiesTable({ properties }: PropertiesTableProps) {
  const [loading, setLoading] = useState<string | null>(null);
  const [restocking, setRestocking] = useState<string | null>(null);
  const [restockResult, setRestockResult] = useState<AutoRestockResult | null>(null);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this property?")) return;

    setLoading(id);
    await deleteProperty(id);
    setLoading(null);
  };

  const handleRestock = async (id: string) => {
    setRestocking(id);
    const result = await autoRestockProperty(id);
    setRestocking(null);

    if (result.success) {
      setRestockResult(result);
    } else {
      alert(result.error || 'Failed to restock property');
    }
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Property</TableHead>
          <TableHead>Address</TableHead>
          <TableHead className="text-right">Inventory Items</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {properties.map((property) => {
          const id = (property as IProperty & { _id: string })._id;
          const isLoading = loading === id;
          const itemCount = property.inventorySettings?.length ?? 0;

          return (
            <TableRow key={id}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50">
                    <MapPin className="h-5 w-5 text-emerald-700" />
                  </div>
                  <p className="font-medium">{property.name}</p>
                </div>
              </TableCell>
              <TableCell>
                {property.address ? (
                  <span className="text-zinc-600">{property.address}</span>
                ) : (
                  <span className="text-zinc-400">No address</span>
                )}
              </TableCell>
              <TableCell className="text-right">
                <Badge variant={itemCount > 0 ? "success" : "default"}>
                  <Package className="mr-1 h-3 w-3" />
                  {itemCount} items
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRestock(id)}
                    disabled={restocking === id || itemCount === 0}
                    className="text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700"
                    title="Auto-restock this property"
                  >
                    {restocking === id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <RefreshCw className="h-4 w-4" />
                    )}
                  </Button>
                  <Link href={`/admin/properties/${id}/edit`}>
                    <Button variant="ghost" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(id)}
                    disabled={isLoading}
                    className="text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>

      {restockResult && (
        <RestockResultModal
          result={restockResult}
          onClose={() => setRestockResult(null)}
        />
      )}
    </Table>
  );
}
