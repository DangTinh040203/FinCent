import { type Metadata } from 'next';

import { PagePlaceholder } from '@/components/admin/page-placeholder';

export const metadata: Metadata = {
  title: 'Goals · FinCent',
};

export default function GoalsPage() {
  return <PagePlaceholder href='/goals' />;
}
