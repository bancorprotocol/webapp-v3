import { Ticker } from 'components/ticker/Ticker';
import { useAppSelector } from 'store';
import { getTopPoolsV3 } from 'store/bancor/pool';
import { ReactComponent as IconGift } from 'assets/icons/gift.svg';
import { Image } from 'components/image/Image';
import { DepositV3Modal } from './poolsTable/v3/DepositV3Modal';

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
                  <DepositV3Modal
                    key={`pool-table-key-${index}`}
                    pool={pool}
                    renderButton={(onClick) => (
                      <button
                        onClick={onClick}
                        className="flex items-center justify-center min-w-[170px] h-[75px] rounded-[6px] bg-white dark:bg-charcoal border border-silver dark:border-grey transition-all duration-300"
                      >
                        <Image
                          src={pool.reserveToken.logoURI}
                          alt="Token Logo"
                          className="!rounded-full w-50 h-50"
                        />
                        <div className="ml-10 text-12 dark:text-graphite text-left">
                          <div className="font-medium">
                            {pool.reserveToken.symbol}
                          </div>
                          <div className="flex items-center gap-5 text-primary text-16">
                            {pool.apr.total.toFixed(2)}%
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
