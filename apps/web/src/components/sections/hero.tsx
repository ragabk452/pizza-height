'use client';

import { motion } from 'framer-motion';
import { ArrowRight, Play, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

const stats = [
  { value: '50K+', label: 'Happy Guests' },
  { value: '4.9★', label: 'Avg Rating' },
  { value: '25min', label: 'Avg Delivery' },
];

export function Hero() {
  return (
    <section className="bg-mesh-gold relative isolate min-h-screen overflow-hidden pt-32 pb-16">
      {/* Decorative grid */}
      <div
        className="absolute inset-0 -z-10 opacity-[0.03]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(201,169,97,1) 1px, transparent 1px), linear-gradient(90deg, rgba(201,169,97,1) 1px, transparent 1px)',
          backgroundSize: '64px 64px',
        }}
      />

      {/* Floating decorative orbs */}
      <motion.div
        animate={{ y: [0, -20, 0], rotate: [0, 5, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        className="bg-primary/10 absolute top-40 right-10 -z-10 h-72 w-72 rounded-full blur-3xl"
      />
      <motion.div
        animate={{ y: [0, 20, 0], rotate: [0, -5, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        className="bg-accent/10 absolute bottom-20 left-10 -z-10 h-80 w-80 rounded-full blur-3xl"
      />

      <div className="mx-auto grid max-w-7xl items-center gap-12 px-6 lg:grid-cols-2 lg:px-8">
        {/* Left: Text content */}
        <div className="relative z-10 flex flex-col items-start">
          {/* Eyebrow badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="border-primary/30 bg-primary/5 text-primary mb-6 inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-medium tracking-wider uppercase backdrop-blur-sm"
          >
            <Sparkles className="size-3" />
            Hand-Crafted · Italian-Inspired · Wood-Fired
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1, ease: 'easeOut' }}
            className="font-display text-foreground text-5xl leading-[0.95] tracking-tight sm:text-6xl lg:text-7xl xl:text-8xl"
          >
            Elevate
            <br />
            Your <span className="text-gradient-gold">Taste.</span>
          </motion.h1>

          {/* Subhead */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3, ease: 'easeOut' }}
            className="text-muted mt-6 max-w-xl text-lg sm:text-xl"
          >
            Pizza Height isn&apos;t just another delivery — it&apos;s a ritual. Wood-fired in 90
            seconds, dressed with imported San Marzano, and delivered before the cheese stops
            singing.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5, ease: 'easeOut' }}
            className="mt-10 flex flex-wrap items-center gap-4"
          >
            <Button size="xl" asChild>
              <Link href="/menu" className="group">
                Order Now
                <ArrowRight className="transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
            <Button size="xl" variant="outline" asChild>
              <Link href="/about" className="group">
                <Play className="transition-transform group-hover:scale-110" />
                Our Story
              </Link>
            </Button>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="mt-14 grid w-full max-w-md grid-cols-3 gap-6"
          >
            {stats.map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.9 + i * 0.1 }}
                className="border-primary/30 border-l pl-4"
              >
                <div className="font-display text-primary text-3xl sm:text-4xl">{s.value}</div>
                <div className="text-muted mt-1 text-xs tracking-wide uppercase">{s.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Right: Visual hero element */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, rotate: -5 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ duration: 1, delay: 0.3, ease: 'easeOut' }}
          className="relative mx-auto aspect-square w-full max-w-xl lg:max-w-none"
        >
          {/* Rotating gold ring */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}
            className="absolute inset-0 rounded-full"
            style={{
              background:
                'conic-gradient(from 0deg, transparent 0deg, rgba(201,169,97,0.3) 90deg, transparent 180deg, rgba(201,169,97,0.3) 270deg, transparent 360deg)',
              maskImage:
                'radial-gradient(circle, transparent 60%, black 62%, black 64%, transparent 66%)',
              WebkitMaskImage:
                'radial-gradient(circle, transparent 60%, black 62%, black 64%, transparent 66%)',
            }}
          />

          {/* Inner glow circle */}
          <div
            className="absolute inset-8 rounded-full"
            style={{
              background:
                'radial-gradient(circle at 30% 30%, rgba(201,169,97,0.4), rgba(184,67,31,0.2) 50%, transparent 70%)',
              filter: 'blur(40px)',
            }}
          />

          {/* Centerpiece - Pizza emoji placeholder (will be replaced with real image/3D) */}
          <motion.div
            animate={{ y: [0, -15, 0], rotate: [0, 3, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute inset-12 flex items-center justify-center"
          >
            <div className="from-surface-elevated via-surface to-background border-primary/20 relative flex aspect-square w-full items-center justify-center overflow-hidden rounded-full border bg-gradient-to-br shadow-[var(--shadow-card)]">
              {/* Pizza visual placeholder */}
              <div className="text-[6rem] leading-none select-none sm:text-[10rem] lg:text-[16rem]">
                🍕
              </div>

              {/* Inner highlight */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/5 via-transparent to-transparent" />
            </div>
          </motion.div>

          {/* Floating spec badges */}
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            className="glass absolute top-12 left-0 rounded-2xl px-4 py-3 shadow-lg sm:-left-4"
          >
            <div className="text-muted text-xs">Wood-Fired</div>
            <div className="font-display text-primary text-lg">90s</div>
          </motion.div>
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
            className="glass absolute right-0 bottom-16 rounded-2xl px-4 py-3 shadow-lg sm:-right-4"
          >
            <div className="text-muted text-xs">Hand-Stretched</div>
            <div className="font-display text-primary text-lg">Daily</div>
          </motion.div>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 1 }}
        className="text-muted absolute bottom-8 left-1/2 flex -translate-x-1/2 flex-col items-center gap-2 text-xs tracking-widest uppercase"
      >
        <span>Scroll</span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          className="from-primary h-10 w-px bg-gradient-to-b to-transparent"
        />
      </motion.div>
    </section>
  );
}
