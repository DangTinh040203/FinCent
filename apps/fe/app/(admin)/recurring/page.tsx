import { type Metadata } from 'next';

import { PagePlaceholder } from '@/components/admin/page-placeholder';

export const metadata: Metadata = {
  title: 'Recurring & bills · FinCent',
};

export default function RecurringPage() {
  return <PagePlaceholder href='/recurring' />;
}
