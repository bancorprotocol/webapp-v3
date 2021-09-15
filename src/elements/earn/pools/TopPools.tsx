import { Ticker } from 'components/ticker/Ticker';
import { Image } from 'components/image/Image';
import { useAppSelector } from 'redux/index';
import { getTopPools, TopPool } from 'redux/bancor/pool';

interface Props {
  setSearch: Function;
}

export const TopPools = ({ setSearch }: Props) => {
  const pools = useAppSelector<TopPool[]>(getTopPools);

  const handleClick = (pool: TopPool) => {
    if (pool.tknSymbol === 'BNT') {
      setSearch(pool.poolName);
    } else {
      setSearch(pool.tknSymbol);
    }
  };

  return (
    <section className="content-section pt-20 pb-10">
      <h2 className="ml-[20px] md:ml-[44px]">Top Earners</h2>
      <hr className="content-separator my-14 mx-[20px] md:mx-[44px]" />
      <Ticker id="top-tokens">
        <div className="flex space-x-16 mt-10">
          {pools.length
            ? pools.map((pool, index) => {
                return (
                  <button
                    onClick={() => handleClick(pool)}
                    key={`pool-table-key-${index}`}
                    className="flex items-center justify-center min-w-[170px] h-[75px] rounded-[6px] bg-blue-0 dark:bg-blue-2 shadow-ticker hover:shadow-content dark:shadow-none transition-all duration-300"
                  >
                    <div className="flex">
                      <Image
                        src={pool.tknLogoURI.replace('thumb', 'small')}
                        alt="Token Logo"
                        className="bg-grey-1 rounded-full w-50 h-50"
                      />
                    </div>
                    <div className="ml-10 text-12 dark:text-grey-3 text-left">
                      <div className="font-medium">{pool.tknSymbol}</div>
                      <div className="text-16">
                        <span className="text-primary text-20 font-semibold">
                          {pool.apr.toFixed(0)}%
                        </span>{' '}
                        APR
                      </div>
                    </div>
                  </button>
                );
              })
            : [...Array(20)].map((_, index) => (
                <div
                  key={`pool-table-loading-key-${index}`}
                  className="loading-skeleton !rounded-[6px] min-w-[150px] h-[75px]"
                ></div>
              ))}
        </div>
      </Ticker>
    </section>
  );
};
