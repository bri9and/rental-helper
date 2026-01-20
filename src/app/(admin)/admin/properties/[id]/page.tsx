export const dynamic = 'force-dynamic';

import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  MapPin,
  Edit,
  Clock,
  Package,
  ClipboardList,
  Bell,
  ShoppingCart,
  CheckCircle,
  AlertTriangle,
  Calendar,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, Badge } from "@/components/ui";
import dbConnect from "@/lib/db";
import Property from "@/models/Property";
import CleaningReport from "@/models/CleaningReport";
import SupplyRequest from "@/models/SupplyRequest";
import WarehouseItem from "@/models/WarehouseItem";
import { getAuthUserId } from "@/lib/auth";

interface PropertyDetailPageProps {
  params: Promise<{ id: string }>;
}

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

async function getPropertyDetails(id: string) {
  await dbConnect();

  const userId = await getAuthUserId();
  if (!userId) return null;

  try {
    const property = await Property.findOne({ _id: id, ownerId: userId }).lean();
    if (!property) return null;

    // Get warehouse items for enriching inventory data
    const warehouseItems = await WarehouseItem.find({ ownerId: userId }).lean();
    const itemMap = new Map(warehouseItems.map(i => [i.sku, i]));

    // Get recent cleaning reports for this property
    const reports = await CleaningReport.find({ propertyId: property._id })
      .sort({ date: -1 })
      .limit(5)
      .lean();

    // Get latest report for current counts
    const latestReport = reports[0];

    // Get supply requests for this property
    const supplyRequests = await SupplyRequest.find({
      propertyId: property._id,
      status: { $in: ['pending', 'ordered'] }
    }).sort({ createdAt: -1 }).lean();

    // Build inventory items with current counts
    const inventoryItems = (property.inventorySettings || []).map(setting => {
      const warehouseItem = itemMap.get(setting.itemSku);
      const reportItem = latestReport?.items?.find((i: { sku: string }) => i.sku === setting.itemSku);
      const currentCount = reportItem ? reportItem.observedCount : setting.parLevel;
      const needed = Math.max(0, setting.parLevel - currentCount);

      let status: 'good' | 'low' | 'critical' = 'good';
      if (currentCount < setting.parLevel * 0.3) status = 'critical';
      else if (currentCount < setting.parLevel * 0.6) status = 'low';

      return {
        sku: setting.itemSku,
        name: warehouseItem?.name || 'Unknown Item',
        currentCount,
        parLevel: setting.parLevel,
        needed,
        status,
        warehouseQty: warehouseItem?.quantity || 0,
        amazonAsin: warehouseItem?.amazonAsin,
        image: getItemImage(setting.itemSku),
      };
    });

    // Calculate stats
    const itemsLow = inventoryItems.filter(i => i.status !== 'good').length;
    const pendingRequests = supplyRequests.filter(r => r.status === 'pending').length;
    const orderedRequests = supplyRequests.filter(r => r.status === 'ordered').length;

    return {
      property: {
        _id: property._id.toString(),
        name: property.name,
        address: property.address,
        createdAt: property.createdAt,
      },
      inventoryItems,
      reports: reports.map(r => ({
        _id: r._id.toString(),
        date: r.date,
        cleanerName: r.cleanerName || 'Unknown',
        checklist: r.checklist,
        itemsReported: r.items?.length || 0,
      })),
      supplyRequests: supplyRequests.map(r => ({
        _id: r._id.toString(),
        itemName: r.itemName,
        sku: r.sku,
        currentCount: r.currentCount,
        status: r.status,
        orderQuantity: r.orderQuantity,
        createdAt: r.createdAt,
        amazonAsin: itemMap.get(r.sku)?.amazonAsin,
        parLevel: property.inventorySettings?.find(s => s.itemSku === r.sku)?.parLevel || 10,
      })),
      stats: {
        itemsLow,
        totalItems: inventoryItems.length,
        pendingRequests,
        orderedRequests,
        lastCleaned: latestReport?.date,
        totalReports: reports.length,
      },
    };
  } catch {
    return null;
  }
}

function formatDate(date: Date | string | undefined): string {
  if (!date) return 'Never';
  const d = new Date(date);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  return d.toLocaleDateString();
}

