export const dynamic = 'force-dynamic';

import { MapPin, ChevronRight, Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui";
import dbConnect from "@/lib/db";
import Property from "@/models/Property";
import Link from "next/link";

async function getProperties() {
  await dbConnect();

  // For now, show all properties (in production, filter by cleaner access)
  const properties = await Property.find()
    .select("name address")
    .sort({ name: 1 })
    .lean();

  return JSON.parse(JSON.stringify(properties));
}

export default async function CleanerHomePage() {
  const properties = await getProperties();

  return (
    <div className="p-4 max-w-lg mx-auto">
      {/* Welcome Section */}
      <div className="text-center mb-8 pt-4">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-100 mb-4">
          <Sparkles className="h-8 w-8 text-emerald-600" />
        </div>
        <h1 className="text-2xl font-bold text-zinc-900">Ready to Clean?</h1>
        <p className="text-zinc-500 mt-2">Select a property to get started</p>
      </div>

      {/* Property List */}
      {properties.length > 0 ? (
        <div className="space-y-3">
          {properties.map((property: { _id: string; name: string; address?: string }) => (
            <Link
              key={property._id}
              href={`/cleaner/${property._id}`}
            >
              <Card className="transition-all hover:shadow-md active:scale-[0.98] border-emerald-100 hover:border-emerald-200">
                <CardContent className="flex items-center gap-4 p-4">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-sm">
                    <MapPin className="h-7 w-7 text-white" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-zinc-900 text-lg">{property.name}</p>
                    {property.address && (
                      <p className="truncate text-sm text-zinc-500 mt-0.5">{property.address}</p>
                    )}
                  </div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50">
                    <ChevronRight className="h-5 w-5 text-emerald-600" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <Card className="border-dashed border-2 border-zinc-200">
          <CardContent className="flex flex-col items-center py-12 text-center">
            <MapPin className="h-12 w-12 text-zinc-300" />
            <h3 className="mt-4 font-semibold text-zinc-900">No properties available</h3>
            <p className="mt-1 text-sm text-zinc-500">
              Contact your manager to get assigned to properties.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
