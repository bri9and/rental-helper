'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2, Loader2 } from 'lucide-react';

interface ResetUserButtonProps {
  userId: string;
}

export function ResetUserButton({ userId }: ResetUserButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleReset = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/super-admin/reset-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to reset user');
      }

      // Success - redirect back to users list
      router.push('/super-admin');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setLoading(false);
    }
  };

  if (showConfirm) {
    return (
      <div className="space-y-4">
        <div className="p-4 rounded-lg bg-rose-950/50 border border-rose-900">
          <p className="text-rose-200 font-medium">Are you sure?</p>
          <p className="text-rose-300/70 text-sm mt-1">
            This will permanently delete all properties, inventory, reports, and supply requests for this user.
          </p>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-rose-900/50 text-rose-200 text-sm">
            {error}
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={handleReset}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white text-sm font-medium"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
            {loading ? 'Resetting...' : 'Yes, Reset User'}
          </button>
          <button
            onClick={() => setShowConfirm(false)}
            disabled={loading}
            className="px-4 py-2 rounded-lg bg-zinc-700 hover:bg-zinc-600 text-white text-sm font-medium"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={() => setShowConfirm(true)}
      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-sm font-medium"
    >
      <Trash2 className="h-4 w-4" />
      Reset User
    </button>
  );
}
