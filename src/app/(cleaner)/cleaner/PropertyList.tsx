'use client';

import { useState, useEffect } from 'react';
import { MapPin, ChevronRight, Sparkles, LogOut, Loader2 } from 'lucide-react';
import { Card, CardContent, Button } from '@/components/ui';
import Link from 'next/link';
import { useCleanerSession } from './CleanerSessionProvider';

interface Property {
  id: string;
  name: string;
  address?: string;
}

export function PropertyList() {
  const { session, logout } = useCleanerSession();
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!session) return;

    const fetchProperties = async () => {
      try {
        const res = await fetch('/api/cleaner/properties', {
          headers: {
            'x-cleaner-id': session.id,
          },
        });

        if (!res.ok) {
          throw new Error('Failed to fetch properties');
        }

        const data = await res.json();
        setProperties(data.properties || []);
      } catch {
        setError('Failed to load properties');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProperties();
  }, [session]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
        <p className="text-zinc-500 mt-4">Loading properties...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 max-w-lg mx-auto">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6 text-center">
            <p className="text-red-600">{error}</p>
            <Button onClick={() => window.location.reload()} className="mt-4">
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-lg mx-auto">
      {/* Welcome Section */}
      <div className="text-center mb-6 pt-4">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-100 mb-4">
          <Sparkles className="h-8 w-8 text-emerald-600" />
        </div>
        <h1 className="text-2xl font-bold text-zinc-900">
          Welcome, {session?.name}!
        </h1>
        <p className="text-zinc-500 mt-2">Select a property to get started</p>
      </div>

      {/* Property List */}
      {properties.length > 0 ? (
        <div className="space-y-3">
          {properties.map((property) => (
            <Link key={property.id} href={`/cleaner/${property.id}`}>
              <Card className="transition-all hover:shadow-md active:scale-[0.98] border-emerald-100 hover:border-emerald-200">
                <CardContent className="flex items-center gap-4 p-4">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-sm">
                    <MapPin className="h-7 w-7 text-white" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-zinc-900 text-lg">
                      {property.name}
                    </p>
                    {property.address && (
                      <p className="truncate text-sm text-zinc-500 mt-0.5">
                        {property.address}
                      </p>
                    )}
                  </div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50">
                    <ChevronRight className="h-5 w-5 text-emerald-600" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <Card className="border-dashed border-2 border-zinc-200">
          <CardContent className="flex flex-col items-center py-12 text-center">
            <MapPin className="h-12 w-12 text-zinc-300" />
            <h3 className="mt-4 font-semibold text-zinc-900">
              No properties available
            </h3>
            <p className="mt-1 text-sm text-zinc-500">
              Your manager hasn&apos;t added any properties yet.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Logout button */}
      <div className="mt-8 pt-6 border-t border-zinc-200">
        <Button
          variant="secondary"
          onClick={logout}
          className="w-full text-zinc-500"
        >
          <LogOut className="h-4 w-4 mr-2" />
          Sign Out
        </Button>
      </div>
    </div>
  );
}
