'use client';

import { Bike, ChefHat, DollarSign, ShoppingBag } from 'lucide-react';
import { Topbar } from '@/components/layout/topbar';
import { KPICard } from '@/components/dashboard/kpi-card';
import { StatusBreakdown } from '@/components/dashboard/status-breakdown';
import { RecentOrdersTable } from '@/components/dashboard/recent-orders-table';
import { useDashboardStats } from '@/hooks/use-admin-data';
import { useStaffRealtime } from '@/hooks/use-staff-realtime';

export default function DashboardPage() {
  const { data, isLoading } = useDashboardStats();
  useStaffRealtime({ notifyOnNewOrder: true });

  return (
    <>
      <Topbar
        title="Dashboard"
        subtitle={`Today · ${new Date().toLocaleDateString(undefined, {
          weekday: 'long',
          month: 'long',
          day: 'numeric',
        })}`}
      />

      <main className="flex-1 px-6 py-8 sm:px-8">
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          <KPICard
            label="Orders today"
            value={data?.today.orderCount ?? 0}
            icon={ShoppingBag}
            accent="gold"
            loading={isLoading}
          />
          <KPICard
            label="Revenue today"
            value={data?.today.revenue ?? 0}
            prefix="$"
            decimals={2}
            icon={DollarSign}
            accent="success"
            loading={isLoading}
          />
          <KPICard
            label="In progress"
            value={data?.today.inProgress ?? 0}
            icon={ChefHat}
            accent="info"
            loading={isLoading}
          />
          <KPICard
            label="On the way"
            value={data?.statusCounts.OUT_FOR_DELIVERY ?? 0}
            icon={Bike}
            accent="sienna"
            loading={isLoading}
          />
        </div>

        <div className="mt-8 grid gap-5 lg:grid-cols-[1.4fr_1fr]">
          <RecentOrdersTable rows={data?.recentOrders} loading={isLoading} />
          <StatusBreakdown counts={data?.statusCounts} loading={isLoading} />
        </div>
      </main>
    </>
  );
}
