'use client';

import type { OrderStatus } from '@/lib/api-types';
import { cn } from '@/lib/utils';

const STYLES: Record<OrderStatus, string> = {
  PENDING: 'border-warning/40 text-warning bg-warning/10',
  CONFIRMED: 'border-info/40 text-info bg-info/10',
  PREPARING: 'border-primary/40 text-primary bg-primary/10',
  READY: 'border-primary/60 text-primary bg-primary/15',
  OUT_FOR_DELIVERY: 'border-primary/60 text-primary bg-primary/15',
  DELIVERED: 'border-success/40 text-success bg-success/10',
  CANCELLED: 'border-accent/40 text-accent bg-accent/10',
};

const LABELS: Record<OrderStatus, string> = {
  PENDING: 'Pending',
  CONFIRMED: 'Confirmed',
  PREPARING: 'Preparing',
  READY: 'Ready',
  OUT_FOR_DELIVERY: 'On the way',
  DELIVERED: 'Delivered',
  CANCELLED: 'Cancelled',
};

interface Props {
  status: OrderStatus;
  className?: string;
  pulse?: boolean;
}

export function StatusBadge({ status, className, pulse }: Props) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10px] font-medium tracking-wide uppercase',
        STYLES[status],
        className,
      )}
    >
      {pulse && <span className="inline-block size-1.5 animate-pulse rounded-full bg-current" />}
      {LABELS[status]}
    </span>
  );
}
