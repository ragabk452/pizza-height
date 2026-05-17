'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect, type ReactNode } from 'react';
import { Loader2 } from 'lucide-react';
import { Sidebar } from '@/components/layout/sidebar';
import { useAuthStore } from '@/store/auth-store';

/**
 * Layout for every page that requires staff auth. By living in a route-group
 * layout (instead of being wrapped per page), the Sidebar mounts ONCE for the
 * whole authenticated section — so the Framer Motion `layoutId` pill actually
 * animates between routes, and we don't pay for a fresh shell on every nav.
 *
 * Gates the render on auth-store rehydration so a hard refresh doesn't flash
 * the dashboard before redirecting to /login.
 */
export default function ProtectedLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const hydrated = useAuthStore((s) => s.hydrated);
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    if (hydrated && !user) {
      const next = encodeURIComponent(pathname || '/');
      router.replace(`/login?next=${next}`);
    }
  }, [hydrated, user, pathname, router]);

  if (!hydrated || !user) {
    return (
      <div className="bg-mesh-gold grid min-h-screen place-items-center">
        <Loader2 className="text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="bg-mesh-gold flex min-h-screen">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">{children}</div>
    </div>
  );
}
