'use client';

import { Drawer } from 'vaul';
import { Loader2, X } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Field, TextArea, TextInput } from '@/components/ui/field';
import { useCreateCategory, useUpdateCategory } from '@/hooks/use-admin-data';
import { ApiError } from '@/lib/api';
import type { Category, CategoryCreatePayload } from '@/lib/api-types';

interface Props {
  open: boolean;
  category: Category | null; // null = create, populated = edit
  onClose: () => void;
}

const EMPTY: CategoryCreatePayload = {
  slug: '',
  name: '',
  description: '',
  imageUrl: '',
  sortOrder: 0,
  isActive: true,
};

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

function fromCategory(c: Category): CategoryCreatePayload {
  return {
    slug: c.slug,
    name: c.name,
    description: c.description ?? '',
    imageUrl: c.imageUrl ?? '',
    sortOrder: c.sortOrder,
    isActive: c.isActive,
  };
}

// Outer wrapper just owns the Drawer chrome. The inner form is rekey'd to
// the target id (or 'new'), so each (re)open with a different target gets
// a fresh useState init — no setState-in-effect form-reset gymnastics.
export function CategoryDrawer({ open, category, onClose }: Props) {
  return (
    <Drawer.Root open={open} onOpenChange={(o) => !o && onClose()} direction="right">
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm" />
        <Drawer.Content
          aria-describedby={undefined}
          className="bg-background border-border fixed top-0 right-0 bottom-0 z-50 flex w-full flex-col border-l outline-none sm:max-w-md"
        >
          {open && (
            <CategoryForm key={category?.id ?? 'new'} category={category} onClose={onClose} />
          )}
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}

function CategoryForm({ category, onClose }: { category: Category | null; onClose: () => void }) {
  const isEdit = Boolean(category);
  const [form, setForm] = useState<CategoryCreatePayload>(() =>
    category ? fromCategory(category) : EMPTY,
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  const create = useCreateCategory();
  const update = useUpdateCategory();
  const pending = create.isPending || update.isPending;

  function validate(): boolean {
    const e: Record<string, string> = {};
    if (form.name.trim().length < 2) e.name = 'At least 2 characters.';
    if (form.slug.trim().length < 2) e.slug = 'At least 2 characters.';
    if (!/^[a-z0-9-]+$/.test(form.slug)) e.slug = 'Lowercase letters, digits, and hyphens only.';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function submit() {
    if (!validate()) return;
    const payload: CategoryCreatePayload = {
      ...form,
      description: form.description?.trim() ? form.description : undefined,
      imageUrl: form.imageUrl?.trim() ? form.imageUrl : undefined,
    };
    try {
      if (isEdit && category) {
        await update.mutateAsync({ id: category.id, payload });
        toast.success(`Updated ${payload.name}`);
      } else {
        await create.mutateAsync(payload);
        toast.success(`Created ${payload.name}`);
      }
      onClose();
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : 'Save failed';
      toast.error(msg);
    }
  }

  return (
    <>
      <Drawer.Title className="sr-only">
        {isEdit ? `Edit ${category?.name}` : 'New category'}
      </Drawer.Title>

      <div className="border-border flex items-center justify-between border-b px-6 py-4">
        <div>
          <p className="text-primary text-[10px] tracking-[0.18em] uppercase">
            {isEdit ? 'Edit category' : 'New category'}
          </p>
          <h2 className="font-display text-foreground mt-0.5 text-xl">
            {isEdit ? category?.name : 'Add a category'}
          </h2>
        </div>
        <button
          onClick={onClose}
          aria-label="Close"
          disabled={pending}
          className="text-muted hover:text-foreground rounded-full p-2 transition-colors disabled:opacity-40"
        >
          <X className="size-5" />
        </button>
      </div>

      <div className="flex-1 space-y-5 overflow-y-auto px-6 py-6">
        <Field label="Name" error={errors.name}>
          <TextInput
            value={form.name}
            onChange={(e) => {
              const name = e.target.value;
              setForm((f) => ({
                ...f,
                name,
                // Auto-suggest slug while creating, but never overwrite a
                // slug the admin already typed (or one we loaded for edit).
                slug: !isEdit && (!f.slug || f.slug === slugify(f.name)) ? slugify(name) : f.slug,
              }));
            }}
            placeholder="Signature Pizzas"
          />
        </Field>
        <Field label="Slug" hint="URL segment — lowercase, hyphens." error={errors.slug}>
          <TextInput
            value={form.slug}
            onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
            placeholder="signature-pizzas"
            className="font-mono"
          />
        </Field>
        <Field label="Description (optional)">
          <TextArea
            value={form.description ?? ''}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            rows={3}
            placeholder="Wood-fired, hand-stretched, obsessed-over."
          />
        </Field>
        <Field label="Image URL (optional)">
          <TextInput
            type="url"
            value={form.imageUrl ?? ''}
            onChange={(e) => setForm((f) => ({ ...f, imageUrl: e.target.value }))}
            placeholder="https://images.unsplash.com/photo-..."
          />
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Sort order">
            <TextInput
              type="number"
              min={0}
              value={form.sortOrder ?? 0}
              onChange={(e) => setForm((f) => ({ ...f, sortOrder: Number(e.target.value) || 0 }))}
            />
          </Field>
          <Field label="Active">
            <label className="bg-surface/60 border-border flex h-11 cursor-pointer items-center gap-2 rounded-lg border px-4 text-sm">
              <input
                type="checkbox"
                checked={form.isActive ?? true}
                onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))}
                className="accent-primary"
              />
              <span>{form.isActive ? 'Visible' : 'Hidden'}</span>
            </label>
          </Field>
        </div>
      </div>

      <div className="border-border bg-surface/40 flex items-center justify-end gap-3 border-t px-6 py-4 backdrop-blur-md">
        <Button variant="ghost" onClick={onClose} disabled={pending}>
          Cancel
        </Button>
        <Button onClick={submit} disabled={pending}>
          {pending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : isEdit ? (
            'Save changes'
          ) : (
            'Create category'
          )}
        </Button>
      </div>
    </>
  );
}
