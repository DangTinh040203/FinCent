import Link from 'next/link';

/**
 * FinCent logo mark — a rounded token holding an ascending cash-flow line
 * with a live end node. Uses the TBH edge gradient (green → blue → pink).
 */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox='0 0 32 32'
      className={className}
      role='img'
      aria-label='FinCent'
      fill='none'
    >
      <defs>
        <linearGradient id='fincent-edge' x1='2' y1='2' x2='30' y2='30' gradientUnits='userSpaceOnUse'>
          <stop stopColor='#5DCAA5' />
          <stop offset='0.5' stopColor='#85B7EB' />
          <stop offset='1' stopColor='#D4537E' />
        </linearGradient>
        <linearGradient id='fincent-fill' x1='16' y1='6' x2='16' y2='24' gradientUnits='userSpaceOnUse'>
          <stop stopColor='#85B7EB' stopOpacity='0.28' />
          <stop offset='1' stopColor='#85B7EB' stopOpacity='0' />
        </linearGradient>
      </defs>

      {/* Token */}
      <rect
        x='1'
        y='1'
        width='30'
        height='30'
        rx='9'
        fill='#0D0F12'
        stroke='url(#fincent-edge)'
        strokeWidth='1.5'
      />

      {/* Area under the trend line */}
      <path d='M7 21 L12.5 15.5 L17.5 18 L25 9 L25 23 L7 23 Z' fill='url(#fincent-fill)' />

      {/* Trend line */}
      <path
        d='M7 21 L12.5 15.5 L17.5 18 L25 9'
        stroke='url(#fincent-edge)'
        strokeWidth='2.4'
        strokeLinecap='round'
        strokeLinejoin='round'
      />

      {/* Live end node */}
      <circle cx='25' cy='9' r='2.6' fill='#0D0F12' />
      <circle cx='25' cy='9' r='2.6' fill='#F4F6F8' />
    </svg>
  );
}

/** Logo mark + wordmark, linking home. */
export function Wordmark({
  href = '/',
  className,
}: {
  href?: string;
  className?: string;
}) {
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
