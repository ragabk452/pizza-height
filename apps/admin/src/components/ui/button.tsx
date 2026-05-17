import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background relative',
  {
    variants: {
      variant: {
        default:
          'bg-primary text-background hover:bg-primary-hover shadow-[var(--shadow-gold)] hover:shadow-[0_8px_32px_rgba(201,169,97,0.4)] hover:-translate-y-0.5',
        outline:
          'border border-primary/40 bg-transparent text-foreground hover:border-primary hover:bg-primary/10',
        ghost: 'text-foreground hover:bg-surface hover:text-primary',
        danger: 'bg-accent text-foreground hover:bg-accent/90 shadow-lg hover:-translate-y-0.5',
        secondary: 'bg-surface-elevated text-foreground hover:bg-surface border border-border',
        link: 'text-primary underline-offset-4 hover:underline',
      },
      size: {
        sm: 'h-8 px-3 text-xs',
        default: 'h-10 px-5',
        lg: 'h-12 px-7 text-base',
        icon: 'h-9 w-9',
      },
    },
    defaultVariants: { variant: 'default', size: 'default' },
  },
);

interface ButtonProps extends ComponentProps<'button'>, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export function Button({ className, variant, size, asChild = false, ...props }: ButtonProps) {
  const Comp = asChild ? Slot : 'button';
  return <Comp className={cn(buttonVariants({ variant, size, className }))} {...props} />;
}

export { buttonVariants };
