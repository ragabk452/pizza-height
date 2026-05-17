'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { AuthShell } from '@/components/auth/auth-shell';
import { Button } from '@/components/ui/button';
import { Field, TextInput } from '@/components/ui/field';
import { useLogin } from '@/hooks/use-auth';
import { useAuthStore } from '@/store/auth-store';
import { ApiError } from '@/lib/api';

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginFallback />}>
      <LoginForm />
    </Suspense>
  );
}

function LoginFallback() {
  return (
    <div className="bg-mesh-gold grid min-h-screen place-items-center">
      <Loader2 className="text-primary animate-spin" />
    </div>
  );
}

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const redirectTo = params.get('next') || '/menu';

  const [phone, setPhone] = useState('+201001112222');
  const [password, setPassword] = useState('DemoPass2026!');
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const login = useLogin();
  const hydrated = useAuthStore((s) => s.hydrated);
  const customer = useAuthStore((s) => s.customer);

  useEffect(() => {
    if (hydrated && customer) router.replace(redirectTo);
  }, [hydrated, customer, router, redirectTo]);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);
    try {
      await login.mutateAsync({ phone, password });
      toast.success('Welcome back!', {
        description: 'You are now signed in.',
      });
      router.replace(redirectTo);
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Could not sign in.';
      setFormError(message);
    }
  }

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in with your phone and password to continue."
      switchPrompt="New here?"
      switchLabel="Create an account"
      switchHref={`/register${redirectTo !== '/menu' ? `?next=${encodeURIComponent(redirectTo)}` : ''}`}
    >
      <form onSubmit={onSubmit} className="space-y-5">
        <Field label="Phone number" hint="Use the country code, e.g. +20 100 ...">
          <TextInput
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            placeholder="+20 100 111 2222"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
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
          <div className="mt-2 space-y-1 font-mono">
            <div>+201001112222 / DemoPass2026!</div>
            <div>+201112223333 / DemoPass2026!</div>
            <div>+201223334444 / DemoPass2026!</div>
          </div>
        </details>
      </form>
    </AuthShell>
  );
}
