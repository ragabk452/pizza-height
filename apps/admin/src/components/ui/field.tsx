'use client';

import {
  forwardRef,
  type InputHTMLAttributes,
  type TextareaHTMLAttributes,
  type ReactNode,
} from 'react';
import { cn } from '@/lib/utils';

interface FieldProps {
  label?: string;
  hint?: string;
  error?: string | null;
  children: ReactNode;
  className?: string;
}

export function Field({ label, hint, error, children, className }: FieldProps) {
  return (
    <label className={cn('flex flex-col gap-1.5', className)}>
      {label && (
        <span className="text-muted text-xs font-medium tracking-wide uppercase">{label}</span>
      )}
      {children}
      {error ? (
        <span className="text-accent text-xs">{error}</span>
      ) : hint ? (
        <span className="text-muted text-xs">{hint}</span>
      ) : null}
    </label>
  );
}

const baseInputStyles = cn(
  'bg-surface/60 border-border text-foreground placeholder:text-muted/60',
  'h-11 rounded-lg border px-4 text-sm transition-all outline-none',
  'focus:border-primary/60 focus:bg-surface/90 focus:shadow-[0_0_0_3px_rgba(201,169,97,0.12)]',
  'disabled:cursor-not-allowed disabled:opacity-50',
);

export const TextInput = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  function TextInput({ className, ...props }, ref) {
    return <input ref={ref} className={cn(baseInputStyles, className)} {...props} />;
  },
);

export const TextArea = forwardRef<
  HTMLTextAreaElement,
  TextareaHTMLAttributes<HTMLTextAreaElement>
>(function TextArea({ className, rows = 3, ...props }, ref) {
  return (
    <textarea
      ref={ref}
      rows={rows}
      className={cn(baseInputStyles, 'h-auto resize-none py-3', className)}
      {...props}
    />
  );
});
