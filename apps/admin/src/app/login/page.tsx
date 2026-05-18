'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Loader2, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Field, TextInput } from '@/components/ui/field';
import { useStaffLogin } from '@/hooks/use-auth';
import { useAuthStore } from '@/store/auth-store';
import { ApiError } from '@/lib/api';

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="bg-mesh-gold grid min-h-screen place-items-center">
          <Loader2 className="text-primary animate-spin" />
        </div>
      }
    >
      <LoginInner />
    </Suspense>
  );
}

function LoginInner() {
  const router = useRouter();
  const params = useSearchParams();
  const redirectTo = params.get('next') || '/';

  const [email, setEmail] = useState('admin@pizzaheight.com');
  const [password, setPassword] = useState('Admin@2026');
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const login = useStaffLogin();
  const hydrated = useAuthStore((s) => s.hydrated);
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    if (hydrated && user) router.replace(redirectTo);
  }, [hydrated, user, router, redirectTo]);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);
    try {
      await login.mutateAsync({ email, password });
      toast.success('Welcome back', { description: 'Signed in to the admin console.' });
      router.replace(redirectTo);
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Could not sign in.';
      setFormError(message);
    }
  }

  return (
    <main className="bg-mesh-gold relative grid min-h-screen overflow-hidden lg:grid-cols-[1.1fr_1fr]">
      {/* Decorative side */}
      <aside className="bg-surface relative hidden overflow-hidden lg:flex">
        <div className="absolute inset-0">
          <div
            className="absolute -top-24 -left-24 size-[28rem] rounded-full opacity-20 blur-3xl"
            style={{ background: 'var(--primary)' }}
          />
          <div
            className="absolute right-0 bottom-0 size-[24rem] rounded-full opacity-10 blur-3xl"
            style={{ background: 'var(--accent)' }}
          />
        </div>
        <div className="relative z-10 flex w-full flex-col justify-between p-12">
          <div className="flex items-center gap-3">
            <span className="bg-primary/15 border-primary/40 text-primary inline-flex size-9 items-center justify-center rounded-xl border">
              <ShieldCheck className="size-4" />
            </span>
            <div>
              <p className="text-muted text-xs tracking-[0.2em] uppercase">Pizza Height</p>
              <p className="font-display text-foreground text-xl">Admin Console</p>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
            className="space-y-5"
          >
            <h1 className="font-display text-foreground text-5xl leading-tight">
              The kitchen,
              <br />
              <span className="text-gradient-gold">at your fingertips.</span>
            </h1>
            <p className="text-muted max-w-md">
              Live orders, status workflow, menu management, and customer history — all in one luxe
              surface.
            </p>
          </motion.div>

          <div className="text-muted/60 text-xs">
            Staff access only · &copy; {new Date().getFullYear()} Pizza Height
          </div>
        </div>
      </aside>

      {/* Form */}
      <section className="flex items-center justify-center px-6 py-12 sm:px-10 lg:px-16">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="w-full max-w-md"
        >
          <h2 className="font-display text-foreground text-4xl">Sign in</h2>
          <p className="text-muted mt-2 mb-8 text-sm">
            Use your staff credentials to access the admin console.
          </p>

          <form onSubmit={onSubmit} className="space-y-5">
            <Field label="Email">
              <TextInput
                type="email"
                autoComplete="email"
                placeholder="you@pizzaheight.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </Field>

            <Field label="Password">
              <div className="relative">
                <TextInput
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                  className="pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="text-muted hover:text-primary absolute top-1/2 right-3 -translate-y-1/2 p-1 transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </Field>

            {formError && (
              <p className="text-accent bg-accent/10 border-accent/30 rounded-lg border px-4 py-2.5 text-sm">
                {formError}
              </p>
            )}

            <Button type="submit" size="lg" className="w-full" disabled={login.isPending}>
              {login.isPending ? <Loader2 className="animate-spin" /> : 'Sign in'}
            </Button>

            <details className="text-muted bg-surface/40 border-border rounded-lg border px-4 py-3 text-xs">
              <summary className="cursor-pointer font-medium">Demo credentials</summary>
              <div className="mt-2 space-y-1 font-mono text-[11px]">
                <div>admin@pizzaheight.com / Admin@2026 (ADMIN)</div>
                <div>manager@pizzaheight.com / Admin@2026 (MANAGER)</div>
                <div>kitchen@pizzaheight.com / Admin@2026 (KITCHEN)</div>
              </div>
            </details>
          </form>
        </motion.div>
      </section>
    </main>
  );
}
