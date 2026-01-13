import { Plus, Home } from "lucide-react";
import { Card, CardContent, Button } from "@/components/ui";
import { getProperties } from "@/lib/actions/properties";
import { PropertiesTable } from "./PropertiesTable";
import Link from "next/link";

export default async function PropertiesPage() {
  const properties = await getProperties();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Properties</h1>
          <p className="text-zinc-500">Manage your rental properties</p>
        </div>
        <Link href="/admin/properties/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Property
          </Button>
        </Link>
      </div>

      {/* Properties Table */}
      {properties.length > 0 ? (
        <Card>
          <PropertiesTable properties={properties} />
        </Card>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Home className="h-12 w-12 text-zinc-300" />
            <h3 className="mt-4 text-lg font-semibold text-zinc-900">
              No properties yet
            </h3>
            <p className="mt-1 text-zinc-500">
              Get started by adding your first rental property.
            </p>
            <Link href="/admin/properties/new" className="mt-4">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Property
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
