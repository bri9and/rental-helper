import { Package, Home, ClipboardList } from "lucide-react";
import { HeaderAuthButtons, HeroAuthButtons } from "@/components/landing/AuthButtons";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-zinc-50">
      {/* Header */}
      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <Package className="h-8 w-8 text-emerald-700" />
            <span className="text-xl font-semibold text-zinc-900">StockBnB</span>
          </div>
          <nav className="flex items-center gap-4">
            <HeaderAuthButtons />
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <main className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-zinc-900 sm:text-5xl">
            Inventory Management for
            <span className="text-emerald-700"> Short Term Rentals</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-zinc-500">
            Treat stays like sales. Automate restocking, track burn rates, and never run out of essentials again.
          </p>
          <div className="mt-10 flex items-center justify-center gap-4">
            <HeroAuthButtons />
          </div>
        </div>

        {/* Features */}
        <div className="mt-24 grid gap-8 sm:grid-cols-3">
          <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-50">
              <Package className="h-6 w-6 text-emerald-700" />
            </div>
            <h3 className="mt-4 text-lg font-semibold text-zinc-900">Central Warehouse</h3>
            <p className="mt-2 text-zinc-500">
              Track your master inventory with par levels, low stock alerts, and cost tracking.
            </p>
          </div>
          <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-50">
              <Home className="h-6 w-6 text-emerald-700" />
            </div>
            <h3 className="mt-4 text-lg font-semibold text-zinc-900">Property Management</h3>
            <p className="mt-2 text-zinc-500">
              Configure inventory needs per property. Set custom par levels for each location.
            </p>
          </div>
          <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-50">
              <ClipboardList className="h-6 w-6 text-emerald-700" />
            </div>
            <h3 className="mt-4 text-lg font-semibold text-zinc-900">Cleaner Reports</h3>
            <p className="mt-2 text-zinc-500">
              Mobile-friendly checklists with AI-powered counting. Auto-restock from warehouse.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
