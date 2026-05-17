'use client';

import { motion } from 'framer-motion';
import { Flame, Crown, Leaf, Sparkles } from 'lucide-react';

const featured = [
  { name: 'Truffle Bianca', price: 24, icon: Crown, tag: 'Signature' },
  { name: 'Margherita DOP', price: 18, icon: Leaf, tag: 'Classic' },
  { name: 'Diavola Forte', price: 22, icon: Flame, tag: 'Spicy' },
  { name: 'Quattro Formaggi', price: 26, icon: Crown, tag: 'Premium' },
  { name: 'Burrata & Prosciutto', price: 28, icon: Sparkles, tag: 'New' },
  { name: 'Fungi di Bosco', price: 23, icon: Leaf, tag: 'Vegetarian' },
];

export function FeaturedItems() {
  // Duplicate so the marquee loops seamlessly
  const items = [...featured, ...featured];

  return (
    <section className="border-border bg-surface/30 relative overflow-hidden border-y py-16">
      {/* Section header */}
      <div className="mx-auto mb-10 max-w-7xl px-6 lg:px-8">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <div className="text-primary mb-2 inline-flex items-center gap-2 text-xs font-medium tracking-wider uppercase">
              <Sparkles className="size-3" />
              Trending Tonight
            </div>
            <h2 className="font-display text-foreground text-3xl sm:text-4xl">Crowd Favorites</h2>
          </div>
          <p className="text-muted max-w-md text-sm">
            Six pies that disappear faster than we can fire them. Picked tonight by our wood-oven
            master.
          </p>
        </div>
      </div>

      {/* Marquee row */}
      <div
        className="relative flex overflow-hidden"
        style={{
          maskImage: 'linear-gradient(to right, transparent, black 8%, black 92%, transparent)',
          WebkitMaskImage:
            'linear-gradient(to right, transparent, black 8%, black 92%, transparent)',
        }}
      >
        <motion.div
          className="flex gap-4 pr-4"
          style={{ animation: 'marquee 40s linear infinite' }}
        >
          {items.map((item, i) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={`${item.name}-${i}`}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className="group border-border bg-surface hover:border-primary/40 flex min-w-[280px] items-center gap-4 rounded-2xl border px-5 py-4 transition-colors"
              >
                <div className="bg-primary/10 text-primary group-hover:bg-primary group-hover:text-background flex size-12 shrink-0 items-center justify-center rounded-xl transition-colors">
                  <Icon className="size-5" />
                </div>
                <div className="flex flex-1 flex-col">
                  <div className="flex items-center gap-2">
                    <span className="text-muted text-xs tracking-wider uppercase">{item.tag}</span>
                    <span className="bg-primary/40 size-1 rounded-full" />
                  </div>
                  <span className="font-display text-foreground mt-0.5 text-lg">{item.name}</span>
                </div>
                <span className="font-display text-primary text-2xl">${item.price}</span>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
