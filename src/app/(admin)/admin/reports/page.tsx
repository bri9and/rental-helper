export const dynamic = 'force-dynamic';

import { ClipboardCheck, Package, AlertTriangle, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, Badge } from "@/components/ui";
import dbConnect from "@/lib/db";
import CleaningReport from "@/models/CleaningReport";
import Property from "@/models/Property";
import WarehouseItem from "@/models/WarehouseItem";
import { getAuthUserId } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

interface ReportItem {
  sku: string;
  observedCount: number;
  restockedAmount: number;
}

interface Report {
  _id: string;
  propertyId: string;
  propertyName?: string;
  date: Date;
  items: ReportItem[];
  notes?: string;
}

async function getRecentReports(): Promise<Report[]> {
  await dbConnect();

  const userId = await getAuthUserId();
  if (!userId) {
    redirect("/");
  }

  const reports = await CleaningReport.find({ cleanerId: userId })
    .sort({ date: -1 })
    .limit(50)
    .lean();

  // Get property names
  const propertyIds = [...new Set(reports.map(r => r.propertyId.toString()))];
  const properties = await Property.find({ _id: { $in: propertyIds } })
    .select("name")
    .lean();

  const propertyMap = new Map(
    properties.map(p => [p._id.toString(), p.name])
  );

  return reports.map(report => ({
    ...report,
    _id: report._id.toString(),
    propertyId: report.propertyId.toString(),
    propertyName: propertyMap.get(report.propertyId.toString()) ?? "Unknown",
  })) as Report[];
}

async function getItemNames(skus: string[]): Promise<Map<string, string>> {
  const userId = await getAuthUserId();
  if (!userId) return new Map();

  const items = await WarehouseItem.find({ ownerId: userId, sku: { $in: skus } })
    .select("sku name")
    .lean();

  return new Map(items.map(i => [i.sku, i.name]));
}

export default async function ReportsPage() {
  const reports = await getRecentReports();

  // Get all unique SKUs
  const allSkus = [...new Set(reports.flatMap(r => r.items.map(i => i.sku)))];
  const itemNames = await getItemNames(allSkus);

  // Calculate stats
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayReports = reports.filter(r => new Date(r.date) >= today);
  const totalRestocked = reports.reduce(
    (sum, r) => sum + r.items.reduce((s, i) => s + i.restockedAmount, 0),
    0
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-zinc-900">Cleaning Reports</h1>
        <p className="text-zinc-500">View inventory reports from cleaners</p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-zinc-500">
              Today's Reports
            </CardTitle>
            <Calendar className="h-5 w-5 text-zinc-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-zinc-900">{todayReports.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-zinc-500">
              Total Reports
            </CardTitle>
            <ClipboardCheck className="h-5 w-5 text-zinc-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-zinc-900">{reports.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-zinc-500">
              Items Restocked
            </CardTitle>
            <Package className="h-5 w-5 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-emerald-600">{totalRestocked}</div>
          </CardContent>
        </Card>
      </div>

      {/* Reports List */}
      {reports.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <ClipboardCheck className="h-12 w-12 text-zinc-300" />
            <h3 className="mt-4 text-lg font-semibold text-zinc-900">
              No reports yet
            </h3>
            <p className="mt-1 text-zinc-500">
              Reports will appear here when cleaners submit inventory counts.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {reports.map((report) => {
            const totalItems = report.items.length;
            const totalRestockedInReport = report.items.reduce((s, i) => s + i.restockedAmount, 0);
            const hasRestocking = totalRestockedInReport > 0;

            return (
              <Card key={report._id} className={hasRestocking ? "border-emerald-200" : ""}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-zinc-900">{report.propertyName}</h3>
                      <p className="text-sm text-zinc-500">
                        {new Date(report.date).toLocaleDateString("en-US", {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                          hour: "numeric",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {hasRestocking && (
                        <Badge variant="success">
                          +{totalRestockedInReport} restocked
                        </Badge>
                      )}
                      <Badge variant="default">{totalItems} items</Badge>
                    </div>
                  </div>

                  {report.notes && (
                    <p className="mt-3 text-sm text-zinc-600 italic">
                      "{report.notes}"
                    </p>
                  )}

                  {/* Item Details */}
                  <div className="mt-4 border-t border-zinc-100 pt-4">
                    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                      {report.items.map((item) => (
                        <div
                          key={item.sku}
                          className="flex items-center justify-between rounded-lg bg-zinc-50 px-3 py-2 text-sm"
                        >
                          <span className="text-zinc-700">
                            {itemNames.get(item.sku) ?? item.sku}
                          </span>
                          <div className="flex items-center gap-2">
                            <span className="text-zinc-500">
                              {item.observedCount}
                            </span>
                            {item.restockedAmount > 0 && (
                              <span className="font-medium text-emerald-600">
                                +{item.restockedAmount}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
