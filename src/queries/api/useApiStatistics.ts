import { useQuery } from 'react-query';
import { BancorApi } from 'services/api/bancorApi/bancorApi';
import BigNumber from 'bignumber.js';
import { bntToken } from 'services/web3/config';
import { toBigNumber } from 'utils/helperFunctions';
import numbro from 'numbro';
import { useApiV2Welcome } from 'queries/api/useApiV2Welcome';
import { WelcomeData } from 'services/api/bancorApi/bancorApi.types';
import { genericFailedNotification } from 'services/notifications/notifications';
import { useDispatch } from 'react-redux';

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

const fetchStatistics = async (
  apiDataV2: WelcomeData
): Promise<Statistic[]> => {
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

  return [
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
};

export const useApiStatistics = () => {
  const dispatch = useDispatch();
  const { data: apiDataV2 } = useApiV2Welcome();

  return useQuery<Statistic[]>(
    ['api', 'v3', 'statistics'],
    () => fetchStatistics(apiDataV2!),
    {
      enabled: !!apiDataV2,
      useErrorBoundary: false,
      onError: (err: any) => {
        genericFailedNotification(
          dispatch,
          `${err.message}`,
          `Server Error: ${['api', 'v3', 'tokens'].join('->')}`
        );
      },
    }
  );
};
