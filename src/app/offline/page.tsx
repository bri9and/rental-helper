'use client';

import { WifiOff } from "lucide-react";
import { Card, CardContent } from "@/components/ui";

export default function OfflinePage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 p-4">
      <Card className="max-w-sm">
        <CardContent className="flex flex-col items-center py-12 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-zinc-100">
            <WifiOff className="h-8 w-8 text-zinc-400" />
          </div>
          <h1 className="mt-6 text-xl font-bold text-zinc-900">You're Offline</h1>
          <p className="mt-2 text-zinc-500">
            Please check your internet connection and try again.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="mt-6 rounded-lg bg-emerald-700 px-6 py-2 text-sm font-medium text-white hover:bg-emerald-800"
          >
            Try Again
          </button>
        </CardContent>
      </Card>
    </div>
  );
}
