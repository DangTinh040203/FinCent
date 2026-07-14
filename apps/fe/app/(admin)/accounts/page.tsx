import { type Metadata } from 'next';

import { PagePlaceholder } from '@/components/admin/page-placeholder';

export const metadata: Metadata = {
  title: 'Accounts · FinCent',
};

export default function AccountsPage() {
  return <PagePlaceholder href='/accounts' />;
}
