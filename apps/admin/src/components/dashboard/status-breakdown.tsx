'use client';

import { motion } from 'framer-motion';
import type { OrderStatus } from '@/lib/api-types';

const STATUS_ROWS: Array<{
  key: OrderStatus;
  label: string;
  color: string;
}> = [
  { key: 'PENDING', label: 'Pending', color: 'var(--warning)' },
  { key: 'CONFIRMED', label: 'Confirmed', color: 'var(--info)' },
  { key: 'PREPARING', label: 'Preparing', color: 'var(--primary)' },
  { key: 'READY', label: 'Ready', color: 'var(--primary)' },
  { key: 'OUT_FOR_DELIVERY', label: 'On the way', color: 'var(--primary)' },
  { key: 'DELIVERED', label: 'Delivered', color: 'var(--success)' },
  { key: 'CANCELLED', label: 'Cancelled', color: 'var(--accent)' },
];

interface Props {
  counts: Record<OrderStatus, number> | undefined;
  loading?: boolean;
}

export function StatusBreakdown({ counts, loading }: Props) {
  const max = counts ? Math.max(...Object.values(counts), 1) : 1;

  return (
    <div className="bg-surface/40 border-border rounded-2xl border p-6">
      <div className="flex items-baseline justify-between">
        <h3 className="font-display text-foreground text-lg">Today by status</h3>
        <span className="text-muted text-xs">Updates live as orders move</span>
      </div>
      <ul className="mt-5 space-y-3">
        {STATUS_ROWS.map((row) => {
          const count = counts?.[row.key] ?? 0;
          const widthPct = loading ? 0 : (count / max) * 100;
          return (
            <li key={row.key} className="flex items-center gap-3">
              <span className="text-foreground w-28 shrink-0 text-xs">{row.label}</span>
              <div className="bg-surface-elevated relative h-2 flex-1 overflow-hidden rounded-full">
                <motion.span
                  initial={{ width: '0%' }}
                  animate={{ width: `${widthPct}%` }}
                  transition={{ duration: 0.6, ease: 'easeOut' }}
                  style={{ background: row.color }}
                  className="absolute inset-y-0 left-0 rounded-full"
                />
              </div>
              <span className="text-foreground w-8 shrink-0 text-right font-mono text-sm tabular-nums">
                {count}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
