import { type Metadata } from 'next';

import { RecurringView } from '@/app/(admin)/recurring/recurring-view';

export const metadata: Metadata = {
  title: 'Recurring & bills · FinCent',
};

export default function RecurringPage() {
  return <RecurringView />;
}
