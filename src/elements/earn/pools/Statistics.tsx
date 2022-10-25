import { useAppSelector } from 'store';
import 'elements/earn/pools/Statistics.css';
import numbro from 'numbro';
import { ReactComponent as IconInfo } from 'assets/icons/info.svg';
import { PopoverV3 } from 'components/popover/PopoverV3';
import { Statistic } from 'services/observables/statistics';
import { SnapshotLink } from 'elements/earn/pools/SnapshotLink';
import { TokenMinimal } from 'services/observables/tokens';
import { ethToken } from 'services/web3/config';
import { getTradeTokensWithExternal } from 'store/bancor/bancor';
import { BaseCurrency } from 'store/user/user';
import { BigNumber } from 'bignumber.js';

const averageFormat = {
  average: true,
  mantissa: 2,
  optionalMantissa: true,
  spaceSeparated: true,
  lowPrecision: false,
};

export const Statistics = () => {
  const stats = useAppSelector((state) => state.bancor.statistics);
  const tokens = useAppSelector<TokenMinimal[]>(getTradeTokensWithExternal);
  const eth = tokens.find((x) => x.address === ethToken);
  const baseCurrency = useAppSelector((state) => state.user.baseCurrency);
  const isETH = baseCurrency === BaseCurrency.ETH;

  const convertToETH = (usd: string) => {
    return eth && isETH
      ? new BigNumber(usd)
          .times(new BigNumber(1).div(eth.usdPrice ?? ''))
          .toString()
      : usd;
  };

  return (
    <section className="p-20 content-block">
      {!stats ? (
        [...Array(4)].map((_, i) => (
          <div key={`stats-loading-key-${i}`}>
            <div className="w-1/2 h-20 mx-auto mb-10 loading-skeleton"></div>
            <div className="w-2/3 mx-auto loading-skeleton h-14"></div>
          </div>
        ))
      ) : (
        <div>
          <div className="flex items-end">
            <div>
              <div className="text-secondary mb-15">Total Liquidity</div>
              <div className="text-[30px] text-black-medium dark:text-white-medium uppercase">
                {`${isETH ? 'ETH' : '$'} ${numbro(
                  convertToETH(stats.totalLiquidity)
                ).format(averageFormat)}`}
              </div>
            </div>
          </div>
          <hr className="my-20 border-fog dark:border-grey" />
          <div className="grid grid-cols-2 gap-20">
            <div>
              <div className="flex items-end">
                <div>
                  <div className="text-secondary">Volume</div>
                  <div className="uppercase text-20 text-black-medium dark:text-white-medium">
                    {`${isETH ? 'ETH' : '$'} ${numbro(
                      convertToETH(stats.totalVolume)
                    ).format(averageFormat)}`}
                  </div>
                </div>
              </div>
            </div>
            <div>
              <div className="flex items-end">
                <div>
                  <div className="flex items-center text-secondary">
                    Fees (24h)
                    {toolTip(stats)}
                  </div>
                  <div className="uppercase text-20 text-black-medium dark:text-white-medium">
                    {`${isETH ? 'ETH' : '$'} ${numbro(
                      convertToETH(stats.totalFees)
                    ).format(averageFormat)}`}
                  </div>
                </div>
              </div>
            </div>
            <div>
              <div className="flex items-end">
                <div>
                  <div className="text-secondary">BNT Price</div>
                  <div className="uppercase text-20 text-black-medium dark:text-white-medium">
                    {`$${numbro(stats.bntRate).format({ mantissa: 2 })}`}
                  </div>
                </div>
              </div>
            </div>
            <div>
              <div className="flex items-end">
                <div>
                  <div className="text-secondary">BNT Staked</div>
                  <div className="uppercase text-20 text-black-medium dark:text-white-medium">
                    {`${numbro(stats.totalBNTStaked).format({ mantissa: 2 })}%`}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
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
              <span>Fees</span>
              <span className="ml-4 text-secondary">24h</span>
            </div>
            <div>{`$${numbro(stats.totalFees).format(averageFormat)}`}</div>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center justify-start">
              <span>Network Fees</span>
              <span className="ml-4 text-secondary">24h</span>
            </div>
            <div>
              {`$${numbro(stats.totalNetworkFees).format(averageFormat)}`}
            </div>
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
