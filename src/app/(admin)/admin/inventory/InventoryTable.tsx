'use client';

import { useState } from "react";
import { Edit, Trash2, Plus, Minus } from "lucide-react";
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
import { IWarehouseItem } from "@/models/WarehouseItem";
import { deleteInventoryItem, adjustInventoryQuantity } from "@/lib/actions/inventory";
import Link from "next/link";

interface InventoryTableProps {
  items: IWarehouseItem[];
}

export function InventoryTable({ items }: InventoryTableProps) {
  const [loading, setLoading] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this item?")) return;

    setLoading(id);
    await deleteInventoryItem(id);
    setLoading(null);
  };

  const handleAdjust = async (id: string, amount: number) => {
    setLoading(id);
    await adjustInventoryQuantity(id, amount);
    setLoading(null);
  };

  const getStockStatus = (item: IWarehouseItem) => {
    if (item.quantity <= item.lowStockThreshold) {
      return { variant: "danger" as const, label: "Low Stock" };
    }
    if (item.quantity <= item.parLevel * 0.5) {
      return { variant: "warning" as const, label: "Getting Low" };
    }
    return { variant: "success" as const, label: "In Stock" };
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Item</TableHead>
          <TableHead>SKU</TableHead>
          <TableHead className="text-right">Quantity</TableHead>
          <TableHead className="text-right">Par Level</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.map((item) => {
          const status = getStockStatus(item);
          const id = (item as IWarehouseItem & { _id: string })._id;
          const isLoading = loading === id;

          return (
            <TableRow key={id}>
              <TableCell>
                <div>
                  <p className="font-medium">{item.name}</p>
                  {item.costPerUnit && (
                    <p className="text-sm text-zinc-500">
                      ${item.costPerUnit.toFixed(2)} per unit
                    </p>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <code className="rounded bg-zinc-100 px-2 py-1 text-sm">
                  {item.sku}
                </code>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleAdjust(id, -1)}
                    disabled={isLoading || item.quantity === 0}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="min-w-[3rem] text-center font-mono text-lg font-semibold">
                    {item.quantity}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleAdjust(id, 1)}
                    disabled={isLoading}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
              <TableCell className="text-right font-mono">
                {item.parLevel}
              </TableCell>
              <TableCell>
                <Badge variant={status.variant}>{status.label}</Badge>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-2">
                  <Link href={`/admin/inventory/${id}/edit`}>
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
    </Table>
  );
}
