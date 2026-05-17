'use client';

import { motion } from 'framer-motion';
import { Check, ChefHat, Clock, Package, Truck, XCircle, type LucideIcon } from 'lucide-react';
import type { OrderStatus, OrderType } from '@/lib/api-types';
import { cn } from '@/lib/utils';

interface Step {
  status: OrderStatus;
  label: string;
  blurb: string;
  icon: LucideIcon;
}

const DELIVERY_STEPS: Step[] = [
  {
    status: 'PENDING',
    label: 'Received',
    blurb: 'We’ve got your order.',
    icon: Clock,
  },
  {
    status: 'CONFIRMED',
    label: 'Confirmed',
    blurb: 'The kitchen has the slip.',
    icon: Check,
  },
  {
    status: 'PREPARING',
    label: 'Preparing',
    blurb: 'Wood-fired magic in progress.',
    icon: ChefHat,
  },
  {
    status: 'READY',
    label: 'Ready',
    blurb: 'Just out of the oven.',
    icon: Package,
  },
  {
    status: 'OUT_FOR_DELIVERY',
    label: 'On the way',
    blurb: 'Driver is rolling.',
    icon: Truck,
  },
  {
    status: 'DELIVERED',
    label: 'Delivered',
    blurb: 'Enjoy every bite!',
    icon: Check,
  },
];

const PICKUP_STEPS: Step[] = [
  DELIVERY_STEPS[0],
  DELIVERY_STEPS[1],
  DELIVERY_STEPS[2],
  {
    status: 'READY',
    label: 'Ready for pickup',
    blurb: 'Come grab it when you’re ready.',
    icon: Package,
  },
  {
    status: 'DELIVERED',
    label: 'Picked up',
    blurb: 'Enjoy!',
    icon: Check,
  },
];

const ORDER: OrderStatus[] = [
  'PENDING',
  'CONFIRMED',
  'PREPARING',
  'READY',
  'OUT_FOR_DELIVERY',
  'DELIVERED',
];

export function StatusTimeline({ status, type }: { status: OrderStatus; type: OrderType }) {
  const steps = type === 'DELIVERY' ? DELIVERY_STEPS : PICKUP_STEPS;

  if (status === 'CANCELLED') {
    return (
      <div className="bg-accent/10 border-accent/30 flex items-start gap-4 rounded-2xl border p-6">
        <XCircle className="text-accent size-6 shrink-0" />
        <div>
          <h3 className="text-foreground font-display text-xl">Order cancelled</h3>
          <p className="text-muted mt-1 text-sm">
            This order was cancelled. If you need a refund, please contact us.
          </p>
        </div>
      </div>
    );
  }

  const currentIndex = ORDER.indexOf(status);

  return (
    <ol className="space-y-4">
      {steps.map((step, i) => {
        const stepIndex = ORDER.indexOf(step.status);
        const done = stepIndex < currentIndex;
        const active = step.status === status;
        const Icon = step.icon;
        return (
          <li key={step.status} className="flex items-start gap-4">
            <div className="relative flex flex-col items-center">
              <motion.div
                initial={false}
                animate={{
                  scale: active ? 1.1 : 1,
                  boxShadow: active
                    ? '0 0 0 6px rgba(201,169,97,0.18)'
                    : '0 0 0 0px rgba(201,169,97,0)',
                }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
                className={cn(
                  'grid size-11 place-items-center rounded-full border transition-colors',
                  done || active
                    ? 'border-primary bg-primary text-background'
                    : 'border-border bg-surface text-muted',
                )}
              >
                <Icon className="size-5" />
              </motion.div>
              {i < steps.length - 1 && (
                <div className="bg-border relative mt-1 h-12 w-px">
                  <motion.div
                    initial={false}
                    animate={{ height: done ? '100%' : '0%' }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                    className="bg-primary absolute inset-x-0 top-0 w-px"
                  />
                </div>
              )}
            </div>
            <div className="pb-6">
              <p
                className={cn(
                  'font-display text-lg',
                  done || active ? 'text-foreground' : 'text-muted',
                )}
              >
                {step.label}
              </p>
              <p className="text-muted text-sm">{step.blurb}</p>
              {active && (
                <span className="text-primary mt-1 inline-flex items-center gap-1.5 text-xs">
                  <span className="bg-primary inline-block size-1.5 animate-pulse rounded-full" />
                  Live
                </span>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
