import { Package } from "lucide-react";
import Link from "next/link";

export default function StaffLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-zinc-50">
      {/* Mobile Header */}
      <header className="sticky top-0 z-40 border-b border-zinc-200 bg-white">
        <div className="flex h-14 items-center justify-between px-4">
          <Link href="/staff" className="flex items-center gap-2">
            <Package className="h-6 w-6 text-emerald-700" />
            <span className="text-lg font-semibold text-zinc-900">StockBnB</span>
          </Link>
          <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
            Staff
          </span>
        </div>
      </header>

      {/* Main content - optimized for mobile */}
      <main className="pb-safe">{children}</main>
    </div>
  );
}
