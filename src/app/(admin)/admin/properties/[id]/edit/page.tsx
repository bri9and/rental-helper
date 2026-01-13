import { notFound } from "next/navigation";
import { getProperty } from "@/lib/actions/properties";
import { getInventoryItems } from "@/lib/actions/inventory";
import { PropertyForm } from "../../PropertyForm";

interface EditPropertyPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditPropertyPage({ params }: EditPropertyPageProps) {
  const { id } = await params;
  const [property, availableItems] = await Promise.all([
    getProperty(id),
    getInventoryItems(),
  ]);

  if (!property) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900">Edit Property</h1>
        <p className="text-zinc-500">Update property details and inventory requirements</p>
      </div>

      <PropertyForm
        property={property as typeof property & { _id: string }}
        availableItems={availableItems}
      />
    </div>
  );
}
