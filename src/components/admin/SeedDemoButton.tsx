'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export function SeedDemoButton() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSeed() {
    setLoading(true);
    try {
      const res = await fetch('/api/seed-demo', { method: 'POST' });
      if (res.ok) {
        router.refresh();
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleSeed}
      disabled={loading}
      className="inline-flex h-10 items-center rounded-lg border border-zinc-300 bg-white px-4 text-sm font-medium text-zinc-700 hover:bg-zinc-50 disabled:opacity-50"
    >
      {loading ? 'Loading...' : 'Load Demo Data'}
    </button>
  );
}
