'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { ChefHat, CircleDot, CircleSlash2, Loader2, Maximize2, X } from 'lucide-react';
import { Chime } from '@/components/kds/chime';
import { KdsCard } from '@/components/kds/kds-card';
import { useKdsBoard } from '@/hooks/use-admin-data';
import { useKdsRealtime } from '@/hooks/use-kds-realtime';
import { useAuthStore } from '@/store/auth-store';
import { cn } from '@/lib/utils';
import type { OrderStatus } from '@/lib/api-types';

const ROLE_OK = new Set(['ADMIN', 'MANAGER', 'KITCHEN']);

const FILTERS: Array<{ key: 'ALL' | OrderStatus; label: string }> = [
  { key: 'ALL', label: 'All active' },
  { key: 'PENDING', label: 'New' },
  { key: 'CONFIRMED', label: 'Confirmed' },
  { key: 'PREPARING', label: 'Preparing' },
  { key: 'READY', label: 'Ready' },
];

export default function KdsPage() {
  const router = useRouter();
  const hydrated = useAuthStore((s) => s.hydrated);
  const user = useAuthStore((s) => s.user);

  // KDS is a separate route from the (protected) shell — re-implement the
  // auth gate inline so we can keep the page totally chrome-less. Same gate
  // as ProtectedLayout: wait for hydrate, then redirect or render.
  useEffect(() => {
    if (!hydrated) return;
    if (!user) {
      router.replace(`/login?next=${encodeURIComponent('/kds')}`);
      return;
    }
    if (!ROLE_OK.has(user.role)) {
      // Logged-in staff but without kitchen access — bounce back to dashboard.
      router.replace('/');
    }
  }, [hydrated, user, router]);

  const { data: orders, isLoading } = useKdsBoard();

  // The realtime hook's `onNewOrder` increments a counter; the Chime watches
  // that counter and plays once per increment.
  const [chimeTrigger, setChimeTrigger] = useState(0);
  const triggerRef = useRef(0);
  useKdsRealtime({
    onNewOrder: () => {
      triggerRef.current += 1;
      setChimeTrigger(triggerRef.current);
    },
  });

  const [filter, setFilter] = useState<'ALL' | OrderStatus>('ALL');
  const visible = useMemo(() => {
    if (!orders) return [];
    if (filter === 'ALL') return orders;
    return orders.filter((o) => o.status === filter);
  }, [orders, filter]);

  const counts = useMemo(() => {
    const out: Record<string, number> = { ALL: orders?.length ?? 0 };
    for (const o of orders ?? []) out[o.status] = (out[o.status] ?? 0) + 1;
    return out;
  }, [orders]);

  function requestFullscreen() {
    if (typeof document === 'undefined') return;
    const el = document.documentElement;
    if (!document.fullscreenElement) {
      void el.requestFullscreen?.();
    } else {
      void document.exitFullscreen?.();
    }
  }

  if (!hydrated || !user || !ROLE_OK.has(user.role)) {
    return (
      <div className="bg-background grid min-h-screen place-items-center">
        <Loader2 className="text-primary animate-spin" />
      </div>
    );
  }

  return (
    <main className="bg-background flex min-h-screen flex-col">
      {/* Slim header bar — full kitchen real estate goes to the cards */}
      <header className="border-border bg-surface/80 sticky top-0 z-20 flex items-center justify-between gap-4 border-b px-6 py-3 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <span className="bg-primary/15 text-primary border-primary/40 inline-flex size-9 items-center justify-center rounded-xl border">
            <ChefHat className="size-4" />
          </span>
          <div className="leading-tight">
            <p className="text-muted text-[10px] tracking-[0.18em] uppercase">Pizza Height</p>
            <p className="font-display text-foreground text-xl">Kitchen Display</p>
          </div>
        </div>

        {/* Filter pills */}
        <div className="hidden flex-1 items-center justify-center gap-2 sm:flex">
          {FILTERS.map((f) => {
            const active = f.key === filter;
            const c = counts[f.key];
            return (
              <button
                key={f.key}
                type="button"
                onClick={() => setFilter(f.key)}
                className={cn(
                  'inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition-all',
                  active
                    ? 'border-primary/60 bg-primary/10 text-foreground'
                    : 'border-border bg-surface/40 text-muted hover:text-foreground hover:border-primary/40',
                )}
              >
                {f.label}
                {typeof c === 'number' && (
                  <span
                    className={cn(
                      'rounded-full px-1.5 text-[10px] tabular-nums',
                      active ? 'bg-primary text-background' : 'bg-surface-elevated',
                    )}
                  >
                    {c}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2">
          <ConnectionDot />
          <Chime trigger={chimeTrigger} />
          <button
            type="button"
            onClick={requestFullscreen}
            aria-label="Toggle fullscreen"
            className="text-muted hover:text-primary border-border hover:border-primary/40 inline-flex size-10 items-center justify-center rounded-xl border transition-colors"
          >
            <Maximize2 className="size-4" />
          </button>
          <Link
            href="/"
            aria-label="Exit KDS"
            className="text-muted hover:text-foreground border-border hover:border-accent/60 inline-flex size-10 items-center justify-center rounded-xl border transition-colors"
          >
            <X className="size-4" />
          </Link>
        </div>
      </header>

      {/* Board */}
      <section className="flex-1 px-4 py-4 sm:px-6 sm:py-6">
        {isLoading ? (
          <div className="text-muted flex items-center justify-center gap-2 py-24 text-sm">
            <Loader2 className="size-4 animate-spin" /> Loading board…
          </div>
        ) : visible.length === 0 ? (
          <div className="grid place-items-center py-24">
            <div className="bg-surface/40 border-border rounded-2xl border px-10 py-16 text-center">
              <div className="bg-success/20 text-success mx-auto grid size-16 place-items-center rounded-full">
                <CircleSlash2 className="size-7" />
              </div>
              <h2 className="font-display text-foreground mt-6 text-3xl">All caught up</h2>
              <p className="text-muted mt-2 text-sm">
                The board is clear — every active order has been bumped.
              </p>
            </div>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            <AnimatePresence initial={false} mode="popLayout">
              {visible.map((order) => (
                <KdsCard key={order.id} order={order} />
              ))}
            </AnimatePresence>
          </div>
        )}
      </section>
    </main>
  );
}

/** Tiny "live" indicator — green when react-query has data, dim while loading. */
function ConnectionDot() {
  const { isLoading, isFetching, isError } = useKdsBoard();
  const ok = !isLoading && !isError;
  return (
    <div
      className="text-muted hidden items-center gap-1.5 px-1 text-xs sm:inline-flex"
      title={isError ? 'Disconnected' : 'Live'}
    >
      <CircleDot
        className={cn(
          'size-3 transition-colors',
          isError ? 'text-accent' : ok ? 'text-success animate-pulse' : 'text-muted',
          isFetching && 'opacity-60',
        )}
      />
      <span className="text-[10px] tracking-[0.18em] uppercase">
        {isError ? 'Offline' : ok ? 'Live' : 'Syncing'}
      </span>
    </div>
  );
}
