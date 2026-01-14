import { Package, Home, ClipboardList, Sparkles, TrendingUp, Bell, CheckCircle2, ArrowRight, Smartphone } from "lucide-react";
import Image from "next/image";
import { HeaderAuthButtons, HeroAuthButtons } from "@/components/landing/AuthButtons";
import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="fixed top-0 z-50 w-full border-b border-zinc-200 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <Image src="/logo.png" alt="Rental Helper" width={32} height={32} className="h-8 w-8" />
            <span className="text-xl font-bold text-zinc-900">Rental Helper</span>
          </div>
          <nav className="flex items-center gap-6">
            <Link href="/pricing" className="text-sm font-medium text-zinc-600 hover:text-zinc-900 transition-colors">
              Pricing
            </Link>
            <HeaderAuthButtons />
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <main>
        <section className="relative overflow-hidden pt-16">
          {/* Gradient Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-white to-white" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-emerald-100/50 rounded-full blur-3xl" />

          <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-32 lg:px-8">
            <div className="text-center">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-1.5 text-sm text-emerald-700 mb-8">
                <Sparkles className="h-4 w-4" />
                AI-Powered Inventory Management
              </div>

              <h1 className="text-5xl font-bold tracking-tight text-zinc-900 sm:text-7xl">
                Never Run Out of
                <span className="block bg-gradient-to-r from-emerald-600 to-emerald-700 bg-clip-text text-transparent">
                  Essentials Again
                </span>
              </h1>

              <p className="mx-auto mt-6 max-w-2xl text-xl text-zinc-600">
                The smart inventory system for short-term rental hosts on Airbnb, VRBO, and beyond. Track supplies, automate restocking, and keep every property guest-ready.
              </p>

              <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
                <HeroAuthButtons />
                <Link
                  href="/admin/dashboard"
                  className="group flex items-center gap-2 text-zinc-600 hover:text-zinc-900 transition-colors"
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
                <div key={stat.label} className="text-center p-4">
                  <div className="text-3xl font-bold text-emerald-600">{stat.value}</div>
                  <div className="text-sm text-zinc-500">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="relative border-t border-zinc-200 bg-zinc-50">
          <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-zinc-900 sm:text-4xl">
                Everything You Need
              </h2>
              <p className="mt-4 text-zinc-600">
                From warehouse to property, we&apos;ve got you covered.
              </p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  icon: Package,
                  title: "Central Warehouse",
                  description: "Track your master inventory with real-time quantities, par levels, and automatic low-stock alerts.",
                },
                {
                  icon: Home,
                  title: "Multi-Property Support",
                  description: "Manage inventory across unlimited properties. Set custom par levels for each location.",
                },
                {
                  icon: ClipboardList,
                  title: "Cleaner Checklists",
                  description: "Mobile-friendly checklists that cleaners can complete in minutes. Auto-sync to dashboard.",
                },
                {
                  icon: Sparkles,
                  title: "AI-Powered Counting",
                  description: "Point your camera at supplies and let AI count them for you. No more manual tallying.",
                },
                {
                  icon: TrendingUp,
                  title: "Burn Rate Analytics",
                  description: "Understand consumption patterns. Get AI predictions on when you'll need to reorder.",
                },
                {
                  icon: Bell,
                  title: "Smart Alerts",
                  description: "Get notified before you run out. Email alerts for low stock and unusual activity.",
                },
              ].map((feature) => (
                <div
                  key={feature.title}
                  className="group rounded-2xl border border-zinc-200 bg-white p-6 hover:border-emerald-300 hover:shadow-lg transition-all"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 group-hover:bg-emerald-200 transition-colors">
                    <feature.icon className="h-6 w-6 text-emerald-600" />
                  </div>
                  <h3 className="mt-4 text-lg font-semibold text-zinc-900">{feature.title}</h3>
                  <p className="mt-2 text-zinc-600">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="border-t border-zinc-200">
          <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-zinc-900 sm:text-4xl">
                How It Works
              </h2>
              <p className="mt-4 text-zinc-600">
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
                <div key={item.step} className="relative">
                  <div className="text-6xl font-bold text-emerald-100">{item.step}</div>
                  <h3 className="mt-2 text-xl font-semibold text-zinc-900">{item.title}</h3>
                  <p className="mt-2 text-zinc-600">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Mobile Apps Section */}
        <section className="border-t border-zinc-200 bg-zinc-50">
          <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
            <div className="grid gap-12 lg:grid-cols-2 items-center">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-1.5 text-sm text-emerald-700 mb-6">
                  <Smartphone className="h-4 w-4" />
                  Native iOS Apps
                </div>
                <h2 className="text-3xl font-bold text-zinc-900 sm:text-4xl">
                  Apps for Everyone
                </h2>
                <p className="mt-4 text-zinc-600 text-lg">
                  Cleaners get a simple checklist app. Managers get a full dashboard with reports and analytics. Both native iOS for the best experience.
                </p>
                <ul className="mt-8 space-y-4">
                  {[
                    "AI-powered camera counting",
                    "Offline-capable",
                    "Real-time sync",
                    "Push notifications",
                  ].map((feature) => (
                    <li key={feature} className="flex items-center gap-3 text-zinc-700">
                      <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-100/50 to-transparent rounded-3xl blur-2xl" />
                <div className="relative bg-white rounded-3xl p-8 border border-zinc-200 shadow-lg">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-zinc-50 rounded-2xl p-4 border border-zinc-200">
                      <Package className="h-8 w-8 text-emerald-600 mb-3" />
                      <div className="text-zinc-900 font-semibold">Cleaners App</div>
                      <div className="text-sm text-zinc-500">Quick inventory counts</div>
                    </div>
                    <div className="bg-zinc-50 rounded-2xl p-4 border border-zinc-200">
                      <TrendingUp className="h-8 w-8 text-emerald-600 mb-3" />
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
        <section className="border-t border-zinc-200">
          <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-600 to-emerald-700 p-8 sm:p-16">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
              <div className="relative text-center">
                <h2 className="text-3xl font-bold text-white sm:text-4xl">
                  Ready to Streamline Your Inventory?
                </h2>
                <p className="mt-4 text-emerald-100 text-lg max-w-2xl mx-auto">
                  Join property managers who&apos;ve eliminated stockouts and saved hours every week.
                </p>
                <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
                  <HeroAuthButtons />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-zinc-200">
          <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
            <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
              <div className="flex items-center gap-2">
                <Image src="/logo.png" alt="Rental Helper" width={24} height={24} className="h-6 w-6" />
                <span className="text-lg font-semibold text-zinc-900">Rental Helper</span>
              </div>
              <div className="text-sm text-zinc-500">
                Built for short-term rental hosts
              </div>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
