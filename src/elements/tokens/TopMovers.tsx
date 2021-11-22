import { Ticker } from 'components/ticker/Ticker';
import { useAppSelector } from 'redux/index';
import { Token } from 'services/observables/tokens';
import { prettifyNumber } from 'utils/helperFunctions';
import { orderBy } from 'lodash';

interface Props {
  setSearch: Function;
}

export const TopMovers = ({ setSearch }: Props) => {
  const tokens = useAppSelector<Token[]>((state) => state.bancor.tokens);
  const topTokens = orderBy(tokens, 'price_change_24', 'desc').slice(0, 20);
  const handleClick = (token: Token) => {
    setSearch(token.symbol);
  };

  return (
    <section className="content-section pt-20 pb-10">
      <h2 className="ml-[20px] md:ml-[44px]">Top Movers</h2>
      <hr className="content-separator my-14 mx-[20px] md:mx-[44px]" />
      <Ticker id="top-tokens">
        <div className="flex space-x-16 mt-10">
          {tokens.length
            ? topTokens.map((token) => {
                const changePositive = Number(token.price_change_24) > 0;
                return (
                  <button
                    onClick={() => handleClick(token)}
                    key={token.address}
                    className="flex items-center justify-center min-w-[150px] h-[75px] rounded-[6px] bg-blue-0 dark:bg-blue-2 shadow-ticker hover:shadow-content dark:shadow-none transition-all duration-300"
                  >
                    <div
                      key={token.address}
                      className="flex items-center justify-center min-w-[150px] h-[75px] rounded-[6px] bg-blue-0 dark:bg-blue-2 shadow-ticker hover:shadow-content dark:shadow-none transition-all duration-300"
                    >
                      <img
                        src={token.logoURI.replace('thumb', 'small')}
                        alt="Token Logo"
                        className="w-50 h-50 rounded-full"
                      />
                      <div className="ml-10 text-12 dark:text-grey-3">
                        <div className="font-medium">{token.symbol}</div>
                        <div>{prettifyNumber(token.usdPrice ?? 0, true)}</div>
                        <div
                          className={`font-bold text-${
                            changePositive ? 'success' : 'error'
                          } `}
                        >
                          {`${changePositive ? '+' : ''}${
                            token.price_change_24
                          }%`}
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })
            : [...Array(20)].map((_, index) => (
                <div
                  key={index}
                  className="loading-skeleton !rounded-[6px] min-w-[150px] h-[75px]"
                ></div>
              ))}
        </div>
      </Ticker>
    </section>
  );
};
