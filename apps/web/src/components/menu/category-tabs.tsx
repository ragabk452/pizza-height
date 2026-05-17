'use client';

import { motion } from 'framer-motion';
import type { Category } from '@/lib/api-types';
import { cn } from '@/lib/utils';

interface CategoryTabsProps {
  categories: Category[];
  active: string | null;
  onChange: (slug: string | null) => void;
}

export function CategoryTabs({ categories, active, onChange }: CategoryTabsProps) {
  const all = [
    { slug: null as string | null, name: 'All' },
    ...categories.map((c) => ({ slug: c.slug, name: c.name })),
  ];

  return (
    <div
      className="border-border bg-background/80 sticky top-20 z-20 -mx-6 mb-8 overflow-x-auto border-y px-6 py-3 backdrop-blur-md lg:-mx-8 lg:px-8"
      style={{
        maskImage:
          'linear-gradient(to right, transparent, black 1rem, black calc(100% - 1rem), transparent)',
        WebkitMaskImage:
          'linear-gradient(to right, transparent, black 1rem, black calc(100% - 1rem), transparent)',
      }}
    >
      <div className="flex min-w-max gap-2">
        {all.map((c) => {
          const isActive = active === c.slug;
          return (
            <button
              key={c.slug ?? 'all'}
              type="button"
              onClick={() => onChange(c.slug)}
              className={cn(
                'relative rounded-full px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors',
                isActive ? 'text-background' : 'text-muted hover:text-foreground hover:bg-surface',
              )}
            >
              {isActive && (
                <motion.span
                  layoutId="category-pill"
                  className="bg-primary absolute inset-0 -z-10 rounded-full shadow-[var(--shadow-gold)]"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              {c.name}
            </button>
          );
        })}
      </div>
    </div>
  );
}
