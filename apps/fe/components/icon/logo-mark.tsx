export interface LogoMarkProps {
  className?: string;
}

export function LogoMark({ className }: LogoMarkProps) {
  return (
    <svg
      viewBox='0 0 32 32'
      className={className}
      role='img'
      aria-label='FinCent'
      fill='none'
    >
      <defs>
        <linearGradient
          id='fincent-edge'
          x1='2'
          y1='2'
          x2='30'
          y2='30'
          gradientUnits='userSpaceOnUse'
        >
          <stop stopColor='#5DCAA5' />
          <stop offset='0.5' stopColor='#85B7EB' />
          <stop offset='1' stopColor='#D4537E' />
        </linearGradient>
        <linearGradient
          id='fincent-fill'
          x1='16'
          y1='6'
          x2='16'
          y2='24'
          gradientUnits='userSpaceOnUse'
        >
          <stop stopColor='#85B7EB' stopOpacity='0.28' />
          <stop offset='1' stopColor='#85B7EB' stopOpacity='0' />
        </linearGradient>
      </defs>

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

      <path
        d='M7 21 L12.5 15.5 L17.5 18 L25 9 L25 23 L7 23 Z'
        fill='url(#fincent-fill)'
      />

      <path
        d='M7 21 L12.5 15.5 L17.5 18 L25 9'
        stroke='url(#fincent-edge)'
        strokeWidth='2.4'
        strokeLinecap='round'
        strokeLinejoin='round'
      />

      <circle cx='25' cy='9' r='2.6' fill='#0D0F12' />
      <circle cx='25' cy='9' r='2.6' fill='#F4F6F8' />
    </svg>
  );
}
