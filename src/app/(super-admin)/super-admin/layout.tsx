import { redirect } from "next/navigation";
import { getAuthUserId } from "@/lib/auth";
import Link from "next/link";
import Image from "next/image";
import { Shield, Users, CreditCard, BarChart3, Settings } from "lucide-react";

// Only these user IDs can access super admin
const SUPER_ADMIN_IDS = [
  "user_386HVlYdKRRJsxiIsbOdAKHWUC8", // sebastian.kiely@gmail.com
];

const navItems = [
  { href: "/super-admin", label: "Dashboard", icon: BarChart3 },
  { href: "/super-admin/users", label: "Users", icon: Users },
  { href: "/super-admin/billing", label: "Billing", icon: CreditCard },
  { href: "/super-admin/settings", label: "Settings", icon: Settings },
];

export default async function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const userId = await getAuthUserId();

  if (!userId || !SUPER_ADMIN_IDS.includes(userId)) {
    redirect("/");
  }

  return (
    <div className="min-h-screen bg-zinc-900">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-zinc-800 bg-zinc-900">
        {/* Logo */}
        <div className="flex h-16 items-center gap-3 border-b border-zinc-800 px-6">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-rose-600">
            <Shield className="h-5 w-5 text-white" />
          </div>
          <div>
            <span className="text-lg font-semibold text-white">Super Admin</span>
            <p className="text-xs text-zinc-500">Rental Helper</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="space-y-1 p-4">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-white"
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Back to app */}
        <div className="absolute bottom-0 left-0 right-0 border-t border-zinc-800 p-4">
          <Link
            href="/admin/dashboard"
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-zinc-500 transition-colors hover:bg-zinc-800 hover:text-white"
          >
            <Image src="/logo.png" alt="App" width={20} height={20} className="h-5 w-5" />
            Back to App
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
