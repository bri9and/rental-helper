'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Bath,
  UtensilsCrossed,
  Bed,
  Sofa,
  Package,
  AlertCircle,
  CheckCircle2,
  Loader2,
  MessageSquare,
  Sparkles,
  ArrowLeft,
} from "lucide-react";
import { Card, CardContent, Button } from "@/components/ui";
import { submitCleaningReport } from "@/lib/actions/cleaner";

interface Supply {
  sku: string;
  name: string;
  parLevel: number;
}

interface CleanerFormProps {
  propertyId: string;
  propertyName: string;
  ownerId: string;
  supplies: Supply[];
  cleanerId: string;
  cleanerName: string; // For display only, server validates from DB
}

const ROOMS = [
  { id: 'bathrooms', label: 'Bathrooms', icon: Bath, color: 'blue' },
  { id: 'kitchen', label: 'Kitchen', icon: UtensilsCrossed, color: 'orange' },
  { id: 'bedrooms', label: 'Bedrooms', icon: Bed, color: 'purple' },
  { id: 'livingSpace', label: 'Living Space', icon: Sofa, color: 'emerald' },
] as const;

type RoomId = typeof ROOMS[number]['id'];

export function CleanerForm({ propertyId, propertyName, ownerId, supplies, cleanerId, cleanerName }: CleanerFormProps) {
  const router = useRouter();
  const [checklist, setChecklist] = useState<Record<RoomId, boolean>>({
    bathrooms: false,
    kitchen: false,
    bedrooms: false,
    livingSpace: false,
  });
  const [lowSupplies, setLowSupplies] = useState<Record<string, boolean>>({});
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const allRoomsChecked = Object.values(checklist).every(Boolean);
  const checkedCount = Object.values(checklist).filter(Boolean).length;
  const lowSupplyCount = Object.values(lowSupplies).filter(Boolean).length;

  const toggleRoom = (roomId: RoomId) => {
    setChecklist(prev => ({ ...prev, [roomId]: !prev[roomId] }));
  };

  const toggleSupply = (sku: string) => {
    setLowSupplies(prev => ({ ...prev, [sku]: !prev[sku] }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    const lowSupplyItems = supplies
      .filter(s => lowSupplies[s.sku])
      .map(s => ({ sku: s.sku, name: s.name }));

    // Server validates cleanerId and propertyId relationship
    // ownerId, propertyName, cleanerName are looked up server-side
    const result = await submitCleaningReport({
      propertyId,
      cleanerId,
      checklist,
      lowSupplies: lowSupplyItems,
      notes: notes.trim() || undefined,
    });

    setLoading(false);

    if (result.success) {
      setSubmitted(true);
    } else {
      setError(result.error || "Failed to submit report");
    }
  };

  // Success screen
  if (submitted) {
    return (
      <div className="text-center py-8">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-emerald-100 mb-6">
          <CheckCircle2 className="h-10 w-10 text-emerald-600" />
        </div>
        <h2 className="text-2xl font-bold text-zinc-900 mb-2">All Done!</h2>
        <p className="text-zinc-500 mb-2">Thanks, {cleanerName}!</p>
        <p className="text-zinc-500 mb-8">Your cleaning report has been submitted.</p>

        {lowSupplyCount > 0 && (
          <Card className="mb-6 border-blue-200 bg-blue-50">
            <CardContent className="p-4">
              <p className="text-sm text-blue-700">
                <AlertCircle className="inline h-4 w-4 mr-1" />
                {lowSupplyCount} low supply alert{lowSupplyCount > 1 ? 's' : ''} sent to manager
              </p>
            </CardContent>
          </Card>
        )}

        <Button
          onClick={() => router.push('/cleaner')}
          className="w-full"
          size="lg"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back to Properties
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <Card className="border-rose-200 bg-rose-50">
          <CardContent className="p-4 text-rose-700 text-sm">
            <AlertCircle className="inline h-4 w-4 mr-1" />
            {error}
          </CardContent>
        </Card>
      )}

      {/* Cleaning Checklist */}
      <div>
        <h2 className="text-lg font-semibold text-zinc-900 mb-3 flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-emerald-600" />
          Cleaning Checklist
        </h2>
        <div className="grid grid-cols-2 gap-3">
          {ROOMS.map((room) => {
            const isChecked = checklist[room.id];
            const Icon = room.icon;
            const colorClasses = {
              blue: isChecked ? 'border-blue-400 bg-blue-50' : 'border-zinc-200 hover:border-blue-200',
              orange: isChecked ? 'border-zinc-400 bg-zinc-100' : 'border-zinc-200 hover:border-zinc-300',
              purple: isChecked ? 'border-purple-400 bg-purple-50' : 'border-zinc-200 hover:border-purple-200',
              emerald: isChecked ? 'border-emerald-400 bg-emerald-50' : 'border-zinc-200 hover:border-emerald-200',
            };
            const iconColors = {
              blue: isChecked ? 'text-blue-600' : 'text-zinc-400',
              orange: isChecked ? 'text-zinc-700' : 'text-zinc-400',
              purple: isChecked ? 'text-purple-600' : 'text-zinc-400',
              emerald: isChecked ? 'text-emerald-600' : 'text-zinc-400',
            };

            return (
              <button
                key={room.id}
                type="button"
                onClick={() => toggleRoom(room.id)}
                className={`relative p-4 rounded-2xl border-2 transition-all ${colorClasses[room.color]}`}
              >
                <div className="flex flex-col items-center gap-2">
                  <Icon className={`h-8 w-8 ${iconColors[room.color]}`} />
                  <span className={`text-sm font-medium ${isChecked ? 'text-zinc-900' : 'text-zinc-600'}`}>
                    {room.label}
                  </span>
                </div>
                {isChecked && (
                  <div className="absolute top-2 right-2">
                    <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
        <p className="text-sm text-zinc-500 mt-2 text-center">
          {checkedCount} of {ROOMS.length} areas cleaned
        </p>
      </div>

      {/* Low Supplies */}
      {supplies.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-zinc-900 mb-3 flex items-center gap-2">
            <Package className="h-5 w-5 text-amber-600" />
            Low on Supplies?
          </h2>
          <Card>
            <CardContent className="p-2">
              <div className="divide-y divide-zinc-100">
                {supplies.map((supply) => {
                  const isLow = lowSupplies[supply.sku];
                  return (
                    <button
                      key={supply.sku}
                      type="button"
                      onClick={() => toggleSupply(supply.sku)}
                      className={`w-full flex items-center justify-between p-3 transition-colors ${
                        isLow ? 'bg-amber-50' : 'hover:bg-zinc-50'
                      }`}
                    >
                      <span className={`text-sm ${isLow ? 'font-medium text-amber-900' : 'text-zinc-700'}`}>
                        {supply.name}
                      </span>
                      <div className={`flex items-center justify-center w-6 h-6 rounded-full border-2 transition-colors ${
                        isLow ? 'border-amber-500 bg-amber-500' : 'border-zinc-300'
                      }`}>
                        {isLow && <AlertCircle className="h-4 w-4 text-white" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>
          {lowSupplyCount > 0 && (
            <p className="text-sm text-amber-600 mt-2 text-center">
              {lowSupplyCount} item{lowSupplyCount > 1 ? 's' : ''} will be reported as low
            </p>
          )}
        </div>
      )}

      {/* Notes */}
      <div>
        <h2 className="text-lg font-semibold text-zinc-900 mb-3 flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-zinc-500" />
          Notes for Manager
        </h2>
        <Card>
          <CardContent className="p-4">
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any issues, observations, or messages..."
              className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-zinc-900 placeholder:text-zinc-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 resize-none"
              rows={3}
            />
          </CardContent>
        </Card>
      </div>

      {/* Submit Button */}
      <div className="pt-4">
        <Button
          onClick={handleSubmit}
          disabled={loading || !allRoomsChecked}
          className="w-full py-6 text-lg"
          size="lg"
        >
          {loading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin mr-2" />
              Submitting...
            </>
          ) : allRoomsChecked ? (
            <>
              <CheckCircle2 className="h-5 w-5 mr-2" />
              Complete Cleaning
            </>
          ) : (
            <>
              Check all rooms to submit
            </>
          )}
        </Button>
        {!allRoomsChecked && (
          <p className="text-sm text-zinc-500 mt-2 text-center">
            Please check off all areas when cleaned
          </p>
        )}
      </div>
    </div>
  );
}
