'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface Props {
  /** ISO timestamp the order was placed. */
  startedAt: string;
  className?: string;
}

/**
 * Live "M:SS" counter that ticks every second and color-shifts as the wait
 * time stretches (10 / 20 minute thresholds match the dashboard's "fresh"
 * vs "running long" signal).
 */
export function ElapsedTime({ startedAt, className }: Props) {
  const startedMs = new Date(startedAt).getTime();
  // Start at 0 to avoid SSR/client hydration mismatch (server's `Date.now()`
  // and the client's first paint disagree by clock skew + network latency).
  // The first tick fires immediately on mount so the counter snaps to the
  // real value within ~16ms.
  const [elapsed, setElapsed] = useState(0);
  useEffect(() => {
    const update = () => setElapsed(Date.now() - startedMs);
    update(); // snap to real value on mount
    const id = setInterval(update, 1_000);
    return () => clearInterval(id);
  }, [startedMs]);

  const minutes = Math.max(Math.floor(elapsed / 60_000), 0);
  const seconds = Math.max(Math.floor((elapsed % 60_000) / 1000), 0);
  const tone = minutes >= 20 ? 'text-accent' : minutes >= 10 ? 'text-warning' : 'text-success';

  return (
    <span
      className={cn('font-mono tabular-nums', tone, className)}
      // The first-paint value (0:00) differs from any client time, so
      // explicitly tell React not to warn — we're aware of the mismatch.
      suppressHydrationWarning
    >
      {minutes}:{seconds.toString().padStart(2, '0')}
    </span>
  );
}
