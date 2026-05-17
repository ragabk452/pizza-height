'use client';

import { Loader2, Pencil, Save, X } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { Topbar } from '@/components/layout/topbar';
import { Button } from '@/components/ui/button';
import { Field, TextArea, TextInput } from '@/components/ui/field';
import { useAdminSettings, useUpdateSetting } from '@/hooks/use-admin-data';
import { ApiError } from '@/lib/api';

// ---------------------------------------------------------------------------
// Settings allowlist
// ---------------------------------------------------------------------------
// The /settings/:key endpoint accepts any JSON value. To keep the admin UI
// safe + predictable we hand-curate the editable keys here, including the
// expected JSON shape, the input control to render, and per-key validation.
// Anything in the API response that isn't in this list shows as read-only.
// ---------------------------------------------------------------------------

type FieldType = 'string' | 'number' | 'percent' | 'currency' | 'workingHours';

interface SettingDef {
  key: string;
  label: string;
  hint?: string;
  type: FieldType;
  /** Returns an error string, or null if the value is acceptable. */
  validate?: (raw: string) => string | null;
}

const NUMBER_GE_ZERO = (raw: string) => {
  const n = Number(raw);
  if (!Number.isFinite(n)) return 'Must be a number.';
  if (n < 0) return 'Must be ≥ 0.';
  return null;
};

const PERCENT = (raw: string) => {
  const n = Number(raw);
  if (!Number.isFinite(n)) return 'Must be a number.';
  if (n < 0 || n > 100) return 'Must be between 0 and 100.';
  return null;
};

const DEFS: SettingDef[] = [
  { key: 'restaurant.name', label: 'Restaurant name', type: 'string' },
  { key: 'restaurant.tagline', label: 'Tagline', type: 'string' },
  {
    key: 'restaurant.currency',
    label: 'Currency code',
    hint: '3-letter ISO (USD, EGP, EUR, …).',
    type: 'string',
    validate: (raw) =>
      /^[A-Z]{3}$/.test(raw.trim()) ? null : 'Must be a 3-letter uppercase code.',
  },
  {
    key: 'restaurant.vatPercent',
    label: 'VAT %',
    hint: 'Applied to subtotal at checkout.',
    type: 'percent',
    validate: PERCENT,
  },
  {
    key: 'restaurant.serviceChargePercent',
    label: 'Service charge %',
    type: 'percent',
    validate: PERCENT,
  },
  {
    key: 'restaurant.minOrderAmount',
    label: 'Min order amount',
    hint: 'Customers can’t check out below this subtotal.',
    type: 'currency',
    validate: NUMBER_GE_ZERO,
  },
  {
    key: 'restaurant.defaultDeliveryFee',
    label: 'Default delivery fee',
    type: 'currency',
    validate: NUMBER_GE_ZERO,
  },
  {
    key: 'restaurant.workingHours',
    label: 'Working hours',
    hint: 'JSON: { "monday": { "open": "12:00", "close": "23:00" }, … }',
    type: 'workingHours',
    validate: (raw) => {
      try {
        const parsed = JSON.parse(raw) as unknown;
        if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed))
          return 'Must be a JSON object.';
        for (const [day, entry] of Object.entries(parsed as Record<string, unknown>)) {
          if (typeof entry !== 'object' || entry === null) return `Invalid entry for "${day}".`;
          const e = entry as Record<string, unknown>;
          if (typeof e.open !== 'string' || typeof e.close !== 'string')
            return `Each day needs "open" + "close" strings.`;
        }
        return null;
      } catch {
        return 'Invalid JSON.';
      }
    },
  },
];

function formatForDisplay(def: SettingDef, raw: unknown): string {
  if (raw === undefined || raw === null) return '—';
  if (def.type === 'percent') return `${raw}%`;
  if (def.type === 'currency') return `$${Number(raw).toFixed(2)}`;
  if (def.type === 'workingHours') return 'JSON';
  return String(raw);
}

function toInputString(def: SettingDef, raw: unknown): string {
  if (raw === undefined || raw === null) return '';
  if (def.type === 'workingHours') return JSON.stringify(raw, null, 2);
  return String(raw);
}

function parseFromInput(def: SettingDef, raw: string): unknown {
  const trimmed = raw.trim();
  if (def.type === 'string') return trimmed;
  if (def.type === 'number' || def.type === 'percent' || def.type === 'currency')
    return Number(trimmed);
  if (def.type === 'workingHours') return JSON.parse(trimmed) as unknown;
  return trimmed;
}

