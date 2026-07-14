import { type Metadata } from 'next';

import { PagePlaceholder } from '@/components/admin/page-placeholder';

export const metadata: Metadata = {
  title: 'Transactions · FinCent',
};

export default function TransactionsPage() {
  return <PagePlaceholder href='/transactions' />;
}
