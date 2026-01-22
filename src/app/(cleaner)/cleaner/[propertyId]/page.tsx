import { notFound } from "next/navigation";
import { headers } from "next/headers";
import { Types } from "mongoose";
import dbConnect from "@/lib/db";
import Property from "@/models/Property";
import WarehouseItem from "@/models/WarehouseItem";
import Cleaner from "@/models/Cleaner";
import { PropertyPageClient } from "./PropertyPageClient";

interface CleanerPageProps {
  params: Promise<{ propertyId: string }>;
}

async function getPropertyData(propertyId: string, cleanerId: string | null) {
  // Validate propertyId format
  if (!Types.ObjectId.isValid(propertyId)) {
    return null;
  }

  await dbConnect();

  const property = await Property.findById(propertyId).lean();
  if (!property) return null;

  // Server-side authorization: if we have a cleanerId, verify access
  // The actual check is done client-side via the PropertyPageClient
  // but we pass the managerId so the client can verify
  const propertyOwnerId = property.ownerId;

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
      ownerId: propertyOwnerId,
    },
    supplies: JSON.parse(JSON.stringify(supplies)),
  };
}

export default async function CleanerPage({ params }: CleanerPageProps) {
  const { propertyId } = await params;

  // Get cleanerId from headers if available (for server-side logging)
  const headersList = await headers();
  const cleanerId = headersList.get('x-cleaner-id');

  const data = await getPropertyData(propertyId, cleanerId);

  if (!data) {
    notFound();
  }

  return <PropertyPageClient data={data} />;
}
