export const dynamic = 'force-dynamic';

import { Home, AlertTriangle, Bell, RefreshCw, CheckCircle, Clock, ShoppingCart, Wrench } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import { SeedDemoButton } from "@/components/admin/SeedDemoButton";
import { PropertyRestockCards } from "./PropertyRestockCards";
import dbConnect from "@/lib/db";
import WarehouseItem from "@/models/WarehouseItem";
import Property from "@/models/Property";
import CleaningReport from "@/models/CleaningReport";
import SupplyRequest from "@/models/SupplyRequest";
import { getAuthUserId } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getAmazonUrl } from "@/lib/amazon";
import { MAINTENANCE_CATEGORIES } from "@/lib/maintenance-categories";

export type PropertyStatus = {
  _id: string;
  name: string;
  address?: string;
  status: 'good' | 'low' | 'critical';
  lastReport?: Date;
  itemsNeedingRestock: number;
  totalItems: number;
  items: {
    sku: string;
    name: string;
    currentCount: number;
    parLevel: number;
    warehouseQty: number;
    image: string;
    amazonAsin?: string;
  }[];
};

// Map SKUs to images
function getItemImage(sku: string): string {
  const imageMap: Record<string, string> = {
    'TP-001': '/items/toilet-paper.png',
    'SOAP-001': '/items/soap.png',
    'SHAMP-001': '/items/shampoo.png',
    'COND-001': '/items/conditioner.png',
    'TOWEL-001': '/items/towel.png',
    'HTOWEL-001': '/items/hand-towel.png',
    'DISH-001': '/items/dish-soap.png',
    'SPONGE-001': '/items/sponge.png',
    'TRASH-001': '/items/trash-bag.png',
    'PTOWEL-001': '/items/paper-towel.png',
    'COFFEE-001': '/items/coffee.png',
    'LAUNDRY-001': '/items/laundry.png',
    'CLEAN-001': '/items/cleaner.png',
    'GLASS-001': '/items/glass-cleaner.png',
    'SHEET-Q01': '/items/sheets.png',
    'FRESH-001': '/items/air-freshener.png',
  };
  return imageMap[sku] || '/items/default.png';
}

