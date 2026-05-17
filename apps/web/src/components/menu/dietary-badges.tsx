import { Flame, Leaf, Sprout, Crown, Sparkles, Wheat } from 'lucide-react';
import type { MenuItem } from '@/lib/api-types';
import { cn } from '@/lib/utils';

const BADGES = [
  { key: 'isPopular', label: 'Popular', Icon: Crown, className: 'text-primary' },
  { key: 'isNew', label: 'New', Icon: Sparkles, className: 'text-accent' },
  { key: 'isSpicy', label: 'Spicy', Icon: Flame, className: 'text-accent' },
  { key: 'isVegetarian', label: 'Veg', Icon: Leaf, className: 'text-success' },
  { key: 'isVegan', label: 'Vegan', Icon: Sprout, className: 'text-success' },
  { key: 'isGlutenFree', label: 'GF', Icon: Wheat, className: 'text-warning' },
] as const;

interface DietaryBadgesProps {
  item: Pick<
    MenuItem,
    'isPopular' | 'isNew' | 'isSpicy' | 'isVegetarian' | 'isVegan' | 'isGlutenFree'
  >;
  size?: 'sm' | 'md';
  className?: string;
}

export function DietaryBadges({ item, size = 'sm', className }: DietaryBadgesProps) {
  const active = BADGES.filter((b) => item[b.key]);
  if (active.length === 0) return null;

  return (
    <div className={cn('flex flex-wrap gap-1.5', className)}>
      {active.map(({ key, label, Icon, className: tone }) => (
        <span
          key={key}
          className={cn(
            'border-border bg-background/60 inline-flex items-center gap-1 rounded-full border px-2 py-0.5 backdrop-blur-sm',
            size === 'sm' ? 'text-[10px]' : 'text-xs',
            tone,
          )}
        >
          <Icon className={cn(size === 'sm' ? 'size-3' : 'size-3.5')} />
          {label}
        </span>
      ))}
    </div>
  );
}
