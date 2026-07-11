import { Inter, JetBrains_Mono, Space_Grotesk } from 'next/font/google';

export const fontDisplay = Space_Grotesk({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-space-grotesk',
  display: 'swap',
});

export const fontBody = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-inter',
  display: 'swap',
});

export const fontMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
});

export const fontVariables = `${fontDisplay.variable} ${fontBody.variable} ${fontMono.variable}`;
