import { WalletButton } from '@/components/wallet-button';

export function SiteHeader() {
  return (
    <header className="bg-background sticky top-0 z-40 border-b p-2">
      <div className="flex items-center">
        <h1 className="font-heading flex-1 text-3xl">Mintun</h1>
        <div className="flex flex-none">
          <WalletButton />
        </div>
      </div>
    </header>
  );
}
