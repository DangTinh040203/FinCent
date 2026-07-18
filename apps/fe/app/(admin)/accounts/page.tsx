import { type Metadata } from 'next';

import { AccountsView } from '@/app/(admin)/accounts/accounts-view';

export const metadata: Metadata = {
  title: 'Accounts · FinCent',
};

export default function AccountsPage() {
  return <AccountsView />;
}
