import '@repo/ui/globals.css';

import { ThemeProvider } from '@repo/ui/components/theme-provider';
import { type Metadata } from 'next';
import { Inter, JetBrains_Mono, Space_Grotesk } from 'next/font/google';
import { type ReactNode } from 'react';

const display = Space_Grotesk({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-space-grotesk',
  display: 'swap',
});

const body = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-inter',
  display: 'swap',
});

const mono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'FinCent — Know exactly what you can safely spend',
  description:
    'FinCent turns daily transactions into an actionable financial plan: fast capture, clear cash-flow understanding, and a live Safe-to-Spend.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang='en'
      suppressHydrationWarning
      className={`
        ${display.variable}
        ${body.variable}
        ${mono.variable}
      `}
    >
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