async function getManagerDashboard() {
  await dbConnect();

  const userId = await getAuthUserId();
  if (!userId) {
    redirect("/");
  }

  // Get all properties
  const properties = await Property.find({ ownerId: userId }).lean();

  // Get all warehouse items
  const warehouseItems = await WarehouseItem.find({ ownerId: userId }).lean();
  const itemMap = new Map(warehouseItems.map(i => [i.sku, i]));

  // Get latest report for each property
  const propertyIds = properties.map(p => p._id);
  const latestReports = await CleaningReport.aggregate([
    { $match: { propertyId: { $in: propertyIds } } },
    { $sort: { date: -1 } },
    { $group: { _id: "$propertyId", latestReport: { $first: "$$ROOT" } } }
  ]);
  const reportMap = new Map(latestReports.map(r => [r._id.toString(), r.latestReport]));

  // Get pending supply requests
  const pendingRequests = await SupplyRequest.find({
    ownerId: userId,
    status: 'pending'
  }).sort({ createdAt: -1 }).limit(5).lean();

  // Get recent maintenance issues (reports with maintenance issues, last 7 days)
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const reportsWithMaintenance = await CleaningReport.find({
    propertyId: { $in: propertyIds },
    'maintenanceIssues.0': { $exists: true }, // Has at least one maintenance issue
    createdAt: { $gte: sevenDaysAgo }
  }).sort({ createdAt: -1 }).limit(10).lean();

  // Build property status list
  const propertyStatuses: PropertyStatus[] = properties.map(p => {
    const settings = p.inventorySettings || [];
    const latestReport = reportMap.get(p._id.toString());

    // Build items with current counts from last report
    const items = settings.map(setting => {
      const warehouseItem = itemMap.get(setting.itemSku);
      const reportItem = latestReport?.items?.find((i: { sku: string }) => i.sku === setting.itemSku);

      // Current count = observed count from last report, or assume full (par level) if no report
      const currentCount = reportItem ? reportItem.observedCount : setting.parLevel;

      return {
        sku: setting.itemSku,
        name: warehouseItem?.name || 'Unknown Item',
        currentCount,
        parLevel: setting.parLevel,
        warehouseQty: warehouseItem?.quantity || 0,
        image: getItemImage(setting.itemSku),
        amazonAsin: warehouseItem?.amazonAsin,
      };
    });

    // Count items needing restock (below 50% of par level)
    const itemsNeedingRestock = items.filter(i => i.currentCount < i.parLevel * 0.5).length;

    // Determine status
    let status: 'good' | 'low' | 'critical' = 'good';
    if (itemsNeedingRestock > 0) {
      status = itemsNeedingRestock >= items.length * 0.5 ? 'critical' : 'low';
    }

    return {
      _id: p._id.toString(),
      name: p.name,
      address: p.address,
      status,
      lastReport: latestReport?.date,
      itemsNeedingRestock,
      totalItems: items.length,
      items,
    };
  });

  // Sort by status (critical first, then low, then good)
  propertyStatuses.sort((a, b) => {
    const order = { critical: 0, low: 1, good: 2 };
    return order[a.status] - order[b.status];
  });

  // Flatten maintenance issues into a list of alerts
  const maintenanceAlerts = reportsWithMaintenance.flatMap(report => {
    const property = properties.find(p => p._id.toString() === report.propertyId.toString());
    return (report.maintenanceIssues || []).map(issue => ({
      _id: `${report._id}-${issue.id}`,
      propertyId: report.propertyId.toString(),
      propertyName: property?.name || 'Unknown Property',
      propertyAddress: property?.address,
      cleanerName: report.cleanerName || 'Unknown',
      issue: issue,
      reportedAt: report.createdAt,
    }));
  });

  return {
    properties: propertyStatuses,
    pendingRequests: pendingRequests.map(r => {
      const property = properties.find(p => p._id.toString() === r.propertyId?.toString());
      const setting = property?.inventorySettings?.find((s: { itemSku: string }) => s.itemSku === r.sku);
      const parLevel = setting?.parLevel || 10;
      const needed = Math.max(1, parLevel - r.currentCount);
      return {
        _id: r._id.toString(),
        propertyName: r.propertyName,
        propertyAddress: property?.address,
        sku: r.sku,
        itemName: r.itemName,
        currentCount: r.currentCount,
        parLevel,
        needed,
        amazonAsin: itemMap.get(r.sku)?.amazonAsin,
        createdAt: r.createdAt,
      };
    }),
    maintenanceAlerts,
    stats: {
      totalProperties: properties.length,
      propertiesNeedingAttention: propertyStatuses.filter(p => p.status !== 'good').length,
      pendingRequestsCount: pendingRequests.length,
      maintenanceAlertsCount: maintenanceAlerts.length,
    }
  };
}

