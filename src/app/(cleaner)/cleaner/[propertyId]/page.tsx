import { notFound } from "next/navigation";
import dbConnect from "@/lib/db";
import Property from "@/models/Property";
import WarehouseItem from "@/models/WarehouseItem";
import { CleanerForm } from "./CleanerForm";

interface CleanerPageProps {
  params: Promise<{ propertyId: string }>;
}

async function getPropertyData(propertyId: string) {
  await dbConnect();

  const property = await Property.findById(propertyId).lean();
  if (!property) return null;

  // Get supply items for this property
  const settings = property.inventorySettings || [];
  const skus = settings.map((s: { itemSku: string }) => s.itemSku);

  const warehouseItems = await WarehouseItem.find({
    ownerId: property.ownerId,
    sku: { $in: skus }
  }).lean();

  const itemMap = new Map(warehouseItems.map(i => [i.sku, i]));

  const supplies = settings.map((setting: { itemSku: string; parLevel: number }) => {
    const item = itemMap.get(setting.itemSku);
    return {
      sku: setting.itemSku,
      name: item?.name || 'Unknown Item',
      parLevel: setting.parLevel,
    };
  });

  return {
    property: {
      _id: property._id.toString(),
      name: property.name,
      address: property.address,
      ownerId: property.ownerId,
    },
    supplies: JSON.parse(JSON.stringify(supplies)),
  };
}

export default async function CleanerPage({ params }: CleanerPageProps) {
  const { propertyId } = await params;
  const data = await getPropertyData(propertyId);

  if (!data) {
    notFound();
  }

  return (
    <div className="p-4 max-w-lg mx-auto">
      {/* Property Header */}
      <div className="mb-6">
        <h1 className="text-xl font-bold text-zinc-900">{data.property.name}</h1>
        {data.property.address && (
          <p className="text-sm text-zinc-500 mt-1">{data.property.address}</p>
        )}
      </div>

      <CleanerForm
        propertyId={data.property._id}
        propertyName={data.property.name}
        ownerId={data.property.ownerId}
        supplies={data.supplies}
      />
    </div>
  );
}
