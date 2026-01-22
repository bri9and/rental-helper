'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, ShieldAlert } from 'lucide-react';
import { Card, CardContent } from '@/components/ui';
import { CleanerForm } from './CleanerForm';

interface Supply {
  sku: string;
  name: string;
  parLevel: number;
}

interface PropertyData {
  property: {
    _id: string;
    name: string;
    address?: string;
    ownerId: string;
  };
  supplies: Supply[];
}

interface PropertyPageClientProps {
  data: PropertyData;
}

interface CleanerSession {
  id: string;
  name: string;
  managerId: string;
}

const STORAGE_KEY = 'cleaner_session';

export function PropertyPageClient({ data }: PropertyPageClientProps) {
  const router = useRouter();
  const [session, setSession] = useState<CleanerSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as CleanerSession;
        setSession(parsed);

        // Critical security check: verify cleaner's managerId matches property's ownerId
        if (parsed.managerId === data.property.ownerId) {
          setIsAuthorized(true);
        } else {
          // Cleaner is trying to access a property that doesn't belong to their manager
          setIsAuthorized(false);
        }
      } catch {
        // Invalid session, redirect to cleaner home
        router.replace('/cleaner');
        return;
      }
    } else {
      // No session, redirect to cleaner home
      router.replace('/cleaner');
      return;
    }
    setIsLoading(false);
  }, [router, data.property.ownerId]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  if (!session) {
    return null;
  }

  // Security: Block unauthorized property access
  if (!isAuthorized) {
    return (
      <div className="p-4 max-w-lg mx-auto">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="flex flex-col items-center py-12 text-center">
            <ShieldAlert className="h-12 w-12 text-red-400 mb-4" />
            <h3 className="font-semibold text-red-900 mb-2">Access Denied</h3>
            <p className="text-sm text-red-700">
              You don&apos;t have permission to access this property.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-lg mx-auto">
      {/* Property Header */}
      <div className="mb-6">
        <h1 className="text-xl font-bold text-zinc-900">{data.property.name}</h1>
        {data.property.address && (
          <p className="text-sm text-zinc-500 mt-1">{data.property.address}</p>
        )}
        <p className="text-sm text-emerald-600 mt-1">Cleaning as: {session.name}</p>
      </div>

      <CleanerForm
        propertyId={data.property._id}
        propertyName={data.property.name}
        ownerId={data.property.ownerId}
        supplies={data.supplies}
        cleanerId={session.id}
        cleanerName={session.name}
      />
    </div>
  );
}
