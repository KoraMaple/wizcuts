'use client';

import { useMemo } from 'react';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';

export interface CalendarProps {
  value?: string; // YYYY-MM-DD
  onChange: (date: string) => void;
  minDate?: Date;
  maxDate?: Date;
}

function pad(n: number) {
  return n < 10 ? `0${n}` : `${n}`;
}

// Convert Date -> YYYY-MM-DD using local time (no UTC shift)
function toLocalYMD(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

// Parse YYYY-MM-DD to a Date at local midnight
function fromLocalYMD(ymd: string): Date {
  const [y, m, d] = ymd.split('-').map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
}

export default function Calendar({
  value,
  onChange,
  minDate,
  maxDate,
}: CalendarProps) {
  const selected = useMemo(
    () => (value ? fromLocalYMD(value) : undefined),
    [value]
  );

  // Defaults: from tomorrow to +30 days
  const today = new Date();
  const defaultFrom = new Date(today);
  defaultFrom.setDate(today.getDate() + 1);
  const defaultTo = new Date(today);
  defaultTo.setDate(today.getDate() + 30);

  const from = minDate ?? defaultFrom;
  const to = maxDate ?? defaultTo;

  return (
    <div className="rdp-theme w-full">
      <DayPicker
        mode="single"
        selected={selected}
        onSelect={(d: Date | undefined) => {
          if (!d) return;
          onChange(toLocalYMD(d));
        }}
        fromDate={from}
        toDate={to}
        disabled={{
          dayOfWeek: [0], // disable Sundays
        }}
        styles={{
          caption: { color: '#f5e6c8' },
          head: { color: '#cbd5e1' },
          day: { color: '#e2e8f0' },
          nav_button: { color: '#f59e0b' },
        }}
        className="rounded-xl border border-slate-700 bg-slate-800/40 p-2"
      />
      <style jsx global>{`
        .rdp-theme .rdp-day_selected,
        .rdp-theme .rdp-day_selected:focus-visible,
        .rdp-theme .rdp-day_selected:hover {
          background: linear-gradient(to right, #f59e0b, #d97706);
          color: #0f172a;
        }
        .rdp-theme .rdp-day_disabled {
          opacity: 0.35;
        }
        .rdp-theme .rdp {
          --rdp-accent-color: #f59e0b;
          --rdp-background-color: transparent;
          --rdp-outline: 2px solid rgba(245, 158, 11, 0.5);
          --rdp-outline-selected: 2px solid rgba(245, 158, 11, 0.8);
          --rdp-outline-color: rgba(245, 158, 11, 0.4);
        }
      `}</style>
    </div>
  );
}
