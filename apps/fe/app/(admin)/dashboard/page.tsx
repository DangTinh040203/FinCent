import { type Metadata } from 'next';

import { DashboardView } from '@/app/(admin)/dashboard/dashboard-view';

export const metadata: Metadata = {
  title: 'Dashboard · FinCent',
  description:
    'Balances, cash flow, Safe-to-Spend, upcoming bills, and budget risks.',
};

export default function DashboardPage() {
  return <DashboardView />;
}
