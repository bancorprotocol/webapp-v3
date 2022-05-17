import { combineLatest } from 'rxjs';
import { shareReplay } from 'rxjs/operators';
import BigNumber from 'bignumber.js';
import numbro from 'numbro';
import { apiData$ } from 'services/observables/apiData';
import { bntToken } from 'services/web3/config';
import { fifteenSeconds$ } from 'services/observables/timers';
import { BancorApi } from 'services/api/bancorApi/bancorApi';
import { switchMapIgnoreThrow } from 'services/observables/customOperators';
import { toBigNumber } from 'utils/helperFunctions';

export interface Statistic {
  label: string;
  value: string;
  change24h?: number;
}

const averageFormat = {
  average: true,
  mantissa: 2,
  optionalMantissa: true,
  spaceSeparated: true,
  lowPrecision: false,
};

export const statisticsV3$ = combineLatest([apiData$, fifteenSeconds$]).pipe(
  switchMapIgnoreThrow(async ([apiDataV2]) => {
    const stats = await BancorApi.v3.getStatistics();

    const bnt24hChange = new BigNumber(stats.bntRate)
      .div(stats.bntRate24hAgo)
      .times(100)
      .minus(100)
      .toNumber();

    const bntSupply = apiDataV2.bnt_supply;

    const totalBntStakedV2: number = apiDataV2.pools.reduce((acc, item) => {
      const bntReserve = item.reserves.find(
        (reserve) => reserve.address === bntToken
      );
      if (!bntReserve) return acc;
      return Number(bntReserve.balance) + acc;
    }, 0);

    const stakedBntPercentV2 = new BigNumber(totalBntStakedV2)
      .div(toBigNumber(bntSupply).toExponential(18))
      .times(100);

    const stakedBntPercentV3 = new BigNumber(stats.stakedBalanceBNT.bnt)
      .div(toBigNumber(bntSupply).toExponential(18))
      .times(100);

    const totalBNTStaked = new BigNumber(stakedBntPercentV2).plus(
      stakedBntPercentV3
    );

    const totalLiquidity = new BigNumber(stats.tradingLiquidityBNT.usd)
      .plus(stats.tradingLiquidityTKN.usd)
      .plus(apiDataV2.total_liquidity.usd);

    const totalVolume = new BigNumber(apiDataV2.total_volume_24h.usd).plus(
      stats.totalVolume24h.usd
    );
    const totalFees = new BigNumber(apiDataV2.total_fees_24h.usd).plus(
      stats.totalFees24h.usd
    );

    const statistics: Statistic[] = [
      {
        label: 'Total Liquidity',
        value: '$' + numbro(totalLiquidity).format(averageFormat),
        change24h: 0,
      },
      {
        label: 'Volume',
        value: '$' + numbro(totalVolume).format(averageFormat),
        change24h: 0,
      },
      {
        label: 'Fees (24h)',
        value: '$' + numbro(totalFees).format(averageFormat),
        change24h: 0,
      },
      {
        label: 'BNT Price',
        value: '$' + numbro(stats.bntRate).format({ mantissa: 2 }),
        change24h: bnt24hChange,
      },
      {
        label: 'BNT Staked',
        value: numbro(totalBNTStaked).format({ mantissa: 2 }) + '%',
      },
    ];
    return statistics;
  }),
  shareReplay(1)
);
