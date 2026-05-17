'use client';

import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import { useEffect } from 'react';
import { cn } from '@/lib/utils';

interface KPICardProps {
  label: string;
  value: number;
  prefix?: string;
  suffix?: string;
  icon: React.ComponentType<{ className?: string }>;
  accent?: 'gold' | 'sienna' | 'success' | 'info';
  decimals?: number;
  loading?: boolean;
}

const ACCENT_STYLES: Record<
  NonNullable<KPICardProps['accent']>,
  { dot: string; bg: string; border: string }
> = {
  gold: {
    dot: 'bg-primary text-background',
    bg: 'from-primary/15 to-transparent',
    border: 'border-primary/30',
  },
  sienna: {
    dot: 'bg-accent text-foreground',
    bg: 'from-accent/15 to-transparent',
    border: 'border-accent/30',
  },
  success: {
    dot: 'bg-success text-background',
    bg: 'from-success/15 to-transparent',
    border: 'border-success/30',
  },
  info: {
    dot: 'bg-info text-foreground',
    bg: 'from-info/15 to-transparent',
    border: 'border-info/30',
  },
};

export function KPICard({
  label,
  value,
  prefix = '',
  suffix = '',
  icon: Icon,
  accent = 'gold',
  decimals = 0,
  loading,
}: KPICardProps) {
  const styles = ACCENT_STYLES[accent];
  const motionVal = useMotionValue(0);
  const rounded = useTransform(motionVal, (v) =>
    decimals === 0
      ? Math.round(v).toLocaleString()
      : v.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ','),
  );

  useEffect(() => {
    const controls = animate(motionVal, value, {
      duration: 0.9,
      ease: 'easeOut',
    });
    return () => controls.stop();
  }, [value, motionVal]);

  return (
    <div
      className={cn(
        'group bg-surface/40 relative overflow-hidden rounded-2xl border p-5 transition-all hover:-translate-y-0.5 hover:shadow-[var(--shadow-card)]',
        styles.border,
      )}
    >
      <div
        className={cn(
          'pointer-events-none absolute inset-0 bg-gradient-to-br opacity-60',
          styles.bg,
        )}
      />
      <div className="relative flex items-start justify-between">
        <div>
          <p className="text-muted text-xs font-medium tracking-[0.15em] uppercase">{label}</p>
          <div className="mt-3 flex items-baseline gap-1">
            <span className="text-foreground text-muted/60 font-display text-2xl">{prefix}</span>
            {loading ? (
              <span className="bg-surface-elevated/60 inline-block h-8 w-20 animate-pulse rounded" />
            ) : (
              <motion.span className="font-display text-foreground text-4xl tabular-nums">
                {rounded}
              </motion.span>
            )}
            {suffix && <span className="text-muted text-sm">{suffix}</span>}
          </div>
        </div>
        <span className={cn('grid size-10 place-items-center rounded-xl', styles.dot)}>
          <Icon className="size-5" />
        </span>
      </div>
    </div>
  );
}
