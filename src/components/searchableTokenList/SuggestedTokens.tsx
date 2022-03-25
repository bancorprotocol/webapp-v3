import { Token } from 'services/observables/tokens';
import { useMemo } from 'react';
import { Image } from 'components/image/Image';
import { TokenMinimal } from 'services/observables/tokens';

interface SuggestedTokensProps {
  allTokens: (Token | TokenMinimal)[];
  suggestedTokens: string[];
  onClick: (token: Token | TokenMinimal) => void;
}

export const SuggestedTokens = ({
  allTokens,
  suggestedTokens,
  onClick,
}: SuggestedTokensProps) => {
  const suggestedTokenList = useMemo(
    () =>
      suggestedTokens
        .map((token) => allTokens.find((t) => t.symbol === token))
        .filter((token) => !!token),
    [allTokens, suggestedTokens]
  );

  return (
    <div className="px-10">
      <h3 className="text-14 mb-10 ml-5">Popular Tokens</h3>
      <div className="flex w-full space-x-8">
        {suggestedTokenList.map((token) => (
          <button
            key={token?.address}
            onClick={() => onClick(token!)}
            className="bg-fog dark:bg-grey border dark:border-grey dark:hover:border-black-disabled pt-10 pb-5 w-full flex flex-col items-center rounded-10 hover:shadow-widget transition-all duration-500"
          >
            <Image
              src={token!.logoURI}
              alt={`${token!.symbol} Token`}
              className="bg-silver rounded-full h-28 w-28 mb-5"
            />
            <span className="text-12">{token!.symbol}</span>
          </button>
        ))}
      </div>
    </div>
  );
};
