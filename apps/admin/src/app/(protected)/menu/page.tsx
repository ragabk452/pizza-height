'use client';

import { motion } from 'framer-motion';
import { EyeOff, Flame, Leaf, Loader2, Pencil, Plus, Star, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Topbar } from '@/components/layout/topbar';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { CategoryDrawer } from '@/components/menu/category-drawer';
import { MenuItemDrawer } from '@/components/menu/menu-item-drawer';
import {
  useAdminCategories,
  useAdminMenuItems,
  useDeleteCategory,
  useDeleteMenuItem,
  useToggleMenuItemAvailability,
} from '@/hooks/use-admin-data';
import { ApiError } from '@/lib/api';
import type { Category, MenuItem } from '@/lib/api-types';
import { cn } from '@/lib/utils';

type CategoryDrawerState = { open: boolean; target: Category | null };
type ItemDrawerState = { open: boolean; itemId: string | null; defaultCategoryId?: string };
type ConfirmState =
  | { kind: 'category'; category: Category }
  | { kind: 'item'; item: MenuItem }
  | null;

export default function AdminMenuPage() {
  const { data: categories, isLoading: catsLoading } = useAdminCategories();
  const { data: items, isLoading: itemsLoading } = useAdminMenuItems();
  const isLoading = catsLoading || itemsLoading;

  const [catDrawer, setCatDrawer] = useState<CategoryDrawerState>({ open: false, target: null });
  const [itemDrawer, setItemDrawer] = useState<ItemDrawerState>({ open: false, itemId: null });
  const [confirm, setConfirm] = useState<ConfirmState>(null);

  const deleteCategory = useDeleteCategory();
  const deleteItem = useDeleteMenuItem();
  const toggle = useToggleMenuItemAvailability();

  // Stable sorted category list — admins want a consistent ordering whatever
  // order the API returned them in (the API sorts by sortOrder but inactive
  // ones can intersperse).
  const sortedCategories = useMemo(
    () => (categories ?? []).slice().sort((a, b) => a.sortOrder - b.sortOrder),
    [categories],
  );

  async function handleToggle(item: MenuItem) {
    try {
      await toggle.mutateAsync({ id: item.id, isAvailable: !item.isAvailable });
      toast.success(
        item.isAvailable ? `${item.name} marked sold out` : `${item.name} back in stock`,
      );
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Toggle failed');
    }
  }

  async function handleConfirmDelete() {
    if (!confirm) return;
    try {
      if (confirm.kind === 'category') {
        await deleteCategory.mutateAsync(confirm.category.id);
        toast.success(`Deleted ${confirm.category.name}`);
      } else {
        await deleteItem.mutateAsync(confirm.item.id);
        toast.success(`Deleted ${confirm.item.name}`);
      }
      setConfirm(null);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Delete failed');
    }
  }

  return (
    <>
      <Topbar
        title="Menu"
        subtitle="Categories, items, sizes, and modifiers."
        trailing={
          <Button onClick={() => setCatDrawer({ open: true, target: null })}>
            <Plus className="size-4" /> Category
          </Button>
        }
      />
      <main className="flex-1 px-6 py-8 sm:px-8">
        {isLoading ? (
          <div className="text-muted flex items-center justify-center gap-2 py-20 text-sm">
            <Loader2 className="size-4 animate-spin" /> Loading menu…
          </div>
        ) : sortedCategories.length === 0 ? (
          <EmptyState onAddCategory={() => setCatDrawer({ open: true, target: null })} />
        ) : (
          <div className="space-y-10">
            {sortedCategories.map((category) => {
              const inCategory = (items ?? []).filter((i) => i.categoryId === category.id);
              return (
                <CategorySection
                  key={category.id}
                  category={category}
                  items={inCategory}
                  onAddItem={() =>
                    setItemDrawer({ open: true, itemId: null, defaultCategoryId: category.id })
                  }
                  onEditCategory={() => setCatDrawer({ open: true, target: category })}
                  onDeleteCategory={() => setConfirm({ kind: 'category', category })}
                  onEditItem={(item) => setItemDrawer({ open: true, itemId: item.id })}
                  onDeleteItem={(item) => setConfirm({ kind: 'item', item })}
                  onToggleItem={(item) => void handleToggle(item)}
                  togglingId={toggle.isPending ? toggle.variables?.id : undefined}
                />
              );
            })}
          </div>
        )}
      </main>

      {/* Drawers */}
      <CategoryDrawer
        open={catDrawer.open}
        category={catDrawer.target}
        onClose={() => setCatDrawer({ open: false, target: null })}
      />
      <MenuItemDrawer
        open={itemDrawer.open}
        itemId={itemDrawer.itemId}
        defaultCategoryId={itemDrawer.defaultCategoryId}
        categories={sortedCategories.filter((c) => c.isActive)}
        onClose={() => setItemDrawer({ open: false, itemId: null })}
      />
      <ConfirmDialog
        open={Boolean(confirm)}
        destructive
        pending={deleteCategory.isPending || deleteItem.isPending}
        title={
          confirm?.kind === 'category'
            ? `Delete ${confirm.category.name}?`
            : confirm?.kind === 'item'
              ? `Delete ${confirm.item.name}?`
              : 'Delete?'
        }
        description={
          confirm?.kind === 'category'
            ? 'The category is soft-deleted and hidden everywhere. Items inside it keep their data but stop appearing in the public menu.'
            : confirm?.kind === 'item'
              ? 'The item is soft-deleted and removed from the public menu. Past orders keep their snapshot.'
              : ''
        }
        confirmLabel="Delete"
        onConfirm={handleConfirmDelete}
        onCancel={() => setConfirm(null)}
      />
    </>
  );
}

