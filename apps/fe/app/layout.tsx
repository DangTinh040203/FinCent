import '@repo/ui/globals.css';

import { ThemeProvider } from '@repo/ui/components/theme-provider';
import { type Metadata } from 'next';
import { type ReactNode } from 'react';

import { fontVariables } from '@/configs/font.config';

export const metadata: Metadata = {
  title: 'FinCent — Know exactly what you can safely spend',
  description:
    'FinCent turns daily transactions into an actionable financial plan: fast capture, clear cash-flow understanding, and a live Safe-to-Spend.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang='en' suppressHydrationWarning className={fontVariables}>
      <body
        className={`
          bg-background text-foreground min-h-dvh font-sans antialiased
        `}
      >
        <ThemeProvider
          attribute='class'
          defaultTheme='dark'
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
