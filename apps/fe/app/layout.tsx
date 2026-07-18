import '@repo/ui/globals.css';

import { ClerkProvider } from '@clerk/nextjs';
import { Toaster } from '@repo/ui/components/sonner';
import { ThemeProvider } from '@repo/ui/components/theme-provider';
import { type Metadata } from 'next';
import { type ReactNode } from 'react';

import { AppProviders } from '@/components/providers/app-providers';
import { fontVariables } from '@/configs/font.config';

export const metadata: Metadata = {
  title: 'FinCent — Know exactly what you can safely spend',
  description:
    'FinCent turns daily transactions into an actionable financial plan: fast capture, clear cash-flow understanding, and a live Safe-to-Spend.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <ClerkProvider signInFallbackRedirectUrl='/' afterSignOutUrl='/sign-in'>
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
            <Toaster richColors />
            <AppProviders>{children}</AppProviders>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
