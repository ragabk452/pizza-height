'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

interface AuthShellProps {
  title: string;
  subtitle: string;
  switchPrompt: string;
  switchLabel: string;
  switchHref: string;
  children: ReactNode;
}

export function AuthShell({
  title,
  subtitle,
  switchPrompt,
  switchLabel,
  switchHref,
  children,
}: AuthShellProps) {
  return (
    <main className="bg-mesh-gold relative grid min-h-screen overflow-hidden lg:grid-cols-2">
      {/* Side panel — only on lg+ */}
      <aside className="bg-surface relative hidden overflow-hidden lg:flex">
        <div className="absolute inset-0">
          <div
            className="absolute -top-32 -left-32 size-96 rounded-full opacity-20 blur-3xl"
            style={{ background: 'var(--primary)' }}
          />
          <div
            className="absolute right-0 bottom-0 size-[28rem] rounded-full opacity-15 blur-3xl"
            style={{ background: 'var(--accent)' }}
          />
        </div>

        <div className="relative z-10 flex w-full flex-col justify-between p-12">
          <Link href="/" className="group inline-flex items-center gap-2">
            <span className="font-display text-foreground group-hover:text-primary text-2xl tracking-tight transition-colors">
              Pizza <span className="text-primary">Height</span>
            </span>
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="space-y-6"
          >
            <div className="text-[10rem] leading-none">🍕</div>
            <h1 className="font-display text-foreground max-w-md text-5xl leading-[1.1]">
              Hand-crafted,
              <br />
              <span className="text-gradient-gold">delivered to elevate.</span>
            </h1>
            <p className="text-muted max-w-md text-lg">
              Wood-fired in 90 seconds. The finest ingredients, the warmest welcome. Join the height
              of taste.
            </p>
          </motion.div>

          <div className="text-muted/60 text-xs">
            &copy; {new Date().getFullYear()} Pizza Height. Crafted with care.
          </div>
        </div>
      </aside>

      {/* Form panel */}
      <section className="flex items-center justify-center px-6 py-12 sm:px-10 lg:px-16">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="w-full max-w-md"
        >
          {/* Mobile-only logo */}
          <Link
            href="/"
            className="font-display text-foreground hover:text-primary mb-10 inline-flex items-center gap-2 text-2xl tracking-tight transition-colors lg:hidden"
          >
            Pizza <span className="text-primary">Height</span>
          </Link>

          <h2 className="font-display text-foreground text-4xl">{title}</h2>
          <p className="text-muted mt-2 mb-8 text-sm">{subtitle}</p>

          {children}

          <p className="text-muted mt-8 text-center text-sm">
            {switchPrompt}{' '}
            <Link
              href={switchHref}
              className="text-primary font-medium underline-offset-4 hover:underline"
            >
              {switchLabel}
            </Link>
          </p>
        </motion.div>
      </section>
    </main>
  );
}
