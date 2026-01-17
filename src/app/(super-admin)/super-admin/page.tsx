export const dynamic = 'force-dynamic';

import { Users, Home, Package, FileText, TrendingUp, Activity } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import dbConnect from "@/lib/db";
import Property from "@/models/Property";
import WarehouseItem from "@/models/WarehouseItem";
import CleaningReport from "@/models/CleaningReport";
import SupplyRequest from "@/models/SupplyRequest";
import Link from "next/link";

interface UserSummary {
  oderId: string;
  propertyCount: number;
  warehouseItemCount: number;
  reportCount: number;
}

async function getPlatformStats() {
  await dbConnect();

  // Get all unique owner IDs and their counts
  const propertyAgg = await Property.aggregate([
    { $group: { _id: "$ownerId", count: { $sum: 1 } } }
  ]);

  const warehouseAgg = await WarehouseItem.aggregate([
    { $group: { _id: "$ownerId", count: { $sum: 1 } } }
  ]);

  const supplyRequestAgg = await SupplyRequest.aggregate([
    { $group: { _id: "$ownerId", count: { $sum: 1 } } }
  ]);

  // Get all unique user IDs
  const allUserIds = new Set<string>();
  propertyAgg.forEach(p => allUserIds.add(p._id));
  warehouseAgg.forEach(w => allUserIds.add(w._id));

  // Build user summaries
  const propertyMap = new Map(propertyAgg.map(p => [p._id, p.count]));
  const warehouseMap = new Map(warehouseAgg.map(w => [w._id, w.count]));
  const supplyMap = new Map(supplyRequestAgg.map(s => [s._id, s.count]));

  const users = Array.from(allUserIds).map(userId => ({
    userId,
    propertyCount: propertyMap.get(userId) || 0,
    warehouseItemCount: warehouseMap.get(userId) || 0,
    supplyRequestCount: supplyMap.get(userId) || 0,
  }));

  // Get totals
  const totalProperties = await Property.countDocuments();
  const totalWarehouseItems = await WarehouseItem.countDocuments();
  const totalReports = await CleaningReport.countDocuments();
  const totalSupplyRequests = await SupplyRequest.countDocuments();

  // Recent activity - reports in last 7 days
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  const recentReports = await CleaningReport.countDocuments({ date: { $gte: weekAgo } });

  return {
    totalUsers: allUserIds.size,
    totalProperties,
    totalWarehouseItems,
    totalReports,
    totalSupplyRequests,
    recentReports,
    users: users.sort((a, b) => b.propertyCount - a.propertyCount),
  };
}

export default async function SuperAdminDashboard() {
  const stats = await getPlatformStats();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Platform Dashboard</h1>
        <p className="text-zinc-400 mt-1">Overview of Rental Helper platform</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card className="bg-zinc-800 border-zinc-700">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600/20">
                <Users className="h-5 w-5 text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{stats.totalUsers}</p>
                <p className="text-xs text-zinc-500">Users</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-zinc-800 border-zinc-700">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-600/20">
                <Home className="h-5 w-5 text-emerald-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{stats.totalProperties}</p>
                <p className="text-xs text-zinc-500">Properties</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-zinc-800 border-zinc-700">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-600/20">
                <Package className="h-5 w-5 text-purple-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{stats.totalWarehouseItems}</p>
                <p className="text-xs text-zinc-500">Inventory Items</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-zinc-800 border-zinc-700">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-600/20">
                <FileText className="h-5 w-5 text-amber-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{stats.totalReports}</p>
                <p className="text-xs text-zinc-500">Reports</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-zinc-800 border-zinc-700">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-rose-600/20">
                <TrendingUp className="h-5 w-5 text-rose-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{stats.totalSupplyRequests}</p>
                <p className="text-xs text-zinc-500">Supply Requests</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-zinc-800 border-zinc-700">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-600/20">
                <Activity className="h-5 w-5 text-cyan-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{stats.recentReports}</p>
                <p className="text-xs text-zinc-500">Reports (7d)</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Users Table */}
      <Card className="bg-zinc-800 border-zinc-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center justify-between">
            <span>All Users</span>
            <Link
              href="/super-admin/users"
              className="text-sm font-normal text-zinc-400 hover:text-white"
            >
              View all →
            </Link>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-zinc-700">
                  <th className="text-left py-3 px-4 text-xs font-medium text-zinc-500 uppercase">User ID</th>
                  <th className="text-center py-3 px-4 text-xs font-medium text-zinc-500 uppercase">Properties</th>
                  <th className="text-center py-3 px-4 text-xs font-medium text-zinc-500 uppercase">Inventory</th>
                  <th className="text-center py-3 px-4 text-xs font-medium text-zinc-500 uppercase">Requests</th>
                  <th className="text-right py-3 px-4 text-xs font-medium text-zinc-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody>
                {stats.users.map((user) => (
                  <tr key={user.userId} className="border-b border-zinc-700/50 hover:bg-zinc-700/30">
                    <td className="py-3 px-4">
                      <code className="text-sm text-zinc-300 bg-zinc-700 px-2 py-1 rounded">
                        {user.userId.slice(0, 20)}...
                      </code>
                    </td>
                    <td className="py-3 px-4 text-center text-zinc-300">{user.propertyCount}</td>
                    <td className="py-3 px-4 text-center text-zinc-300">{user.warehouseItemCount}</td>
                    <td className="py-3 px-4 text-center text-zinc-300">{user.supplyRequestCount}</td>
                    <td className="py-3 px-4 text-right">
                      <Link
                        href={`/super-admin/users/${user.userId}`}
                        className="text-sm text-blue-400 hover:text-blue-300"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
