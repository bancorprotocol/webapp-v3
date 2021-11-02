import {
  LiquidityProtection,
  LiquidityProtection__factory,
  LiquidityProtectionStore,
  LiquidityProtectionStore__factory,
} from 'services/web3/abis/types';
import { web3 } from 'services/web3/index';
import {
  liquidityProtection$,
  liquidityProtectionStore$,
} from 'services/observables/contracts';
import { take } from 'rxjs/operators';
import { multicall } from 'services/web3/multicall/multicall';
import { currentNetwork$ } from 'services/observables/network';
import { fromPairs, keyBy, merge, toPairs, uniq, values } from 'lodash';
import dayjs from 'dayjs';
import { decToPpm, rewindBlocksByDays } from 'utils/helperFunctions';
import BigNumber from 'bignumber.js';
import { Pool } from 'services/observables/tokens';
import { fetchTokenSupply } from 'services/web3/token/token';
import { fetchReserveBalances } from 'services/web3/liquidity/liquidity';

export interface ProtectedLiquidity {
  id: string;
  owner: string;
  poolToken: string;
  reserveToken: string;
  poolAmount: string;
  reserveAmount: string;
  reserveRateN: string;
  reserveRateD: string;
  timestamp: string;
}

const fetchPositionIds = async (
  contract: LiquidityProtectionStore,
  currentUser: string
) => {
  try {
    return await contract.protectedLiquidityIds(currentUser);
  } catch (e) {
    throw new Error(`Failed fetching position ids ${e}`);
  }
};

const buildProtectedPositionCalls = (
  contract: LiquidityProtectionStore,
  protectionId: string
) => {
  return {
    contractAddress: contract.address,
    interface: contract.interface,
    methodName: 'protectedLiquidity',
    methodParameters: [protectionId],
  };
};

interface PositionReturn {
  baseAmount: string;
  networkAmount: string;
  targetAmount: string;
}

interface RemoveLiquidityReturn {
  id: string;
  fullLiquidityReturn: PositionReturn;
  currentLiquidityReturn: PositionReturn;
  roiDec: string;
}

const removeLiquidityReturn = async (
  contract: LiquidityProtection,
  position: ProtectedLiquidity
): Promise<RemoveLiquidityReturn> => {
  const timeNow = dayjs();
  const timeNowUnix = timeNow.unix();
  const fullWaitTimeUnix = timeNow.add(1, 'year').unix();
  const portion = decToPpm(1);

  const getRemoveLiquidityReturn = async (
    id: string,
    ppm: string,
    removeTimestamp: number
  ): Promise<PositionReturn> => {
    const res = await contract.removeLiquidityReturn(
      id,
      ppm,
      String(removeTimestamp)
    );
    const keys = ['targetAmount', 'baseAmount', 'networkAmount'];
    const pairs = toPairs(res).map(([, value], index) => [
      keys[index],
      value.toString(),
    ]);

    return fromPairs(pairs) as PositionReturn;
  };

  const [fullLiquidityReturn, currentLiquidityReturn] = await Promise.all([
    getRemoveLiquidityReturn(position.id, portion, fullWaitTimeUnix),
    getRemoveLiquidityReturn(position.id, portion, timeNowUnix),
  ]);

  const roiDec =
    fullLiquidityReturn &&
    new BigNumber(fullLiquidityReturn.targetAmount)
      .div(position.reserveAmount)
      .minus(1)
      .toString();

  return {
    id: position.id,
    fullLiquidityReturn,
    currentLiquidityReturn,
    roiDec,
  };
};

const fetchRawPositions = async (
  contract: LiquidityProtectionStore,
  currentUser: string
) => {
  const positionIds = await fetchPositionIds(contract, currentUser);

  const calls = positionIds.map((id) =>
    buildProtectedPositionCalls(contract, id.toString())
  );

  const currentNetwork = await currentNetwork$.pipe(take(1)).toPromise();

  const rawPositions = await multicall(currentNetwork, calls);

  const keys = [
    'owner',
    'poolToken',
    'reserveToken',
    'poolAmount',
    'reserveAmount',
    'reserveRateN',
    'reserveRateD',
    'timestamp',
  ];

  return rawPositions!
    .map((res) => ({ ...res }))
    .map((res) =>
      fromPairs(keys.map((key, index) => [key, res[index].toString()]))
    )
    .map((res, index) => ({
      ...res,
      id: positionIds[index].toString(),
    })) as ProtectedLiquidity[];
};

// new

export interface TimeScale {
  blockHeight: number;
  days: number;
  label: string;
}

export interface PoolHistoricBalance {
  scale: TimeScale;
  pool: Pool;
  smartTokenSupply: string;
  reserveBalances: { tknBalance: string; bntBalance: string };
}

