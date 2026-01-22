'use client';

import { useState } from 'react';
import { KeyRound, User, Mail, Phone, Loader2, CheckCircle } from 'lucide-react';
import { Card, CardContent, Button, Input, Label } from '@/components/ui';
import { useCleanerSession } from './CleanerSessionProvider';

type Step = 'code' | 'details';

export function JoinScreen() {
  const { login } = useCleanerSession();
  const [step, setStep] = useState<Step>('code');
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isValid, setIsValid] = useState(false);

  const handleValidateCode = async () => {
    if (!code.trim()) {
      setError('Please enter an invitation code');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const res = await fetch(`/api/invitations/validate/${code.toUpperCase()}`);
      const data = await res.json();

      if (data.valid) {
        setIsValid(true);
        setStep('details');
      } else {
        setError(data.error || 'Invalid invitation code');
      }
    } catch {
      setError('Failed to validate code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoin = async () => {
    if (!name.trim()) {
      setError('Please enter your name');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const res = await fetch('/api/invitations/accept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: code.toUpperCase(),
          name: name.trim(),
          email: email.trim() || undefined,
          phone: phone.trim() || undefined,
        }),
      });

      const data = await res.json();

      if (data.success) {
        login(data.cleaner.id, data.cleaner.name, data.cleaner.managerId);
      } else {
        setError(data.error || 'Failed to join. Please try again.');
      }
    } catch {
      setError('Failed to join. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 max-w-md mx-auto">
      <div className="text-center mb-8 pt-8">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-emerald-100 mb-4">
          <KeyRound className="h-10 w-10 text-emerald-600" />
        </div>
        <h1 className="text-2xl font-bold text-zinc-900">Join as Cleaner</h1>
        <p className="text-zinc-500 mt-2">
          {step === 'code'
            ? 'Enter the invitation code from your manager'
            : 'Almost there! Tell us about yourself'}
        </p>
      </div>

      {step === 'code' ? (
        <Card>
          <CardContent className="p-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="code">Invitation Code</Label>
              <Input
                id="code"
                placeholder="Enter 6-digit code"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                maxLength={6}
                className="text-center text-2xl font-mono tracking-widest uppercase"
                disabled={isLoading}
              />
            </div>

            {error && (
              <p className="text-sm text-red-600 text-center">{error}</p>
            )}

            <Button
              onClick={handleValidateCode}
              disabled={isLoading || code.length < 6}
              className="w-full"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Validating...
                </>
              ) : (
                'Continue'
              )}
            </Button>

            <p className="text-xs text-zinc-400 text-center">
              Don&apos;t have a code? Ask your property manager for an invitation.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-6 space-y-4">
            {isValid && (
              <div className="flex items-center gap-2 p-3 bg-emerald-50 rounded-lg text-emerald-700 text-sm">
                <CheckCircle className="h-4 w-4" />
                <span>Valid invitation code: <strong>{code}</strong></span>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="name">
                <User className="h-4 w-4 inline mr-1" />
                Your Name *
              </Label>
              <Input
                id="name"
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">
                <Mail className="h-4 w-4 inline mr-1" />
                Email (optional)
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">
                <Phone className="h-4 w-4 inline mr-1" />
                Phone (optional)
              </Label>
              <Input
                id="phone"
                type="tel"
                placeholder="(555) 123-4567"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                disabled={isLoading}
              />
            </div>

            {error && (
              <p className="text-sm text-red-600 text-center">{error}</p>
            )}

            <div className="flex gap-3">
              <Button
                variant="secondary"
                onClick={() => setStep('code')}
                disabled={isLoading}
              >
                Back
              </Button>
              <Button
                onClick={handleJoin}
                disabled={isLoading || !name.trim()}
                className="flex-1"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Joining...
                  </>
                ) : (
                  'Join Team'
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
