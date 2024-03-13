import { CreateCollectionContextProvider } from './context';

export default function CreateCollectionLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main className="flex flex-col items-center p-4 md:p-8">
      <CreateCollectionContextProvider>{children}</CreateCollectionContextProvider>
    </main>
  );
}
