'use client';

import { Construction, Loader2 } from 'lucide-react';
import { ProtectedShell } from '@/components/layout/protected-shell';
import { Topbar } from '@/components/layout/topbar';
import { useAdminSettings } from '@/hooks/use-admin-data';

interface SettingRow {
  key: string;
  label: string;
  format?: (v: unknown) => string;
}

const ROWS: SettingRow[] = [
  { key: 'restaurant.name', label: 'Restaurant name' },
  { key: 'restaurant.tagline', label: 'Tagline' },
  { key: 'restaurant.currency', label: 'Currency' },
  {
    key: 'restaurant.vatPercent',
    label: 'VAT %',
    format: (v) => `${v}%`,
  },
  {
    key: 'restaurant.serviceChargePercent',
    label: 'Service charge %',
    format: (v) => `${v}%`,
  },
  {
    key: 'restaurant.minOrderAmount',
    label: 'Min order',
    format: (v) => `$${Number(v).toFixed(2)}`,
  },
  {
    key: 'restaurant.defaultDeliveryFee',
    label: 'Delivery fee',
    format: (v) => `$${Number(v).toFixed(2)}`,
  },
];

export default function SettingsPage() {
  const { data, isLoading } = useAdminSettings();
  return (
    <ProtectedShell>
      <Topbar
        title="Settings"
        subtitle="Restaurant configuration."
        trailing={
          <div className="bg-warning/10 text-warning border-warning/30 hidden items-center gap-2 rounded-full border px-3 py-1.5 text-xs sm:inline-flex">
            <Construction className="size-3.5" />
            Read-only · editor lands in Sprint 5.1
          </div>
        }
      />

      <main className="flex-1 px-6 py-8 sm:px-8">
        {isLoading ? (
          <div className="text-muted flex items-center justify-center gap-2 py-20 text-sm">
            <Loader2 className="size-4 animate-spin" /> Loading…
          </div>
        ) : (
          <div className="bg-surface/40 border-border max-w-2xl overflow-hidden rounded-2xl border">
            <ul className="divide-border divide-y">
              {ROWS.map((row) => {
                const raw = data?.[row.key];
                const formatted =
                  raw === undefined || raw === null
                    ? '—'
                    : row.format
                      ? row.format(raw)
                      : String(raw);
                return (
                  <li key={row.key} className="flex items-baseline justify-between gap-4 px-6 py-4">
                    <div>
                      <p className="text-foreground text-sm font-medium">{row.label}</p>
                      <p className="text-muted font-mono text-[10px]">{row.key}</p>
                    </div>
                    <span className="text-foreground font-display text-lg tabular-nums">
                      {formatted}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        {data?.['restaurant.workingHours'] !== undefined && (
          <div className="bg-surface/40 border-border mt-6 max-w-2xl rounded-2xl border p-6">
            <p className="text-muted text-[10px] tracking-[0.18em] uppercase">Working hours</p>
            <pre className="text-muted mt-2 overflow-x-auto font-mono text-xs">
              {JSON.stringify(data['restaurant.workingHours'], null, 2)}
            </pre>
          </div>
        )}
      </main>
    </ProtectedShell>
  );
}
