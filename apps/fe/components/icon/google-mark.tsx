export interface IconProps {
  className?: string;
  size?: number;
}

export function GoogleMark({ className, size = 20 }: IconProps) {
  return (
    <svg
      viewBox='0 0 24 24'
      width={size}
      height={size}
      className={className}
      aria-hidden='true'
    >
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
}
