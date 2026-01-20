import { Package, Home, ClipboardList, Sparkles, TrendingUp, Bell, CheckCircle2, ArrowRight, Smartphone } from "lucide-react";
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
              <h1 className="text-5xl font-bold tracking-tight text-zinc-900 sm:text-7xl leading-tight">
                Never Run Out of
                <span className="block text-zinc-600">
                  Essentials Again
                </span>
              </h1>

              <p className="mx-auto mt-6 max-w-2xl text-xl text-zinc-600 leading-relaxed">
                The smart inventory system for short-term rental hosts. Track supplies, automate restocking, and keep every property guest-ready.
              </p>

              <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Link
                  href="/sign-up"
                  className="h-12 rounded-lg bg-emerald-600 px-6 text-base font-medium text-white hover:bg-emerald-700 transition-colors flex items-center"
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

        {/* Features Grid */}
        <section className="relative bg-white py-24 border-y border-zinc-200">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-zinc-900 sm:text-4xl">
                Everything You Need
              </h2>
              <p className="mt-4 text-zinc-500 text-lg">
                From warehouse to property, we've got you covered.
              </p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              <div className="group rounded-2xl bg-white p-6 border border-zinc-200 hover:border-zinc-300 hover:shadow-lg hover:shadow-zinc-100/50 transition-all">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-100 group-hover:scale-110 transition-transform">
                  <Home className="h-6 w-6 text-zinc-600" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-zinc-900">Multi-Property Support</h3>
                <p className="mt-2 text-zinc-500 leading-relaxed">Manage inventory across unlimited properties. Set custom par levels for each location.</p>
              </div>

              <div className="group rounded-2xl bg-white p-6 border border-zinc-200 hover:border-zinc-300 hover:shadow-lg hover:shadow-zinc-100/50 transition-all">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-100 group-hover:scale-110 transition-transform">
                  <ClipboardList className="h-6 w-6 text-zinc-600" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-zinc-900">Cleaner Checklists</h3>
                <p className="mt-2 text-zinc-500 leading-relaxed">Mobile-friendly checklists that cleaners can complete in minutes. Auto-sync to dashboard.</p>
              </div>

              <div className="group rounded-2xl bg-white p-6 border border-zinc-200 hover:border-zinc-300 hover:shadow-lg hover:shadow-zinc-100/50 transition-all">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-100 group-hover:scale-110 transition-transform">
                  <TrendingUp className="h-6 w-6 text-zinc-600" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-zinc-900">Burn Rate Analytics</h3>
                <p className="mt-2 text-zinc-500 leading-relaxed">Understand consumption patterns. Get AI predictions on when you'll need to reorder.</p>
              </div>

              <div className="group rounded-2xl bg-white p-6 border border-zinc-200 hover:border-zinc-300 hover:shadow-lg hover:shadow-zinc-100/50 transition-all">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-100 group-hover:scale-110 transition-transform">
                  <Bell className="h-6 w-6 text-zinc-600" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-zinc-900">Smart Alerts</h3>
                <p className="mt-2 text-zinc-500 leading-relaxed">Get notified before you run out. Email alerts for low stock and unusual activity.</p>
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
                Three simple steps to never worry about supplies again.
              </p>
            </div>

            <div className="grid gap-8 sm:grid-cols-3">
              {[
                {
                  step: "01",
                  title: "Set Up Your Inventory",
                  description: "Add your supplies with par levels and low-stock thresholds. Import from spreadsheet or add manually.",
                },
                {
                  step: "02",
                  title: "Cleaners Report",
                  description: "After each turnover, cleaners count supplies using our mobile app. AI camera makes it instant.",
                },
                {
                  step: "03",
                  title: "Auto-Restock Magic",
                  description: "The system automatically deducts from your warehouse and alerts you when supplies are low.",
                },
              ].map((item) => (
                <div key={item.step} className="relative bg-white rounded-2xl p-8 shadow-sm border border-zinc-200 hover:shadow-md transition-shadow">
                  <div className="text-5xl font-bold text-zinc-200">{item.step}</div>
                  <h3 className="mt-4 text-xl font-semibold text-zinc-900">{item.title}</h3>
                  <p className="mt-2 text-zinc-500 leading-relaxed">{item.description}</p>
                </div>
              ))}
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
                    "AI-powered camera counting",
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
