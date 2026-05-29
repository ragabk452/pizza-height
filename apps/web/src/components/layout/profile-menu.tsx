'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { LogOut, Receipt, User } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { useLogout } from '@/hooks/use-auth';
import { useAuthStore } from '@/store/auth-store';
import { cn } from '@/lib/utils';

export function ProfileMenu() {
  const router = useRouter();
  const hydrated = useAuthStore((s) => s.hydrated);
  const customer = useAuthStore((s) => s.customer);
  const logout = useLogout();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  // Avoid flashing "Sign in" before localStorage rehydrates
  if (!hydrated) return <div className="size-10" />;

  if (!customer) {
    return (
      <Button asChild variant="outline" size="sm" className="hidden sm:inline-flex">
        <Link href="/login">Sign in</Link>
      </Button>
    );
  }

  const initials = customer.name
    .split(/\s+/)
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          'bg-surface/60 border-border text-foreground hover:border-primary/40 hover:bg-surface flex items-center gap-2 rounded-full border py-1.5 pr-3 pl-1.5 transition-all',
          open && 'border-primary/60',
        )}
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <span className="bg-primary text-background grid size-7 place-items-center rounded-full text-xs font-medium">
          {initials || <User className="size-3.5" />}
        </span>
        <span className="hidden text-xs font-medium sm:inline">{customer.name.split(' ')[0]}</span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.18 }}
            role="menu"
            className="bg-surface border-border absolute right-0 mt-2 w-60 max-w-[calc(100vw-1.5rem)] overflow-hidden rounded-2xl border shadow-[var(--shadow-card)] backdrop-blur-md"
          >
            <div className="border-border border-b px-4 py-3">
              <p className="text-foreground text-sm font-medium">{customer.name}</p>
              <p className="text-muted mt-0.5 text-xs">{customer.phone}</p>
            </div>
            <div className="p-2">
              <MenuLink
                href="/orders"
                icon={Receipt}
                label="My orders"
                onClick={() => setOpen(false)}
              />
              <button
                type="button"
                role="menuitem"
                disabled={logout.isPending}
                onClick={async () => {
                  setOpen(false);
                  await logout.mutateAsync();
                  toast.success('Signed out');
                  router.replace('/');
                }}
                className="text-accent hover:bg-accent/10 flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors disabled:opacity-50"
              >
                <LogOut className="size-4" />
                Sign out
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function MenuLink({
  href,
  icon: Icon,
  label,
  onClick,
}: {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  onClick?: () => void;
}) {
  return (
    <Link
      href={href}
      role="menuitem"
      onClick={onClick}
      className="text-foreground hover:bg-surface-elevated hover:text-primary flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors"
    >
      <Icon className="size-4" />
      {label}
    </Link>
  );
}
