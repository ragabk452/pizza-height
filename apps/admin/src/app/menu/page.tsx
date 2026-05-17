'use client';

import { motion } from 'framer-motion';
import { Construction, Flame, Leaf, Loader2, Star } from 'lucide-react';
import { ProtectedShell } from '@/components/layout/protected-shell';
import { Topbar } from '@/components/layout/topbar';
import { useAdminCategories, useAdminMenuItems } from '@/hooks/use-admin-data';
import type { MenuItem } from '@/lib/api-types';
import { cn } from '@/lib/utils';

export default function AdminMenuPage() {
  const { data: categories } = useAdminCategories();
  const { data: items, isLoading } = useAdminMenuItems();

  return (
    <ProtectedShell>
      <Topbar
        title="Menu"
        subtitle="Categories, items, sizes, and modifiers."
        trailing={
          <div className="bg-warning/10 text-warning border-warning/30 hidden items-center gap-2 rounded-full border px-3 py-1.5 text-xs sm:inline-flex">
            <Construction className="size-3.5" />
            Read-only · CRUD lands in Sprint 5.1
          </div>
        }
      />
      <main className="flex-1 px-6 py-8 sm:px-8">
        {isLoading ? (
          <div className="text-muted flex items-center justify-center gap-2 py-20 text-sm">
            <Loader2 className="size-4 animate-spin" /> Loading menu…
          </div>
        ) : !items || items.length === 0 ? (
          <p className="text-muted text-center text-sm">No menu items yet.</p>
        ) : (
          <div className="space-y-10">
            {categories
              ?.filter((c) => c.isActive)
              .map((category) => {
                const inCategory = items.filter((i) => i.categoryId === category.id);
                if (inCategory.length === 0) return null;
                return (
                  <section key={category.id}>
                    <div className="flex items-baseline justify-between gap-4">
                      <div>
                        <h2 className="font-display text-foreground text-2xl">{category.name}</h2>
                        {category.description && (
                          <p className="text-muted mt-1 text-sm">{category.description}</p>
                        )}
                      </div>
                      <span className="text-muted text-xs">
                        {inCategory.length} {inCategory.length === 1 ? 'item' : 'items'}
                      </span>
                    </div>
                    <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                      {inCategory.map((item, i) => (
                        <ItemCard key={item.id} item={item} index={i} />
                      ))}
                    </div>
                  </section>
                );
              })}
          </div>
        )}
      </main>
    </ProtectedShell>
  );
}

function ItemCard({ item, index }: { item: MenuItem; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03, duration: 0.35 }}
      className={cn(
        'bg-surface/40 border-border group overflow-hidden rounded-2xl border transition-all hover:-translate-y-0.5 hover:shadow-[var(--shadow-card)]',
        !item.isAvailable && 'opacity-60',
      )}
    >
      <div className="bg-surface-elevated relative aspect-[5/3] overflow-hidden">
        {item.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.imageUrl}
            alt={item.name}
            className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="grid size-full place-items-center text-4xl">🍕</div>
        )}
        {!item.isAvailable && (
          <span className="bg-accent text-foreground absolute top-3 left-3 rounded-full px-2 py-0.5 text-[10px] tracking-wide uppercase">
            Sold out
          </span>
        )}
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-foreground font-display text-lg leading-tight">{item.name}</h3>
          <span className="font-display text-primary shrink-0 text-lg tabular-nums">
            ${item.basePrice.toFixed(2)}
          </span>
        </div>
        <p className="text-muted mt-1 line-clamp-2 text-xs">{item.description}</p>
        <div className="mt-3 flex flex-wrap items-center gap-1.5">
          {item.isPopular && <Badge icon={Star} label="Popular" />}
          {item.isSpicy && <Badge icon={Flame} label="Spicy" tone="sienna" />}
          {item.isVegan && <Badge icon={Leaf} label="Vegan" tone="success" />}
          {item.isVegetarian && !item.isVegan && <Badge icon={Leaf} label="Veg" tone="success" />}
          {item.isGlutenFree && <Badge label="GF" />}
          {item.isNew && <Badge label="New" tone="info" />}
        </div>
      </div>
    </motion.div>
  );
}

function Badge({
  icon: Icon,
  label,
  tone = 'gold',
}: {
  icon?: React.ComponentType<{ className?: string }>;
  label: string;
  tone?: 'gold' | 'sienna' | 'success' | 'info';
}) {
  const TONES = {
    gold: 'border-primary/40 text-primary bg-primary/10',
    sienna: 'border-accent/40 text-accent bg-accent/10',
    success: 'border-success/40 text-success bg-success/10',
    info: 'border-info/40 text-info bg-info/10',
  };
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium tracking-wide uppercase',
        TONES[tone],
      )}
    >
      {Icon && <Icon className="size-3" />}
      {label}
    </span>
  );
}
