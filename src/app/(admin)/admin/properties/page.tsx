export const dynamic = 'force-dynamic';

import { Plus, Home, AlertTriangle, Truck, CheckCircle } from "lucide-react";
import { Button, Card, CardContent } from "@/components/ui";
import { getPropertiesWithItems } from "@/lib/actions/properties";
import { PropertyCards } from "./PropertyCards";
import Link from "next/link";

export default async function PropertiesPage() {
  const properties = await getPropertiesWithItems();

  // Calculate overall stats
  const totalItemsNeedOrder = properties.reduce((sum, p) => sum + p.itemsNeedOrder, 0);
  const totalItemsOnOrder = properties.reduce((sum, p) => sum + p.itemsOnOrder, 0);
  const totalItemsOk = properties.reduce((sum, p) => sum + p.itemsOk, 0);
  const propertiesNeedingAttention = properties.filter(p => p.itemsNeedOrder > 0).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-zinc-900">Properties</h1>
          <p className="text-sm text-zinc-500">Monitor inventory status at your properties</p>
        </div>
        <Link href="/admin/properties/new">
          <Button size="sm">
            <Plus className="mr-1 h-4 w-4" />
            Add
          </Button>
        </Link>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="bg-gradient-to-br from-zinc-50 to-slate-50 border-zinc-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-zinc-100 flex items-center justify-center">
                <Home className="h-5 w-5 text-zinc-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-zinc-700">{properties.length}</p>
                <p className="text-xs font-medium text-zinc-600">Properties</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={`bg-gradient-to-br ${totalItemsNeedOrder > 0 ? 'from-amber-50 to-orange-50 border-amber-200' : 'from-zinc-50 to-slate-50 border-zinc-200'}`}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className={`h-10 w-10 rounded-full flex items-center justify-center ${totalItemsNeedOrder > 0 ? 'bg-amber-100' : 'bg-zinc-100'}`}>
                <AlertTriangle className={`h-5 w-5 ${totalItemsNeedOrder > 0 ? 'text-amber-600' : 'text-zinc-400'}`} />
              </div>
              <div>
                <p className={`text-2xl font-bold ${totalItemsNeedOrder > 0 ? 'text-amber-700' : 'text-zinc-400'}`}>{totalItemsNeedOrder}</p>
                <p className={`text-xs font-medium ${totalItemsNeedOrder > 0 ? 'text-amber-600' : 'text-zinc-500'}`}>Need Order</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={`bg-gradient-to-br ${totalItemsOnOrder > 0 ? 'from-blue-50 to-indigo-50 border-blue-200' : 'from-zinc-50 to-slate-50 border-zinc-200'}`}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className={`h-10 w-10 rounded-full flex items-center justify-center ${totalItemsOnOrder > 0 ? 'bg-blue-100' : 'bg-zinc-100'}`}>
                <Truck className={`h-5 w-5 ${totalItemsOnOrder > 0 ? 'text-blue-600' : 'text-zinc-400'}`} />
              </div>
              <div>
                <p className={`text-2xl font-bold ${totalItemsOnOrder > 0 ? 'text-blue-700' : 'text-zinc-400'}`}>{totalItemsOnOrder}</p>
                <p className={`text-xs font-medium ${totalItemsOnOrder > 0 ? 'text-blue-600' : 'text-zinc-500'}`}>On Order</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-emerald-700">{totalItemsOk}</p>
                <p className="text-xs font-medium text-emerald-600">Items OK</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alert Banner for properties needing attention */}
      {propertiesNeedingAttention > 0 && (
        <div className="flex items-center gap-3 p-4 rounded-lg bg-amber-50 border border-amber-200">
          <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0" />
          <p className="text-sm text-amber-800">
            <span className="font-semibold">{propertiesNeedingAttention} {propertiesNeedingAttention === 1 ? 'property needs' : 'properties need'}</span> supplies ordered based on cleaner reports.
            <Link href="/admin/reports" className="ml-1 underline hover:no-underline font-medium">
              View requests
            </Link>
          </p>
        </div>
      )}

      {/* Property Cards */}
      <PropertyCards properties={properties} />
    </div>
  );
}
