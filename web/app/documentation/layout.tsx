import React from 'react';

export default function layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center">
      <div className="prose dark:prose-invert max-w-[1920px] px-4 py-6 md:px-8 md:py-12">{children}</div>
    </div>
  );
}
