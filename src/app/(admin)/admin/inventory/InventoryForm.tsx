'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent, CardFooter, Button, Input, Label } from "@/components/ui";
import { createInventoryItem, updateInventoryItem, InventoryFormData } from "@/lib/actions/inventory";
import { IWarehouseItem } from "@/models/WarehouseItem";

interface InventoryFormProps {
  item?: IWarehouseItem & { _id: string };
}

export function InventoryForm({ item }: InventoryFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEditing = !!item;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const data: InventoryFormData = {
      name: formData.get("name") as string,
      sku: formData.get("sku") as string,
      quantity: Number(formData.get("quantity")),
      parLevel: Number(formData.get("parLevel")),
      lowStockThreshold: Number(formData.get("lowStockThreshold")),
      costPerUnit: formData.get("costPerUnit")
        ? Number(formData.get("costPerUnit"))
        : undefined,
    };

    const result = isEditing
      ? await updateInventoryItem(item._id, data)
      : await createInventoryItem(data);

    setLoading(false);

    if (result.success) {
      router.push("/admin/inventory");
    } else {
      setError(result.error || "An error occurred");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>{isEditing ? "Edit Item" : "New Inventory Item"}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {error && (
            <div className="rounded-lg bg-rose-50 p-4 text-sm text-rose-600">
              {error}
            </div>
          )}

          <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Item Name *</Label>
              <Input
                id="name"
                name="name"
                placeholder="e.g., Toilet Paper"
                defaultValue={item?.name}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="sku">SKU *</Label>
              <Input
                id="sku"
                name="sku"
                placeholder="e.g., TP-3PLY"
                defaultValue={item?.sku}
                required
              />
              <p className="text-xs text-zinc-500">
                Unique identifier for this item
              </p>
            </div>
          </div>

          <div className="grid gap-6 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="quantity">Current Quantity *</Label>
              <Input
                id="quantity"
                name="quantity"
                type="number"
                min="0"
                placeholder="0"
                defaultValue={item?.quantity ?? 0}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="parLevel">Par Level *</Label>
              <Input
                id="parLevel"
                name="parLevel"
                type="number"
                min="0"
                placeholder="10"
                defaultValue={item?.parLevel ?? 10}
                required
              />
              <p className="text-xs text-zinc-500">Ideal stock level</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="lowStockThreshold">Low Stock Alert *</Label>
              <Input
                id="lowStockThreshold"
                name="lowStockThreshold"
                type="number"
                min="0"
                placeholder="5"
                defaultValue={item?.lowStockThreshold ?? 5}
                required
              />
              <p className="text-xs text-zinc-500">Alert when below this</p>
            </div>
          </div>

          <div className="max-w-xs space-y-2">
            <Label htmlFor="costPerUnit">Cost Per Unit ($)</Label>
            <Input
              id="costPerUnit"
              name="costPerUnit"
              type="number"
              min="0"
              step="0.01"
              placeholder="0.00"
              defaultValue={item?.costPerUnit}
            />
            <p className="text-xs text-zinc-500">Optional, for value tracking</p>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button
            type="button"
            variant="secondary"
            onClick={() => router.push("/admin/inventory")}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? "Saving..." : isEditing ? "Save Changes" : "Create Item"}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}
