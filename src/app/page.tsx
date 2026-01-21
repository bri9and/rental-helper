import { Package, Home, ClipboardList, TrendingUp, Bell, CheckCircle2, ArrowRight, Smartphone } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { SiteHeader } from "@/components/layout/SiteHeader";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-50 via-white to-slate-50">
      {/* Header */}
      <SiteHeader />

      {/* Hero Section */}
      <main>
        <section className="relative overflow-hidden pt-20">
          {/* Subtle gradient blobs */}
          <div className="absolute top-20 left-1/4 w-96 h-96 bg-zinc-200/40 rounded-full blur-3xl" />
          <div className="absolute top-40 right-1/4 w-80 h-80 bg-slate-200/40 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-zinc-100/50 rounded-full blur-3xl -translate-x-1/2" />

          <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
            <div className="text-center">
              <h1 className="text-5xl font-bold tracking-tight text-zinc-900 sm:text-6xl leading-tight">
                Your Rentals,
                <span className="block text-emerald-700">
                  Always Guest-Ready
                </span>
              </h1>

              <p className="mx-auto mt-6 max-w-2xl text-lg text-zinc-600 leading-relaxed">
                Track supplies across all your Airbnb and VRBO properties. Know what's running low before your cleaner arrives. One-click Amazon restocking.
              </p>

              <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Link
                  href="/sign-up"
                  className="h-12 rounded-lg bg-emerald-700 px-6 text-base font-medium text-white hover:bg-emerald-800 transition-colors flex items-center"
                >
                  Get Started Free
                </Link>
                <Link
                  href="/admin/dashboard"
                  className="group flex items-center gap-2 px-6 py-3 text-zinc-600 hover:text-zinc-900 font-medium transition-colors"
                >
                  See Demo
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>

            {/* Stats */}
            <div className="mt-20 grid grid-cols-2 gap-4 sm:grid-cols-4 max-w-3xl mx-auto">
              {[
                { value: "10x", label: "Faster Restocking" },
                { value: "0", label: "Stockouts" },
                { value: "100%", label: "Property Coverage" },
                { value: "24/7", label: "Inventory Tracking" },
              ].map((stat) => (
                <div key={stat.label} className="text-center p-4 rounded-2xl bg-white/80 backdrop-blur-sm shadow-sm border border-zinc-200">
                  <div className="text-3xl font-bold text-zinc-900">{stat.value}</div>
                  <div className="text-sm text-zinc-500 mt-1">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Grid - Problem First */}
        <section className="relative bg-white py-24 border-y border-zinc-200">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-zinc-900 sm:text-4xl">
                Sound Familiar?
              </h2>
              <p className="mt-4 text-zinc-500 text-lg">
                Problems every rental host knows. Solutions that actually work.
              </p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              {/* Problem 1 */}
              <div className="group rounded-2xl bg-gradient-to-br from-rose-50 to-white p-6 border border-rose-100 hover:shadow-lg transition-all">
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-100 flex-shrink-0">
                    <ClipboardList className="h-5 w-5 text-rose-600" />
                  </div>
                  <div>
                    <p className="text-rose-700 text-sm font-medium mb-1">The Problem</p>
                    <h3 className="text-lg font-semibold text-zinc-900">"My cleaner texted asking if there's toilet paper"</h3>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-rose-100">
                  <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 flex-shrink-0">
                      <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-emerald-700 text-sm font-medium mb-1">The Solution</p>
                      <p className="text-zinc-600">Cleaners use a mobile checklist to count supplies after each turnover. You see inventory in real-time.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Problem 2 */}
              <div className="group rounded-2xl bg-gradient-to-br from-amber-50 to-white p-6 border border-amber-100 hover:shadow-lg transition-all">
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 flex-shrink-0">
                    <Bell className="h-5 w-5 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-amber-700 text-sm font-medium mb-1">The Problem</p>
                    <h3 className="text-lg font-semibold text-zinc-900">"Guest complained there was no coffee"</h3>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-amber-100">
                  <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 flex-shrink-0">
                      <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-emerald-700 text-sm font-medium mb-1">The Solution</p>
                      <p className="text-zinc-600">Set par levels for each item. Get alerts before you run out—not after a bad review.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Problem 3 */}
              <div className="group rounded-2xl bg-gradient-to-br from-blue-50 to-white p-6 border border-blue-100 hover:shadow-lg transition-all">
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 flex-shrink-0">
                    <Home className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-blue-700 text-sm font-medium mb-1">The Problem</p>
                    <h3 className="text-lg font-semibold text-zinc-900">"I'm placing 5 separate Amazon orders for 5 properties"</h3>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-blue-100">
                  <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 flex-shrink-0">
                      <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-emerald-700 text-sm font-medium mb-1">The Solution</p>
                      <p className="text-zinc-600">One dashboard shows all properties. One click adds everything to your Amazon cart.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Problem 4 */}
              <div className="group rounded-2xl bg-gradient-to-br from-purple-50 to-white p-6 border border-purple-100 hover:shadow-lg transition-all">
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100 flex-shrink-0">
                    <TrendingUp className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-purple-700 text-sm font-medium mb-1">The Problem</p>
                    <h3 className="text-lg font-semibold text-zinc-900">"I have no idea how fast we go through supplies"</h3>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-purple-100">
                  <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 flex-shrink-0">
                      <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-emerald-700 text-sm font-medium mb-1">The Solution</p>
                      <p className="text-zinc-600">Burn rate analytics show consumption patterns. AI predicts when you'll need to reorder.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="bg-gradient-to-br from-zinc-50 via-white to-slate-50 py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-zinc-900 sm:text-4xl">
                How It Works
              </h2>
              <p className="mt-4 text-zinc-500 text-lg">
                Set up once. Stay stocked forever.
              </p>
            </div>

            <div className="grid gap-8 sm:grid-cols-3">
              {/* Step 1 */}
              <div className="relative bg-white rounded-2xl p-8 shadow-sm border border-zinc-200 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 font-bold">1</div>
                  <h3 className="text-xl font-semibold text-zinc-900">Add Your Properties</h3>
                </div>
                <p className="text-zinc-500 leading-relaxed mb-4">
                  Enter each rental property and set par levels for supplies. "Beach House needs 12 toilet paper rolls, 6 soap bars..."
                </p>
                <div className="flex gap-2">
                  <div className="flex-1 bg-zinc-50 rounded-lg p-2 border border-zinc-200">
                    <div className="text-xs text-zinc-400">Property</div>
                    <div className="text-sm font-medium text-zinc-700">Beach House</div>
                  </div>
                  <div className="flex-1 bg-zinc-50 rounded-lg p-2 border border-zinc-200">
                    <div className="text-xs text-zinc-400">Property</div>
                    <div className="text-sm font-medium text-zinc-700">Downtown Loft</div>
                  </div>
                </div>
              </div>

              {/* Step 2 */}
              <div className="relative bg-white rounded-2xl p-8 shadow-sm border border-zinc-200 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 font-bold">2</div>
                  <h3 className="text-xl font-semibold text-zinc-900">Cleaners Count</h3>
                </div>
                <p className="text-zinc-500 leading-relaxed mb-4">
                  After each turnover, your cleaner opens the app and counts what's left. Takes 2 minutes. You're notified instantly.
                </p>
                <div className="bg-zinc-50 rounded-lg p-3 border border-zinc-200">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-zinc-600">Toilet Paper</span>
                    <span className="font-medium text-amber-600">4 left</span>
                  </div>
                  <div className="flex items-center justify-between text-sm mt-2">
                    <span className="text-zinc-600">Coffee Pods</span>
                    <span className="font-medium text-emerald-600">12 left</span>
                  </div>
                </div>
              </div>

              {/* Step 3 */}
              <div className="relative bg-white rounded-2xl p-8 shadow-sm border border-zinc-200 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 font-bold">3</div>
                  <h3 className="text-xl font-semibold text-zinc-900">One-Click Restock</h3>
                </div>
                <p className="text-zinc-500 leading-relaxed mb-4">
                  See what's low across all properties. Click once to add everything to your Amazon cart. Done.
                </p>
                <div className="bg-emerald-50 rounded-lg p-3 border border-emerald-200">
                  <div className="flex items-center gap-2 text-emerald-700 text-sm font-medium">
                    <Package className="h-4 w-4" />
                    Add 3 items to Amazon Cart
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Mobile Apps Section */}
        <section className="bg-white py-24 border-y border-zinc-200">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-12 lg:grid-cols-2 items-center">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full bg-zinc-100 px-4 py-2 text-sm font-medium text-zinc-700 mb-6">
                  <Smartphone className="h-4 w-4" />
                  Native iOS Apps
                </div>
                <h2 className="text-3xl font-bold text-zinc-900 sm:text-4xl">
                  Apps for Everyone
                </h2>
                <p className="mt-4 text-zinc-500 text-lg leading-relaxed">
                  Cleaners get a simple checklist app. Managers get a full dashboard with reports and analytics. Both native iOS for the best experience.
                </p>
                <ul className="mt-8 space-y-4">
                  {[
                    "Offline-capable",
                    "Real-time sync",
                    "Push notifications",
                  ].map((feature) => (
                    <li key={feature} className="flex items-center gap-3 text-zinc-600">
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100">
                        <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                      </div>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-zinc-100/50 to-slate-100/50 rounded-3xl blur-2xl" />
                <div className="relative bg-gradient-to-br from-white to-zinc-50 rounded-3xl p-8 border border-zinc-200 shadow-lg">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-zinc-50 rounded-2xl p-5 border border-zinc-200">
                      <Package className="h-8 w-8 text-zinc-600 mb-3" />
                      <div className="text-zinc-900 font-semibold">Cleaners App</div>
                      <div className="text-sm text-zinc-500">Quick inventory counts</div>
                    </div>
                    <div className="bg-zinc-50 rounded-2xl p-5 border border-zinc-200">
                      <TrendingUp className="h-8 w-8 text-zinc-600 mb-3" />
                      <div className="text-zinc-900 font-semibold">Manager App</div>
                      <div className="text-sm text-zinc-500">Full dashboard</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-zinc-800 via-zinc-900 to-zinc-800 p-8 sm:p-16 shadow-xl">
              <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-zinc-700/30 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
              <div className="relative text-center">
                <h2 className="text-3xl font-bold text-white sm:text-4xl">
                  Ready to Streamline Your Inventory?
                </h2>
                <p className="mt-4 text-zinc-300 text-lg max-w-2xl mx-auto">
                  Join property managers who've eliminated stockouts and saved hours every week.
                </p>
                <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
                  <Link
                    href="/sign-up"
                    className="h-12 rounded-lg bg-white px-6 text-base font-medium text-emerald-700 hover:bg-emerald-50 transition-colors flex items-center"
                  >
                    Get Started Free
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-zinc-200 bg-white">
          <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
            <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
              <div className="flex items-center gap-2">
                <Image src="/logo.png" alt="Rental Helper" width={40} height={40} className="h-10 w-10" />
                <span className="text-xl font-bold tracking-tight text-zinc-900">Rental Helper</span>
              </div>
              <div className="text-sm text-zinc-400">
                Built for short-term rental hosts
              </div>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
