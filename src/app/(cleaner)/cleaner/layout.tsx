import { SiteHeader } from "@/components/layout/SiteHeader";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Rental Helper - Cleaner",
};

export default function CleanerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Shared Site Header */}
      <SiteHeader showPricing={false} />

      {/* Cleaner badge */}
      <div className="fixed top-16 left-0 right-0 z-30 bg-zinc-100 border-b border-zinc-200 px-4 py-2">
        <span className="text-xs font-medium text-zinc-600">Cleaner Portal</span>
      </div>

      {/* Main content - Full width, mobile optimized */}
      <main className="pt-24 pb-8">{children}</main>
    </div>
  );
}
