import { type Metadata } from 'next';

import { DataPrivacyView } from '@/app/(admin)/data-privacy/data-privacy-view';

export const metadata: Metadata = {
  title: 'Data & privacy · FinCent',
};

export default function DataPrivacyPage() {
  return <DataPrivacyView />;
}
