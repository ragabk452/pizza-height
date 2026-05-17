'use client';

import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface StepDef {
  key: string;
  label: string;
}

interface StepperProps {
  steps: StepDef[];
  current: number;
  className?: string;
}

export function Stepper({ steps, current, className }: StepperProps) {
  return (
    <ol className={cn('flex items-center gap-2 sm:gap-4', className)}>
      {steps.map((step, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <li key={step.key} className="flex flex-1 items-center gap-2 sm:gap-3">
            <div className="relative flex items-center gap-2 sm:gap-3">
              <motion.div
                initial={false}
                animate={{
                  scale: active ? 1.1 : 1,
                  boxShadow: active
                    ? '0 0 0 4px rgba(201,169,97,0.18)'
                    : '0 0 0 0px rgba(201,169,97,0)',
                }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                className={cn(
                  'grid size-9 shrink-0 place-items-center rounded-full border text-sm font-medium transition-colors',
                  done
                    ? 'border-primary bg-primary text-background'
                    : active
                      ? 'border-primary text-primary bg-primary/10'
                      : 'border-border text-muted bg-surface',
                )}
              >
                {done ? <Check className="size-4" /> : i + 1}
              </motion.div>
              <span
                className={cn(
                  'hidden text-xs font-medium tracking-wide uppercase transition-colors sm:inline',
                  active ? 'text-foreground' : done ? 'text-muted' : 'text-muted/60',
                )}
              >
                {step.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className="bg-border relative h-px flex-1 overflow-hidden">
                <motion.div
                  initial={false}
                  animate={{ width: done ? '100%' : '0%' }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                  className="bg-primary absolute inset-y-0 left-0"
                />
              </div>
            )}
          </li>
        );
      })}
    </ol>
  );
}
