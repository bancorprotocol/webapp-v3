import { Ticker } from 'components/ticker/Ticker';
import { useAppSelector } from 'store';
import { getTopPoolsV3 } from 'store/bancor/pool';
import { ReactComponent as IconGift } from 'assets/icons/gift.svg';
import { Image } from 'components/image/Image';
import { useModal } from 'hooks/useModal';
import { ModalNames } from 'modals';

export const TopPools = () => {
  const pools = useAppSelector(getTopPoolsV3);
  const { pushModal } = useModal();

  return (
    <section className="pt-20 pb-10 content-block">
      <h2 className="ml-[20px]">Top Performing</h2>
      <Ticker id="top-tokens">
        <div className="flex mt-20 space-x-16">
          {pools.length
            ? pools.map((pool, index) => {
                return (
                  <button
                    key={`pool-table-key-${index}`}
                    onClick={() =>
                      pushModal({ modalName: ModalNames.DepositDisabled })
                    }
                    className="flex items-center justify-center min-w-[170px] h-[75px] rounded-[6px] bg-white dark:bg-charcoal border border-silver dark:border-grey transition-all duration-300"
                  >
                    <Image
                      src={pool.reserveToken.logoURI}
                      alt="Token Logo"
                      className="!rounded-full w-50 h-50"
                    />
                    <div className="ml-10 text-left text-12 dark:text-graphite">
                      <div className="font-medium">
                        {pool.reserveToken.symbol}
                      </div>
                      <div className="flex items-center gap-5 text-primary text-16">
                        {pool.apr7d.total.toFixed(2)}%
                        {pool.latestProgram?.isActive && (
                          <IconGift className="w-14 h-14" />
                        )}
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
