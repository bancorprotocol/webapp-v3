import { combineLatest } from 'rxjs';
import { shareReplay } from 'rxjs/operators';
import BigNumber from 'bignumber.js';
import { apiData$ } from 'services/observables/apiData';
import { bntToken } from 'services/web3/config';
import { oneMinute$ } from 'services/observables/timers';
import { BancorApi } from 'services/api/bancorApi/bancorApi';
import { switchMapIgnoreThrow } from 'services/observables/customOperators';
import { toBigNumber } from 'utils/helperFunctions';

export interface Statistic {
  totalLiquidity: string;
  totalVolume: string;
  totalFees: string;
  totalLpFees: string;
  totalNetworkFees: string;
  bntRate: string;
  totalBNTStaked: string;
}

export const statisticsV3$ = combineLatest([apiData$, oneMinute$]).pipe(
  switchMapIgnoreThrow(async ([apiDataV2]) => {
    const stats = await BancorApi.v3.getStatistics();

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
    const totalNetworkFees = new BigNumber(
      apiDataV2.total_network_fees_24h.usd
    ).plus(stats.totalNetworkFees24h.usd);

    const statistics: Statistic = {
      totalLiquidity: totalLiquidity.toString(),
      totalVolume: totalVolume.toString(),
      totalFees: totalFees.toString(),
      bntRate: stats.bntRate,
      totalBNTStaked: totalBNTStaked.toString(),
      totalNetworkFees: totalNetworkFees.toString(),
      totalLpFees: '0',
    };
    return statistics;
  }),
  shareReplay(1)
);
