'use client';

import { useState } from "react";
import {
  ClipboardCheck, Bell, Bath, UtensilsCrossed, Bed, Sofa,
  CheckCircle2, User
} from "lucide-react";
import { Card, CardContent, Badge } from "@/components/ui";
import { SupplyRequestList } from "./SupplyRequestList";
import { SupplyRequestSummary } from "@/lib/actions/supply-requests";

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

interface Report {
  _id: string;
  propertyId: string;
  propertyName?: string;
  cleanerName?: string;
  date: Date;
  items: ReportItem[];
  notes?: string;
  checklist?: CleaningChecklist;
  completedAt?: Date;
}

interface ReportsTabsProps {
  reports: Report[];
  itemNames: Record<string, string>;
  pendingRequests: SupplyRequestSummary[];
  orderedRequests: SupplyRequestSummary[];
  completedRequests: SupplyRequestSummary[];
}

export function ReportsTabs({
  reports,
  itemNames,
  pendingRequests,
  orderedRequests,
  completedRequests,
}: ReportsTabsProps) {
  const [activeTab, setActiveTab] = useState<'requests' | 'cleaning'>('requests');

  const totalRequests = pendingRequests.length + orderedRequests.length;

  return (
    <div>
      {/* Tab Navigation */}
      <div className="flex border-b border-zinc-200 mb-6">
        <button
          onClick={() => setActiveTab('requests')}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'requests'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-zinc-500 hover:text-zinc-700'
          }`}
        >
          <Bell className="h-4 w-4" />
          Supply Requests
          {totalRequests > 0 && (
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
              activeTab === 'requests'
                ? 'bg-emerald-100 text-emerald-700'
                : 'bg-zinc-100 text-zinc-600'
            }`}>
              {totalRequests}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('cleaning')}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'cleaning'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-zinc-500 hover:text-zinc-700'
          }`}
        >
          <ClipboardCheck className="h-4 w-4" />
          Cleaning Reports
          {reports.length > 0 && (
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
              activeTab === 'cleaning'
                ? 'bg-emerald-100 text-emerald-700'
                : 'bg-zinc-100 text-zinc-600'
            }`}>
              {reports.length}
            </span>
          )}
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'requests' ? (
        <SupplyRequestsContent
          pendingRequests={pendingRequests}
          orderedRequests={orderedRequests}
          completedRequests={completedRequests}
        />
      ) : (
        <CleaningReportsContent reports={reports} itemNames={itemNames} />
      )}
    </div>
  );
}

function SupplyRequestsContent({
  pendingRequests,
  orderedRequests,
  completedRequests,
}: {
  pendingRequests: SupplyRequestSummary[];
  orderedRequests: SupplyRequestSummary[];
  completedRequests: SupplyRequestSummary[];
}) {
  const totalRequests = pendingRequests.length + orderedRequests.length + completedRequests.length;

  if (totalRequests === 0) {
    return (
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
    );
  }

  return (
    <SupplyRequestList
      pendingRequests={pendingRequests}
      orderedRequests={orderedRequests}
      completedRequests={completedRequests}
    />
  );
}

function CleaningReportsContent({
  reports,
  itemNames,
}: {
  reports: Report[];
  itemNames: Record<string, string>;
}) {
  if (reports.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <ClipboardCheck className="h-12 w-12 text-zinc-300" />
          <h3 className="mt-4 text-lg font-semibold text-zinc-900">
            No cleaning reports yet
          </h3>
          <p className="mt-1 text-zinc-500">
            Reports will appear here when cleaners submit their cleaning checklists.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {reports.map((report) => {
        const totalItems = report.items.length;
        const totalRestockedInReport = report.items.reduce((s, i) => s + i.restockedAmount, 0);
        const hasRestocking = totalRestockedInReport > 0;
        const isCleanerReport = !!report.checklist;

        return (
          <Card key={report._id} className={hasRestocking ? "border-emerald-200" : isCleanerReport ? "border-emerald-100" : ""}>
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
                  {report.cleanerName && (
                    <p className="text-sm text-zinc-500 flex items-center gap-1 mt-1">
                      <User className="h-3 w-3" />
                      {report.cleanerName}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {isCleanerReport && (
                    <Badge variant="success">
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      Cleaned
                    </Badge>
                  )}
                  {hasRestocking && (
                    <Badge variant="success">
                      +{totalRestockedInReport} restocked
                    </Badge>
                  )}
                  {totalItems > 0 && (
                    <Badge variant="default">{totalItems} items</Badge>
                  )}
                </div>
              </div>

              {/* Cleaning Checklist for cleaner reports */}
              {report.checklist && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {report.checklist.bathrooms && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
                      <Bath className="h-3 w-3" /> Bathrooms
                    </span>
                  )}
                  {report.checklist.kitchen && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-700">
                      <UtensilsCrossed className="h-3 w-3" /> Kitchen
                    </span>
                  )}
                  {report.checklist.bedrooms && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-purple-50 px-3 py-1 text-xs font-medium text-purple-700">
                      <Bed className="h-3 w-3" /> Bedrooms
                    </span>
                  )}
                  {report.checklist.livingSpace && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
                      <Sofa className="h-3 w-3" /> Living Space
                    </span>
                  )}
                </div>
              )}

              {report.notes && (
                <p className="mt-3 text-sm text-zinc-600 italic">
                  &quot;{report.notes}&quot;
                </p>
              )}

              {/* Item Details - only show if there are items */}
              {report.items.length > 0 && (
                <div className="mt-4 border-t border-zinc-100 pt-4">
                  <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                    {report.items.map((item) => (
                      <div
                        key={item.sku}
                        className="flex items-center justify-between rounded-lg bg-zinc-50 px-3 py-2 text-sm"
                      >
                        <span className="text-zinc-700">
                          {itemNames[item.sku] ?? item.sku}
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
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
