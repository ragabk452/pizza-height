'use client';

import { motion } from 'framer-motion';
import { Loader2, Mail, Phone, Search, User } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Topbar } from '@/components/layout/topbar';
import { TextInput } from '@/components/ui/field';
import { CustomerDetailDrawer } from '@/components/customers/customer-detail-drawer';
import { useCustomersList } from '@/hooks/use-admin-data';

export default function CustomersPage() {
  const router = useRouter();
  const [input, setInput] = useState('');
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setSearch(input.trim()), 250);
    return () => clearTimeout(t);
  }, [input]);

  const { data: customers, isLoading } = useCustomersList(search || undefined);

  return (
    <>
      <Topbar
        title="Customers"
        subtitle={
          customers
            ? `${customers.length} ${customers.length === 1 ? 'customer' : 'customers'}`
            : 'Loading…'
        }
      />
      <main className="flex-1 px-6 py-8 sm:px-8">
        <div className="relative max-w-sm">
          <Search className="text-muted pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
          <TextInput
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Search name, phone, or email"
            className="pl-10"
          />
        </div>

        {isLoading ? (
          <div className="text-muted mt-10 flex items-center justify-center gap-2 text-sm">
            <Loader2 className="size-4 animate-spin" /> Loading customers…
          </div>
        ) : !customers || customers.length === 0 ? (
          <div className="bg-surface/40 border-border mt-8 rounded-2xl border px-6 py-16 text-center">
            <h3 className="font-display text-foreground text-xl">No matching customers</h3>
            <p className="text-muted mt-2 text-sm">Try a different search term.</p>
          </div>
        ) : (
          <ul className="mt-6 grid gap-3 lg:grid-cols-2">
            {customers.map((c, i) => (
              <motion.li
                key={c.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03, duration: 0.3 }}
              >
                <button
                  type="button"
                  onClick={() => setSelectedId(c.id)}
                  className="bg-surface/40 border-border hover:bg-surface hover:border-primary/40 flex w-full items-center gap-4 rounded-2xl border p-4 text-left transition-all hover:-translate-y-0.5 hover:shadow-[var(--shadow-card)]"
                >
                  <span className="bg-primary/15 border-primary/40 text-primary inline-flex size-11 shrink-0 items-center justify-center rounded-xl border">
                    <User className="size-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-foreground font-medium">{c.name}</p>
                    <div className="text-muted mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
                      <span className="inline-flex items-center gap-1">
                        <Phone className="size-3" /> {c.phone}
                      </span>
                      {c.email && (
                        <span className="inline-flex items-center gap-1">
                          <Mail className="size-3" /> {c.email}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-display text-primary text-lg tabular-nums">
                      ${c.lifetimeSpend.toFixed(2)}
                    </p>
                    <p className="text-muted text-[10px] tracking-wide uppercase">
                      {c.orderCount} {c.orderCount === 1 ? 'order' : 'orders'}
                    </p>
                  </div>
                </button>
              </motion.li>
            ))}
          </ul>
        )}
      </main>

      <CustomerDetailDrawer
        customerId={selectedId}
        onClose={() => setSelectedId(null)}
        // Deep-link into /orders?id=<orderId> — the orders page already
        // opens that order's drawer when ?id= is set.
        onOrderClick={(orderId) => {
          setSelectedId(null);
          router.push(`/orders?id=${orderId}`);
        }}
      />
    </>
  );
}
