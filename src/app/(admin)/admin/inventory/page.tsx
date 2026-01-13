export const dynamic = 'force-dynamic';

import { Plus, Package } from "lucide-react";
import { Card, CardContent, Button } from "@/components/ui";
import { getInventoryItems } from "@/lib/actions/inventory";
import { InventoryTable } from "./InventoryTable";
import Link from "next/link";

export default async function InventoryPage() {
  const items = await getInventoryItems();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Inventory</h1>
          <p className="text-zinc-500">Manage your warehouse inventory</p>
        </div>
        <Link href="/admin/inventory/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Item
          </Button>
        </Link>
      </div>

      {/* Inventory Table */}
      {items.length > 0 ? (
        <Card>
          <InventoryTable items={items} />
        </Card>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Package className="h-12 w-12 text-zinc-300" />
            <h3 className="mt-4 text-lg font-semibold text-zinc-900">
              No inventory items
            </h3>
            <p className="mt-1 text-zinc-500">
              Get started by adding your first inventory item.
            </p>
            <Link href="/admin/inventory/new" className="mt-4">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Item
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
