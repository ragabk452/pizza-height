'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface Props {
  /** ISO timestamp the order was placed. */
  startedAt: string;
  className?: string;
}

/**
 * Live "X min Y sec" counter that ticks every 5 seconds and color-shifts as
 * the wait time stretches. The two thresholds (10 / 20 minutes) match what
 * the dashboard considers "fresh" vs "running long".
 */
export function ElapsedTime({ startedAt, className }: Props) {
  const startedMs = new Date(startedAt).getTime();
  // Recompute on tick — useState init runs once, the interval drives updates.
  const [elapsed, setElapsed] = useState(() => Date.now() - startedMs);
  useEffect(() => {
    const id = setInterval(() => setElapsed(Date.now() - startedMs), 5_000);
    return () => clearInterval(id);
  }, [startedMs]);

  const minutes = Math.max(Math.floor(elapsed / 60_000), 0);
  const seconds = Math.max(Math.floor((elapsed % 60_000) / 1000), 0);
  const tone = minutes >= 20 ? 'text-accent' : minutes >= 10 ? 'text-warning' : 'text-success';

  return (
    <span className={cn('font-mono tabular-nums', tone, className)}>
      {minutes}:{seconds.toString().padStart(2, '0')}
    </span>
  );
}
