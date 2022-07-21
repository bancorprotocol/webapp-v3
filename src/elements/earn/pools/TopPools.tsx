import { Ticker } from 'components/ticker/Ticker';
import { ReactComponent as IconGift } from 'assets/icons/gift.svg';
import { Image } from 'components/image/Image';
import { DepositDisabledModal } from 'elements/earn/pools/poolsTable/v3/DepositDisabledModal';
import { usePoolPick } from 'queries';
import { useMemo } from 'react';
import { orderBy } from 'lodash';
// import { DepositV3Modal } from './poolsTable/v3/DepositV3Modal';

export const TopPools = () => {
  const { getMany } = usePoolPick([
    'poolDltId',
    'symbol',
    'apr',
    'latestProgram',
  ]);

  const { data, isLoading } = getMany();

  const pools = useMemo(() => {
    return orderBy(
      data?.filter((p) => p.apr && p.apr.apr7d.total > 0),
      'apr.apr7d.total',
      'desc'
    ).slice(0, 20);
  }, [data]);

  return (
    <section className="pt-20 pb-10 content-block">
      <h2 className="ml-[20px]">Top Performing</h2>
      <Ticker id="top-tokens">
        <div className="flex mt-20 space-x-16">
          {!isLoading
            ? pools.map((pool, index) => {
                return (
                  <DepositDisabledModal
                    key={`pool-table-key-${index}`}
                    renderButton={(onClick) => (
                      <button
                        onClick={onClick}
                        className="flex items-center justify-center min-w-[170px] h-[75px] rounded-[6px] bg-white dark:bg-charcoal border border-silver dark:border-grey transition-all duration-300"
                      >
                        <Image
                          src={`https://d1wmp5nysbq9xl.cloudfront.net/ethereum/tokens/${pool.poolDltId.toLowerCase()}.svg`}
                          alt="Token Logo"
                          className="!rounded-full w-50 h-50"
                        />
                        <div className="ml-10 text-left text-12 dark:text-graphite">
                          <div className="font-medium">{pool.symbol}</div>
                          <div className="flex items-center gap-5 text-primary text-16">
                            {pool.apr?.apr7d.total.toFixed(2)}%
                            {pool.latestProgram?.isActive && (
                              <IconGift className="w-14 h-14" />
                            )}
                          </div>
                        </div>
                      </button>
                    )}
                  />
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
