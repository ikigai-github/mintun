import WalletSelector from './WalletSelector';

export default function Nav() {
  return (
    <nav class='navbar bg-gradient-220 from-primary to-secondary shadow-lg shadow-base-300 '>
      <div class='flex-1 text-5xl text-black font-logo'>
        mintUN
      </div>
      <div class='flex-none'>
        <WalletSelector />
      </div>
    </nav>
  );
}