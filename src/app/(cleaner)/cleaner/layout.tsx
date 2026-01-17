import Image from "next/image";
import Link from "next/link";

export default function CleanerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white">
      {/* Mobile Header - Simple and clean */}
      <header className="sticky top-0 z-40 border-b border-emerald-100 bg-white/80 backdrop-blur-sm">
        <div className="flex h-14 items-center justify-center px-4">
          <Link href="/cleaner" className="flex items-center gap-2">
            <Image src="/logo.png" alt="Rental Helper" width={28} height={28} className="h-7 w-7" />
            <span className="text-lg font-semibold text-zinc-900">Cleaner Portal</span>
          </Link>
        </div>
      </header>

      {/* Main content - Full width, mobile optimized */}
      <main className="pb-8">{children}</main>
    </div>
  );
}