export default function SettingsPage() {
  const { data, isLoading } = useAdminSettings();
  const [editing, setEditing] = useState<string | null>(null);

  // Anything in the API response not covered by DEFS shows in an
  // "Other" read-only section — gives the admin visibility without
  // risking a bad write.
  const knownKeys = new Set(DEFS.map((d) => d.key));
  const otherKeys = data ? Object.keys(data).filter((k) => !knownKeys.has(k)) : [];

  return (
    <>
      <Topbar title="Settings" subtitle="Restaurant configuration — edit live." />
      <main className="flex-1 px-6 py-8 sm:px-8">
        {isLoading ? (
          <div className="text-muted flex items-center justify-center gap-2 py-20 text-sm">
            <Loader2 className="size-4 animate-spin" /> Loading…
          </div>
        ) : (
          <div className="max-w-3xl space-y-4">
            {DEFS.map((def) => (
              <SettingRow
                key={def.key}
                def={def}
                value={data?.[def.key]}
                editing={editing === def.key}
                onStartEdit={() => setEditing(def.key)}
                onCancel={() => setEditing(null)}
                onSaved={() => setEditing(null)}
              />
            ))}

            {otherKeys.length > 0 && (
              <div className="bg-surface/30 border-border mt-6 rounded-2xl border p-5">
                <p className="text-muted text-[10px] tracking-[0.18em] uppercase">
                  Other settings (read-only)
                </p>
                <ul className="divide-border mt-2 divide-y">
                  {otherKeys.map((k) => (
                    <li key={k} className="flex items-start justify-between gap-4 py-2">
                      <p className="text-muted font-mono text-xs">{k}</p>
                      <pre className="text-foreground max-w-[60%] overflow-x-auto text-xs">
                        {typeof data?.[k] === 'object'
                          ? JSON.stringify(data[k], null, 2)
                          : String(data?.[k])}
                      </pre>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </main>
    </>
  );
}

// ---------------------------------------------------------------------------

interface RowProps {
  def: SettingDef;
  value: unknown;
  editing: boolean;
  onStartEdit: () => void;
  onCancel: () => void;
  onSaved: () => void;
}

function SettingRow({ def, value, editing, onStartEdit, onCancel, onSaved }: RowProps) {
  return (
    <div className="bg-surface/40 border-border rounded-2xl border p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-foreground text-sm font-medium">{def.label}</p>
          <p className="text-muted font-mono text-[10px]">{def.key}</p>
          {def.hint && <p className="text-muted mt-1 text-xs">{def.hint}</p>}
        </div>
        {!editing && (
          <div className="flex items-center gap-3">
            <span className="font-display text-foreground text-lg tabular-nums">
              {formatForDisplay(def, value)}
            </span>
            <Button size="sm" variant="ghost" onClick={onStartEdit} aria-label="Edit">
              <Pencil className="size-3.5" />
            </Button>
          </div>
        )}
      </div>

      {editing && (
        // Re-mount the editor whenever the underlying value or the key
        // changes so the draft re-seeds via useState initializer — no
        // setState-in-effect.
        <SettingEditor
          key={`${def.key}::${toInputString(def, value)}`}
          def={def}
          value={value}
          onCancel={onCancel}
          onSaved={onSaved}
        />
      )}
    </div>
  );
}

function SettingEditor({
  def,
  value,
  onCancel,
  onSaved,
}: {
  def: SettingDef;
  value: unknown;
  onCancel: () => void;
  onSaved: () => void;
}) {
  const [draft, setDraft] = useState(() => toInputString(def, value));
  const [error, setError] = useState<string | null>(null);
  const update = useUpdateSetting();

  async function save() {
    const validation = def.validate?.(draft) ?? null;
    if (validation) {
      setError(validation);
      return;
    }
    try {
      const parsed = parseFromInput(def, draft);
      await update.mutateAsync({ key: def.key, value: parsed });
      toast.success(`Updated ${def.label}`);
      onSaved();
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : 'Save failed';
      toast.error(msg);
      setError(msg);
    }
  }

  return (
    <div className="mt-4 space-y-3">
      <Field error={error}>
        {def.type === 'workingHours' ? (
          <TextArea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            rows={10}
            className="font-mono text-xs"
          />
        ) : def.type === 'percent' || def.type === 'currency' || def.type === 'number' ? (
          <TextInput
            type="number"
            step={def.type === 'percent' ? '0.1' : '0.01'}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
          />
        ) : (
          <TextInput value={draft} onChange={(e) => setDraft(e.target.value)} />
        )}
      </Field>
      <div className="flex items-center justify-end gap-2">
        <Button size="sm" variant="ghost" onClick={onCancel} disabled={update.isPending}>
          <X className="size-3.5" /> Cancel
        </Button>
        <Button size="sm" onClick={save} disabled={update.isPending}>
          {update.isPending ? (
            <Loader2 className="size-3.5 animate-spin" />
          ) : (
            <Save className="size-3.5" />
          )}{' '}
          Save
        </Button>
      </div>
    </div>
  );
}
