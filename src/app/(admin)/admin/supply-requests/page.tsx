export const dynamic = 'force-dynamic';

import { Bell, Clock, Truck, CheckCircle, Package } from "lucide-react";
import { Card, CardContent } from "@/components/ui";
import { getSupplyRequests } from "@/lib/actions/supply-requests";
import { SupplyRequestList } from "./SupplyRequestList";

export default async function SupplyRequestsPage() {
  const requests = await getSupplyRequests();

  const pendingRequests = requests.filter((r) => r.status === "pending");
  const orderedRequests = requests.filter((r) => r.status === "ordered");
  const completedRequests = requests.filter(
    (r) => r.status === "received" || r.status === "cancelled"
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl md:text-2xl font-bold text-zinc-900">
          Supply Requests
        </h1>
        <p className="text-sm text-zinc-500">
          Track and fulfill cleaner supply requests
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center">
                <Clock className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-amber-600">
                  {pendingRequests.length}
                </p>
                <p className="text-xs font-medium text-amber-700">Pending</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                <Truck className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-600">
                  {orderedRequests.length}
                </p>
                <p className="text-xs font-medium text-blue-700">On Order</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-emerald-600">
                  {completedRequests.length}
                </p>
                <p className="text-xs font-medium text-emerald-700">Completed</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {requests.length === 0 ? (
        <Card className="bg-white border-slate-200">
          <CardContent className="flex flex-col items-center py-16 text-center">
            <div className="h-16 w-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
              <Bell className="h-8 w-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-zinc-800">
              No supply requests yet
            </h3>
            <p className="mt-2 text-sm text-zinc-500 max-w-sm">
              When cleaners report low inventory at properties, their requests will appear here.
            </p>
          </CardContent>
        </Card>
      ) : (
        <SupplyRequestList
          pendingRequests={pendingRequests}
          orderedRequests={orderedRequests}
          completedRequests={completedRequests}
        />
      )}
    </div>
  );
}
