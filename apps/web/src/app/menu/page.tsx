'use client';

import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Frown } from 'lucide-react';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { useCategories, useMenuItems } from '@/hooks/use-menu';
import { CategoryTabs } from '@/components/menu/category-tabs';
import { SearchBar } from '@/components/menu/search-bar';
import { ItemCard, ItemCardSkeleton } from '@/components/menu/item-card';
import { ItemDetailsDrawer } from '@/components/menu/item-details-drawer';

export default function MenuPage() {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const { data: categories } = useCategories();
  const {
    data: items,
    isLoading,
    isError,
  } = useMenuItems({
    category: activeCategory ?? undefined,
    search: search || undefined,
  });

  const activeCategoryName = useMemo(
    () => categories?.find((c) => c.slug === activeCategory)?.name ?? null,
    [categories, activeCategory],
  );

  return (
    <>
      <Navbar />

      <main className="flex-1 pt-32 pb-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="max-w-3xl"
          >
            <div className="text-primary mb-3 inline-flex items-center gap-2 text-xs font-medium tracking-wider uppercase">
              <Sparkles className="size-3" />
              The full menu
            </div>
            <h1 className="font-display text-foreground text-4xl leading-tight sm:text-5xl lg:text-6xl">
              Tonight&apos;s lineup,
              <br />
              <span className="text-gradient-gold">obsessed-over.</span>
            </h1>
            <p className="text-muted mt-4 text-lg">
              {activeCategoryName
                ? `Browsing ${activeCategoryName.toLowerCase()} — `
                : 'Every pizza wood-fired in 90 seconds. Every side picked to match. '}
              Tap any dish to customize and add to your order.
            </p>
          </motion.div>

          {/* Search */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="mt-8"
          >
            <SearchBar value={search} onChange={setSearch} />
          </motion.div>

          {/* Category tabs */}
          <div className="mt-8">
            {categories && (
              <CategoryTabs
                categories={categories}
                active={activeCategory}
                onChange={setActiveCategory}
              />
            )}
          </div>

          {/* Items grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <ItemCardSkeleton key={i} />
              ))}
            </div>
          ) : isError ? (
            <ErrorState />
          ) : !items || items.length === 0 ? (
            <EmptyState query={search} category={activeCategoryName} />
          ) : (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {items.map((item, i) => (
                <ItemCard key={item.id} item={item} index={i} />
              ))}
            </div>
          )}

          {/* Results summary */}
          {items && items.length > 0 && (
            <p className="text-muted mt-10 text-center text-sm">
              Showing {items.length} {items.length === 1 ? 'dish' : 'dishes'}
              {activeCategoryName && ` in ${activeCategoryName}`}
              {search && ` matching "${search}"`}
            </p>
          )}
        </div>
      </main>

      <Footer />

      {/* Drawers */}
      <ItemDetailsDrawer />
    </>
  );
}

function ErrorState() {
  return (
    <div className="border-border bg-surface/50 rounded-3xl border p-16 text-center">
      <Frown className="text-muted mx-auto size-12" />
      <h3 className="font-display text-foreground mt-4 text-xl">Menu unavailable</h3>
      <p className="text-muted mt-2 text-sm">
        We couldn&apos;t reach the kitchen. Make sure the API is running on port 4000.
      </p>
    </div>
  );
}

function EmptyState({ query, category }: { query: string; category: string | null }) {
  return (
    <div className="border-border bg-surface/50 rounded-3xl border p-16 text-center">
      <div className="grid place-items-center text-6xl">🍕</div>
      <h3 className="font-display text-foreground mt-4 text-xl">Nothing found</h3>
      <p className="text-muted mt-2 text-sm">
        {query && `No matches for "${query}"`}
        {query && category && ' in '}
        {category && !query && `No dishes in ${category}`}
        {category && query && category}
        {!query && !category && 'The kitchen is empty.'}
      </p>
    </div>
  );
}
