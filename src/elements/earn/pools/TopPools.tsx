import { Ticker } from 'components/ticker/Ticker';
import { orderBy } from 'lodash';
import { Pool } from 'services/observables/pools';

interface Props {
  pools: Pool[];
}

export const TopPools = ({ pools }: Props) => {
  const topPools = orderBy(pools, 'apr', 'desc').slice(0, 20);

  return (
    <section className="content-section pt-20 pb-10">
      <h2 className="ml-[20px] md:ml-[44px]">Top Pools</h2>
      <hr className="content-separator my-14 mx-[20px] md:mx-[44px]" />
      <Ticker id="top-tokens">
        <div className="flex space-x-16 mt-10">
          {pools.length
            ? topPools.map((pool) => {
                return (
                  <div
                    key={pool.name}
                    className="flex items-center justify-center min-w-[150px] h-[75px] rounded-[6px] bg-blue-0 dark:bg-blue-2 shadow-ticker hover:shadow-content dark:shadow-none transition-all duration-300"
                  >
                    <div className="ml-10 text-12 dark:text-grey-3">
                      <div className="font-medium">{pool.name}</div>
                      <div>{pool.apr.toFixed(2)}% APR</div>
                    </div>
                  </div>
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
