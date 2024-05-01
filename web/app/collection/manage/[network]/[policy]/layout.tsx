import { ManageCollectionContextProvider } from './context';

export default async function ManageCollectionLayout({
  params,
  children,
}: Readonly<{
  params: { policy: string; network: string };
  children: React.ReactNode;
}>) {
  return (
    <main className="flex flex-col items-center p-4 md:p-8">
      <ManageCollectionContextProvider policy={params.policy}>{children}</ManageCollectionContextProvider>
    </main>
  );
}
