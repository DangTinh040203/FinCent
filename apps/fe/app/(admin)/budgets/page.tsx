import { type Metadata } from 'next';

import { BudgetsView } from '@/app/(admin)/budgets/budgets-view';

export const metadata: Metadata = {
  title: 'Budgets · FinCent',
};

export default function BudgetsPage() {
  return <BudgetsView />;
}
