'use client';

import { Drawer } from 'vaul';
import { ArrowDown, ArrowUp, Loader2, Plus, Trash2, X } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Field, TextArea, TextInput } from '@/components/ui/field';
import { useAdminMenuItem, useCreateMenuItem, useUpdateMenuItem } from '@/hooks/use-admin-data';
import { ApiError } from '@/lib/api';
import type {
  Category,
  MenuItem,
  MenuItemCreatePayload,
  ModifierGroupPayload,
  ModifierPayload,
  SizePayload,
} from '@/lib/api-types';
import { cn } from '@/lib/utils';

interface Props {
  open: boolean;
  /** When editing: the id (we fetch the full detail with sizes + modifiers).
   *  When creating: null. */
  itemId: string | null;
  /** Pre-selected category when creating from a specific section. */
  defaultCategoryId?: string;
  categories: Category[];
  onClose: () => void;
}

// ------------------------------------------------------------------------
// Outer wrapper owns the drawer chrome. When `open` flips to true we mount
// the inner loader (keyed by the target id), which fetches the detail and
// then mounts the form. The form's initial state derives from props — no
// setState-in-effect reset.
// ------------------------------------------------------------------------
export function MenuItemDrawer({ open, itemId, defaultCategoryId, categories, onClose }: Props) {
  return (
    <Drawer.Root open={open} onOpenChange={(o) => !o && onClose()} direction="right">
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm" />
        <Drawer.Content
          aria-describedby={undefined}
          className="bg-background border-border fixed top-0 right-0 bottom-0 z-50 flex w-full flex-col border-l outline-none sm:max-w-2xl"
        >
          {open && (
            <MenuItemLoader
              key={itemId ?? 'new'}
              itemId={itemId}
              defaultCategoryId={defaultCategoryId}
              categories={categories}
              onClose={onClose}
            />
          )}
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}

interface LoaderProps {
  itemId: string | null;
  defaultCategoryId?: string;
  categories: Category[];
  onClose: () => void;
}

function MenuItemLoader({ itemId, defaultCategoryId, categories, onClose }: LoaderProps) {
  const isEdit = Boolean(itemId);
  const { data: detail, isLoading } = useAdminMenuItem(itemId ?? undefined);

  if (isEdit && isLoading) {
    return (
      <>
        <Drawer.Title className="sr-only">Loading item</Drawer.Title>
        <div className="text-muted flex flex-1 items-center justify-center gap-2 text-sm">
          <Loader2 className="size-4 animate-spin" /> Loading item details…
        </div>
      </>
    );
  }

  return (
    <MenuItemForm
      initial={isEdit && detail ? fromItem(detail) : emptyForm(defaultCategoryId)}
      itemId={itemId}
      categories={categories}
      onClose={onClose}
    />
  );
}

interface FormProps {
  initial: FormState;
  itemId: string | null;
  categories: Category[];
  onClose: () => void;
}

interface FormState {
  categoryId: string;
  slug: string;
  name: string;
  description: string;
  imageUrl: string;
  basePrice: string; // kept as string so the input behaves correctly
  isAvailable: boolean;
  isPopular: boolean;
  isSpicy: boolean;
  isVegetarian: boolean;
  isVegan: boolean;
  isGlutenFree: boolean;
  isNew: boolean;
  prepTimeMin: string;
  sortOrder: string;
  sizes: SizePayload[];
  modifierGroups: ModifierGroupPayload[];
}

function emptyForm(defaultCategoryId = ''): FormState {
  return {
    categoryId: defaultCategoryId,
    slug: '',
    name: '',
    description: '',
    imageUrl: '',
    basePrice: '',
    isAvailable: true,
    isPopular: false,
    isSpicy: false,
    isVegetarian: false,
    isVegan: false,
    isGlutenFree: false,
    isNew: false,
    prepTimeMin: '15',
    sortOrder: '0',
    sizes: [],
    modifierGroups: [],
  };
}

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

function fromItem(item: MenuItem): FormState {
  return {
    categoryId: item.categoryId,
    slug: item.slug,
    name: item.name,
    description: item.description,
    imageUrl: item.imageUrl ?? '',
    basePrice: String(item.basePrice),
    isAvailable: item.isAvailable,
    isPopular: item.isPopular,
    isSpicy: item.isSpicy,
    isVegetarian: item.isVegetarian,
    isVegan: item.isVegan,
    isGlutenFree: item.isGlutenFree,
    isNew: item.isNew,
    prepTimeMin: String(item.prepTimeMin),
    sortOrder: String(item.sortOrder),
    sizes: (item.sizes ?? []).map((s) => ({
      name: s.name,
      diameterCm: s.diameterCm ?? undefined,
      priceModifier: s.priceModifier,
      isDefault: s.isDefault,
      sortOrder: s.sortOrder,
    })),
    modifierGroups: (item.modifierGroups ?? []).map((g) => ({
      name: g.name,
      isRequired: g.isRequired,
      minSelection: g.minSelection,
      maxSelection: g.maxSelection,
      sortOrder: g.sortOrder,
      modifiers: g.modifiers.map((m) => ({
        name: m.name,
        priceModifier: m.priceModifier,
        isAvailable: m.isAvailable,
        sortOrder: m.sortOrder,
      })),
    })),
  };
}

function MenuItemForm({ initial, itemId, categories, onClose }: FormProps) {
  const isEdit = Boolean(itemId);
  const [form, setForm] = useState<FormState>(initial);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const create = useCreateMenuItem();
  const update = useUpdateMenuItem();
  const pending = create.isPending || update.isPending;

  function setField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function validate(): boolean {
    const e: Record<string, string> = {};
    if (!form.categoryId) e.categoryId = 'Pick a category.';
    if (form.name.trim().length < 2) e.name = 'At least 2 characters.';
    if (!/^[a-z0-9-]+$/.test(form.slug) || form.slug.length < 2)
      e.slug = 'Lowercase letters, digits, hyphens. Min 2.';
    if (form.description.trim().length < 10) e.description = 'At least 10 characters.';
    const price = Number(form.basePrice);
    if (!Number.isFinite(price) || price < 0) e.basePrice = 'Price must be a non-negative number.';

    form.sizes.forEach((s, i) => {
      if (!s.name.trim()) e[`size-${i}-name`] = 'Required';
      if (!Number.isFinite(s.priceModifier)) e[`size-${i}-mod`] = 'Required';
    });
    form.modifierGroups.forEach((g, gi) => {
      if (!g.name.trim()) e[`grp-${gi}-name`] = 'Required';
      if (g.maxSelection < g.minSelection) e[`grp-${gi}-max`] = 'Max must be ≥ min.';
      if (g.modifiers.length === 0) e[`grp-${gi}-mods`] = 'Add at least one option.';
      g.modifiers.forEach((m, mi) => {
        if (!m.name.trim()) e[`grp-${gi}-mod-${mi}-name`] = 'Required';
      });
    });

    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function submit() {
    if (!validate()) {
      toast.error('Fix the highlighted fields.');
      return;
    }
    const payload: MenuItemCreatePayload = {
      categoryId: form.categoryId,
      slug: form.slug,
      name: form.name,
      description: form.description,
      imageUrl: form.imageUrl.trim() || undefined,
      basePrice: Number(form.basePrice),
      isAvailable: form.isAvailable,
      isPopular: form.isPopular,
      isSpicy: form.isSpicy,
      isVegetarian: form.isVegetarian,
      isVegan: form.isVegan,
      isGlutenFree: form.isGlutenFree,
      isNew: form.isNew,
      prepTimeMin: Number(form.prepTimeMin) || 15,
      sortOrder: Number(form.sortOrder) || 0,
      sizes: form.sizes.map((s, i) => ({ ...s, sortOrder: i })),
      modifierGroups: form.modifierGroups.map((g, gi) => ({
        ...g,
        sortOrder: gi,
        modifiers: g.modifiers.map((m, mi) => ({ ...m, sortOrder: mi })),
      })),
    };

    try {
      if (isEdit && itemId) {
        await update.mutateAsync({ id: itemId, payload });
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

  // ----- Sizes helpers -----
  function addSize() {
    setField('sizes', [
      ...form.sizes,
      {
        name: '',
        priceModifier: 0,
        isDefault: form.sizes.length === 0,
        sortOrder: form.sizes.length,
      },
    ]);
  }
  function updateSize(i: number, patch: Partial<SizePayload>) {
    setField(
      'sizes',
      form.sizes.map((s, idx) => (idx === i ? { ...s, ...patch } : s)),
    );
  }
  function moveSize(i: number, dir: -1 | 1) {
    const j = i + dir;
    if (j < 0 || j >= form.sizes.length) return;
    const copy = [...form.sizes];
    [copy[i], copy[j]] = [copy[j], copy[i]];
    setField('sizes', copy);
  }
  function removeSize(i: number) {
    setField(
      'sizes',
      form.sizes.filter((_, idx) => idx !== i),
    );
  }
  function makeDefaultSize(i: number) {
    setField(
      'sizes',
      form.sizes.map((s, idx) => ({ ...s, isDefault: idx === i })),
    );
  }

  // ----- Modifier groups helpers -----
  function addGroup() {
    setField('modifierGroups', [
      ...form.modifierGroups,
      {
        name: '',
        isRequired: false,
        minSelection: 0,
        maxSelection: 1,
        sortOrder: form.modifierGroups.length,
        modifiers: [{ name: '', priceModifier: 0, isAvailable: true, sortOrder: 0 }],
      },
    ]);
  }
  function updateGroup(gi: number, patch: Partial<ModifierGroupPayload>) {
    setField(
      'modifierGroups',
      form.modifierGroups.map((g, i) => (i === gi ? { ...g, ...patch } : g)),
    );
  }
  function moveGroup(gi: number, dir: -1 | 1) {
    const j = gi + dir;
    if (j < 0 || j >= form.modifierGroups.length) return;
    const copy = [...form.modifierGroups];
    [copy[gi], copy[j]] = [copy[j], copy[gi]];
    setField('modifierGroups', copy);
  }
  function removeGroup(gi: number) {
    setField(
      'modifierGroups',
      form.modifierGroups.filter((_, i) => i !== gi),
    );
  }
  function addModifier(gi: number) {
    updateGroup(gi, {
      modifiers: [
        ...form.modifierGroups[gi].modifiers,
        {
          name: '',
          priceModifier: 0,
          isAvailable: true,
          sortOrder: form.modifierGroups[gi].modifiers.length,
        },
      ],
    });
  }
  function updateModifier(gi: number, mi: number, patch: Partial<ModifierPayload>) {
    updateGroup(gi, {
      modifiers: form.modifierGroups[gi].modifiers.map((m, i) =>
        i === mi ? { ...m, ...patch } : m,
      ),
    });
  }
  function removeModifier(gi: number, mi: number) {
    updateGroup(gi, {
      modifiers: form.modifierGroups[gi].modifiers.filter((_, i) => i !== mi),
    });
  }

  // `detail` is no longer in scope (the loader handed us `initial`).
  // Use the initial values to render the header label until the user
  // edits anything.
  const headerName = initial.name || 'Loading…';

  return (
    <>
      <Drawer.Title className="sr-only">
        {isEdit ? `Edit ${headerName}` : 'New menu item'}
      </Drawer.Title>

      <div className="border-border flex items-center justify-between border-b px-6 py-4">
        <div>
          <p className="text-primary text-[10px] tracking-[0.18em] uppercase">
            {isEdit ? 'Edit item' : 'New item'}
          </p>
          <h2 className="font-display text-foreground mt-0.5 text-xl">
            {isEdit ? headerName : 'Add a menu item'}
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

      <div className="flex-1 space-y-8 overflow-y-auto px-6 py-6">
        {/* ---------------- Scalars ---------------- */}
        <section className="space-y-4">
          <SectionHeader title="Basics" />
          <Field label="Category" error={errors.categoryId}>
            <select
              value={form.categoryId}
              onChange={(e) => setField('categoryId', e.target.value)}
              className="bg-surface/60 border-border text-foreground focus:border-primary/60 h-11 rounded-lg border px-4 text-sm outline-none"
            >
              <option value="">— Select —</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Name" error={errors.name}>
            <TextInput
              value={form.name}
              onChange={(e) => {
                const name = e.target.value;
                setForm((f) => ({
                  ...f,
                  name,
                  slug: !isEdit && (!f.slug || f.slug === slugify(f.name)) ? slugify(name) : f.slug,
                }));
              }}
              placeholder="Truffle Bianca"
            />
          </Field>
          <Field label="Slug" hint="URL segment." error={errors.slug}>
            <TextInput
              value={form.slug}
              onChange={(e) => setField('slug', e.target.value)}
              className="font-mono"
              placeholder="truffle-bianca"
            />
          </Field>
          <Field label="Description" error={errors.description}>
            <TextArea
              value={form.description}
              onChange={(e) => setField('description', e.target.value)}
              rows={3}
              placeholder="Wood-fired bianca topped with shaved black truffle…"
            />
          </Field>
          <Field label="Image URL (optional)">
            <TextInput
              type="url"
              value={form.imageUrl}
              onChange={(e) => setField('imageUrl', e.target.value)}
              placeholder="https://images.unsplash.com/..."
            />
          </Field>
          <div className="grid grid-cols-3 gap-4">
            <Field label="Base price" hint="USD" error={errors.basePrice}>
              <TextInput
                type="number"
                step="0.01"
                min={0}
                value={form.basePrice}
                onChange={(e) => setField('basePrice', e.target.value)}
                placeholder="24.00"
              />
            </Field>
            <Field label="Prep time" hint="minutes">
              <TextInput
                type="number"
                min={1}
                value={form.prepTimeMin}
                onChange={(e) => setField('prepTimeMin', e.target.value)}
              />
            </Field>
            <Field label="Sort order">
              <TextInput
                type="number"
                min={0}
                value={form.sortOrder}
                onChange={(e) => setField('sortOrder', e.target.value)}
              />
            </Field>
          </div>
        </section>

        {/* ---------------- Badges ---------------- */}
        <section className="space-y-2">
          <SectionHeader title="Tags" />
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            <Toggle
              label="Available"
              value={form.isAvailable}
              onChange={(v) => setField('isAvailable', v)}
            />
            <Toggle
              label="Popular"
              value={form.isPopular}
              onChange={(v) => setField('isPopular', v)}
            />
            <Toggle label="Spicy" value={form.isSpicy} onChange={(v) => setField('isSpicy', v)} />
            <Toggle
              label="Vegetarian"
              value={form.isVegetarian}
              onChange={(v) => setField('isVegetarian', v)}
            />
            <Toggle label="Vegan" value={form.isVegan} onChange={(v) => setField('isVegan', v)} />
            <Toggle
              label="Gluten-free"
              value={form.isGlutenFree}
              onChange={(v) => setField('isGlutenFree', v)}
            />
            <Toggle label="New" value={form.isNew} onChange={(v) => setField('isNew', v)} />
          </div>
        </section>

        {/* ---------------- Sizes ---------------- */}
        <section className="space-y-3">
          <SectionHeader
            title="Sizes"
            hint="Optional. Price modifier is added to the base price."
            action={
              <Button size="sm" variant="outline" onClick={addSize} disabled={pending}>
                <Plus className="size-3.5" /> Size
              </Button>
            }
          />
          {form.sizes.length === 0 ? (
            <EmptyHint>No sizes — the base price applies as-is.</EmptyHint>
          ) : (
            <div className="space-y-2">
              {form.sizes.map((s, i) => (
                <div
                  key={i}
                  className="bg-surface/40 border-border grid grid-cols-[1fr_90px_90px_auto_auto] items-end gap-2 rounded-xl border p-3"
                >
                  <Field label={i === 0 ? 'Name' : ''} error={errors[`size-${i}-name`]}>
                    <TextInput
                      value={s.name}
                      onChange={(e) => updateSize(i, { name: e.target.value })}
                      placeholder="Large"
                    />
                  </Field>
                  <Field label={i === 0 ? 'Diameter' : ''} hint="cm">
                    <TextInput
                      type="number"
                      min={0}
                      value={s.diameterCm ?? ''}
                      onChange={(e) =>
                        updateSize(i, {
                          diameterCm: e.target.value ? Number(e.target.value) : undefined,
                        })
                      }
                    />
                  </Field>
                  <Field label={i === 0 ? '± Price' : ''} error={errors[`size-${i}-mod`]}>
                    <TextInput
                      type="number"
                      step="0.01"
                      value={s.priceModifier}
                      onChange={(e) => updateSize(i, { priceModifier: Number(e.target.value) })}
                    />
                  </Field>
                  <button
                    type="button"
                    onClick={() => makeDefaultSize(i)}
                    title={s.isDefault ? 'Default' : 'Set as default'}
                    className={cn(
                      'rounded-full px-2 py-1 text-[10px] tracking-wide uppercase transition-colors',
                      s.isDefault ? 'bg-primary/15 text-primary' : 'text-muted hover:text-primary',
                    )}
                  >
                    {s.isDefault ? '★ default' : 'Set default'}
                  </button>
                  <div className="flex flex-col gap-1">
                    <RowButton
                      onClick={() => moveSize(i, -1)}
                      disabled={i === 0}
                      aria-label="Move up"
                    >
                      <ArrowUp className="size-3.5" />
                    </RowButton>
                    <RowButton
                      onClick={() => moveSize(i, 1)}
                      disabled={i === form.sizes.length - 1}
                      aria-label="Move down"
                    >
                      <ArrowDown className="size-3.5" />
                    </RowButton>
                    <RowButton onClick={() => removeSize(i)} aria-label="Remove size" tone="danger">
                      <Trash2 className="size-3.5" />
                    </RowButton>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ---------------- Modifier groups ---------------- */}
        <section className="space-y-3">
          <SectionHeader
            title="Modifier groups"
            hint="E.g. Crust style, Extra toppings."
            action={
              <Button size="sm" variant="outline" onClick={addGroup} disabled={pending}>
                <Plus className="size-3.5" /> Group
              </Button>
            }
          />
          {form.modifierGroups.length === 0 ? (
            <EmptyHint>No modifier groups yet.</EmptyHint>
          ) : (
            <div className="space-y-4">
              {form.modifierGroups.map((g, gi) => (
                <div
                  key={gi}
                  className="bg-surface/40 border-border space-y-3 rounded-2xl border p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <Field
                      label={`Group ${gi + 1} name`}
                      error={errors[`grp-${gi}-name`]}
                      className="flex-1"
                    >
                      <TextInput
                        value={g.name}
                        onChange={(e) => updateGroup(gi, { name: e.target.value })}
                        placeholder="Crust style"
                      />
                    </Field>
                    <div className="flex flex-col gap-1 pt-6">
                      <RowButton
                        onClick={() => moveGroup(gi, -1)}
                        disabled={gi === 0}
                        aria-label="Move up"
                      >
                        <ArrowUp className="size-3.5" />
                      </RowButton>
                      <RowButton
                        onClick={() => moveGroup(gi, 1)}
                        disabled={gi === form.modifierGroups.length - 1}
                        aria-label="Move down"
                      >
                        <ArrowDown className="size-3.5" />
                      </RowButton>
                      <RowButton
                        onClick={() => removeGroup(gi)}
                        aria-label="Remove group"
                        tone="danger"
                      >
                        <Trash2 className="size-3.5" />
                      </RowButton>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <Field label="Required">
                      <label className="bg-surface/60 border-border flex h-11 cursor-pointer items-center gap-2 rounded-lg border px-3 text-sm">
                        <input
                          type="checkbox"
                          checked={g.isRequired}
                          onChange={(e) => updateGroup(gi, { isRequired: e.target.checked })}
                          className="accent-primary"
                        />
                        <span>{g.isRequired ? 'Yes' : 'No'}</span>
                      </label>
                    </Field>
                    <Field label="Min select">
                      <TextInput
                        type="number"
                        min={0}
                        value={g.minSelection}
                        onChange={(e) =>
                          updateGroup(gi, { minSelection: Number(e.target.value) || 0 })
                        }
                      />
                    </Field>
                    <Field label="Max select" hint="0 = unlimited" error={errors[`grp-${gi}-max`]}>
                      <TextInput
                        type="number"
                        min={0}
                        value={g.maxSelection}
                        onChange={(e) =>
                          updateGroup(gi, { maxSelection: Number(e.target.value) || 0 })
                        }
                      />
                    </Field>
                  </div>

                  {/* Modifiers inside the group */}
                  <div className="space-y-2">
                    <div className="text-muted text-[10px] tracking-[0.18em] uppercase">
                      Options
                      {errors[`grp-${gi}-mods`] && (
                        <span className="text-accent ml-2 tracking-normal normal-case">
                          · {errors[`grp-${gi}-mods`]}
                        </span>
                      )}
                    </div>
                    {g.modifiers.map((m, mi) => (
                      <div
                        key={mi}
                        className="bg-background/40 border-border grid grid-cols-[1fr_90px_auto_auto] items-end gap-2 rounded-lg border p-2.5"
                      >
                        <Field error={errors[`grp-${gi}-mod-${mi}-name`]}>
                          <TextInput
                            value={m.name}
                            onChange={(e) => updateModifier(gi, mi, { name: e.target.value })}
                            placeholder="Truffle oil"
                          />
                        </Field>
                        <Field>
                          <TextInput
                            type="number"
                            step="0.01"
                            value={m.priceModifier}
                            onChange={(e) =>
                              updateModifier(gi, mi, { priceModifier: Number(e.target.value) })
                            }
                            placeholder="+0.00"
                          />
                        </Field>
                        <button
                          type="button"
                          onClick={() => updateModifier(gi, mi, { isAvailable: !m.isAvailable })}
                          title={m.isAvailable ? 'Available' : 'Sold out'}
                          className={cn(
                            'rounded-full px-2 py-1 text-[10px] tracking-wide uppercase',
                            m.isAvailable
                              ? 'text-success bg-success/10'
                              : 'text-accent bg-accent/10',
                          )}
                        >
                          {m.isAvailable ? 'In stock' : 'Sold out'}
                        </button>
                        <RowButton
                          onClick={() => removeModifier(gi, mi)}
                          aria-label="Remove option"
                          tone="danger"
                        >
                          <Trash2 className="size-3.5" />
                        </RowButton>
                      </div>
                    ))}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => addModifier(gi)}
                      disabled={pending}
                    >
                      <Plus className="size-3.5" /> Add option
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      <div className="border-border bg-surface/40 flex items-center justify-between gap-3 border-t px-6 py-4 backdrop-blur-md">
        <p className="text-muted text-xs">
          {isEdit
            ? 'Saving replaces all sizes + modifier groups atomically.'
            : 'Sizes + modifier groups are optional.'}
        </p>
        <div className="flex items-center gap-2">
          <Button variant="ghost" onClick={onClose} disabled={pending}>
            Cancel
          </Button>
          <Button onClick={submit} disabled={pending}>
            {pending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : isEdit ? (
              'Save changes'
            ) : (
              'Create item'
            )}
          </Button>
        </div>
      </div>
    </>
  );
}

// ----- small helpers -----

function SectionHeader({
  title,
  hint,
  action,
}: {
  title: string;
  hint?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex items-end justify-between gap-3">
      <div>
        <h3 className="text-foreground font-display text-lg">{title}</h3>
        {hint && <p className="text-muted text-xs">{hint}</p>}
      </div>
      {action}
    </div>
  );
}

function Toggle({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label
      className={cn(
        'flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors',
        value
          ? 'border-primary/40 bg-primary/10 text-primary'
          : 'border-border bg-surface/40 text-muted hover:text-foreground',
      )}
    >
      <input
        type="checkbox"
        checked={value}
        onChange={(e) => onChange(e.target.checked)}
        className="accent-primary"
      />
      {label}
    </label>
  );
}

function EmptyHint({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-muted bg-surface/30 border-border rounded-xl border border-dashed px-4 py-6 text-center text-xs">
      {children}
    </p>
  );
}

function RowButton({
  children,
  onClick,
  disabled,
  tone = 'default',
  ...rest
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  tone?: 'default' | 'danger';
} & React.AriaAttributes) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'grid size-7 place-items-center rounded-md border transition-colors disabled:opacity-30',
        tone === 'danger'
          ? 'border-accent/30 text-accent hover:bg-accent/10'
          : 'border-border text-muted hover:text-primary hover:border-primary/40',
      )}
      {...rest}
    >
      {children}
    </button>
  );
}
