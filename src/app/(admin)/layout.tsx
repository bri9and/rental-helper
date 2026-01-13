import { Package, LayoutDashboard, Home, Settings, ClipboardList } from "lucide-react";
import Link from "next/link";

const navItems = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/reports", label: "Reports", icon: ClipboardList },
  { href: "/admin/inventory", label: "Inventory", icon: Package },
  { href: "/admin/properties", label: "Properties", icon: Home },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-zinc-50">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-zinc-200 bg-white">
        {/* Logo */}
        <div className="flex h-16 items-center gap-2 border-b border-zinc-200 px-6">
          <Package className="h-8 w-8 text-emerald-700" />
          <span className="text-xl font-semibold text-zinc-900">StockBnB</span>
        </div>

        {/* Navigation */}
        <nav className="space-y-1 p-4">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-900"
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Settings at bottom */}
        <div className="absolute bottom-0 left-0 right-0 border-t border-zinc-200 p-4">
          <Link
            href="/admin/settings"
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-900"
          >
            <Settings className="h-5 w-5" />
            Settings
          </Link>
        </div>
      </aside>

      {/* Main content */}
      <main className="pl-64">
        <div className="p-8">{children}</div>
      </main>
    </div>
  );
}
