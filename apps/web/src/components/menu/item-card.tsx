'use client';

import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import type { MenuItem } from '@/lib/api-types';
import { useUIStore } from '@/store/ui-store';
import { DietaryBadges } from './dietary-badges';
import { cn } from '@/lib/utils';

interface ItemCardProps {
  item: MenuItem;
  index?: number;
}

export function ItemCard({ item, index = 0 }: ItemCardProps) {
  const openItemDetails = useUIStore((s) => s.openItemDetails);

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: Math.min(index * 0.04, 0.4), ease: 'easeOut' }}
      whileHover={{ y: -6 }}
      className={cn(
        'group bg-surface border-border hover:border-primary/40 relative flex flex-col overflow-hidden rounded-3xl border transition-all',
        !item.isAvailable && 'opacity-60',
      )}
    >
      {/* Image */}
      <button
        type="button"
        onClick={() => openItemDetails(item.slug)}
        disabled={!item.isAvailable}
        className="from-surface-elevated to-background relative aspect-square w-full overflow-hidden bg-gradient-to-br focus:outline-none disabled:cursor-not-allowed"
        aria-label={`View ${item.name}`}
      >
        {item.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.imageUrl}
            alt={item.name}
            loading="lazy"
            className="size-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
        ) : (
          <div className="grid size-full place-items-center text-7xl">🍕</div>
        )}

        {/* Gradient overlay */}
        <div className="from-background/90 via-background/20 absolute inset-0 bg-gradient-to-t to-transparent" />

        {/* Top-right badges */}
        <div className="absolute top-3 right-3">
          <DietaryBadges item={item} />
        </div>

        {/* Sold out chip */}
        {!item.isAvailable && (
          <div className="bg-background/80 absolute inset-0 grid place-items-center backdrop-blur-sm">
            <span className="font-display text-accent border-accent/40 bg-background/80 rounded-full border px-4 py-1.5 text-sm tracking-wider uppercase">
              Sold Out
            </span>
          </div>
        )}
      </button>

      {/* Body */}
      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex items-start justify-between gap-3">
          <h3
            className="font-display text-foreground group-hover:text-primary cursor-pointer text-xl leading-tight transition-colors"
            onClick={() => openItemDetails(item.slug)}
          >
            {item.name}
          </h3>
          <span className="font-display text-primary shrink-0 text-xl">${item.basePrice}</span>
        </div>

        <p className="text-muted line-clamp-2 flex-1 text-sm leading-relaxed">{item.description}</p>

        <button
          type="button"
          onClick={() => openItemDetails(item.slug)}
          disabled={!item.isAvailable}
          className={cn(
            'mt-2 inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-all',
            'bg-primary text-background hover:bg-primary-hover shadow-[var(--shadow-gold)]',
            'hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(201,169,97,0.35)]',
            'disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:transform-none',
          )}
        >
          <Plus className="size-4" />
          Customize & Add
        </button>
      </div>
    </motion.article>
  );
}

export function ItemCardSkeleton() {
  return (
    <div className="bg-surface border-border flex animate-pulse flex-col overflow-hidden rounded-3xl border">
      <div className="bg-surface-elevated/40 aspect-square w-full" />
      <div className="flex flex-col gap-3 p-5">
        <div className="bg-surface-elevated/40 h-6 w-3/4 rounded" />
        <div className="bg-surface-elevated/40 h-4 w-full rounded" />
        <div className="bg-surface-elevated/40 h-4 w-5/6 rounded" />
        <div className="bg-surface-elevated/40 mt-2 h-10 rounded-xl" />
      </div>
    </div>
  );
}