export default async function PropertyDetailPage({ params }: PropertyDetailPageProps) {
  const { id } = await params;
  const data = await getPropertyDetails(id);

  if (!data) {
    notFound();
  }

  const { property, inventoryItems, reports, supplyRequests, stats } = data;
  const hasIssues = stats.itemsLow > 0 || stats.pendingRequests > 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <Link
            href="/admin/properties"
            className="mt-1 p-2 rounded-lg hover:bg-zinc-100 text-zinc-500"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-zinc-900">{property.name}</h1>
              {hasIssues ? (
                <Badge variant="warning" className="flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  Needs Attention
                </Badge>
              ) : (
                <Badge variant="success" className="flex items-center gap-1">
                  <CheckCircle className="h-3 w-3" />
                  All Good
                </Badge>
              )}
            </div>
            {property.address && (
              <p className="text-zinc-500 flex items-center gap-1 mt-1">
                <MapPin className="h-4 w-4" />
                {property.address}
              </p>
            )}
          </div>
        </div>
        <Link
          href={`/admin/properties/${id}/edit`}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-sm font-medium"
        >
          <Edit className="h-4 w-4" />
          Edit
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className={stats.itemsLow > 0 ? "border-amber-200 bg-amber-50" : "border-emerald-200 bg-emerald-50"}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              {stats.itemsLow > 0 ? (
                <AlertTriangle className="h-8 w-8 text-amber-600" />
              ) : (
                <CheckCircle className="h-8 w-8 text-emerald-600" />
              )}
              <div>
                <p className="text-2xl font-bold text-zinc-900">{stats.itemsLow}</p>
                <p className="text-xs text-zinc-600">Items Low</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Calendar className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-lg font-bold text-zinc-900">{formatDate(stats.lastCleaned)}</p>
                <p className="text-xs text-zinc-600">Last Cleaned</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={stats.pendingRequests > 0 ? "border-blue-200 bg-blue-50" : ""}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Bell className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-2xl font-bold text-zinc-900">{stats.pendingRequests}</p>
                <p className="text-xs text-zinc-600">Pending Requests</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Package className="h-8 w-8 text-zinc-400" />
              <div>
                <p className="text-2xl font-bold text-zinc-900">{stats.totalItems}</p>
                <p className="text-xs text-zinc-600">Tracked Items</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Supply Requests */}
      {supplyRequests.length > 0 && (
        <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-blue-800">
              <Bell className="h-5 w-5" />
              Supply Requests
              <span className="ml-auto text-sm font-normal">
                <Link href="/admin/supply-requests" className="text-blue-600 hover:underline">
                  View all →
                </Link>
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2">
              {supplyRequests.map((req) => {
                const needed = Math.max(1, req.parLevel - req.currentCount);
                return (
                  <div key={req._id} className="flex items-center justify-between bg-white rounded-lg p-3 border border-blue-100">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-zinc-900">{req.itemName}</p>
                      <p className="text-sm text-zinc-500">
                        {req.status === 'pending' ? `Only ${req.currentCount} left` : `${req.orderQuantity} ordered`}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      {req.status === 'pending' && req.amazonAsin && (
                        <a
                          href={`https://www.amazon.com/dp/${req.amazonAsin}?qty=${needed}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 px-2 py-1 rounded bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-xs font-medium"
                        >
                          <ShoppingCart className="h-3 w-3" />
                          Buy {needed}
                        </a>
                      )}
                      <Badge variant={req.status === 'pending' ? 'warning' : 'default'}>
                        {req.status}
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Inventory Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Inventory Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          {inventoryItems.length === 0 ? (
            <p className="text-zinc-500 text-center py-8">No items configured for this property</p>
          ) : (
            <div className="space-y-2">
              {inventoryItems.map((item) => (
                <div key={item.sku} className="flex items-center gap-3 p-3 rounded-lg bg-zinc-50 hover:bg-zinc-100 transition-colors">
                  <div className="relative h-10 w-10 rounded-lg overflow-hidden bg-white border border-zinc-200 flex-shrink-0">
                    <Image src={item.image} alt={item.name} fill className="object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-zinc-900">{item.name}</p>
                    <p className="text-xs text-zinc-500">
                      {item.currentCount} / {item.parLevel} in unit
                      {item.warehouseQty > 0 && <span className="text-emerald-600 ml-2">({item.warehouseQty} in warehouse)</span>}
                    </p>
                  </div>
                  <Badge variant={item.status === 'good' ? 'success' : item.status === 'low' ? 'warning' : 'danger'}>
                    {item.status === 'good' ? 'Good' : item.status === 'low' ? 'Low' : 'Critical'}
                  </Badge>
                  {item.status !== 'good' && item.amazonAsin && (
                    <a
                      href={`https://www.amazon.com/dp/${item.amazonAsin}?qty=${item.needed}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 px-2 py-1 rounded bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-xs font-medium"
                    >
                      <ShoppingCart className="h-3 w-3" />
                      Buy {item.needed}
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Reports */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ClipboardList className="h-5 w-5" />
            Recent Cleaning Reports
            <span className="ml-auto text-sm font-normal">
              <Link href="/admin/reports" className="text-blue-600 hover:underline">
                View all →
              </Link>
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {reports.length === 0 ? (
            <p className="text-zinc-500 text-center py-8">No cleaning reports yet</p>
          ) : (
            <div className="space-y-2">
              {reports.map((report) => (
                <div key={report._id} className="flex items-center justify-between p-3 rounded-lg bg-zinc-50">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center">
                      <CheckCircle className="h-5 w-5 text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-zinc-900">{formatDate(report.date)}</p>
                      <p className="text-xs text-zinc-500">Cleaned by {report.cleanerName}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {report.checklist && (
                      <div className="flex gap-1">
                        {report.checklist.bathrooms && <Badge variant="success">Bath</Badge>}
                        {report.checklist.kitchen && <Badge variant="success">Kitchen</Badge>}
                        {report.checklist.bedrooms && <Badge variant="success">Beds</Badge>}
                        {report.checklist.livingSpace && <Badge variant="success">Living</Badge>}
                      </div>
                    )}
                    <span className="text-xs text-zinc-500">{report.itemsReported} items checked</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
