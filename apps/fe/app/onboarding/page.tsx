import { type Metadata } from 'next';

import { OnboardingWizard } from '@/app/onboarding/onboarding-wizard';

export const metadata: Metadata = {
  title: 'Welcome · FinCent',
};

export default function OnboardingPage() {
  return (
    <main
      className={`
        mx-auto flex min-h-dvh w-full max-w-2xl flex-col justify-center gap-6
        p-4
      `}
    >
      <OnboardingWizard />
    </main>
  );
}
