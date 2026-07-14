import { type Metadata } from 'next';

import { PagePlaceholder } from '@/components/admin/page-placeholder';

export const metadata: Metadata = {
  title: 'Data & privacy · FinCent',
};

export default function DataPrivacyPage() {
  return <PagePlaceholder href='/data-privacy' />;
}
