import { useAppSelector } from 'redux/index';
import { useMemo } from 'react';
import { Token } from 'services/observables/tokens';

type PreSuggestedTokenProsp = { onSelect: (token: Token) => void };

const preSuggestedTokenList = ['BNT', 'ETH', 'WBTC', 'USDC', 'USDT'];

export const PreSuggestedToken = ({ onSelect }: PreSuggestedTokenProsp) => {
  const tokens = useAppSelector<Token[]>((state) => state.bancor.tokens);
  const preSuggestedTokens = useMemo(
    () =>
      preSuggestedTokenList.map(
        (tokenSymbol) => tokens.find((t) => t.symbol === tokenSymbol)!
      )
      .filter(token => !!token),
    [tokens]
  );

  return (
    <div className="px-20">
      <div className="ml-12 mb-8 text-grey-5 dark:text-grey-3">
        Popular Tokens
      </div>
      <div className="flex items-center justify-between pb-12">
        {preSuggestedTokens.map((token) => {
          return (
            <div
              onClick={() => onSelect(token)}
              key={token.address}
              className="flex flex-col items-center justify-center w-[60px] h-[60px] rounded-[12px] bg-blue-0 dark:bg-blue-2 shadow-ticker hover:shadow-content hover:border hover:border-grey-2 dark:shadow-none dark:hover:border-none dark:hover:bg-blue-1"
            >
              <img
                src={token.logoURI.replace('thumb', 'small')}
                alt="Token Logo"
                className="w-30 h-30 rounded-full p-5"
              />
              <div className="text-12 dark:text-grey-2">
                <div>{token.symbol}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PreSuggestedToken;
