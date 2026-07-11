import { AuthenticateWithRedirectCallback } from '@clerk/nextjs';
import { type Metadata } from 'next';

import { Wordmark } from '@/components/brand';

export const metadata: Metadata = {
  title: 'Signing in · FinCent',
};

export default function SSOCallbackPage() {
  return (
    <main
      className={`
        relative grid min-h-dvh place-items-center overflow-hidden px-6
      `}
    >
      {/* Completes the OAuth handshake, then redirects per ClerkProvider config. */}
      <AuthenticateWithRedirectCallback />

      {/* Ambient accent glow — the one colored element per view. */}
      <div
        aria-hidden='true'
        className={`
          pointer-events-none absolute top-[-20%] left-1/2 h-[60%] w-[85%]
          max-w-[720px] -translate-x-1/2 rounded-full opacity-70 blur-3xl
          [background:radial-gradient(45%_45%_at_50%_50%,rgba(93,202,165,0.20),transparent_70%),radial-gradient(45%_45%_at_65%_60%,rgba(133,183,235,0.16),transparent_70%),radial-gradient(40%_40%_at_40%_75%,rgba(212,83,126,0.14),transparent_70%)]
        `}
        style={{ animation: 'fincent-drift 14s var(--ease-fincent) infinite' }}
      />

      <div
        className={`
          relative z-10 flex w-full max-w-[400px] flex-col items-center
          text-center
        `}
      >
        <Wordmark href='/sign-in' />

        <span
          className={`
            border-border bg-background/60 text-muted-foreground mt-10
            inline-flex items-center gap-2.5 rounded-full border px-4 py-2
            font-mono text-[11px] tracking-[0.14em] uppercase
          `}
        >
          <span
            className='bg-accent-green h-[6px] w-[6px] rounded-full'
            style={{ animation: 'fincent-breathe 2.4s var(--ease-fincent) infinite' }}
          />
          Verifying your account
        </span>

        <h1
          className={`
            text-foreground font-display mt-6 text-[clamp(1.9rem,5vw,2.4rem)]
            leading-[1.05] font-semibold tracking-[-0.03em]
          `}
        >
          Almost there.
        </h1>
        <p className='text-muted-foreground mt-3 text-[15px] leading-relaxed'>
          We&rsquo;re finishing your secure sign-in and getting your
          Safe-to-Spend ready. This only takes a moment.
        </p>

        {/* Indeterminate progress — gradient sweeping across a hairline track. */}
        <div
          role='progressbar'
          aria-label='Finishing sign-in'
          className={`
            bg-border/60 relative mt-8 h-1 w-full max-w-[220px] overflow-hidden
            rounded-full
          `}
        >
          <span
            aria-hidden='true'
            className={`
              absolute inset-y-0 left-0 w-1/3 rounded-full
              bg-[linear-gradient(90deg,transparent,#5dcaa5,#85b7eb,#d4537e,transparent)]
            `}
            style={{
              animation: 'fincent-sweep 1.4s var(--ease-fincent) infinite',
            }}
          />
        </div>
      </div>

      {/* Required for sign-up flows: Clerk's bot protection is on by default. */}
      <div id='clerk-captcha' />
    </main>
  );
}
