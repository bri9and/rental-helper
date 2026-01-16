export const dynamic = 'force-dynamic';

import { Plus } from "lucide-react";
import { Button } from "@/components/ui";
import { getPropertiesWithItems } from "@/lib/actions/properties";
import { PropertyCards } from "./PropertyCards";
import Link from "next/link";

export default async function PropertiesPage() {
  const properties = await getPropertiesWithItems();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-zinc-900 dark:text-zinc-100">Properties</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">Restock your rental properties</p>
        </div>
        <Link href="/admin/properties/new">
          <Button size="sm">
            <Plus className="mr-1 h-4 w-4" />
            Add
          </Button>
        </Link>
      </div>

      {/* Property Cards */}
      <PropertyCards properties={properties} />
    </div>
  );
}
