import Image from 'next/image';
import type { MintunNft } from '@ikigai-github/mintun-offchain';

import { Card } from '@/components/ui/card';

const hmm =
  'https://ipfs.grabbit.market/ipfs/QmbxVn9628DWipG3giijaH9KvJTZbmnb9B46dvgUGLQmLs?pinataGatewayToken=aIEWTKfwAwdmav4oVVCCQLMokn4yliahcmeF4KLyiFm5J8-luyvpvtevnzWwYvQY';
const drafts: MintunNft[] = [
  {
    name: 'Guy Smoking',
    image: 'ipfs://Qma4Y6f1Kh2bExhNvSa3ooeT2XhX92r5RjbrKq62chTjmo',
    mediaType: 'image/jpeg',
    description: 'A picture of a guy smoking',
    files: [
      {
        src: 'ipfs://Qma4Y6f1Kh2bExhNvSa3ooeT2XhX92r5RjbrKq62chTjmo',
        mediaType: 'image/jpeg',
        purpose: 'Thumbnail',
        dimension: {
          width: 100,
          height: 100,
        },
      },
    ],
  },
  {
    name: 'Guy Pooping',
    image: 'ipfs://QmbxVn9628DWipG3giijaH9KvJTZbmnb9B46dvgUGLQmLs',
    mediaType: 'image/jpeg',
    description: 'A picture of a guy pooping',
    files: [
      {
        src: 'ipfs://QmbxVn9628DWipG3giijaH9KvJTZbmnb9B46dvgUGLQmLs',
        mediaType: 'image/jpeg',
        purpose: 'Thumbnail',
        dimension: {
          width: 100,
          height: 100,
        },
      },
    ],
  },
];

const minted: MintunNft[] = [
  {
    name: 'Guy Thinking',
    image: 'ipfs://QmPHJXbaNbNuF2vtVutfmLECJfzNtLrGTVRdkPqePXiTFB',
    mediaType: 'image/jpeg',
    description: 'A picture of a guy thinking',
    files: [
      {
        src: 'ipfs://QmPHJXbaNbNuF2vtVutfmLECJfzNtLrGTVRdkPqePXiTFB',
        mediaType: 'image/jpeg',
        purpose: 'Thumbnail',
        dimension: {
          width: 100,
          height: 100,
        },
      },
    ],
  },
  {
    name: 'Guy Sneaking',
    image: 'ipfs://QmcGWxZyVNXcZ6MUSTtAvQPkZ6qzUeMBA4T61iHgV3tGdC',
    mediaType: 'image/jpeg',
    description: 'A picture of a guy sneaking',
    files: [
      {
        src: 'ipfs://QmcGWxZyVNXcZ6MUSTtAvQPkZ6qzUeMBA4T61iHgV3tGdC',
        mediaType: 'image/jpeg',
        purpose: 'Thumbnail',
        dimension: {
          width: 100,
          height: 100,
        },
      },
    ],
  },
  {
    name: 'Guy Flipping',
    image: 'ipfs://QmU9rPC9WY9CfqtuYHLVTcTNwb4J9UyyR3kCKZSuBy8qhU',
    mediaType: 'image/jpeg',
    description: 'A picture of a guy flipping you off',
    files: [
      {
        src: 'ipfs://QmU9rPC9WY9CfqtuYHLVTcTNwb4J9UyyR3kCKZSuBy8qhU',
        mediaType: 'image/jpeg',
        purpose: 'Thumbnail',
        dimension: {
          width: 100,
          height: 100,
        },
      },
    ],
  },
  {
    name: 'Guy Pretending',
    image: 'ipfs://QmQrBjtzxSoZmmjKCu6mzdRfHxCnLgtZHYgYRypdADAGCF',
    mediaType: 'image/jpeg',
    description: 'A picture of a guy pretending to make out with someone',
    files: [
      {
        src: 'ipfs://QmQrBjtzxSoZmmjKCu6mzdRfHxCnLgtZHYgYRypdADAGCF',
        mediaType: 'image/jpeg',
        purpose: 'Thumbnail',
        dimension: {
          width: 100,
          height: 100,
        },
      },
    ],
  },
  {
    name: 'Guy Derping',
    image: 'ipfs://QmYnSgBAMkxiw9TzyTphnzE7vJpCjDWJYAgo7hBBPZKufe',
    mediaType: 'image/jpeg',
    description: 'A picture of a guy derping',
    files: [
      {
        src: 'ipfs://QmYnSgBAMkxiw9TzyTphnzE7vJpCjDWJYAgo7hBBPZKufe',
        mediaType: 'image/jpeg',
        purpose: 'Thumbnail',
        dimension: {
          width: 100,
          height: 100,
        },
      },
    ],
  },
];

function ipfsToGateway(url: string) {
  return url.replace('ipfs://', 'https://w3s.link/ipfs/');
}

function CollectionCard({ nft }: { nft: MintunNft }) {
  return (
    <Card className="w-32">
      <div className="h-32">
        <Image fill={true} src={ipfsToGateway(nft.image)} alt={nft.name} />
      </div>
    </Card>
  );
}

export function Collection() {
  return (
    <div className="border p-4 ">
      {drafts.map((nft) => (
        <CollectionCard nft={nft} />
      ))}
    </div>
  );
  // will add paging
}
