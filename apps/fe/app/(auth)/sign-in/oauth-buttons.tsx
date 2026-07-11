'use client';

import { Button } from '@repo/ui/components/button';
import { type ReactNode, useState } from 'react';

import { GitHubMark } from '@/components/icon/github-mark';
import { GoogleMark } from '@/components/icon/google-mark';
import { Env } from '@/configs/env.config';

type Provider = 'google' | 'github';

interface OAuthProvider {
  id: Provider;
  label: string;
  icon: ReactNode;
}

const PROVIDERS: OAuthProvider[] = [
  { id: 'google', label: 'Google', icon: <GoogleMark /> },
  { id: 'github', label: 'GitHub', icon: <GitHubMark /> },
];

function startOAuth(provider: Provider) {
  const target = `${Env.NEXT_PUBLIC_API_URL.replace(/\/$/, '')}/auth/${provider}`;
  window.location.assign(target);
}

export function OAuthButtons() {
  const [pending, setPending] = useState<Provider | null>(null);

  const handle = (provider: Provider) => {
    if (pending) return;
    setPending(provider);
    startOAuth(provider);
  };

  return (
    <div className='flex flex-col gap-3'>
      {PROVIDERS.map(({ id, label, icon }) => (
        <Button
          key={id}
          type='button'
          variant='outline'
          onClick={() => handle(id)}
          disabled={pending !== null}
          aria-label={`Continue with ${label}`}
          data-provider={id}
          className={`
            ease-fincent h-auto min-h-[54px] w-full justify-center gap-3
            rounded-[10px] font-mono text-[13px] font-medium tracking-[0.06em]
            uppercase transition-transform duration-150
            hover:-translate-y-0.5
            active:translate-y-0
          `}
        >
          <span className='flex h-5 w-5 shrink-0 items-center justify-center'>
            {pending === id ? (
              <span
                aria-hidden='true'
                className={`
                  border-muted-foreground border-t-foreground h-4 w-4
                  animate-spin rounded-full border-2
                `}
              />
            ) : (
              icon
            )}
          </span>
          Continue with {label}
        </Button>
      ))}
    </div>
  );
}
