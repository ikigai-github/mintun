'use client';

import { Card } from './ui/card';

type TokenCardProps = {
  tokenName: string;
  img: string;
};

// MOCKS
export const MOCK_TOKEN_CARDS = [
  { tokenName: 'Token #1', img: 'https://via.placeholder.com/150' },
  { tokenName: 'Token #2', img: 'https://via.placeholder.com/150' },
  { tokenName: 'Token #3', img: 'https://via.placeholder.com/150' },
  { tokenName: 'Token #4', img: 'https://via.placeholder.com/150' },
];

const TokenCard = ({ tokenName, img }: TokenCardProps) => {
  return (
    <Card className="flex h-56 w-40 flex-col justify-between rounded-md border sm:w-auto">
      <img className="h-36 w-40 rounded-t-md object-cover" src={img} alt={tokenName} />
      <p className="p-4 font-bold">{tokenName}</p>
    </Card>
  );
};

export const TokenCardList = ({ tokenCards }: { tokenCards: TokenCardProps[] }) => {
  return (
    <div className="flex w-full flex-wrap justify-center gap-3">
      {tokenCards.map((token, index) => {
        return <TokenCard key={index} tokenName={token.tokenName} img={token.img} />;
      })}
    </div>
  );
};
