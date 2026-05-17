'use client';

import { motion, useScroll, useTransform, useMotionValueEvent } from 'framer-motion';
import { ShoppingBag, Menu, X } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const navLinks = [
  { href: '#menu', label: 'Menu' },
  { href: '#story', label: 'Our Story' },
  { href: '#locations', label: 'Locations' },
  { href: '#contact', label: 'Contact' },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { scrollY } = useScroll();

  const padding = useTransform(scrollY, [0, 100], ['1.5rem', '0.75rem']);

  useMotionValueEvent(scrollY, 'change', (latest) => {
    setScrolled(latest > 50);
  });

  return (
    <motion.header
      className={cn(
        'fixed top-0 right-0 left-0 z-50 transition-colors duration-500',
        scrolled ? 'glass border-border border-b' : 'bg-transparent',
      )}
    >
      <motion.div
        style={{ paddingTop: padding, paddingBottom: padding }}
        className="mx-auto flex max-w-7xl items-center justify-between px-6 lg:px-8"
      >
        {/* Logo */}
        <Link href="/" className="group flex items-center gap-2">
          <motion.span
            className="font-display text-foreground group-hover:text-primary text-2xl tracking-tight transition-colors"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          >
            Pizza <span className="text-primary">Height</span>
          </motion.span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-8 md:flex">
          {navLinks.map((link, i) => (
            <motion.a
              key={link.href}
              href={link.href}
              className="text-muted hover:text-primary group relative text-sm font-medium transition-colors"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 * i, ease: 'easeOut' }}
            >
              {link.label}
              <span className="bg-primary absolute -bottom-1 left-0 h-px w-0 transition-all duration-300 group-hover:w-full" />
            </motion.a>
          ))}
        </nav>

        {/* CTA + Cart */}
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="relative hidden md:inline-flex">
            <ShoppingBag />
            <span className="bg-primary text-background absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold">
              0
            </span>
          </Button>
          <Button size="sm" className="hidden md:inline-flex">
            Order Now
          </Button>

          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X /> : <Menu />}
          </Button>
        </div>
      </motion.div>

      {/* Mobile menu */}
      {mobileOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="glass border-border border-t md:hidden"
        >
          <nav className="flex flex-col gap-1 px-6 py-4">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="text-foreground hover:bg-surface hover:text-primary rounded-md px-3 py-3 text-sm font-medium transition-colors"
              >
                {link.label}
              </a>
            ))}
            <Button className="mt-3 w-full">Order Now</Button>
          </nav>
        </motion.div>
      )}
    </motion.header>
  );
}
