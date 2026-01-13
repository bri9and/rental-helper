export const dynamic = 'force-dynamic';

import { getInventoryItems } from "@/lib/actions/inventory";
import { PropertyForm } from "../PropertyForm";

export default async function NewPropertyPage() {
  const availableItems = await getInventoryItems();

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900">Add Property</h1>
        <p className="text-zinc-500">Add a new rental property</p>
      </div>

      <PropertyForm availableItems={availableItems} />
    </div>
  );
}
