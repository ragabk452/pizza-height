'use client';

import { Drawer } from 'vaul';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  pending?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * Centered confirmation modal — built on Vaul so we inherit its focus trap
 * + ESC handling + scroll lock for free. Used by every "are you sure?"
 * action in the admin (delete category, delete menu item, etc).
 */
export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  destructive = false,
  pending = false,
  onConfirm,
  onCancel,
}: Props) {
  return (
    <Drawer.Root
      open={open}
      onOpenChange={(o) => !o && !pending && onCancel()}
      direction="bottom"
      modal
    >
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm" />
        <Drawer.Content
          aria-describedby={undefined}
          className="bg-background border-border fixed inset-x-0 bottom-0 z-[70] mx-auto max-w-md rounded-t-3xl border outline-none sm:top-1/2 sm:bottom-auto sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-3xl"
        >
          <div className="p-6">
            <div
              className={
                destructive
                  ? 'bg-accent/15 text-accent grid size-12 place-items-center rounded-full'
                  : 'bg-primary/15 text-primary grid size-12 place-items-center rounded-full'
              }
            >
              <AlertTriangle className="size-6" />
            </div>
            <Drawer.Title className="font-display text-foreground mt-4 text-2xl">
              {title}
            </Drawer.Title>
            <p className="text-muted mt-2 text-sm">{description}</p>
            <div className="mt-6 flex items-center justify-end gap-3">
              <Button variant="ghost" onClick={onCancel} disabled={pending}>
                {cancelLabel}
              </Button>
              <Button
                variant={destructive ? 'danger' : 'default'}
                onClick={onConfirm}
                disabled={pending}
              >
                {pending ? <Loader2 className="size-4 animate-spin" /> : confirmLabel}
              </Button>
            </div>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
