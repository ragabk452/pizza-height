'use client';

import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Field, TextArea, TextInput } from '@/components/ui/field';
import { useCreateAddress } from '@/hooks/use-addresses';
import { ApiError } from '@/lib/api';

interface AddressFormProps {
  onCreated: (id: string) => void;
  onCancel: () => void;
}

export function AddressForm({ onCreated, onCancel }: AddressFormProps) {
  const create = useCreateAddress();
  const [form, setForm] = useState({
    label: 'Home',
    street: '',
    building: '',
    apartment: '',
    floor: '',
    area: '',
    city: 'Cairo',
    governorate: 'Cairo',
    landmark: '',
    instructions: '',
  });

  function update<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      const created = await create.mutateAsync({
        label: form.label || undefined,
        street: form.street.trim(),
        building: form.building.trim() || undefined,
        apartment: form.apartment.trim() || undefined,
        floor: form.floor.trim() || undefined,
        area: form.area.trim(),
        city: form.city.trim(),
        governorate: form.governorate.trim() || undefined,
        landmark: form.landmark.trim() || undefined,
        instructions: form.instructions.trim() || undefined,
        isDefault: true,
      });
      toast.success('Address saved');
      onCreated(created.id);
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Could not save address';
      toast.error(message);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Label">
          <TextInput
            value={form.label}
            onChange={(e) => update('label', e.target.value)}
            placeholder="Home, Work…"
            maxLength={40}
          />
        </Field>
        <Field label="Street">
          <TextInput
            value={form.street}
            onChange={(e) => update('street', e.target.value)}
            placeholder="12 El-Tahrir Street"
            required
          />
        </Field>
        <Field label="Building">
          <TextInput
            value={form.building}
            onChange={(e) => update('building', e.target.value)}
            placeholder="5"
          />
        </Field>
        <Field label="Apartment">
          <TextInput
            value={form.apartment}
            onChange={(e) => update('apartment', e.target.value)}
            placeholder="3A"
          />
        </Field>
        <Field label="Floor">
          <TextInput
            value={form.floor}
            onChange={(e) => update('floor', e.target.value)}
            placeholder="3"
          />
        </Field>
        <Field label="Area / Neighborhood">
          <TextInput
            value={form.area}
            onChange={(e) => update('area', e.target.value)}
            placeholder="Zamalek"
            required
          />
        </Field>
        <Field label="City">
          <TextInput value={form.city} onChange={(e) => update('city', e.target.value)} required />
        </Field>
        <Field label="Governorate">
          <TextInput
            value={form.governorate}
            onChange={(e) => update('governorate', e.target.value)}
          />
        </Field>
      </div>

      <Field label="Landmark (helps the driver find you)">
        <TextInput
          value={form.landmark}
          onChange={(e) => update('landmark', e.target.value)}
          placeholder="Near Marriott Hotel"
        />
      </Field>

      <Field label="Delivery instructions">
        <TextArea
          value={form.instructions}
          onChange={(e) => update('instructions', e.target.value)}
          placeholder="Ring the bell twice, leave at door…"
          maxLength={280}
        />
      </Field>

      <div className="flex flex-wrap justify-end gap-3 pt-2">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={create.isPending}>
          {create.isPending ? <Loader2 className="size-4 animate-spin" /> : 'Save address'}
        </Button>
      </div>
    </form>
  );
}