// ----- subcomponents -----

function EmptyState({ onAddCategory }: { onAddCategory: () => void }) {
  return (
    <div className="border-border bg-surface/30 rounded-3xl border border-dashed p-16 text-center">
      <div className="text-5xl">🍕</div>
      <h2 className="text-foreground font-display mt-4 text-2xl">No categories yet</h2>
      <p className="text-muted mt-2 text-sm">Create a category to start adding menu items.</p>
      <Button className="mt-6" onClick={onAddCategory}>
        <Plus className="size-4" /> New category
      </Button>
    </div>
  );
}

function CategorySection({
  category,
  items,
  onAddItem,
  onEditCategory,
  onDeleteCategory,
  onEditItem,
  onDeleteItem,
  onToggleItem,
  togglingId,
}: {
  category: Category;
  items: MenuItem[];
  onAddItem: () => void;
  onEditCategory: () => void;
  onDeleteCategory: () => void;
  onEditItem: (item: MenuItem) => void;
  onDeleteItem: (item: MenuItem) => void;
  onToggleItem: (item: MenuItem) => void;
  togglingId?: string;
}) {
  return (
    <section>
      <div className="flex items-end justify-between gap-4">
        <div className="flex items-baseline gap-3">
          <h2 className="font-display text-foreground text-2xl">{category.name}</h2>
          {!category.isActive && (
            <span className="bg-warning/10 text-warning border-warning/30 inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] tracking-wide uppercase">
              <EyeOff className="size-3" /> Hidden
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-muted mr-2 text-xs">
            {items.length} {items.length === 1 ? 'item' : 'items'}
          </span>
          <Button size="sm" variant="outline" onClick={onAddItem}>
            <Plus className="size-3.5" /> Item
          </Button>
          <Button size="sm" variant="ghost" onClick={onEditCategory} aria-label="Edit category">
            <Pencil className="size-3.5" />
          </Button>
          <Button size="sm" variant="ghost" onClick={onDeleteCategory} aria-label="Delete category">
            <Trash2 className="size-3.5" />
          </Button>
        </div>
      </div>
      {category.description && <p className="text-muted mt-1 text-sm">{category.description}</p>}

      {items.length === 0 ? (
        <p className="text-muted bg-surface/30 border-border mt-4 rounded-xl border border-dashed py-8 text-center text-xs">
          No items in this category yet.
        </p>
      ) : (
        <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {items.map((item, i) => (
            <ItemCard
              key={item.id}
              item={item}
              index={i}
              onEdit={() => onEditItem(item)}
              onDelete={() => onDeleteItem(item)}
              onToggle={() => onToggleItem(item)}
              toggling={togglingId === item.id}
            />
          ))}
        </div>
      )}
    </section>
  );
}

function ItemCard({
  item,
  index,
  onEdit,
  onDelete,
  onToggle,
  toggling,
}: {
  item: MenuItem;
  index: number;
  onEdit: () => void;
  onDelete: () => void;
  onToggle: () => void;
  toggling?: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03, duration: 0.35 }}
      className={cn(
        'bg-surface/40 border-border group relative overflow-hidden rounded-2xl border transition-all hover:-translate-y-0.5 hover:shadow-[var(--shadow-card)]',
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

        {/* Action bar */}
        <div className="border-border mt-4 flex items-center justify-between gap-2 border-t pt-3">
          <button
            type="button"
            onClick={onToggle}
            disabled={toggling}
            className={cn(
              'rounded-full px-3 py-1 text-xs font-medium transition-colors',
              item.isAvailable
                ? 'text-success bg-success/10 hover:bg-success/20'
                : 'text-accent bg-accent/10 hover:bg-accent/20',
              toggling && 'opacity-60',
            )}
          >
            {toggling ? '…' : item.isAvailable ? 'In stock' : 'Sold out'}
          </button>
          <div className="flex items-center gap-1">
            <Button size="sm" variant="ghost" onClick={onEdit} aria-label="Edit item">
              <Pencil className="size-3.5" />
            </Button>
            <Button size="sm" variant="ghost" onClick={onDelete} aria-label="Delete item">
              <Trash2 className="size-3.5" />
            </Button>
          </div>
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
