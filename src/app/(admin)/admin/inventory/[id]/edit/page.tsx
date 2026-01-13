import { notFound } from "next/navigation";
import { getAuthUserId } from "@/lib/auth";
import dbConnect from "@/lib/db";
import WarehouseItem from "@/models/WarehouseItem";
import { InventoryForm } from "../../InventoryForm";

interface EditInventoryPageProps {
  params: Promise<{ id: string }>;
}

async function getItem(id: string) {
  await dbConnect();

  const userId = await getAuthUserId();
  if (!userId) {
    return null;
  }

  try {
    const item = await WarehouseItem.findOne({ _id: id, ownerId: userId }).lean();
    return item ? JSON.parse(JSON.stringify(item)) : null;
  } catch {
    return null;
  }
}

export default async function EditInventoryPage({ params }: EditInventoryPageProps) {
  const { id } = await params;
  const item = await getItem(id);

  if (!item) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900">Edit Inventory Item</h1>
        <p className="text-zinc-500">Update item details</p>
      </div>

      <InventoryForm item={item} />
    </div>
  );
}
