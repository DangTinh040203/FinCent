'use client';

import { Button } from '@repo/ui/components/button';
import { useState } from 'react';

import { Env } from '@/configs/env.config';

type Provider = 'google' | 'github';

function startOAuth(provider: Provider) {
  // Backend OAuth initiation route (Passport / NestJS) — e.g. GET /auth/google.
  const target = `${Env.NEXT_PUBLIC_API_URL.replace(/\/$/, '')}/auth/${provider}`;
  window.location.assign(target);
}

const GoogleMark = () => (
  <svg viewBox='0 0 24 24' width='20' height='20' aria-hidden='true'>
    <path
      fill='#4285F4'
      d='M23.52 12.27c0-.82-.07-1.6-.2-2.36H12v4.47h6.47a5.53 5.53 0 0 1-2.4 3.63v3.02h3.88c2.27-2.09 3.57-5.17 3.57-8.76Z'
    />
    <path
      fill='#34A853'
      d='M12 24c3.24 0 5.96-1.08 7.95-2.9l-3.88-3.02c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.28v3.12A12 12 0 0 0 12 24Z'
    />
    <path
      fill='#FBBC05'
      d='M5.27 14.28a7.2 7.2 0 0 1 0-4.56V6.6H1.28a12 12 0 0 0 0 10.8l3.99-3.12Z'
    />
    <path
      fill='#EA4335'
      d='M12 4.76c1.77 0 3.35.61 4.6 1.8l3.44-3.44A11.96 11.96 0 0 0 12 0 12 12 0 0 0 1.28 6.6l3.99 3.12C6.22 6.87 8.87 4.76 12 4.76Z'
    />
  </svg>
);

const GitHubMark = () => (
  <svg
    viewBox='0 0 24 24'
    width='20'
    height='20'
    aria-hidden='true'
    fill='currentColor'
  >
    <path d='M12 .5A11.5 11.5 0 0 0 .5 12a11.5 11.5 0 0 0 7.86 10.92c.58.11.79-.25.79-.56v-2c-3.2.7-3.88-1.37-3.88-1.37-.53-1.35-1.29-1.71-1.29-1.71-1.05-.72.08-.71.08-.71 1.16.08 1.77 1.2 1.77 1.2 1.03 1.77 2.71 1.26 3.37.96.1-.75.4-1.26.73-1.55-2.56-.29-5.25-1.28-5.25-5.7 0-1.26.45-2.29 1.19-3.1-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11 11 0 0 1 5.79 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.84 1.19 3.1 0 4.43-2.7 5.41-5.27 5.69.41.36.78 1.06.78 2.14v3.17c0 .31.21.68.8.56A11.5 11.5 0 0 0 23.5 12 11.5 11.5 0 0 0 12 .5Z' />
  </svg>
);

const PROVIDERS: {
  id: Provider;
  label: string;
  icon: React.ReactNode;
}[] = [
  { id: 'google', label: 'Google', icon: <GoogleMark /> },
  { id: 'github', label: 'GitHub', icon: <GitHubMark /> },
];

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
            ease-tbh h-auto min-h-[54px] w-full justify-center gap-3
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
