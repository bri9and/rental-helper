import { Package, Home, AlertTriangle, ClipboardCheck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import { AISuggestions } from "@/components/admin/AISuggestions";
import dbConnect from "@/lib/db";
import WarehouseItem from "@/models/WarehouseItem";
import Property from "@/models/Property";
import CleaningReport from "@/models/CleaningReport";
import { getAuthUserId } from "@/lib/auth";
import { redirect } from "next/navigation";

async function getDashboardStats() {
  await dbConnect();

  const userId = await getAuthUserId();
  if (!userId) {
    redirect("/");
  }

  const [totalItems, lowStockItems, properties, todayReports] = await Promise.all([
    WarehouseItem.countDocuments({ ownerId: userId }),
    WarehouseItem.countDocuments({
      ownerId: userId,
      $expr: { $lte: ["$quantity", "$lowStockThreshold"] },
    }),
    Property.countDocuments({ ownerId: userId }),
    CleaningReport.countDocuments({
      cleanerId: userId,
      date: {
        $gte: new Date(new Date().setHours(0, 0, 0, 0)),
        $lt: new Date(new Date().setHours(23, 59, 59, 999)),
      },
    }),
  ]);

  const lowStockItemsList = await WarehouseItem.find({
    ownerId: userId,
    $expr: { $lte: ["$quantity", "$lowStockThreshold"] },
  })
    .select("name sku quantity lowStockThreshold")
    .limit(5)
    .lean();

  return {
    totalItems,
    lowStockItems,
    properties,
    todayReports,
    lowStockItemsList,
  };
}

export default async function DashboardPage() {
  const stats = await getDashboardStats();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-zinc-900">Dashboard</h1>
        <p className="text-zinc-500">Overview of your inventory and properties</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-zinc-500">
              Total Items
            </CardTitle>
            <Package className="h-5 w-5 text-zinc-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-zinc-900">{stats.totalItems}</div>
            <p className="text-xs text-zinc-500">in warehouse</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-zinc-500">
              Low Stock
            </CardTitle>
            <AlertTriangle className="h-5 w-5 text-rose-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-rose-600">{stats.lowStockItems}</div>
            <p className="text-xs text-zinc-500">items need restocking</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-zinc-500">
              Properties
            </CardTitle>
            <Home className="h-5 w-5 text-zinc-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-zinc-900">{stats.properties}</div>
            <p className="text-xs text-zinc-500">active locations</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-zinc-500">
              Today&apos;s Reports
            </CardTitle>
            <ClipboardCheck className="h-5 w-5 text-zinc-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-zinc-900">{stats.todayReports}</div>
            <p className="text-xs text-zinc-500">cleanings completed</p>
          </CardContent>
        </Card>
      </div>

      {/* Low Stock Alert Section */}
      {stats.lowStockItems > 0 && (
        <Card className="border-rose-200 bg-rose-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-rose-700">
              <AlertTriangle className="h-5 w-5" />
              Low Stock Alert
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.lowStockItemsList.map((item) => (
                <div
                  key={item.sku}
                  className="flex items-center justify-between rounded-lg bg-white p-3"
                >
                  <div>
                    <p className="font-medium text-zinc-900">{item.name}</p>
                    <p className="text-sm text-zinc-500">SKU: {item.sku}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-rose-600">{item.quantity}</p>
                    <p className="text-xs text-zinc-500">
                      of {item.lowStockThreshold} min
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* AI Suggestions */}
      {stats.totalItems > 0 && <AISuggestions />}

      {/* Empty State */}
      {stats.totalItems === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Package className="h-12 w-12 text-zinc-300" />
            <h3 className="mt-4 text-lg font-semibold text-zinc-900">
              No inventory yet
            </h3>
            <p className="mt-1 text-zinc-500">
              Get started by adding items to your warehouse inventory.
            </p>
            <a
              href="/admin/inventory"
              className="mt-4 inline-flex h-10 items-center rounded-lg bg-emerald-700 px-4 text-sm font-medium text-white hover:bg-emerald-800"
            >
              Add Inventory
            </a>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