const fetchHistoricBalances = async (
  positions: ProtectedLiquidity[],
  pools: Pool[]
): Promise<PoolHistoricBalance[][]> => {
  const blockNow = await web3.provider.getBlockNumber();
  const timeScales: TimeScale[] = (
    [
      [1, 'day'],
      [7, 'week'],
    ] as [number, string][]
  ).map(([days, label]) => ({
    blockHeight: rewindBlocksByDays(blockNow, days),
    days,
    label,
  }));
  const uniqueAnchors = uniq(positions.map((pos) => pos.poolToken));
  const relevantPools = pools.filter((pool) =>
    uniqueAnchors.some((anchor) => pool.pool_dlt_id === anchor)
  );

  const atLeastOneAnchorAndScale =
    timeScales.length > 0 && relevantPools.length > 0;
  if (!atLeastOneAnchorAndScale)
    throw new Error('Must pass at least one time scale and anchor');

  return await Promise.all(
    timeScales.map((scale) =>
      Promise.all(
        relevantPools.map(async (pool) => {
          const blockHeight = scale.blockHeight;
          try {
            const supply = await fetchTokenSupply(
              pool.pool_dlt_id,
              blockHeight
            );

            const reserveBalances = await fetchReserveBalances(
              pool,
              blockHeight
            );

            return {
              scale,
              pool,
              smartTokenSupply: supply.toString(),
              reserveBalances,
            };
          } catch (e) {
            console.error('Failed to fetch token supply.', e);
            throw e;
          }
        })
      )
    )
  );
};

const fetchPoolAprs = async (
  pools: Pool[],
  positions: ProtectedLiquidity[],
  contract: LiquidityProtection
) => {
  try {
    const historicBalances = await fetchHistoricBalances(positions, pools);

    return await Promise.all(
      positions.map((position) =>
        Promise.all(
          historicBalances
            .flat()
            .filter(
              (historicBalance) =>
                historicBalance.pool.pool_dlt_id === position.poolToken
            )
            .map(async (historicBalance) => {
              const { tknBalance, bntBalance } =
                historicBalance.reserveBalances;
              const poolToken = position.poolToken;
              const reserveToken = position.reserveToken;
              const reserveAmount = position.reserveAmount;
              const poolRateN = new BigNumber(tknBalance).times(2).toString();
              const poolRateD = historicBalance.smartTokenSupply;

              const reserveRateN = bntBalance;
              const reserveRateD = tknBalance;

              try {
                const poolRoi = await contract.poolROI(
                  poolToken,
                  reserveToken,
                  reserveAmount,
                  poolRateN,
                  poolRateD,
                  reserveRateN,
                  reserveRateD
                );

                const scale = historicBalance.scale;
                const magnitude =
                  scale.label === 'day'
                    ? 365
                    : scale.label === 'week'
                    ? 52
                    : 365 / scale.days;

                const calculatedAprDec = new BigNumber(poolRoi.toString())
                  .div(1000000)
                  .minus(1)
                  .times(magnitude);

                return {
                  calculatedAprDec: calculatedAprDec.isNegative()
                    ? '0'
                    : calculatedAprDec.toString(),
                  id: position.id,
                  scaleId: historicBalance.scale.label,
                };
              } catch (err) {
                console.error('getting pool roi failed!', err, {
                  address: contract.address,
                  poolToken,
                  reserveToken,
                  reserveAmount,
                  poolRateN,
                  poolRateD,
                  reserveRateN,
                  reserveRateD,
                });
              }
            })
        )
      )
    );
  } catch (e) {
    throw new Error(`Failed fetching pool aprs ${e}`);
  }
};

export const mainEntry = async (pools: Pool[], currentUser: string) => {
  const liquidityProtectionStoreContractAddress =
    await liquidityProtectionStore$.pipe(take(1)).toPromise();

  const liquidityProtectionStoreContract =
    LiquidityProtectionStore__factory.connect(
      liquidityProtectionStoreContractAddress,
      web3.provider
    );

  const rawPositions = await fetchRawPositions(
    liquidityProtectionStoreContract,
    currentUser
  );

  const liquidityProtectionContractAddress = await liquidityProtection$
    .pipe(take(1))
    .toPromise();

  const liquidityProtectionContract = LiquidityProtection__factory.connect(
    liquidityProtectionContractAddress,
    web3.provider
  );

  const positionsWithRoi = await Promise.all(
    rawPositions.map(
      async (pos) =>
        await removeLiquidityReturn(liquidityProtectionContract, pos)
    )
  );

  // const res = await fetchPoolAprs(
  //   pools,
  //   rawPositions,
  //   liquidityProtectionContract
  // );
  //
  // console.log(res);

  const merged = values(
    merge(keyBy(rawPositions, 'id'), keyBy(positionsWithRoi, 'id'))
  );

  return merged.map((pos) => ({
    id: pos.id,
    poolId: pos.poolToken,
    reserveTokenId: pos.reserveToken,
    initialStake: pos.reserveAmount,
    protectedAmount: pos.fullLiquidityReturn.targetAmount,
    claimableAmount: pos.currentLiquidityReturn.targetAmount,
    roi: pos.roiDec,
  }));
};
