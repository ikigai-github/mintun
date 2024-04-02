import { ManageCollectionContextProvider } from './context';

export default function ManageCollectionLayout({
  params,
  children,
}: Readonly<{
  params: { policy: string };
  children: React.ReactNode;
}>) {
  return (
    <main className="flex flex-col items-center p-4 md:p-8">
      <ManageCollectionContextProvider policy={params.policy}>{children}</ManageCollectionContextProvider>
    </main>
  );
}
