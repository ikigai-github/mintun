import Link from 'next/link';

export default function Home() {
  return (
    <main className="flex  flex-col items-center justify-between gap-10 p-24">
      <Link href="/create-collection/describe">Create a collection</Link>
    </main>
  );
}
