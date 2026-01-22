'use client';

import { Loader2 } from 'lucide-react';
import { CleanerSessionProvider, useCleanerSession } from './CleanerSessionProvider';
import { JoinScreen } from './JoinScreen';
import { PropertyList } from './PropertyList';

function CleanerContent() {
  const { session, isLoading } = useCleanerSession();

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  if (!session) {
    return <JoinScreen />;
  }

  return <PropertyList />;
}

export function CleanerApp() {
  return (
    <CleanerSessionProvider>
      <CleanerContent />
    </CleanerSessionProvider>
  );
}
