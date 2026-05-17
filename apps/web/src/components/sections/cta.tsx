'use client';

import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function CTA() {
  return (
    <section className="relative overflow-hidden py-24 sm:py-32">
      {/* Background mesh */}
      <div
        className="absolute inset-0 -z-10"
        style={{
          background:
            'radial-gradient(ellipse 80% 60% at 50% 50%, rgba(201,169,97,0.12), transparent), radial-gradient(ellipse 40% 30% at 80% 20%, rgba(184,67,31,0.1), transparent)',
        }}
      />

      <div className="mx-auto max-w-5xl px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 30 }}
          whileInView={{ opacity: 1, scale: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="border-primary/20 from-surface via-surface to-surface-elevated relative overflow-hidden rounded-[2.5rem] border bg-gradient-to-br p-12 sm:p-16 lg:p-24"
        >
          {/* Animated beam */}
          <motion.div
            animate={{
              backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
            }}
            transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
            className="absolute -top-px right-0 left-0 h-px"
            style={{
              background: 'linear-gradient(90deg, transparent, rgba(201,169,97,0.8), transparent)',
              backgroundSize: '200% 100%',
            }}
          />

          <div className="relative mx-auto max-w-3xl text-center">
            <h2 className="font-display text-foreground text-4xl leading-tight sm:text-5xl lg:text-6xl">
              Tonight&apos;s pizza
              <br />
              <span className="text-gradient-gold">starts at 90 seconds.</span>
            </h2>
            <p className="text-muted mx-auto mt-6 max-w-xl text-lg">
              Build your pie. We fire it. You eat it. Repeat religiously.
            </p>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
              <Button size="xl" asChild>
                <a href="#menu" className="group">
                  Start Your Order
                  <ArrowRight className="transition-transform group-hover:translate-x-1" />
                </a>
              </Button>
              <Button size="xl" variant="outline" asChild>
                <a href="#locations">Find a Location</a>
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
