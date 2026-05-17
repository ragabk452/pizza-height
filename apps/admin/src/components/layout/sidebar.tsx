'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  ClipboardList,
  LayoutGrid,
  Settings as SettingsIcon,
  ShieldCheck,
  Sparkles,
  Users,
  Utensils,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const NAV = [
  { href: '/', label: 'Dashboard', icon: LayoutGrid },
  { href: '/orders', label: 'Orders', icon: ClipboardList },
  { href: '/menu', label: 'Menu', icon: Utensils },
  { href: '/customers', label: 'Customers', icon: Users },
  { href: '/settings', label: 'Settings', icon: SettingsIcon },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="border-border bg-surface/60 hidden w-64 shrink-0 flex-col border-r backdrop-blur-md lg:flex">
      <div className="border-border flex items-center gap-3 border-b px-6 py-5">
        <span className="bg-primary/15 border-primary/40 text-primary inline-flex size-9 items-center justify-center rounded-xl border">
          <ShieldCheck className="size-4" />
        </span>
        <div className="leading-tight">
          <p className="text-muted text-[10px] tracking-[0.18em] uppercase">Pizza Height</p>
          <p className="font-display text-foreground text-lg">Admin</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {NAV.map((item) => {
          const active =
            item.href === '/'
              ? pathname === '/'
              : pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all',
                active
                  ? 'text-foreground bg-surface'
                  : 'text-muted hover:text-foreground hover:bg-surface/60',
              )}
            >
              {active && (
                <motion.span
                  layoutId="sidebar-active-pill"
                  className="bg-primary/10 border-primary/40 absolute inset-0 rounded-xl border"
                  transition={{ duration: 0.25, ease: 'easeOut' }}
                />
              )}
              <Icon
                className={cn(
                  'relative size-4 shrink-0 transition-colors',
                  active ? 'text-primary' : 'text-muted group-hover:text-primary',
                )}
              />
              <span className="relative font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="border-border border-t px-6 py-4">
        <div className="text-muted flex items-center gap-2 text-xs">
          <Sparkles className="text-primary size-3.5" />
          <span>Sprint 5 · v0.5</span>
        </div>
      </div>
    </aside>
  );
}
