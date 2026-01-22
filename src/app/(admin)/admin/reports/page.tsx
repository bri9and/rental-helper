export const dynamic = 'force-dynamic';

import {
  ClipboardCheck, Package, Calendar, Bath, UtensilsCrossed, Bed, Sofa,
  CheckCircle2, User, Clock, Truck, CheckCircle, Bell, Wrench
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, Badge } from "@/components/ui";
import dbConnect from "@/lib/db";
import CleaningReport from "@/models/CleaningReport";
import Property from "@/models/Property";
import WarehouseItem from "@/models/WarehouseItem";
import { getAuthUserId } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getSupplyRequests } from "@/lib/actions/supply-requests";
import { ReportsTabs } from "./ReportsTabs";
import type { IMaintenanceIssue } from "@/lib/maintenance-categories";

interface ReportItem {
  sku: string;
  observedCount: number;
  restockedAmount: number;
}

interface CleaningChecklist {
  bathrooms: boolean;
  kitchen: boolean;
  bedrooms: boolean;
  livingSpace: boolean;
}

export interface Report {
  _id: string;
  propertyId: string;
  propertyName?: string;
  cleanerName?: string;
  date: Date;
  items: ReportItem[];
  notes?: string;
  checklist?: CleaningChecklist;
  maintenanceIssues?: IMaintenanceIssue[];
  completedAt?: Date;
}

async function getRecentReports(): Promise<Report[]> {
  await dbConnect();

  const userId = await getAuthUserId();
  if (!userId) {
    redirect("/");
  }

  // Get properties owned by this user
  const userProperties = await Property.find({ ownerId: userId })
    .select("_id name")
    .lean();

  const propertyIds = userProperties.map(p => p._id);
  const propertyMap = new Map(
    userProperties.map(p => [p._id.toString(), p.name])
  );

  // Get reports for user's properties (from any cleaner)
  const reports = await CleaningReport.find({ propertyId: { $in: propertyIds } })
    .sort({ date: -1 })
    .limit(50)
    .lean();

  return reports.map(report => ({
    ...report,
    _id: report._id.toString(),
    propertyId: report.propertyId.toString(),
    propertyName: propertyMap.get(report.propertyId.toString()) ?? "Unknown",
  })) as Report[];
}

async function getItemNames(skus: string[]): Promise<Record<string, string>> {
  const userId = await getAuthUserId();
  if (!userId) return {};

  const items = await WarehouseItem.find({ ownerId: userId, sku: { $in: skus } })
    .select("sku name")
    .lean();

  return Object.fromEntries(items.map(i => [i.sku, i.name]));
}

export default async function ReportsPage() {
  const reports = await getRecentReports();
  const supplyRequests = await getSupplyRequests();

  // Get all unique SKUs for item names
  const allSkus = [...new Set(reports.flatMap(r => r.items.map(i => i.sku)))];
  const itemNames = await getItemNames(allSkus);

  // Calculate cleaning report stats
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayReports = reports.filter(r => new Date(r.date) >= today);
  const totalRestocked = reports.reduce(
    (sum, r) => sum + r.items.reduce((s, i) => s + i.restockedAmount, 0),
    0
  );

  // Calculate supply request stats
  const pendingRequests = supplyRequests.filter((r) => r.status === "pending");
  const orderedRequests = supplyRequests.filter((r) => r.status === "ordered");
  const completedRequests = supplyRequests.filter(
    (r) => r.status === "received" || r.status === "cancelled"
  );

  // Calculate maintenance issue stats
  const maintenanceCount = reports.reduce(
    (sum, r) => sum + (r.maintenanceIssues?.length || 0),
    0
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl md:text-2xl font-bold text-zinc-900">Reports & Requests</h1>
        <p className="text-sm text-zinc-500">
          View cleaning reports and manage supply requests
        </p>
      </div>

      {/* Summary Stats - Combined */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <Card className="bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center">
                <ClipboardCheck className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-emerald-700">{todayReports.length}</p>
                <p className="text-xs font-medium text-emerald-600">Today's Cleanings</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center">
                <Clock className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-amber-700">{pendingRequests.length}</p>
                <p className="text-xs font-medium text-amber-600">Pending Requests</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                <Truck className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-700">{orderedRequests.length}</p>
                <p className="text-xs font-medium text-blue-600">On Order</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-zinc-50 to-slate-50 border-zinc-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-zinc-100 flex items-center justify-center">
                <Package className="h-5 w-5 text-zinc-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-zinc-700">{totalRestocked}</p>
                <p className="text-xs font-medium text-zinc-600">Items Restocked</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={`bg-gradient-to-br ${maintenanceCount > 0 ? 'from-red-50 to-orange-50 border-red-200' : 'from-zinc-50 to-slate-50 border-zinc-200'}`}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className={`h-10 w-10 rounded-full flex items-center justify-center ${maintenanceCount > 0 ? 'bg-red-100' : 'bg-zinc-100'}`}>
                <Wrench className={`h-5 w-5 ${maintenanceCount > 0 ? 'text-red-600' : 'text-zinc-600'}`} />
              </div>
              <div>
                <p className={`text-2xl font-bold ${maintenanceCount > 0 ? 'text-red-700' : 'text-zinc-700'}`}>{maintenanceCount}</p>
                <p className={`text-xs font-medium ${maintenanceCount > 0 ? 'text-red-600' : 'text-zinc-600'}`}>Maintenance</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabbed Content */}
      <ReportsTabs
        reports={JSON.parse(JSON.stringify(reports))}
        itemNames={itemNames}
        pendingRequests={pendingRequests}
        orderedRequests={orderedRequests}
        completedRequests={completedRequests}
      />
    </div>
  );
}
