'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { LogOut, User } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { useStaffLogout } from '@/hooks/use-auth';
import { useAuthStore } from '@/store/auth-store';
import { cn } from '@/lib/utils';

const ROLE_LABELS: Record<string, string> = {
  ADMIN: 'Admin',
  MANAGER: 'Manager',
  KITCHEN: 'Kitchen',
  DRIVER: 'Driver',
};

interface TopbarProps {
  title: string;
  subtitle?: string;
  trailing?: React.ReactNode;
}

export function Topbar({ title, subtitle, trailing }: TopbarProps) {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const logout = useStaffLogout();
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

  const initials = user
    ? user.name
        .split(/\s+/)
        .map((p) => p[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : '';

  return (
    <header className="border-border bg-background/80 sticky top-0 z-30 border-b px-6 py-4 backdrop-blur-md sm:px-8">
      <div className="flex items-center gap-4">
        <div className="min-w-0 flex-1">
          <h1 className="font-display text-foreground truncate text-2xl tracking-tight sm:text-3xl">
            {title}
          </h1>
          {subtitle && <p className="text-muted mt-0.5 truncate text-xs sm:text-sm">{subtitle}</p>}
        </div>

        {trailing}

        {user && (
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
              <span className="hidden text-xs font-medium sm:inline">
                {user.name.split(' ')[0]}
              </span>
            </button>

            <AnimatePresence>
              {open && (
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.96 }}
                  transition={{ duration: 0.18 }}
                  role="menu"
                  className="bg-surface border-border absolute right-0 mt-2 w-64 overflow-hidden rounded-2xl border shadow-[var(--shadow-card)]"
                >
                  <div className="border-border border-b px-4 py-3">
                    <p className="text-foreground text-sm font-medium">{user.name}</p>
                    <p className="text-muted mt-0.5 text-xs">{user.email}</p>
                    <p className="text-primary mt-1 text-[10px] tracking-wide uppercase">
                      {ROLE_LABELS[user.role] ?? user.role}
                    </p>
                  </div>
                  <div className="p-2">
                    <button
                      type="button"
                      role="menuitem"
                      disabled={logout.isPending}
                      onClick={async () => {
                        setOpen(false);
                        await logout.mutateAsync();
                        toast.success('Signed out');
                        router.replace('/login');
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
        )}
      </div>
    </header>
  );
}
