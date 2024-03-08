import { CreateCollectionContextProvider } from './context';

export default function CreateCollectionLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main className="flex flex-col items-center justify-between gap-10 p-4 pt-8 md:p-24">
      <CreateCollectionContextProvider>{children}</CreateCollectionContextProvider>
    </main>
  );
}
