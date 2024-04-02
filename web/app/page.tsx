import Image from 'next/image';
import Link from 'next/link';

import { Card } from '@/components/ui/card';
import CollectionsList from '@/components/collections-list';

type LandingLinkProps = {
  href: string;
  imageSrc: string;
  label: string | React.ReactNode; // To pass component such as icon
  alt: string;
};

const LandingLink = ({ href, imageSrc, label, alt }: LandingLinkProps) => {
  return (
    <Card className="overflow-hidden border-[3px] border-gray-300/20">
      <Link href={href} className="relative flex h-60 w-full flex-col justify-center">
        <Image
          src={imageSrc}
          alt={alt}
          width={400}
          height={200}
          className="absolute z-0 size-full object-cover object-center opacity-15 transition-transform duration-[500ms] hover:scale-110"
        />
        <div className=" z-10 text-center text-2xl shadow-sm">{label}</div>
      </Link>
    </Card>
  );
};

export default function Home() {
  return (
    <main className="px-8 py-6 md:px-14 md:py-8 lg:px-20 lg:py-8">
      <div className="mb-12 grid w-full gap-16 md:grid-cols-2">
        <LandingLink
          href="/collection/create"
          imageSrc="/mintun-create-collection.webp"
          label="Create New Collection"
          alt="Create New Collection"
        />
        <LandingLink href="/documentation" imageSrc="/mintun-learn-more.webp" label="Learn More" alt="Learn More" />
      </div>
      <CollectionsList />
    </main>
  );
}
