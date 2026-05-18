'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Receipt, ShoppingBag, User, UtensilsCrossed } from 'lucide-react';
import { useCartStore } from '@/store/cart-store';
import { useUIStore } from '@/store/ui-store';
import { useAuthStore } from '@/store/auth-store';
import { cn } from '@/lib/utils';

// Pages where the bottom nav would distract from a focused task. The
// regular navbar stays at the top of these — bottom nav is for browsing /
// returning to the home state.
const HIDDEN_ON: (string | RegExp)[] = [
  '/login',
  '/register',
  '/checkout',
  '/payment/mock',
  /^\/order\/(success|cancelled)/,
  /^\/order\/[^/]+$/, // /order/[id] focused tracking screen
];

interface Tab {
  href?: string;
  label: string;
  Icon: React.ComponentType<{ className?: string }>;
  match: (pathname: string) => boolean;
  onClick?: () => void;
  badgeCount?: number;
}

export function BottomNav() {
  const pathname = usePathname() || '/';
  const openCart = useUIStore((s) => s.openCart);
  const itemCount = useCartStore((s) =>
    s.hydrated ? s.items.reduce((sum, i) => sum + i.quantity, 0) : 0,
  );
  const isAuthed = useAuthStore((s) => s.hydrated && Boolean(s.accessToken));

  if (HIDDEN_ON.some((p) => (typeof p === 'string' ? pathname === p : p.test(pathname)))) {
    return null;
  }

  const tabs: Tab[] = [
    {
      href: '/',
      label: 'Home',
      Icon: Home,
      match: (p) => p === '/',
    },
    {
      href: '/menu',
      label: 'Menu',
      Icon: UtensilsCrossed,
      match: (p) => p.startsWith('/menu'),
    },
    {
      label: 'Cart',
      Icon: ShoppingBag,
      onClick: openCart,
      match: () => false,
      badgeCount: itemCount,
    },
    {
      href: '/orders',
      label: 'Orders',
      Icon: Receipt,
      match: (p) => p.startsWith('/orders'),
    },
    {
      href: isAuthed ? '/orders' : '/login',
      label: isAuthed ? 'Account' : 'Sign in',
      Icon: User,
      match: (p) => p === '/login' || p === '/register',
    },
  ];

  return (
    <nav
      aria-label="Primary mobile"
      className={cn(
        'glass border-border fixed inset-x-0 bottom-0 z-40 flex justify-around border-t md:hidden',
        // Honor the iOS home-indicator inset
        'pb-[max(env(safe-area-inset-bottom),0px)]',
      )}
    >
      {tabs.map((tab) => (
        <BottomNavItem key={tab.label} tab={tab} active={tab.match(pathname)} />
      ))}
    </nav>
  );
}

function BottomNavItem({ tab, active }: { tab: Tab; active: boolean }) {
  const content = (
    <>
      <span className="relative grid h-6 place-items-center">
        <tab.Icon
          className={cn('size-5 transition-colors', active ? 'text-primary' : 'text-muted')}
        />
        {tab.badgeCount !== undefined && tab.badgeCount > 0 && (
          <span
            aria-hidden="true"
            className="bg-primary text-background absolute -top-1.5 -right-2 grid h-4 min-w-4 place-items-center rounded-full px-1 text-[9px] font-bold"
          >
            {tab.badgeCount > 9 ? '9+' : tab.badgeCount}
          </span>
        )}
      </span>
      <span
        className={cn(
          'mt-0.5 text-[10px] font-medium transition-colors',
          active ? 'text-primary' : 'text-muted',
        )}
      >
        {tab.label}
      </span>
    </>
  );

  const className =
    'group flex flex-1 flex-col items-center justify-center px-2 py-2.5 text-center transition-colors active:bg-surface/60';

  if (tab.onClick) {
    return (
      <button
        type="button"
        onClick={tab.onClick}
        className={className}
        aria-label={
          tab.badgeCount !== undefined && tab.badgeCount > 0
            ? `${tab.label}, ${tab.badgeCount} ${tab.badgeCount === 1 ? 'item' : 'items'}`
            : tab.label
        }
      >
        {content}
      </button>
    );
  }

  return (
    <Link
      href={tab.href!}
      className={className}
      aria-current={active ? 'page' : undefined}
      aria-label={tab.label}
    >
      {content}
    </Link>
  );
}
