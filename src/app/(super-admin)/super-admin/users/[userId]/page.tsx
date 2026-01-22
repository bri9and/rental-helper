export const dynamic = 'force-dynamic';

import { ArrowLeft, Home, Package, FileText, Bell } from "lucide-react";
import { ResetUserButton } from "./ResetUserButton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import dbConnect from "@/lib/db";
import Property from "@/models/Property";
import WarehouseItem from "@/models/WarehouseItem";
import CleaningReport from "@/models/CleaningReport";
import SupplyRequest from "@/models/SupplyRequest";
import Link from "next/link";

interface UserDetailPageProps {
  params: Promise<{ userId: string }>;
}

async function getUserData(userId: string) {
  await dbConnect();

  const properties = await Property.find({ ownerId: userId })
    .select("name address createdAt")
    .sort({ createdAt: -1 })
    .lean();

  const warehouseItems = await WarehouseItem.find({ ownerId: userId })
    .select("name sku quantity")
    .sort({ name: 1 })
    .lean();

  const propertyIds = properties.map(p => p._id);

  const reports = await CleaningReport.find({ propertyId: { $in: propertyIds } })
    .sort({ date: -1 })
    .limit(10)
    .lean();

  const supplyRequests = await SupplyRequest.find({ ownerId: userId })
    .sort({ createdAt: -1 })
    .limit(10)
    .lean();

  return {
    userId,
    properties: JSON.parse(JSON.stringify(properties)),
    warehouseItems: JSON.parse(JSON.stringify(warehouseItems)),
    reports: JSON.parse(JSON.stringify(reports)),
    supplyRequests: JSON.parse(JSON.stringify(supplyRequests)),
    stats: {
      propertyCount: properties.length,
      warehouseItemCount: warehouseItems.length,
      reportCount: reports.length,
      supplyRequestCount: supplyRequests.length,
    }
  };
}

export default async function UserDetailPage({ params }: UserDetailPageProps) {
  const { userId } = await params;
  const data = await getUserData(userId);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/super-admin"
          className="flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white">User Details</h1>
          <code className="text-sm text-zinc-500">{userId}</code>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-zinc-800 border-zinc-700">
          <CardContent className="p-4 flex items-center gap-3">
            <Home className="h-8 w-8 text-emerald-400" />
            <div>
              <p className="text-2xl font-bold text-white">{data.stats.propertyCount}</p>
              <p className="text-xs text-zinc-500">Properties</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-zinc-800 border-zinc-700">
          <CardContent className="p-4 flex items-center gap-3">
            <Package className="h-8 w-8 text-purple-400" />
            <div>
              <p className="text-2xl font-bold text-white">{data.stats.warehouseItemCount}</p>
              <p className="text-xs text-zinc-500">Inventory Items</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-zinc-800 border-zinc-700">
          <CardContent className="p-4 flex items-center gap-3">
            <FileText className="h-8 w-8 text-amber-400" />
            <div>
              <p className="text-2xl font-bold text-white">{data.stats.reportCount}</p>
              <p className="text-xs text-zinc-500">Reports</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-zinc-800 border-zinc-700">
          <CardContent className="p-4 flex items-center gap-3">
            <Bell className="h-8 w-8 text-blue-400" />
            <div>
              <p className="text-2xl font-bold text-white">{data.stats.supplyRequestCount}</p>
              <p className="text-xs text-zinc-500">Supply Requests</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Properties */}
      <Card className="bg-zinc-800 border-zinc-700">
        <CardHeader>
          <CardTitle className="text-white">Properties</CardTitle>
        </CardHeader>
        <CardContent>
          {data.properties.length === 0 ? (
            <p className="text-zinc-500">No properties</p>
          ) : (
            <div className="space-y-2">
              {data.properties.map((property: { _id: string; name: string; address?: string; createdAt: string }) => (
                <div key={property._id} className="flex items-center justify-between p-3 rounded-lg bg-zinc-700/50">
                  <div>
                    <p className="font-medium text-white">{property.name}</p>
                    {property.address && (
                      <p className="text-sm text-zinc-400">{property.address}</p>
                    )}
                  </div>
                  <p className="text-xs text-zinc-500">
                    {new Date(property.createdAt).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Warehouse Items */}
      <Card className="bg-zinc-800 border-zinc-700">
        <CardHeader>
          <CardTitle className="text-white">Warehouse Inventory</CardTitle>
        </CardHeader>
        <CardContent>
          {data.warehouseItems.length === 0 ? (
            <p className="text-zinc-500">No inventory items</p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
              {data.warehouseItems.slice(0, 12).map((item: { _id: string; name: string; sku: string; quantity: number }) => (
                <div key={item._id} className="p-3 rounded-lg bg-zinc-700/50">
                  <p className="text-sm font-medium text-white truncate">{item.name}</p>
                  <p className="text-xs text-zinc-500">{item.sku} • Qty: {item.quantity}</p>
                </div>
              ))}
              {data.warehouseItems.length > 12 && (
                <div className="p-3 rounded-lg bg-zinc-700/30 flex items-center justify-center">
                  <p className="text-sm text-zinc-400">+{data.warehouseItems.length - 12} more</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Reports */}
      <Card className="bg-zinc-800 border-zinc-700">
        <CardHeader>
          <CardTitle className="text-white">Recent Reports</CardTitle>
        </CardHeader>
        <CardContent>
          {data.reports.length === 0 ? (
            <p className="text-zinc-500">No reports</p>
          ) : (
            <div className="space-y-2">
              {data.reports.map((report: { _id: string; date: string; cleanerName?: string; notes?: string }) => (
                <div key={report._id} className="flex items-center justify-between p-3 rounded-lg bg-zinc-700/50">
                  <div>
                    <p className="text-sm font-medium text-white">
                      {report.cleanerName || 'Unknown cleaner'}
                    </p>
                    {report.notes && (
                      <p className="text-xs text-zinc-400 truncate max-w-md">{report.notes}</p>
                    )}
                  </div>
                  <p className="text-xs text-zinc-500">
                    {new Date(report.date).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="bg-zinc-800 border-rose-900/50">
        <CardHeader>
          <CardTitle className="text-rose-400">Danger Zone</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 rounded-lg bg-rose-950/30 border border-rose-900/50">
            <div>
              <p className="font-medium text-white">Reset User Data</p>
              <p className="text-sm text-zinc-400">Delete all properties, inventory, and reports for this user</p>
            </div>
            <ResetUserButton userId={userId} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
