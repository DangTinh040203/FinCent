import { type Metadata } from 'next';

import { ScenariosView } from '@/app/(admin)/scenarios/scenarios-view';

export const metadata: Metadata = {
  title: 'Can I afford it? · FinCent',
};

export default function ScenariosPage() {
  return <ScenariosView />;
}
