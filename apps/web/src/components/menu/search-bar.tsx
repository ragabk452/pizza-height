'use client';

import { Search, X } from 'lucide-react';
import { useEffect, useState } from 'react';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function SearchBar({ value, onChange, placeholder = 'Search the menu...' }: SearchBarProps) {
  const [local, setLocal] = useState(value);

  // Debounce input to avoid hammering the API
  useEffect(() => {
    const t = setTimeout(() => onChange(local), 250);
    return () => clearTimeout(t);
  }, [local, onChange]);

  return (
    <div className="relative w-full max-w-md">
      <Search className="text-muted pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2" />
      <input
        type="search"
        value={local}
        onChange={(e) => setLocal(e.target.value)}
        placeholder={placeholder}
        className="border-border bg-surface text-foreground placeholder:text-muted focus:border-primary focus:ring-primary/30 w-full rounded-full border py-3 pr-12 pl-11 text-sm transition-colors focus:ring-2 focus:outline-none"
      />
      {local && (
        <button
          type="button"
          onClick={() => setLocal('')}
          aria-label="Clear search"
          className="text-muted hover:text-foreground absolute top-1/2 right-3 -translate-y-1/2 rounded-full p-1 transition-colors"
        >
          <X className="size-4" />
        </button>
      )}
    </div>
  );
}
