import type { Metadata } from 'next';

import './globals.css';

import { Dosis as FontBase, Glory as FontHeading } from 'next/font/google';
import { Toaster } from 'sonner';

import { cn } from '@/lib/utils';
import { SiteHeader } from '@/components/site-header';
import { ThemeProvider } from '@/components/theme-provider';
import { WalletProvider } from '@/components/wallet-provider';

const fontBase = FontBase({
  subsets: ['latin'],
  variable: '--font-base',
});

const fontHeading = FontHeading({
  subsets: ['latin'],
  variable: '--font-heading',
});

export const metadata: Metadata = {
  title: 'Mintun',
  description: 'Tool for building a modern NFT collection on Cardano',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={cn('flex min-h-screen flex-col font-sans antialiased', fontBase.variable, fontHeading.variable)}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <WalletProvider>
            <SiteHeader />
            {children}
          </WalletProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
