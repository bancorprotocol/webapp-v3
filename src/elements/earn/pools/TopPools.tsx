import { Ticker } from 'components/ticker/Ticker';
import { Image } from 'components/image/Image';
import { useAppSelector } from 'store';
import { getTopPoolsV3 } from 'store/bancor/pool';

export const TopPools = () => {
  const pools = useAppSelector(getTopPoolsV3);

  return (
    <section className="content-block pt-20 pb-10">
      <h2 className="ml-[20px]">Top Performing</h2>
      <Ticker id="top-tokens">
        <div className="flex space-x-16 mt-20">
          {pools.length
            ? pools.map((pool, index) => {
                return (
                  <div
                    key={`pool-table-key-${index}`}
                    className="flex items-center justify-center min-w-[170px] h-[75px] rounded-[6px] bg-white dark:bg-charcoal border border-graphite dark:border-grey transition-all duration-300"
                  >
                    <div className="flex">
                      <Image
                        src={pool.reserveToken.logoURI}
                        alt="Token Logo"
                        className="bg-fog rounded-full w-50 h-50"
                      />
                    </div>
                    <div className="ml-10 text-12 dark:text-graphite text-left">
                      <div className="font-medium">
                        {pool.reserveToken.symbol}
                      </div>
                      <div className="text-16">
                        <span className="text-primary text-20 font-semibold">
                          {pool.apr.toFixed(0)}%
                        </span>{' '}
                        APR
                      </div>
                    </div>
                  </div>
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
