'use client';

import { Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface StepperInputProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  className?: string;
}

export function StepperInput({
  value,
  onChange,
  min = 0,
  max = 999,
  className,
}: StepperInputProps) {
  const decrement = () => {
    if (value > min) {
      onChange(value - 1);
    }
  };

  const increment = () => {
    if (value < max) {
      onChange(value + 1);
    }
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <button
        type="button"
        onClick={decrement}
        disabled={value <= min}
        className="flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-100 text-zinc-700 transition-colors hover:bg-zinc-200 active:bg-zinc-300 disabled:opacity-50"
      >
        <Minus className="h-5 w-5" />
      </button>
      <input
        type="number"
        value={value}
        onChange={(e) => {
          const newValue = parseInt(e.target.value) || 0;
          onChange(Math.max(min, Math.min(max, newValue)));
        }}
        className="h-12 w-20 rounded-xl border border-zinc-200 bg-white text-center text-xl font-bold text-zinc-900 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600"
        min={min}
        max={max}
      />
      <button
        type="button"
        onClick={increment}
        disabled={value >= max}
        className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 transition-colors hover:bg-emerald-200 active:bg-emerald-300 disabled:opacity-50"
      >
        <Plus className="h-5 w-5" />
      </button>
    </div>
  );
}
