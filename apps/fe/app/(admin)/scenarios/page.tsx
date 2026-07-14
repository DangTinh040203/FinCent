import { type Metadata } from 'next';

import { PagePlaceholder } from '@/components/admin/page-placeholder';

export const metadata: Metadata = {
  title: 'Can I afford it? · FinCent',
};

export default function ScenariosPage() {
  return <PagePlaceholder href='/scenarios' />;
}
