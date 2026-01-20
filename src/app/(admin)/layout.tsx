import { LayoutDashboard, Home, Settings, ClipboardList, Bell } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import packageJson from "../../../package.json";

const navItems = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/properties", label: "Properties", icon: Home },
  { href: "/admin/supply-requests", label: "Requests", icon: Bell },
  { href: "/admin/reports", label: "Reports", icon: ClipboardList },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Mobile Header */}
      <header className="fixed top-0 left-0 right-0 z-40 flex h-14 items-center justify-between border-b border-zinc-200 bg-white px-4 md:hidden">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/logo.png" alt="Rental Helper" width={32} height={32} className="h-8 w-8" />
          <span className="text-lg font-semibold text-zinc-900">Rental Helper</span>
        </Link>
        <Link href="/admin/settings" className="p-2 text-zinc-600">
          <Settings className="h-5 w-5" />
        </Link>
      </header>

      {/* Desktop Sidebar */}
      <aside className="fixed left-0 top-0 z-40 hidden h-screen w-64 border-r border-zinc-200 bg-white md:block">
        {/* Logo */}
        <Link href="/" className="flex h-16 items-center gap-2 border-b border-zinc-200 px-6">
          <Image src="/logo.png" alt="Rental Helper" width={32} height={32} className="h-8 w-8" />
          <span className="text-xl font-semibold text-zinc-900">Rental Helper</span>
        </Link>

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

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 flex h-16 items-center justify-around border-t border-zinc-200 bg-white md:hidden">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex flex-col items-center gap-1 px-3 py-2 text-zinc-600"
          >
            <item.icon className="h-5 w-5" />
            <span className="text-xs">{item.label}</span>
          </Link>
        ))}
      </nav>

      {/* Main content */}
      <main className="pt-14 pb-20 md:pt-0 md:pb-0 md:pl-64">
        <div className="p-4 md:p-8">{children}</div>
      </main>

      {/* Version number */}
      <div className="fixed bottom-2 right-2 text-[10px] text-zinc-400 md:bottom-4 md:right-4">
        v{packageJson.version}
      </div>
    </div>
  );
}
