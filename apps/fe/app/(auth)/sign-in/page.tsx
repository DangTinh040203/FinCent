import { Card, CardContent } from '@repo/ui/components/card';
import { Progress } from '@repo/ui/components/progress';
import { Separator } from '@repo/ui/components/separator';
import { ThemeSelect } from '@repo/ui/components/theme-select';
import { type Metadata } from 'next';
import Link from 'next/link';

import { OAuthButtons } from '@/app/(auth)/sign-in/oauth-buttons';
import { Wordmark } from '@/components/brand';

export const metadata: Metadata = {
  title: 'Sign in · FinCent',
  description: 'Sign in to FinCent with Google or GitHub.',
};

function BrandPanel() {
  return (
    <aside
      className={`
        border-border bg-background relative hidden overflow-hidden border-r
        lg:flex lg:flex-col lg:justify-between lg:p-14
      `}
    >
      <div
        aria-hidden='true'
        className={`
          pointer-events-none absolute top-[-10%] -left-1/4 h-[70%] w-[80%]
          rounded-full opacity-70 blur-3xl
          [background:radial-gradient(45%_45%_at_50%_50%,rgba(93,202,165,0.22),transparent_70%),radial-gradient(45%_45%_at_70%_60%,rgba(133,183,235,0.18),transparent_70%),radial-gradient(40%_40%_at_40%_80%,rgba(212,83,126,0.16),transparent_70%)]
        `}
        style={{ animation: 'fincent-drift 14s var(--ease-fincent) infinite' }}
      />
      <div className='relative z-10'>
        <Wordmark />
      </div>

      <div className='relative z-10 max-w-[30ch]'>
        <span
          className={`
            text-muted-foreground font-mono text-xs font-medium
            tracking-[0.16em] uppercase
          `}
        >
          Personal finance, decided
        </span>
        <h1
          className={`
            text-foreground font-display mt-5 text-[clamp(2.2rem,3.4vw,3.1rem)]
            leading-[1.05] font-semibold tracking-[-0.03em]
          `}
        >
          Know exactly what you can safely spend.
        </h1>
        <p className='text-muted-foreground mt-5 text-[15px] leading-relaxed'>
          FinCent turns daily transactions into an actionable plan — fast
          capture, clear cash-flow, and a live Safe-to-Spend you can trust.
        </p>
      </div>

      <Card className='relative z-10 w-full max-w-sm gap-0 py-5'>
        <CardContent className='px-5'>
          <div className='flex items-center justify-between'>
            <span
              className={`
                text-muted-foreground font-mono text-[11px] tracking-[0.14em]
                uppercase
              `}
            >
              Safe-to-Spend
            </span>
            <span
              className={`
                text-foreground inline-flex items-center gap-2 font-mono
                text-[11px] tracking-[0.1em] uppercase
              `}
            >
              <span
                className='bg-accent-green h-[6px] w-[6px] rounded-full'
                style={{ animation: 'fincent-breathe 2.4s var(--ease-fincent) infinite' }}
              />
              On track
            </span>
          </div>
          <div
            className={`
              text-foreground font-display mt-3 text-[2rem] font-semibold
              tracking-[-0.02em] tabular-nums
            `}
          >
            $1,284
            <span className={`
              text-muted-foreground ml-2 align-middle text-sm font-normal
            `}>
              until Aug 1
            </span>
          </div>
          <Progress
            value={62}
            className={`
              mt-4 h-1.5
              [&>[data-slot=progress-indicator]]:bg-[linear-gradient(90deg,#5dcaa5,#85b7eb)]
            `}
          />
        </CardContent>
      </Card>
    </aside>
  );
}

export default function SignInPage() {
  return (
    <main className={`
      grid min-h-dvh grid-cols-1
      lg:grid-cols-[1.05fr_1fr]
    `}>
      <BrandPanel />

      <section className={`
        relative flex flex-col px-5 py-8
        sm:px-8
        lg:px-14 lg:py-12
      `}>
        <header className='flex items-center justify-between'>
          <div className='lg:invisible'>
            <Wordmark />
          </div>
          <ThemeSelect />
        </header>

        <div className='flex flex-1 flex-col justify-center'>
          <div className='mx-auto w-full max-w-[400px]'>
            <span
              className={`
                text-muted-foreground font-mono text-xs font-medium
                tracking-[0.16em] uppercase
              `}
            >
              Welcome back
            </span>
            <h2
              className={`
                text-foreground font-display mt-3
                text-[clamp(1.9rem,6vw,2.4rem)] leading-[1.05] font-semibold
                tracking-[-0.03em]
              `}
            >
              Sign in to FinCent
            </h2>
            <p className={`
              text-muted-foreground mt-3 text-[15px] leading-relaxed
            `}>
              Use your Google or GitHub account. No passwords to remember.
            </p>

            <div className='mt-8'>
              <OAuthButtons />
            </div>

            <div className='mt-7 flex items-center gap-4' aria-hidden='true'>
              <Separator className='flex-1' />
              <span
                className={`
                  text-muted-foreground font-mono text-[11px] tracking-[0.14em]
                  uppercase
                `}
              >
                Secure sign-in
              </span>
              <Separator className='flex-1' />
            </div>

            <p className={`
              text-muted-foreground mt-7 text-[13px] leading-relaxed
            `}>
              By continuing you agree to FinCent&rsquo;s{' '}
              <Link
                href='/terms'
                className={`
                  decoration-border underline underline-offset-4
                  transition-colors
                  hover:text-foreground
                `}
              >
                Terms
              </Link>{' '}
              and{' '}
              <Link
                href='/privacy'
                className={`
                  decoration-border underline underline-offset-4
                  transition-colors
                  hover:text-foreground
                `}
              >
                Privacy Policy
              </Link>
              . Your financial data stays yours - export or delete it anytime.
            </p>
          </div>
        </div>

        <footer className='mx-auto w-full max-w-[400px]'>
          <p
            className={`
              text-muted-foreground font-mono text-[11px] tracking-[0.12em]
              uppercase
            `}
          >
            New here? Continue with a provider to create your account.
          </p>
        </footer>
      </section>
    </main>
  );
}
