import { type Metadata } from 'next';

import { GoalsView } from '@/app/(admin)/goals/goals-view';

export const metadata: Metadata = {
  title: 'Goals · FinCent',
};

export default function GoalsPage() {
  return <GoalsView />;
}
