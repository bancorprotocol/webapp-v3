import { combineLatest } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';
import { apiData$ } from 'services/observables/pools';
import BigNumber from 'bignumber.js';
import numbro from 'numbro';

export interface Statistic {
  label: string;
  value: string;
  change24h?: number;
}

export const statistics$ = combineLatest([apiData$]).pipe(
  map(([apiData]) => {
    const averageFormat = {
      average: true,
      mantissa: 3,
      optionalMantissa: true,
      spaceSeparated: true,
      lowPrecision: false,
    };

    const bnt24hChange = new BigNumber(apiData.bnt_price.usd!)
      .div(apiData.bnt_price_24h_ago.usd!)
      .times(100)
      .minus(100)
      .toNumber();

    const bntAddress = '0x1F573D6Fb3F13d689FF844B4cE37794d79a7FF1C';
    const bntSupply: string = apiData.bnt_supply;
    const totalBntStaked: number = apiData.pools.reduce((acc, item) => {
      const bntReserve = item.reserves.find(
        (reserve) => reserve.address.toLowerCase() === bntAddress.toLowerCase()
      );
      if (!bntReserve) return acc;
      return Number(bntReserve.balance) + acc;
    }, 0);

    const stakedBntPercent =
      (totalBntStaked / Number(parseFloat(bntSupply).toExponential(18))) * 100;

    const statistics: Statistic[] = [
      {
        label: 'BNT Price',
        value: '$' + numbro(apiData.bnt_price.usd).format({ mantissa: 2 }),
        change24h: bnt24hChange,
      },
      {
        label: 'Total Liquidity',
        value: '$' + numbro(apiData.total_liquidity.usd).format(averageFormat),
      },
      {
        label: 'Volume (24h)',
        value: '$' + numbro(apiData.total_volume_24h.usd).format(averageFormat),
      },
      {
        label: 'Total BNT Staked',
        value: numbro(stakedBntPercent).format({ mantissa: 2 }) + '%',
      },
    ];
    return statistics;
  }),
  shareReplay(1)
);
