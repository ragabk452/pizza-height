'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { StatusBadge } from '@/components/ui/status-badge';
import type { DashboardStats } from '@/lib/api-types';

interface Props {
  rows: DashboardStats['recentOrders'] | undefined;
  loading?: boolean;
}

const TYPE_LABEL: Record<string, string> = {
  DELIVERY: 'Delivery',
  PICKUP: 'Pickup',
  DINE_IN: 'Dine in',
};

export function RecentOrdersTable({ rows, loading }: Props) {
  return (
    <div className="bg-surface/40 border-border rounded-2xl border">
      <div className="border-border flex items-center justify-between border-b px-6 py-4">
        <h3 className="font-display text-foreground text-lg">Recent orders</h3>
        <Link
          href="/orders"
          className="text-primary inline-flex items-center gap-1 text-xs hover:underline"
        >
          View all <ArrowRight className="size-3" />
        </Link>
      </div>

      {loading ? (
        <div className="space-y-2 px-6 py-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="bg-surface-elevated/60 h-10 animate-pulse rounded-lg" />
          ))}
        </div>
      ) : !rows || rows.length === 0 ? (
        <div className="text-muted px-6 py-10 text-center text-sm">No orders yet today.</div>
      ) : (
        <ul className="divide-border divide-y">
          {rows.map((row, i) => (
            <motion.li
              key={row.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04, duration: 0.3 }}
            >
              <Link
                href={`/orders?id=${row.id}`}
                className="hover:bg-surface/40 group flex items-center gap-3 px-6 py-3 transition-colors"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline gap-2">
                    <span className="text-foreground font-display tracking-wide">
                      {row.orderNumber}
                    </span>
                    <StatusBadge status={row.status} />
                  </div>
                  <p className="text-muted mt-0.5 text-xs">
                    {row.customerName} · {TYPE_LABEL[row.type] ?? row.type} · {row.itemCount}{' '}
                    {row.itemCount === 1 ? 'item' : 'items'}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-foreground font-display text-lg tabular-nums">
                    ${row.total.toFixed(2)}
                  </p>
                  <p className="text-muted text-[10px]">
                    {new Date(row.createdAt).toLocaleTimeString(undefined, {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
                <ArrowRight className="text-muted group-hover:text-primary size-4 shrink-0 transition-all group-hover:translate-x-1" />
              </Link>
            </motion.li>
          ))}
        </ul>
      )}
    </div>
  );
}
