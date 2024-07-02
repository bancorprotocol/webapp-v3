import { useAppSelector } from 'store';
import 'elements/earn/pools/Statistics.css';
import numbro from 'numbro';
import { ReactComponent as IconInfo } from 'assets/icons/info.svg';
import { PopoverV3 } from 'components/popover/PopoverV3';
import { Statistic } from 'services/observables/statistics';
import { SnapshotLink } from 'elements/earn/pools/SnapshotLink';

const averageFormat = {
  average: true,
  mantissa: 2,
  optionalMantissa: true,
  spaceSeparated: true,
  lowPrecision: false,
};

export const Statistics = () => {
  const stats = useAppSelector((state) => state.bancor.statistics);

  return (
    <section className="p-20 content-block">
      <div className="grid grid-cols-2 gap-20">
        {!stats ? (
          [...Array(4)].map((_, i) => (
            <div key={`stats-loading-key-${i}`} className={'space-y-6 mb-4'}>
              <div className="w-2/3 loading-skeleton h-14"></div>
              <div className="w-1/2 h-20 mb-10 loading-skeleton"></div>
            </div>
          ))
        ) : (
          <>
            <div>
              <div className="text-secondary">Total Liquidity</div>
              <div className="uppercase text-20 text-black-medium dark:text-white-medium">
                {`$${numbro(stats.totalLiquidity).format(averageFormat)}`}
              </div>
            </div>
            <div>
              <div className="text-secondary">Volume</div>
              <div className="uppercase text-20 text-black-medium dark:text-white-medium">
                {`$${numbro(stats.totalVolume).format(averageFormat)}`}
              </div>
            </div>
            <div>
              <div className="flex items-center text-secondary">
                Fees (24h)
                {toolTip(stats)}
              </div>
              <div className="uppercase text-20 text-black-medium dark:text-white-medium">
                {`$${numbro(stats.totalFees).format(averageFormat)}`}
              </div>
            </div>
            <div>
              <div className="text-secondary">BNT Price</div>
              <div className="uppercase text-20 text-black-medium dark:text-white-medium">
                {`$${numbro(stats.bntRate).format({ mantissa: 2 })}`}
              </div>
            </div>
          </>
        )}
      </div>
    </section>
  );
};

const toolTip = (stats: Statistic) => {
  return (
    <span className="inline-flex ml-5">
      <PopoverV3
        buttonElement={() => (
          <IconInfo className="w-[10px] h-[10px] text-black-low dark:text-white-low" />
        )}
      >
        <div className="w-[220px] text-black-medium dark:text-white-medium">
          <div className="flex items-center justify-between">
            <div className="flex items-center justify-start">
              {/* we show the text as Network Fees instead of fees - see this commit to better understand */}
              <span>Network Fees</span>
              <span className="ml-4 text-secondary">24h</span>
            </div>
            <div>{`$${numbro(stats.totalFees).format(averageFormat)}`}</div>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center justify-start">
              <span>LP Fees</span>
              <span className="ml-4 text-secondary">24h</span>
              <SnapshotLink />
            </div>
            <div>{`$${numbro(stats.totalLpFees).format(averageFormat)}`}</div>
          </div>
        </div>
      </PopoverV3>
    </span>
  );
};
