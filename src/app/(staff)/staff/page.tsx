import { MapPin, ChevronRight, ClipboardList } from "lucide-react";
import { Card, CardContent } from "@/components/ui";
import dbConnect from "@/lib/db";
import Property from "@/models/Property";
import { getAuthUserId } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

async function getProperties() {
  await dbConnect();

  const userId = await getAuthUserId();
  if (!userId) {
    redirect("/");
  }

  // For staff, we show all properties they have access to
  // In a real app, you'd filter by staff assignments
  const properties = await Property.find({ ownerId: userId })
    .select("name address inventorySettings")
    .sort({ name: 1 })
    .lean();

  return JSON.parse(JSON.stringify(properties));
}

export default async function StaffHomePage() {
  const properties = await getProperties();

  return (
    <div className="p-4">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl font-bold text-zinc-900">Select Property</h1>
        <p className="text-sm text-zinc-500">Choose a property to report inventory</p>
      </div>

      {/* Property List */}
      {properties.length > 0 ? (
        <div className="space-y-3">
          {properties.map((property: { _id: string; name: string; address?: string; inventorySettings?: { itemSku: string }[] }) => (
            <Link
              key={property._id}
              href={`/staff/report/${property._id}`}
            >
              <Card className="transition-shadow hover:shadow-md active:bg-zinc-50">
                <CardContent className="flex items-center gap-4 p-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-50">
                    <MapPin className="h-6 w-6 text-emerald-700" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-zinc-900">{property.name}</p>
                    {property.address && (
                      <p className="truncate text-sm text-zinc-500">{property.address}</p>
                    )}
                    <p className="text-xs text-zinc-400">
                      {property.inventorySettings?.length ?? 0} items to check
                    </p>
                  </div>
                  <ChevronRight className="h-5 w-5 shrink-0 text-zinc-400" />
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center py-12 text-center">
            <ClipboardList className="h-12 w-12 text-zinc-300" />
            <h3 className="mt-4 font-semibold text-zinc-900">No properties available</h3>
            <p className="mt-1 text-sm text-zinc-500">
              Contact your administrator to set up properties.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
