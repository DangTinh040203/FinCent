'use client';

import { useSignIn } from '@clerk/nextjs';
import { type OAuthStrategy } from '@clerk/shared/types';
import { Button } from '@repo/ui/components/button';
import { type ReactNode, useState } from 'react';

import { GitHubMark } from '@/components/icon/github-mark';
import { GoogleMark } from '@/components/icon/google-mark';
import { Env } from '@/configs/env.config';
import { handleClerkError } from '@/libs/clerk-toast';

type Provider = 'google' | 'github';

interface OAuthProvider {
  id: Provider;
  label: string;
  icon: ReactNode;
  strategy: OAuthStrategy;
}

const PROVIDERS: OAuthProvider[] = [
  {
    id: 'google',
    label: 'Google',
    icon: <GoogleMark />,
    strategy: 'oauth_google',
  },
  {
    id: 'github',
    label: 'GitHub',
    icon: <GitHubMark />,
    strategy: 'oauth_github',
  },
];

export function OAuthButtons() {
  const { isLoaded, signIn } = useSignIn();
  const [pending, setPending] = useState<Provider | null>(null);

  const handle = async (provider: OAuthProvider) => {
    if (!isLoaded || pending) return;

    setPending(provider.id);

    try {
      await signIn.authenticateWithRedirect({
        strategy: provider.strategy,
        redirectUrl: Env.NEXT_PUBLIC_REDIRECT_URL,
        redirectUrlComplete: '/',
      });
    } catch (error) {
      handleClerkError(error, {
        fallbackMessage: `Could not continue with ${provider.label}. Please try again.`,
      });
      setPending(null);
    }
  };

  return (
    <div className='flex flex-col gap-3'>
      {PROVIDERS.map((provider) => (
        <Button
          key={provider.id}
          type='button'
          variant='outline'
          onClick={() => handle(provider)}
          disabled={!isLoaded || pending !== null}
          aria-label={`Continue with ${provider.label}`}
          data-provider={provider.id}
          className={`
            ease-fincent h-auto min-h-[54px] w-full justify-center gap-3
            rounded-[10px] font-mono text-[13px] font-medium tracking-[0.06em]
            uppercase transition-transform duration-150
            hover:-translate-y-0.5
            active:translate-y-0
          `}
        >
          <span className='flex h-5 w-5 shrink-0 items-center justify-center'>
            {pending === provider.id ? (
              <span
                aria-hidden='true'
                className={`
                  border-muted-foreground border-t-foreground h-4 w-4
                  animate-spin rounded-full border-2
                `}
              />
            ) : (
              provider.icon
            )}
          </span>
          Continue with {provider.label}
        </Button>
      ))}
    </div>
  );
}
