'use client';

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
    <div className="h-48 w-36 rounded-md border sm:w-auto">
      <img className="h-36 w-36 rounded-md object-cover" src={img} alt={tokenName} />
      <p className="px-3 pt-2 font-bold">{tokenName}</p>
    </div>
  );
};

export const TokenCardList = ({ tokenCards }: { tokenCards: TokenCardProps[] }) => {
  return (
    <div className="flex flex-wrap gap-3">
      {tokenCards.map((token, index) => {
        return <TokenCard key={`token-card-${index}`} tokenName={token.tokenName} img={token.img} />;
      })}
    </div>
  );
};