export default async function DashboardPage() {
  const data = await getManagerDashboard();

  // Empty state
  if (data.stats.totalProperties === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Welcome to Rental Helper</h1>
          <p className="text-zinc-500">Get started by loading demo data or adding your properties</p>
        </div>

        <Card className="border-2 border-dashed border-zinc-200">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Home className="h-16 w-16 text-zinc-300 mb-4" />
            <h3 className="text-xl font-semibold text-zinc-900 mb-2">No properties yet</h3>
            <p className="text-zinc-500 text-center max-w-md mb-6">
              Add your rental properties to start tracking inventory and restocking supplies.
            </p>
            <div className="flex gap-3">
              <SeedDemoButton />
              <Link
                href="/admin/properties/new"
                className="inline-flex h-10 items-center rounded-lg border border-zinc-200 bg-white px-4 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
              >
                Add Property Manually
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Property Dashboard</h1>
          <p className="text-zinc-500">Manage restocking for your {data.stats.totalProperties} properties</p>
        </div>
      </div>

      {/* Quick Stats - Clickable */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Link href="/admin/properties">
          <Card className={`cursor-pointer hover:shadow-md transition-shadow ${data.stats.propertiesNeedingAttention > 0 ? "border-amber-200 bg-amber-50 hover:border-amber-300" : "border-emerald-200 bg-emerald-50 hover:border-emerald-300"}`}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                {data.stats.propertiesNeedingAttention > 0 ? (
                  <AlertTriangle className="h-8 w-8 text-amber-600" />
                ) : (
                  <CheckCircle className="h-8 w-8 text-emerald-600" />
                )}
                <div>
                  <p className="text-2xl font-bold text-zinc-900">{data.stats.propertiesNeedingAttention}</p>
                  <p className="text-xs text-zinc-600">Need Attention</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/properties">
          <Card className="cursor-pointer hover:shadow-md hover:border-zinc-300 transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Home className="h-8 w-8 text-zinc-400" />
                <div>
                  <p className="text-2xl font-bold text-zinc-900">{data.stats.totalProperties}</p>
                  <p className="text-xs text-zinc-600">Properties</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/supply-requests">
          <Card className={`cursor-pointer hover:shadow-md transition-shadow ${data.stats.pendingRequestsCount > 0 ? "border-blue-200 bg-blue-50 hover:border-blue-300" : "hover:border-zinc-300"}`}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Bell className="h-8 w-8 text-blue-500" />
                <div>
                  <p className="text-2xl font-bold text-zinc-900">{data.stats.pendingRequestsCount}</p>
                  <p className="text-xs text-zinc-600">Supply Requests</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/reports">
          <Card className={`cursor-pointer hover:shadow-md transition-shadow ${data.stats.maintenanceAlertsCount > 0 ? "border-red-200 bg-red-50 hover:border-red-300" : "hover:border-zinc-300"}`}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Wrench className={`h-8 w-8 ${data.stats.maintenanceAlertsCount > 0 ? 'text-red-500' : 'text-zinc-400'}`} />
                <div>
                  <p className="text-2xl font-bold text-zinc-900">{data.stats.maintenanceAlertsCount}</p>
                  <p className="text-xs text-zinc-600">Maintenance</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Maintenance Alerts - Show first if any exist */}
      {data.maintenanceAlerts.length > 0 && (
        <Card className="border-red-200 bg-gradient-to-r from-red-50 to-orange-50">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-red-800">
              <Wrench className="h-5 w-5" />
              Maintenance Issues
              <span className="ml-auto text-sm font-normal">
                <Link href="/admin/reports" className="text-red-600 hover:underline">
                  View all →
                </Link>
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2">
              {data.maintenanceAlerts.slice(0, 5).map((alert) => {
                // Get category label for display
                const categoryInfo = Object.entries(MAINTENANCE_CATEGORIES).find(
                  ([key]) => key === alert.issue.category
                );
                const categoryLabel = categoryInfo?.[1].label || alert.issue.category;

                return (
                  <div key={alert._id} className="flex items-center justify-between bg-white rounded-lg p-3 border border-red-100">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-zinc-900">{alert.issue.item}</p>
                        <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs font-medium rounded-full">
                          {categoryLabel}
                        </span>
                      </div>
                      <p className="text-sm text-zinc-500">{alert.propertyName}</p>
                      {alert.issue.description && (
                        <p className="text-xs text-zinc-400 mt-1 truncate">&quot;{alert.issue.description}&quot;</p>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-1 text-xs text-zinc-500">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {new Date(alert.reportedAt).toLocaleDateString()}
                      </div>
                      <span className="text-zinc-400">by {alert.cleanerName}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Pending Supply Requests */}
      {data.pendingRequests.length > 0 && (
        <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-blue-800">
              <Bell className="h-5 w-5" />
              Cleaner Requests
              <span className="ml-auto text-sm font-normal">
                <Link href="/admin/supply-requests" className="text-blue-600 hover:underline">
                  View all →
                </Link>
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2">
              {data.pendingRequests.map((req) => (
                <div key={req._id} className="flex items-center justify-between bg-white rounded-lg p-3 border border-blue-100">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-zinc-900">{req.itemName}</p>
                    <p className="text-sm text-zinc-500">{req.propertyName} • Only {req.currentCount} left</p>
                    {req.propertyAddress && (
                      <p className="text-xs text-zinc-400 truncate">{req.propertyAddress}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    {req.amazonAsin && (
                      <a
                        href={getAmazonUrl(req.amazonAsin, req.needed)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 px-2 py-1 rounded bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-xs font-medium"
                      >
                        <ShoppingCart className="h-3 w-3" />
                        Buy {req.needed}
                      </a>
                    )}
                    <div className="flex items-center gap-2 text-sm text-zinc-500">
                      <Clock className="h-4 w-4" />
                      {new Date(req.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Property Cards - Main Focus */}
      <div>
        <h2 className="text-lg font-semibold text-zinc-900 mb-4 flex items-center gap-2">
          <RefreshCw className="h-5 w-5" />
          Properties
        </h2>
        <PropertyRestockCards properties={data.properties} />
      </div>
    </div>
  );
}
