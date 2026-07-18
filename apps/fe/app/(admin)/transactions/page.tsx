import { type Metadata } from 'next';
import { Suspense } from 'react';

import { TransactionsView } from '@/app/(admin)/transactions/transactions-view';

export const metadata: Metadata = {
  title: 'Transactions · FinCent',
};

export default function TransactionsPage() {
  return (
    <Suspense>
      <TransactionsView />
    </Suspense>
  );
}
