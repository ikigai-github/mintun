import { CreateCollectionContextProvider } from './context';

export default function CreateCollectionLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main className="flex flex-col items-center justify-between gap-10 p-4 md:p-12 lg:p-24">
      <CreateCollectionContextProvider>{children}</CreateCollectionContextProvider>
    </main>
  );
}
