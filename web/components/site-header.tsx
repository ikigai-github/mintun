import Link from 'next/link';

import { WalletButton } from '@/components/wallet-button';

import { ThemeToggle } from './theme-toggle';

export function SiteHeader() {
  return (
    <header className="bg-background sticky top-0 z-40 border-b p-2 px-10">
      <div className="flex items-center">
        <div className="flex flex-1 gap-2">
          <ThemeToggle />
          <Link href="/">
            <h1 className="font-heading flex-1 text-3xl">Mintun</h1>
          </Link>
        </div>
        <div className="flex flex-none">
          <WalletButton />
        </div>
      </div>
    </header>
  );
}
