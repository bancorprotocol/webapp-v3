import { Ticker } from 'components/ticker/Ticker';
import { useAppSelector } from 'store';
import { Token } from 'services/observables/tokens';
import { prettifyNumber } from 'utils/helperFunctions';
import { getTopMovers } from 'store/bancor/bancor';

interface Props {
  setSearch: Function;
}

export const TopMovers = ({ setSearch }: Props) => {
  const tokens = useAppSelector(getTopMovers);
  const handleClick = (token: Token) => {
    setSearch(token.symbol);
  };

  return (
    <section className="pt-20 pb-10 content-block">
      <h2 className="ml-[20px]">Top Movers</h2>
      <Ticker id="top-tokens">
        <div className="flex mt-20 space-x-16">
          {tokens.length
            ? tokens.map((token) => {
                const changePositive = Number(token.price_change_24) > 0;
                return (
                  <button
                    onClick={() => handleClick(token)}
                    key={token.address}
                  >
                    <div className="flex items-center justify-center min-w-[170px] h-[75px] rounded-[6px] bg-white dark:bg-charcoal border border-graphite dark:border-grey transition-all duration-300">
                      <img
                        src={token.logoURI.replace('thumb', 'small')}
                        alt="Token Logo"
                        className="rounded-full w-50 h-50"
                      />
                      <div className="ml-10 text-12 dark:text-graphite">
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
