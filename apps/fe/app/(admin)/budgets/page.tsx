import { type Metadata } from 'next';

import { PagePlaceholder } from '@/components/admin/page-placeholder';

export const metadata: Metadata = {
  title: 'Budgets · FinCent',
};

export default function BudgetsPage() {
  return <PagePlaceholder href='/budgets' />;
}
