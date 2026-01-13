import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ClerkProviderWrapper } from "@/components/providers/ClerkProviderWrapper";
import { ServiceWorkerRegistration } from "@/components/providers/ServiceWorkerRegistration";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "StockBnB - Inventory Management for Short Term Rentals",
  description: "A Shopify-style inventory management system for STRs",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "StockBnB",
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: "/favicon.png",
    apple: "/icons/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#047857",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-zinc-50`}
      >
        <ClerkProviderWrapper>{children}</ClerkProviderWrapper>
        <ServiceWorkerRegistration />
      </body>
    </html>
  );
}
