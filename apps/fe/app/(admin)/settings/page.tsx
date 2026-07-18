import { type Metadata } from 'next';

import { SettingsView } from '@/app/(admin)/settings/settings-view';

export const metadata: Metadata = {
  title: 'Settings · FinCent',
};

export default function SettingsPage() {
  return <SettingsView />;
}
