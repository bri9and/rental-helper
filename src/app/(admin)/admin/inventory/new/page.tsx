import { InventoryForm } from "../InventoryForm";

export default function NewInventoryPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900">Add Inventory Item</h1>
        <p className="text-zinc-500">Add a new item to your warehouse inventory</p>
      </div>

      <InventoryForm />
    </div>
  );
}
