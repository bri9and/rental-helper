'use client';

import { useState } from 'react';
import {
  Users,
  UserPlus,
  Copy,
  Check,
  Clock,
  Trash2,
  Mail,
  Phone,
  Loader2,
  RefreshCw,
  KeyRound,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, Button } from '@/components/ui';
import { useRouter } from 'next/navigation';

interface Cleaner {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  status: string;
  lastActiveAt?: string;
  createdAt: string;
}

interface Invitation {
  id: string;
  code: string;
  status: string;
  cleanerName?: string;
  expiresAt: string;
  createdAt: string;
}

interface TeamPageClientProps {
  initialData: {
    cleaners: Cleaner[];
    invitations: Invitation[];
  };
}

export function TeamPageClient({ initialData }: TeamPageClientProps) {
  const router = useRouter();
  const [cleaners, setCleaners] = useState(initialData.cleaners);
  const [invitations, setInvitations] = useState(initialData.invitations);
  const [isCreating, setIsCreating] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [revoking, setRevoking] = useState<string | null>(null);

  const pendingInvitations = invitations.filter(i => i.status === 'pending');
  const activeCleaners = cleaners.filter(c => c.status === 'active');

  const handleCreateInvitation = async () => {
    setIsCreating(true);
    try {
      const res = await fetch('/api/invitations', { method: 'POST' });
      const data = await res.json();
      if (data.invitation) {
        setInvitations(prev => [data.invitation, ...prev]);
      }
    } catch (error) {
      console.error('Failed to create invitation:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleCopyCode = async (code: string) => {
    await navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleRevokeInvitation = async (code: string) => {
    setRevoking(code);
    try {
      const res = await fetch(`/api/invitations/${code}`, { method: 'DELETE' });
      if (res.ok) {
        setInvitations(prev =>
          prev.map(inv => (inv.code === code ? { ...inv, status: 'revoked' } : inv))
        );
      }
    } catch (error) {
      console.error('Failed to revoke invitation:', error);
    } finally {
      setRevoking(null);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    return 'Just now';
  };

  const isExpired = (expiresAt: string) => {
    return new Date(expiresAt) < new Date();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Cleaning Team</h1>
          <p className="text-zinc-500">
            Manage your cleaning crew and send invitations
          </p>
        </div>
        <Button onClick={handleCreateInvitation} disabled={isCreating}>
          {isCreating ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <UserPlus className="h-4 w-4 mr-2" />
          )}
          Invite Cleaner
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <Users className="h-8 w-8 text-emerald-500" />
            <div>
              <p className="text-2xl font-bold text-zinc-900">
                {activeCleaners.length}
              </p>
              <p className="text-xs text-zinc-500">Active Cleaners</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <KeyRound className="h-8 w-8 text-amber-500" />
            <div>
              <p className="text-2xl font-bold text-zinc-900">
                {pendingInvitations.length}
              </p>
              <p className="text-xs text-zinc-500">Pending Invitations</p>
            </div>
          </CardContent>
        </Card>
        <Card className="hidden md:block">
          <CardContent className="p-4 flex items-center gap-3">
            <RefreshCw className="h-8 w-8 text-blue-500" />
            <div>
              <p className="text-2xl font-bold text-zinc-900">
                {invitations.filter(i => i.status === 'accepted').length}
              </p>
              <p className="text-xs text-zinc-500">Accepted Invitations</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pending Invitations */}
      {pendingInvitations.length > 0 && (
        <Card className="border-amber-200 bg-amber-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-800">
              <KeyRound className="h-5 w-5" />
              Pending Invitations
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {pendingInvitations.map(inv => (
              <div
                key={inv.id}
                className="flex items-center justify-between bg-white rounded-lg p-4 border border-amber-200"
              >
                <div>
                  <div className="flex items-center gap-3">
                    <code className="text-2xl font-mono font-bold tracking-widest text-zinc-900">
                      {inv.code}
                    </code>
                    <button
                      onClick={() => handleCopyCode(inv.code)}
                      className="p-2 rounded-lg hover:bg-zinc-100 text-zinc-500"
                    >
                      {copiedCode === inv.code ? (
                        <Check className="h-4 w-4 text-emerald-600" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  <p className="text-sm text-zinc-500 mt-1">
                    {isExpired(inv.expiresAt) ? (
                      <span className="text-red-600">Expired</span>
                    ) : (
                      <>Expires {formatDate(inv.expiresAt)}</>
                    )}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRevokeInvitation(inv.code)}
                  disabled={revoking === inv.code}
                >
                  {revoking === inv.code ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4 text-zinc-400 hover:text-red-500" />
                  )}
                </Button>
              </div>
            ))}
            <p className="text-sm text-amber-700 mt-2">
              Share these codes with your cleaners. They can join at{' '}
              <code className="bg-amber-100 px-1 rounded">
                {typeof window !== 'undefined' ? window.location.origin : ''}/cleaner
              </code>
            </p>
          </CardContent>
        </Card>
      )}

      {/* Team Members */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-emerald-600" />
            Team Members
          </CardTitle>
        </CardHeader>
        <CardContent>
          {activeCleaners.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-zinc-300 mx-auto mb-4" />
              <h3 className="font-semibold text-zinc-900 mb-2">No team members yet</h3>
              <p className="text-sm text-zinc-500 mb-4">
                Create an invitation and share the code with your cleaning crew.
              </p>
              <Button onClick={handleCreateInvitation} disabled={isCreating}>
                {isCreating ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <UserPlus className="h-4 w-4 mr-2" />
                )}
                Create Invitation
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {activeCleaners.map(cleaner => (
                <div
                  key={cleaner.id}
                  className="flex items-center justify-between p-4 rounded-lg bg-zinc-50 border border-zinc-200"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center">
                      <span className="text-lg font-semibold text-emerald-700">
                        {cleaner.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="font-semibold text-zinc-900">{cleaner.name}</p>
                      <div className="flex items-center gap-3 text-sm text-zinc-500">
                        {cleaner.email && (
                          <span className="flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {cleaner.email}
                          </span>
                        )}
                        {cleaner.phone && (
                          <span className="flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {cleaner.phone}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1 text-sm text-zinc-500">
                      <Clock className="h-3 w-3" />
                      {cleaner.lastActiveAt
                        ? formatTime(cleaner.lastActiveAt)
                        : 'Never active'}
                    </div>
                    <p className="text-xs text-zinc-400">
                      Joined {formatDate(cleaner.createdAt)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Invitation History */}
      {invitations.filter(i => i.status !== 'pending').length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-zinc-500">Invitation History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {invitations
                .filter(i => i.status !== 'pending')
                .slice(0, 10)
                .map(inv => (
                  <div
                    key={inv.id}
                    className="flex items-center justify-between py-2 border-b border-zinc-100 last:border-0"
                  >
                    <div className="flex items-center gap-3">
                      <code className="text-sm font-mono text-zinc-500">{inv.code}</code>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full ${
                          inv.status === 'accepted'
                            ? 'bg-emerald-100 text-emerald-700'
                            : inv.status === 'expired'
                            ? 'bg-zinc-100 text-zinc-500'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {inv.status}
                      </span>
                    </div>
                    <div className="text-sm text-zinc-500">
                      {inv.cleanerName && <span className="mr-2">{inv.cleanerName}</span>}
                      {formatDate(inv.createdAt)}
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
