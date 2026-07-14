import { type Metadata } from 'next';

import { PagePlaceholder } from '@/components/admin/page-placeholder';

export const metadata: Metadata = {
  title: 'Settings · FinCent',
};

export default function SettingsPage() {
  return <PagePlaceholder href='/settings' />;
}
