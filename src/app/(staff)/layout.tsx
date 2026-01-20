import { SiteHeader } from "@/components/layout/SiteHeader";

export default function StaffLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Shared Site Header */}
      <SiteHeader showPricing={false} />

      {/* Staff badge */}
      <div className="fixed top-16 left-0 right-0 z-30 bg-zinc-100 border-b border-zinc-200 px-4 py-2">
        <span className="text-xs font-medium text-zinc-600">Staff Portal</span>
      </div>

      {/* Main content - optimized for mobile */}
      <main className="pt-24 pb-safe">{children}</main>
    </div>
  );
}
