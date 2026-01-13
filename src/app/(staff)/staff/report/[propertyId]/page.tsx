import { notFound } from "next/navigation";
import { getPropertyReportData } from "@/lib/actions/reports";
import { ReportForm } from "./ReportForm";

interface ReportPageProps {
  params: Promise<{ propertyId: string }>;
}

export default async function ReportPage({ params }: ReportPageProps) {
  const { propertyId } = await params;
  const data = await getPropertyReportData(propertyId);

  if (!data) {
    notFound();
  }

  return (
    <div className="p-4">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl font-bold text-zinc-900">{data.property.name}</h1>
        <p className="text-sm text-zinc-500">
          Count each item and submit when done
        </p>
      </div>

      {/* Report Form */}
      <ReportForm
        propertyId={propertyId}
        checklist={data.checklist}
      />
    </div>
  );
}
