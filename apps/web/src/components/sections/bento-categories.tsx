'use client';

import { motion } from 'framer-motion';
import { ArrowUpRight, Pizza, Salad, Wine, Cookie, Drumstick, Coffee } from 'lucide-react';
import { cn } from '@/lib/utils';

const categories = [
  {
    title: 'Signature Pizzas',
    description: 'Our hand-crafted masterpieces, wood-fired in 90 seconds.',
    icon: Pizza,
    span: 'md:col-span-2 md:row-span-2',
    accent: true,
  },
  {
    title: 'Fresh Salads',
    description: 'Crisp, vibrant, picked at peak.',
    icon: Salad,
    span: 'md:col-span-1',
  },
  {
    title: 'Italian Wines',
    description: 'Curated reds & whites.',
    icon: Wine,
    span: 'md:col-span-1',
  },
  {
    title: 'Antipasti',
    description: 'Italian starters to share.',
    icon: Cookie,
    span: 'md:col-span-1 md:row-span-2',
  },
  {
    title: 'Wings & Sides',
    description: 'Crispy. Bold. Addictive.',
    icon: Drumstick,
    span: 'md:col-span-1',
  },
  {
    title: 'Coffee & Desserts',
    description: 'A sweet finale, espresso strong.',
    icon: Coffee,
    span: 'md:col-span-1',
  },
];

export function BentoCategories() {
  return (
    <section className="relative py-24 sm:py-32" id="menu">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
          className="mb-16 max-w-2xl"
        >
          <div className="text-primary mb-3 inline-flex items-center gap-2 text-xs font-medium tracking-wider uppercase">
            <span className="bg-primary size-1 rounded-full" />
            Explore Our Menu
          </div>
          <h2 className="font-display text-foreground text-4xl leading-tight sm:text-5xl lg:text-6xl">
            Crafted with <span className="text-gradient-gold">obsession.</span>
          </h2>
          <p className="text-muted mt-4 text-lg">
            Every category curated like a tasting menu — pizzas at the heart, with everything around
            built to complete the ritual.
          </p>
        </motion.div>

        {/* Bento grid */}
        <div className="grid auto-rows-[200px] grid-cols-1 gap-4 md:grid-cols-3 md:gap-5 lg:grid-cols-4">
          {categories.map((cat, i) => {
            const Icon = cat.icon;
            return (
              <motion.a
                key={cat.title}
                href="#"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.5, delay: i * 0.08, ease: 'easeOut' }}
                whileHover={{ y: -4 }}
                className={cn(
                  'group border-border bg-surface hover:border-primary/40 relative flex flex-col justify-between overflow-hidden rounded-3xl border p-6 transition-colors',
                  cat.span,
                  cat.accent && 'from-surface via-surface to-primary/5 bg-gradient-to-br',
                )}
              >
                {/* Decorative gradient on hover */}
                <div className="from-primary/0 via-primary/0 to-primary/0 absolute inset-0 -z-10 bg-gradient-to-br opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

                {/* Icon */}
                <div className="relative">
                  <div
                    className={cn(
                      'bg-background/50 text-primary group-hover:bg-primary group-hover:text-background inline-flex size-12 items-center justify-center rounded-2xl transition-all duration-300 group-hover:scale-110',
                      cat.accent && 'size-16',
                    )}
                  >
                    <Icon className={cn('size-5', cat.accent && 'size-7')} />
                  </div>
                  {cat.accent && (
                    <span className="bg-accent text-foreground absolute -top-2 -right-2 rounded-full px-2 py-0.5 text-[10px] font-semibold tracking-wider uppercase">
                      Hot
                    </span>
                  )}
                </div>

                {/* Content */}
                <div>
                  <h3
                    className={cn(
                      'font-display text-foreground group-hover:text-primary text-2xl transition-colors',
                      cat.accent && 'text-3xl lg:text-4xl',
                    )}
                  >
                    {cat.title}
                  </h3>
                  <p className="text-muted mt-2 text-sm">{cat.description}</p>
                </div>

                {/* Arrow indicator */}
                <ArrowUpRight className="text-muted group-hover:text-primary absolute top-6 right-6 size-5 opacity-0 transition-all duration-300 group-hover:translate-x-1 group-hover:-translate-y-1 group-hover:opacity-100" />
              </motion.a>
            );
          })}
        </div>
      </div>
    </section>
  );
}
