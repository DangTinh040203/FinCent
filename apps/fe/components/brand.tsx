import Link from 'next/link';

import { LogoMark } from '@/components/icon/logo-mark';

export interface WordmarkProps {
  href?: string;
  className?: string;
}

export function Wordmark({ href = '/', className }: WordmarkProps) {
  return (
    <Link
      href={href}
      aria-label='FinCent home'
      className={`
        focus-visible:ring-ring focus-visible:ring-offset-background
        focus-visible:ring-2 focus-visible:ring-offset-4
        focus-visible:outline-none
        inline-flex items-center gap-2.5 rounded-lg
        ${className ?? ''}
      `}
    >
      <LogoMark className='h-9 w-9' />
      <span className={`
        font-display text-foreground text-[18px] font-semibold
        tracking-[-0.02em]
      `}>
        Fin<span className='text-muted-foreground'>Cent</span>
      </span>
    </Link>
  );
}
